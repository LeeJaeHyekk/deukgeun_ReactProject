/**
 * 주간 크롤링 스케줄러
 * 백엔드 서버 내부에서 node-cron을 사용하여 주간 크롤링을 스케줄링합니다.
 * 
 * 특징:
 * - 백엔드 서버 프로세스 내부에서 실행
 * - 서버가 실행 중이면 크롤링도 자동 실행
 * - PM2 cron의 제한사항 없음
 * - 상태 모니터링 및 수동 실행 가능
 * 
 * 스케줄 규칙:
 * - 업데이트 날짜: 매주 일요일 (0)만 허용
 * - 업데이트 시간: 오전 6시 (6)만 허용
 * - 정확한 스케줄: "0 6 * * 0" (예외 없음)
 * - 다른 날짜나 시간은 허용되지 않음
 */

import { CronJob } from 'cron'
import { exec, ChildProcess } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'

const execAsync = promisify(exec)

// 상수 정의
const MAX_EXECUTION_TIME = 2 * 60 * 60 * 1000 // 2시간 (밀리초)
const MAX_CONSECUTIVE_FAILURES = 3 // 최대 연속 실패 횟수
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const EXECUTION_TIMEOUT = 2 * 60 * 60 * 1000 // 2시간 타임아웃

interface CrawlingStatus {
  isRunning: boolean
  lastRun: Date | null
  nextRun: Date | null
  lastSuccess: boolean
  lastError: string | null
  lastRunDuration: number | null
  consecutiveFailures: number
  totalRuns: number
  totalSuccesses: number
  totalFailures: number
}

class WeeklyCrawlingScheduler {
  private job: CronJob | null = null
  private status: CrawlingStatus = {
    isRunning: false,
    lastRun: null,
    nextRun: null,
    lastSuccess: false,
    lastError: null,
    lastRunDuration: null,
    consecutiveFailures: 0,
    totalRuns: 0,
    totalSuccesses: 0,
    totalFailures: 0
  }
  private executionLock: boolean = false
  private currentProcess: ChildProcess | null = null
  private executionTimeout: NodeJS.Timeout | null = null

  /**
   * cron 스케줄 검증
   * 매주 일요일 오전 6시만 허용 (예외 없음)
   */
  private validateCronSchedule(cronSchedule: string): boolean {
    // cron 표현식 형식: 분 시간 일 월 요일
    // 정확히 "0 6 * * 0"만 허용 (매주 일요일 오전 6시)
    const trimmedSchedule = cronSchedule.trim()
    
    // 정확한 형식 검증
    if (trimmedSchedule !== '0 6 * * 0') {
      console.error(`❌ 잘못된 cron 스케줄: ${trimmedSchedule}`)
      console.error('   정확한 스케줄만 허용: "0 6 * * 0" (매주 일요일 오전 6시)')
      console.error('   다른 날짜, 시간, 예외는 허용되지 않습니다.')
      return false
    }

    return true
  }

  /**
   * 안전한 cron 스케줄 가져오기
   * 검증을 통과한 경우만 반환, 실패 시 기본값 사용
   */
  private getValidatedCronSchedule(): string {
    const defaultSchedule = '0 6 * * 0' // 매주 일요일 오전 6시
    
    // 환경 변수에서 가져오기
    const envSchedule = process.env.WEEKLY_CRAWLING_SCHEDULE
    
    if (!envSchedule) {
      console.log(`📅 환경 변수 WEEKLY_CRAWLING_SCHEDULE이 설정되지 않았습니다. 기본값 사용: ${defaultSchedule}`)
      return defaultSchedule
    }

    // 환경 변수로 설정된 경우 검증
    if (this.validateCronSchedule(envSchedule)) {
      console.log(`📅 환경 변수에서 가져온 cron 스케줄 검증 통과: ${envSchedule}`)
      return envSchedule
    } else {
      console.warn(`⚠️ 환경 변수 cron 스케줄 검증 실패. 기본값 사용: ${defaultSchedule}`)
      return defaultSchedule
    }
  }

