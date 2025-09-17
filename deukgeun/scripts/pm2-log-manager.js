#!/usr/bin/env node

/**
 * PM2 로그 관리 및 모니터링 스크립트
 * PM2 배포 시 정확한 오류 정보를 확인하고 관리할 수 있는 도구
 */

const fs = require('fs')
const path = require('path')
const { execSync, spawn } = require('child_process')

class PM2LogManager {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs')
    this.pm2LogFiles = {
      backend: {
        error: path.join(this.logDir, 'pm2-backend-error-detailed.log'),
        out: path.join(this.logDir, 'pm2-backend-out-detailed.log'),
        combined: path.join(this.logDir, 'pm2-backend-combined-detailed.log'),
        pm2: path.join(this.logDir, 'pm2-backend-pm2-detailed.log'),
      },
      frontend: {
        error: path.join(this.logDir, 'pm2-frontend-error-detailed.log'),
        out: path.join(this.logDir, 'pm2-frontend-out-detailed.log'),
        combined: path.join(this.logDir, 'pm2-frontend-combined-detailed.log'),
        pm2: path.join(this.logDir, 'pm2-frontend-pm2-detailed.log'),
      },
    }
  }

  // 로그 파일 초기화
  initializeLogFiles() {
    console.log('🔧 PM2 로그 파일 초기화 중...')

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }

    const allLogFiles = [
      ...Object.values(this.pm2LogFiles.backend),
      ...Object.values(this.pm2LogFiles.frontend),
    ]

    allLogFiles.forEach(logPath => {
      if (!fs.existsSync(logPath)) {
        const header = `# PM2 상세 로그 파일 - ${new Date().toISOString()}\n# 이 파일은 PM2 배포 시 상세한 오류 정보를 기록합니다.\n\n`
        fs.writeFileSync(logPath, header)
        console.log(`✅ 로그 파일 생성: ${path.basename(logPath)}`)
      }
    })

    console.log('✅ PM2 로그 파일 초기화 완료')
  }

  // 실시간 로그 모니터링
  monitorLogs(appName = 'all', logType = 'error') {
    console.log(`📊 ${appName} 앱의 ${logType} 로그 모니터링 시작...`)

    const apps = appName === 'all' ? ['backend', 'frontend'] : [appName]

    apps.forEach(app => {
      if (this.pm2LogFiles[app] && this.pm2LogFiles[app][logType]) {
        const logFile = this.pm2LogFiles[app][logType]

        if (fs.existsSync(logFile)) {
          console.log(
            `\n🔍 ${app.toUpperCase()} ${logType.toUpperCase()} 로그 모니터링:`
          )
          console.log(`📁 파일: ${logFile}`)
          console.log('=' * 60)

          // tail -f 명령어로 실시간 로그 모니터링
          const tail = spawn('tail', ['-f', logFile])

          tail.stdout.on('data', data => {
            console.log(data.toString())
          })

          tail.stderr.on('data', data => {
            console.error(`오류: ${data}`)
          })

          tail.on('close', code => {
            console.log(`로그 모니터링 종료 (코드: ${code})`)
          })
        } else {
          console.log(`❌ 로그 파일이 존재하지 않습니다: ${logFile}`)
        }
      }
    })
  }

  // 최근 오류 로그 조회
  getRecentErrors(appName = 'all', lines = 50) {
    console.log(`🔍 최근 ${lines}줄의 오류 로그 조회 중...`)

    const apps = appName === 'all' ? ['backend', 'frontend'] : [appName]

    apps.forEach(app => {
      if (this.pm2LogFiles[app] && this.pm2LogFiles[app].error) {
        const errorLogFile = this.pm2LogFiles[app].error

        if (fs.existsSync(errorLogFile)) {
          console.log(`\n📋 ${app.toUpperCase()} 최근 오류 로그:`)
          console.log('=' * 60)

          try {
            const content = fs.readFileSync(errorLogFile, 'utf8')
            const lines = content.split('\n')
            const recentLines = lines.slice(-lines).join('\n')
            console.log(recentLines)
          } catch (error) {
            console.error(`로그 파일 읽기 오류: ${error.message}`)
          }
        } else {
          console.log(`❌ 오류 로그 파일이 존재하지 않습니다: ${errorLogFile}`)
        }
      }
    })
  }

  // 로그 파일 분석
  analyzeLogs(appName = 'all') {
    console.log(`📊 ${appName} 로그 분석 중...`)

    const apps = appName === 'all' ? ['backend', 'frontend'] : [appName]

    apps.forEach(app => {
      if (this.pm2LogFiles[app]) {
        console.log(`\n📈 ${app.toUpperCase()} 로그 분석 결과:`)
        console.log('=' * 60)

        Object.entries(this.pm2LogFiles[app]).forEach(([type, logFile]) => {
          if (fs.existsSync(logFile)) {
            const stats = fs.statSync(logFile)
            const content = fs.readFileSync(logFile, 'utf8')
            const lines = content.split('\n').filter(line => line.trim())

            console.log(`📁 ${type.toUpperCase()} 로그:`)
            console.log(`   - 파일 크기: ${(stats.size / 1024).toFixed(2)} KB`)
            console.log(`   - 총 라인 수: ${lines.length}`)
            console.log(`   - 마지막 수정: ${stats.mtime.toISOString()}`)

            // 오류 로그인 경우 오류 통계
            if (type === 'error' && lines.length > 0) {
              const errorCount = lines.filter(
                line =>
                  line.includes('ERROR') ||
                  line.includes('Error') ||
                  line.includes('error')
              ).length
              console.log(`   - 오류 발생 횟수: ${errorCount}`)
            }

            console.log('')
          }
        })
      }
    })
  }

  // 로그 파일 정리
  cleanupLogs(daysToKeep = 7) {
    console.log(`🧹 ${daysToKeep}일 이상 된 로그 파일 정리 중...`)

    const now = Date.now()
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000

    if (fs.existsSync(this.logDir)) {
      const files = fs.readdirSync(this.logDir)
      let deletedCount = 0

      files.forEach(file => {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file)
          const stats = fs.statSync(filePath)

          // 오래된 로그 파일 또는 불필요한 로그 파일 삭제
          const isOldFile = now - stats.mtime.getTime() > maxAge
          const isUnnecessaryFile = this.isUnnecessaryLogFile(file)

          if (isOldFile || isUnnecessaryFile) {
            fs.unlinkSync(filePath)
            console.log(`🗑️  로그 파일 삭제: ${file}`)
            deletedCount++
          }
        }
      })

      console.log(`✅ 로그 파일 정리 완료 (${deletedCount}개 파일 삭제)`)
    }
  }

  // 불필요한 로그 파일인지 확인
  isUnnecessaryLogFile(filename) {
    const unnecessaryPatterns = [
      'backend-combined-', // 번호가 붙은 백엔드 통합 로그
      'backend-error-', // 번호가 붙은 백엔드 오류 로그
      'backend-out-', // 번호가 붙은 백엔드 출력 로그
      'frontend-combined-', // 번호가 붙은 프론트엔드 통합 로그
      'frontend-error-', // 번호가 붙은 프론트엔드 오류 로그
      'frontend-out-', // 번호가 붙은 프론트엔드 출력 로그
      'build-debug.log', // 빌드 디버그 로그
      'combined.log', // 일반 통합 로그
      'error.log', // 일반 오류 로그
      'exceptions.log', // 예외 로그
    ]

    return unnecessaryPatterns.some(pattern => filename.includes(pattern))
  }

  // PM2 상태 확인
  checkPM2Status() {
    console.log('📊 PM2 프로세스 상태 확인 중...')

    try {
      const status = execSync('pm2 status', { encoding: 'utf8' })
      console.log(status)
    } catch (error) {
      console.error('PM2 상태 확인 오류:', error.message)
    }
  }

  // PM2 로그 실시간 조회
  getPM2Logs(appName = 'all', lines = 100) {
    console.log(`📋 PM2 로그 조회 중... (최근 ${lines}줄)`)

    try {
      const command =
        appName === 'all'
          ? `pm2 logs --lines ${lines}`
          : `pm2 logs ${appName} --lines ${lines}`
      const logs = execSync(command, { encoding: 'utf8' })
      console.log(logs)
    } catch (error) {
      console.error('PM2 로그 조회 오류:', error.message)
    }
  }

  // 도움말 출력
  showHelp() {
    console.log(`
🔧 PM2 로그 관리 도구 사용법:

기본 명령어:
  node pm2-log-manager.js <명령어> [옵션]

명령어:
  init                    - 로그 파일 초기화
  monitor [app] [type]    - 실시간 로그 모니터링 (app: backend|frontend|all, type: error|out|combined)
  errors [app] [lines]    - 최근 오류 로그 조회 (app: backend|frontend|all, lines: 숫자)
  analyze [app]           - 로그 파일 분석 (app: backend|frontend|all)
  cleanup [days]          - 오래된 로그 파일 정리 (days: 보관할 일수)
  status                  - PM2 프로세스 상태 확인
  logs [app] [lines]      - PM2 로그 조회 (app: backend|frontend|all, lines: 숫자)
  help                    - 이 도움말 표시

예시:
  node pm2-log-manager.js init
  node pm2-log-manager.js monitor backend error
  node pm2-log-manager.js errors all 100
  node pm2-log-manager.js analyze backend
  node pm2-log-manager.js cleanup 7
  node pm2-log-manager.js status
  node pm2-log-manager.js logs all 50
`)
  }
}

// 메인 실행 함수
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const param1 = args[1]
  const param2 = args[2]

  const logManager = new PM2LogManager()

  switch (command) {
    case 'init':
      logManager.initializeLogFiles()
      break
    case 'monitor':
      logManager.monitorLogs(param1 || 'all', param2 || 'error')
      break
    case 'errors':
      logManager.getRecentErrors(param1 || 'all', parseInt(param2) || 50)
      break
    case 'analyze':
      logManager.analyzeLogs(param1 || 'all')
      break
    case 'cleanup':
      logManager.cleanupLogs(parseInt(param1) || 7)
      break
    case 'status':
      logManager.checkPM2Status()
      break
    case 'logs':
      logManager.getPM2Logs(param1 || 'all', parseInt(param2) || 100)
      break
    case 'help':
    case '--help':
    case '-h':
      logManager.showHelp()
      break
    default:
      console.log('❌ 알 수 없는 명령어입니다.')
      logManager.showHelp()
      break
  }
}

// 스크립트로 직접 실행될 때만 main 함수 실행
if (require.main === module) {
  main()
}

module.exports = PM2LogManager