  /**
   * 환경 변수 검증
   */
  private validateEnvironment(): boolean {
    const requiredEnvVars = ['NODE_ENV']
    const missingVars: string[] = []

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar)
      }
    }

    if (missingVars.length > 0) {
      console.error(`❌ 필수 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`)
      return false
    }

    return true
  }

  /**
   * 스케줄러 시작
   */
  start(): void {
    try {
      // 환경 변수 검증
      if (!this.validateEnvironment()) {
        console.error('❌ 환경 변수 검증 실패로 스케줄러를 시작할 수 없습니다')
        return
      }

      // 프로덕션 환경에서만 실행
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 개발 환경: 주간 크롤링 스케줄러 비활성화')
        return
      }

      // 이미 실행 중이면 중복 시작 방지
      if (this.job) {
        console.warn('⚠️ 주간 크롤링 스케줄러가 이미 실행 중입니다')
        return
      }

      console.log('🕐 주간 크롤링 스케줄러 시작...')

      // cron 스케줄 검증 및 가져오기 (매주 일요일 오전 6시만 허용)
      const cronSchedule = this.getValidatedCronSchedule()

      // 크롤링 스크립트 경로 확인
      const scriptPath = this.getScriptPath()
      if (!scriptPath) {
        console.error('❌ 크롤링 스크립트를 찾을 수 없습니다')
        return
      }

      // 스크립트 파일 검증
      if (!this.validateScriptPath(scriptPath)) {
        console.error('❌ 크롤링 스크립트 파일이 유효하지 않습니다')
        return
      }

      // CronJob 생성
      try {
        this.job = CronJob.from({
          cronTime: cronSchedule,
          onTick: () => {
            // 안전하게 실행 (중복 실행 방지)
            this.safeExecuteCrawling(scriptPath).catch((error) => {
              console.error('❌ 크롤링 실행 중 예외 발생:', error)
              this.logError(error, 0)
            })
          },
          start: true, // 즉시 시작
          timeZone: 'Asia/Seoul' // 시간대
        })

        // 다음 실행 시간 설정
        try {
          const nextDates = this.job.nextDates()
          if (!nextDates) {
            console.warn('⚠️ 다음 실행 시간을 가져올 수 없습니다')
            this.status.nextRun = null
            return
          }
          
          const nextRun = Array.isArray(nextDates) 
            ? (nextDates[0] ? nextDates[0].toDate() : null)
            : (nextDates.toDate ? nextDates.toDate() : null)
          
          if (!nextRun) {
            console.warn('⚠️ 다음 실행 시간을 Date 객체로 변환할 수 없습니다')
            this.status.nextRun = null
            return
          }
          
          this.status.nextRun = nextRun

          // 다음 실행 시간이 일요일 오전 6시인지 검증
          const nextRunDay = nextRun.getDay() // 0 = 일요일
          const nextRunHour = nextRun.getHours()
          const nextRunMinute = nextRun.getMinutes()

          if (nextRunDay !== 0 || nextRunHour !== 6 || nextRunMinute !== 0) {
            console.warn(`⚠️ 다음 실행 시간이 예상과 다릅니다: ${nextRun.toISOString()}`)
            console.warn(`   예상: 일요일 오전 6시 0분`)
            console.warn(`   실제: ${this.getDayName(nextRunDay)} ${nextRunHour}시 ${nextRunMinute}분`)
          }

          console.log('✅ 주간 크롤링 스케줄러 시작 완료')
          console.log(`📅 Cron 스케줄: ${cronSchedule} (매주 일요일 오전 6시)`)
          console.log(`📅 다음 실행 시간: ${nextRun.toISOString()} (${this.getDayName(nextRunDay)} ${nextRunHour}시 ${nextRunMinute}분)`)
        } catch (dateError) {
          console.error('❌ 다음 실행 시간 계산 실패:', dateError)
          // 에러가 발생해도 스케줄러는 계속 실행
          this.status.nextRun = null
        }
      } catch (error) {
        console.error('❌ CronJob 생성 실패:', error)
        console.error(`   Cron 스케줄: ${cronSchedule}`)
        if (error instanceof Error && error.stack) {
          console.error('   스택 트레이스:', error.stack)
        }
        throw error
      }
    } catch (error) {
      console.error('❌ 스케줄러 시작 실패:', error)
      if (error instanceof Error && error.stack) {
        console.error('   스택 트레이스:', error.stack)
      }
      throw error
    }
  }

  /**
   * 요일 이름 가져오기
   */
  private getDayName(day: number): string {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    return days[day] || `요일${day}`
  }

  /**
   * 크롤링 스크립트 경로 찾기
   */
  private getScriptPath(): string | null {
    try {
      // 여러 가능한 경로 시도
      const possiblePaths = [
        path.join(process.cwd(), 'src/backend/scripts/weeklyCrawlingCron.ts'),
        path.join(process.cwd(), 'dist/backend/backend/scripts/weeklyCrawlingCron.cjs'),
        path.join(process.cwd(), 'scripts/weeklyCrawlingCron.ts'),
      ]

      for (const scriptPath of possiblePaths) {
        try {
          if (fs.existsSync(scriptPath)) {
            // 파일 접근 권한 확인
            fs.accessSync(scriptPath, fs.constants.R_OK)
            return scriptPath
          }
        } catch (accessError) {
          // 파일이 존재하지만 읽을 수 없는 경우
          console.warn(`⚠️ 스크립트 파일 접근 불가: ${scriptPath}`, accessError)
          continue
        }
      }

      return null
    } catch (error) {
      console.error('❌ 스크립트 경로 찾기 실패:', error)
      return null
    }
  }

  /**
   * 스크립트 경로 검증
   */
  private validateScriptPath(scriptPath: string): boolean {
    try {
      // 파일 존재 확인
      if (!fs.existsSync(scriptPath)) {
        console.error(`❌ 스크립트 파일이 존재하지 않습니다: ${scriptPath}`)
        return false
      }

      // 파일 읽기 권한 확인
      try {
        fs.accessSync(scriptPath, fs.constants.R_OK)
      } catch (accessError) {
        console.error(`❌ 스크립트 파일 읽기 권한이 없습니다: ${scriptPath}`)
        return false
      }

      // 파일 통계 확인
      const stats = fs.statSync(scriptPath)
      if (!stats.isFile()) {
        console.error(`❌ 스크립트 경로가 파일이 아닙니다: ${scriptPath}`)
        return false
      }

      // 파일 크기 확인 (0바이트 파일 방지)
      if (stats.size === 0) {
        console.error(`❌ 스크립트 파일이 비어있습니다: ${scriptPath}`)
        return false
      }

      return true
    } catch (error) {
      console.error(`❌ 스크립트 경로 검증 실패: ${scriptPath}`, error)
      return false
    }
  }

  /**
   * 안전한 크롤링 실행 (중복 실행 방지 및 에러 처리)
   */
  private async safeExecuteCrawling(scriptPath: string): Promise<void> {
    // 실행 락 확인
    if (this.executionLock || this.status.isRunning) {
      console.warn('⚠️ 크롤링이 이미 실행 중입니다. 중복 실행을 건너뜁니다.')
      return
    }

    // 연속 실패 횟수 확인
    if (this.status.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error(`❌ 연속 실패 횟수 초과 (${this.status.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}). 스케줄러가 일시 중지되었습니다.`)
      console.error('   수동으로 실행하여 문제를 해결한 후 스케줄러를 재시작하세요.')
      return
    }

    // 실행 락 설정
    this.executionLock = true
    this.status.isRunning = true
    this.status.lastRun = new Date()
    this.status.lastError = null
    this.status.totalRuns++
    const startTime = Date.now()

    console.log('🚀 주간 크롤링 시작...')
    console.log(`📅 실행 시간: ${this.status.lastRun.toISOString()}`)
    console.log(`📁 스크립트 경로: ${scriptPath}`)
    console.log(`📊 총 실행 횟수: ${this.status.totalRuns}, 성공: ${this.status.totalSuccesses}, 실패: ${this.status.totalFailures}`)

    try {
      await this.executeCrawlingWithTimeout(scriptPath, startTime)
    } catch (error) {
      // 에러는 executeCrawlingWithTimeout 내부에서 처리됨
      console.error('❌ 크롤링 실행 중 예외 발생:', error)
    } finally {
      // 실행 락 해제
      this.executionLock = false
      this.status.isRunning = false

      // 타임아웃 클리어
      if (this.executionTimeout) {
        clearTimeout(this.executionTimeout)
        this.executionTimeout = null
      }

      // 현재 프로세스 정리
      if (this.currentProcess) {
        this.currentProcess = null
      }
    }
  }

  /**
   * 타임아웃이 있는 크롤링 실행
   */
  private async executeCrawlingWithTimeout(scriptPath: string, startTime: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // 타임아웃 설정
        this.executionTimeout = setTimeout(() => {
          if (this.currentProcess) {
            console.error('❌ 크롤링 실행 타임아웃 (2시간 초과)')
            this.currentProcess.kill('SIGTERM')
            
            // 강제 종료 대기
            setTimeout(() => {
              if (this.currentProcess && !this.currentProcess.killed) {
                console.error('⚠️ 프로세스가 종료되지 않아 강제 종료합니다')
                this.currentProcess.kill('SIGKILL')
              }
            }, 5000)
          }

          const duration = Date.now() - startTime
          const timeoutError = new Error(`크롤링 실행 타임아웃 (${(duration / 1000 / 60).toFixed(2)}분)`)
          
          this.handleExecutionFailure(timeoutError, duration)
          reject(timeoutError)
        }, EXECUTION_TIMEOUT)

        // TypeScript 파일인지 확인
        const isTypeScript = scriptPath.endsWith('.ts')
        
        // 실행 명령어 결정
        let command: string
        if (isTypeScript) {
          // TypeScript 파일: tsx 사용
          command = `node node_modules/tsx/dist/cli.mjs ${scriptPath}`
        } else {
          // CommonJS 파일: node 직접 실행
          command = `node ${scriptPath}`
        }

        console.log(`🔧 실행 명령어: ${command}`)

        // 프로세스 생성
        const childProcess = exec(command, {
          cwd: process.cwd(),
          env: {
            ...process.env,
            NODE_ENV: 'production',
            MODE: 'production'
          },
          maxBuffer: 10 * 1024 * 1024, // 10MB 버퍼
          timeout: EXECUTION_TIMEOUT // exec 타임아웃
        }, (error, stdout, stderr) => {
          // 타임아웃 클리어
          if (this.executionTimeout) {
            clearTimeout(this.executionTimeout)
            this.executionTimeout = null
          }

          const duration = Date.now() - startTime

          if (error) {
            // 에러 처리
            this.handleExecutionFailure(error, duration)
            if (stdout) {
              console.log('📊 크롤링 출력:', stdout.substring(0, 1000)) // 최대 1000자만 출력
            }
            if (stderr) {
              console.error('❌ 크롤링 에러 출력:', stderr.substring(0, 1000))
            }
            reject(error)
          } else {
            // 성공 처리
            this.handleExecutionSuccess(stdout, stderr, duration)
            resolve()
          }
        })

        // 프로세스 참조 저장
        this.currentProcess = childProcess

        // 프로세스 종료 이벤트 처리
        childProcess.on('exit', (code, signal) => {
          if (code !== 0 && signal === null) {
            // 비정상 종료
            const duration = Date.now() - startTime
            const exitError = new Error(`크롤링 프로세스가 비정상 종료되었습니다 (종료 코드: ${code})`)
            this.handleExecutionFailure(exitError, duration)
          }
        })

        // 프로세스 에러 이벤트 처리
        childProcess.on('error', (error) => {
          const duration = Date.now() - startTime
          this.handleExecutionFailure(error, duration)
          reject(error)
        })

      } catch (error) {
        // 타임아웃 클리어
        if (this.executionTimeout) {
          clearTimeout(this.executionTimeout)
          this.executionTimeout = null
        }

        const duration = Date.now() - startTime
        this.handleExecutionFailure(error, duration)
        reject(error)
      }
    })
  }

  /**
   * 실행 성공 처리
   */
  private handleExecutionSuccess(stdout: string | null, stderr: string | null, duration: number): void {
    this.status.isRunning = false
    this.status.lastSuccess = true
    this.status.lastError = null
    this.status.lastRunDuration = duration
    this.status.consecutiveFailures = 0 // 연속 실패 횟수 리셋
    this.status.totalSuccesses++

    console.log('✅ 크롤링 완료')
    console.log(`⏱️ 소요 시간: ${(duration / 1000).toFixed(2)}초`)

    if (stdout) {
      const outputPreview = stdout.length > 1000 ? stdout.substring(0, 1000) + '...' : stdout
      console.log('📊 크롤링 결과:', outputPreview)
    }

    if (stderr) {
      console.warn('⚠️ 크롤링 경고:', stderr.substring(0, 500))
    }

    // 다음 실행 시간 업데이트
    try {
      if (this.job) {
        const nextDates = this.job.nextDates()
        if (!nextDates) {
          this.status.nextRun = null
          return
        }
        const nextRun = Array.isArray(nextDates) 
          ? (nextDates[0] ? nextDates[0].toDate() : null)
          : (nextDates.toDate ? nextDates.toDate() : null)
        this.status.nextRun = nextRun || null
      }
    } catch (dateError) {
      console.warn('⚠️ 다음 실행 시간 업데이트 실패:', dateError)
    }
  }

  /**
   * 실행 실패 처리
   */
  private handleExecutionFailure(error: Error | unknown, duration: number): void {
    this.status.isRunning = false
    this.status.lastSuccess = false
    this.status.lastError = error instanceof Error ? error.message : String(error)
    this.status.lastRunDuration = duration
    this.status.consecutiveFailures++
    this.status.totalFailures++

    console.error('❌ 크롤링 실행 실패:', error)
    console.error(`📊 연속 실패 횟수: ${this.status.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}`)

    // 에러 로그 저장
    this.logError(error, duration)

    // 다음 실행 시간 업데이트
    try {
      if (this.job) {
        const nextDates = this.job.nextDates()
        if (!nextDates) {
          this.status.nextRun = null
          return
        }
        const nextRun = Array.isArray(nextDates) 
          ? (nextDates[0] ? nextDates[0].toDate() : null)
          : (nextDates.toDate ? nextDates.toDate() : null)
        this.status.nextRun = nextRun || null
      }
    } catch (dateError) {
      console.warn('⚠️ 다음 실행 시간 업데이트 실패:', dateError)
    }

    // 연속 실패 횟수 초과 시 경고
    if (this.status.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error(`❌ 연속 실패 횟수 초과. 다음 실행은 건너뜁니다.`)
      console.error('   수동으로 실행하여 문제를 해결한 후 스케줄러를 재시작하세요.')
    }
  }

  /**
   * 크롤링 실행 (기존 메서드 - 호환성 유지)
   */
  private async executeCrawling(scriptPath: string): Promise<void> {
    await this.safeExecuteCrawling(scriptPath)
  }

  /**
   * 에러 로그 저장
   */
  private logError(error: Error | unknown, duration: number): void {
    const logDir = path.join(process.cwd(), 'logs')
    const logFile = path.join(logDir, 'weekly-crawling-scheduler-error.log')

    try {
      // 로그 디렉토리 생성
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      // 로그 파일 크기 확인 및 로테이션
      this.rotateLogFileIfNeeded(logFile)

      // 에러 로그 작성
      const timestamp = new Date().toISOString()
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : ''
      
      const logEntry = `[${timestamp}] ERROR: ${errorMessage}\n` +
                      `Duration: ${(duration / 1000).toFixed(2)}s\n` +
                      `Consecutive Failures: ${this.status.consecutiveFailures}\n` +
                      `Total Runs: ${this.status.totalRuns}, Successes: ${this.status.totalSuccesses}, Failures: ${this.status.totalFailures}\n` +
                      `${errorStack}\n\n`

      fs.appendFileSync(logFile, logEntry, 'utf-8')
    } catch (logError) {
      console.error('❌ 로그 파일 쓰기 실패:', logError)
    }
  }

  /**
   * 로그 파일 크기 확인 및 로테이션
   */
  private rotateLogFileIfNeeded(logFile: string): void {
    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile)
        
        // 파일 크기가 최대 크기를 초과하면 로테이션
        if (stats.size > MAX_LOG_FILE_SIZE) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const rotatedFile = `${logFile}.${timestamp}`
          
          fs.renameSync(logFile, rotatedFile)
          console.log(`📦 로그 파일 로테이션: ${logFile} -> ${rotatedFile}`)
          
          // 오래된 로그 파일 삭제 (30일 이상)
          this.cleanupOldLogFiles(path.dirname(logFile))
        }
      }
    } catch (error) {
      console.warn('⚠️ 로그 파일 로테이션 실패:', error)
    }
  }

  /**
   * 오래된 로그 파일 정리
   */
  private cleanupOldLogFiles(logDir: string): void {
    try {
      const files = fs.readdirSync(logDir)
      const now = Date.now()
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30일

      for (const file of files) {
        if (file.startsWith('weekly-crawling-scheduler-error.log.')) {
          const filePath = path.join(logDir, file)
          const stats = fs.statSync(filePath)
          
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath)
            console.log(`🗑️ 오래된 로그 파일 삭제: ${file}`)
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ 오래된 로그 파일 정리 실패:', error)
    }
  }

  /**
   * 스케줄러 중지
   */
  stop(): void {
    try {
      // 실행 중인 크롤링이 있으면 종료 대기
      if (this.status.isRunning && this.currentProcess) {
        console.log('⚠️ 실행 중인 크롤링 프로세스 종료 중...')
        this.currentProcess.kill('SIGTERM')
        
        // 5초 대기 후 강제 종료
        setTimeout(() => {
          if (this.currentProcess && !this.currentProcess.killed) {
            console.warn('⚠️ 프로세스가 종료되지 않아 강제 종료합니다')
            this.currentProcess.kill('SIGKILL')
          }
        }, 5000)
      }

      // 타임아웃 클리어
      if (this.executionTimeout) {
        clearTimeout(this.executionTimeout)
        this.executionTimeout = null
      }

      // CronJob 중지
      if (this.job) {
        this.job.stop()
        this.job = null
        console.log('🛑 주간 크롤링 스케줄러 중지')
      }

      // 상태 리셋
      this.executionLock = false
      this.currentProcess = null
    } catch (error) {
      console.error('❌ 스케줄러 중지 중 오류 발생:', error)
    }
  }

  /**
   * 상태 조회
   */
  getStatus(): CrawlingStatus {
    // 다음 실행 시간 업데이트
    if (this.job && !this.status.isRunning) {
      try {
        const nextDates = this.job.nextDates()
        if (!nextDates) {
          this.status.nextRun = null
          return
        }
        const nextRun = Array.isArray(nextDates) 
          ? (nextDates[0] ? nextDates[0].toDate() : null)
          : (nextDates.toDate ? nextDates.toDate() : null)
        this.status.nextRun = nextRun || null
      } catch (error) {
        // 다음 실행 시간 계산 실패 시 무시
      }
    }

    return { ...this.status }
  }

  /**
   * 수동 실행
   */
  async runManual(): Promise<{ success: boolean; message: string }> {
    if (this.status.isRunning || this.executionLock) {
      return {
        success: false,
        message: '크롤링이 이미 실행 중입니다'
      }
    }

    const scriptPath = this.getScriptPath()
    if (!scriptPath) {
      return {
        success: false,
        message: '크롤링 스크립트를 찾을 수 없습니다'
      }
    }

    // 스크립트 경로 검증
    if (!this.validateScriptPath(scriptPath)) {
      return {
        success: false,
        message: '크롤링 스크립트 파일이 유효하지 않습니다'
      }
    }

    console.log('🔧 수동 크롤링 실행 요청')
    
    try {
      await this.executeCrawling(scriptPath)
      
      // 연속 실패 횟수 리셋 (수동 실행 성공 시)
      if (this.status.lastSuccess) {
        this.status.consecutiveFailures = 0
      }

      return {
        success: this.status.lastSuccess,
        message: this.status.lastSuccess
          ? '크롤링이 성공적으로 완료되었습니다'
          : `크롤링 실행 실패: ${this.status.lastError || '알 수 없는 오류'}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        message: `크롤링 실행 중 예외 발생: ${errorMessage}`
      }
    }
  }
}

// 싱글톤 인스턴스
export const weeklyCrawlingScheduler = new WeeklyCrawlingScheduler()

