# 백엔드 서버 내부 스케줄링 구조 설명

## 📋 개요

백엔드 서버 내부 스케줄링은 **백엔드 서버 프로세스가 실행 중일 때, 서버 내부에서 직접 cron 작업을 실행**하는 방식입니다.

## 🏗️ 구조 비교

### 현재 방식 (PM2 Cron)

```
┌─────────────────────────────────────────────────┐
│ PM2 (프로세스 관리자)                            │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ weekly-crawling 프로세스                   │  │
│  │ - 독립적인 프로세스                        │  │
│  │ - cron_restart: '0 2 * * 0'               │  │
│  │ - autorestart: false                      │  │
│  │ - 실행 후 종료 → cron이 다시 시작 안 함    │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ deukgeun-backend 프로세스                  │  │
│  │ - Express 서버 실행                        │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**문제점:**
- 크롤링 스크립트는 일회성 작업 (실행 후 `process.exit()`)
- PM2 cron은 실행 중인 프로세스를 재시작하는 기능
- 프로세스가 종료되면 cron이 다시 시작하지 않음
- `autorestart: false`로 설정되어 자동 재시작 안 됨

### 개선 방식 (백엔드 서버 내부 스케줄링)

```
┌─────────────────────────────────────────────────┐
│ PM2 (프로세스 관리자)                            │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ deukgeun-backend 프로세스                  │  │
│  │                                           │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ Express 서버                        │  │  │
│  │  │ - HTTP 요청 처리                    │  │  │
│  │  │ - API 엔드포인트                    │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ Cron 스케줄러 (node-cron)           │  │  │
│  │  │ - 매주 일요일 새벽 2시 실행          │  │  │
│  │  │ - 백엔드 서버 내부에서 실행          │  │  │
│  │  │ - 서버가 실행 중이면 계속 작동       │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ 크롤링 스크립트 실행                 │  │  │
│  │  │ - child_process로 실행              │  │  │
│  │  │ - 실행 후 종료되어도 문제 없음       │  │  │
│  │  │ - 다음 cron 스케줄에 다시 실행       │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**장점:**
- ✅ 서버가 실행 중이면 크롤링도 자동 실행
- ✅ PM2의 cron 제한사항 없음
- ✅ 서버 로그와 크롤링 로그 통합 관리
- ✅ 서버 상태 모니터링 가능
- ✅ 크롤링 상태 API 엔드포인트 제공 가능

## 🔧 구현 구조

### 1. 서버 시작 시점

백엔드 서버는 `src/backend/index.ts`의 `startServer()` 함수에서 시작됩니다:

```typescript
async function startServer(): Promise<void> {
  // 1. 데이터베이스 연결
  await connectDatabase()
  
  // 2. Express 앱 생성
  const app = await createApp()
  
  // 3. 서버 시작
  const server = app.listen(port, async () => {
    console.log("✅ Backend server is ready!")
    
    // 여기에 cron 스케줄러 추가 가능
  })
}
```

### 2. Cron 스케줄러 추가 위치

서버가 성공적으로 시작된 후, Express 앱이 준비된 상태에서 cron 스케줄러를 추가합니다:

```typescript
// 서버 시작 후
server.listen(port, async () => {
  console.log("✅ Backend server is ready!")
  
  // 크롤링 스케줄러 시작 (프로덕션 환경에서만)
  if (process.env.NODE_ENV === 'production') {
    startWeeklyCrawlingScheduler()
  }
})
```

### 3. Cron 스케줄러 구현

```typescript
import { CronJob } from 'cron'
import { exec } from 'child_process'
import path from 'path'

let weeklyCrawlJob: CronJob | null = null

function startWeeklyCrawlingScheduler(): void {
  console.log('🕐 주간 크롤링 스케줄러 시작...')
  
  // 매주 일요일 새벽 2시에 실행 (Asia/Seoul 시간대)
  weeklyCrawlJob = new CronJob(
    '0 2 * * 0',  // cron 표현식: 매주 일요일 새벽 2시
    () => {
      console.log('🚀 주간 크롤링 시작...')
      const timestamp = new Date().toISOString()
      
      // 크롤링 스크립트 실행
      const scriptPath = path.join(
        process.cwd(),
        'src/backend/scripts/weeklyCrawlingCron.ts'
      )
      
      // tsx를 사용하여 TypeScript 파일 실행
      const command = `node node_modules/tsx/dist/cli.mjs ${scriptPath}`
      
      exec(command, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_ENV: 'production',
          MODE: 'production'
        }
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ 크롤링 실행 실패:', error)
          return
        }
        
        console.log('✅ 크롤링 완료:', stdout)
        if (stderr) {
          console.warn('⚠️ 크롤링 경고:', stderr)
        }
      })
    },
    null,  // onComplete (없음)
    true,  // start: 즉시 시작
    'Asia/Seoul'  // 시간대
  )
  
  weeklyCrawlJob.start()
  console.log('✅ 주간 크롤링 스케줄러 시작 완료')
  console.log('📅 다음 실행 시간:', weeklyCrawlJob.nextDates().toISOString())
}

function stopWeeklyCrawlingScheduler(): void {
  if (weeklyCrawlJob) {
    weeklyCrawlJob.stop()
    weeklyCrawlJob = null
    console.log('🛑 주간 크롤링 스케줄러 중지')
  }
}
```

## 📊 실행 흐름

### 1. 서버 시작 시

```
1. PM2가 백엔드 서버 프로세스 시작
   ↓
2. startServer() 함수 실행
   ↓
3. 데이터베이스 연결
   ↓
4. Express 앱 생성
   ↓
5. 서버 포트에서 리스닝 시작
   ↓
6. 서버 시작 완료 콜백 실행
   ↓
7. 크롤링 스케줄러 시작 (프로덕션 환경)
   ↓
8. Cron 스케줄러가 백그라운드에서 실행 대기
```

### 2. Cron 실행 시

```
1. 매주 일요일 새벽 2시 (Asia/Seoul)
   ↓
2. CronJob의 onTick 콜백 실행
   ↓
3. child_process.exec()로 크롤링 스크립트 실행
   ↓
4. 크롤링 스크립트 독립 프로세스로 실행
   ├─ 공공 API 데이터 수집
   ├─ gyms_raw.json 업데이트
   ├─ 웹 크롤링 (병렬 처리)
   └─ 최종 데이터 병합 및 저장
   ↓
5. 크롤링 스크립트 종료 (process.exit())
   ↓
6. 부모 프로세스(백엔드 서버)는 계속 실행
   ↓
7. 다음 cron 스케줄까지 대기
```

## 🎯 장점 상세

### 1. 안정성
- **서버가 실행 중이면 크롤링도 자동 실행**: PM2가 백엔드 서버를 재시작하면 크롤링 스케줄러도 자동으로 다시 시작
- **프로세스 종료 문제 없음**: 크롤링 스크립트가 종료되어도 서버는 계속 실행되므로 다음 cron에 다시 실행

### 2. 모니터링
- **통합 로그**: 서버 로그와 크롤링 로그를 함께 확인 가능
- **상태 확인**: 서버 상태 API를 통해 크롤링 상태 확인 가능
- **에러 처리**: 서버 내부에서 크롤링 에러를 처리하고 모니터링 가능

### 3. 유연성
- **환경별 설정**: 개발 환경에서는 비활성화, 프로덕션에서만 활성화
- **수동 실행**: API를 통해 수동으로 크롤링 실행 가능
- **스케줄 변경**: 환경 변수로 스케줄 변경 가능

### 4. 확장성
- **다중 스케줄**: 여러 cron 작업을 쉽게 추가 가능
- **상태 관리**: 크롤링 상태를 데이터베이스에 저장하여 관리 가능
- **알림 기능**: 크롤링 실패 시 알림 전송 가능

## 🔍 구현 예시

### 완전한 구현 코드

```typescript
// src/backend/schedulers/weeklyCrawlingScheduler.ts

import { CronJob } from 'cron'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

interface CrawlingStatus {
  isRunning: boolean
  lastRun: Date | null
  nextRun: Date | null
  lastSuccess: boolean
  lastError: string | null
}

class WeeklyCrawlingScheduler {
  private job: CronJob | null = null
  private status: CrawlingStatus = {
    isRunning: false,
    lastRun: null,
    nextRun: null,
    lastSuccess: false,
    lastError: null
  }

  /**
   * 스케줄러 시작
   */
  start(): void {
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
    
    // cron 스케줄 (환경 변수에서 가져오거나 기본값 사용)
    const cronSchedule = process.env.WEEKLY_CRAWLING_SCHEDULE || '0 2 * * 0'
    
    // 크롤링 스크립트 경로
    const scriptPath = path.join(
      process.cwd(),
      'src/backend/scripts/weeklyCrawlingCron.ts'
    )

    // 스크립트 파일 존재 확인
    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ 크롤링 스크립트를 찾을 수 없습니다: ${scriptPath}`)
      return
    }

    // CronJob 생성
    this.job = new CronJob(
      cronSchedule,
      () => {
        this.executeCrawling(scriptPath)
      },
      null,  // onComplete
      true,  // start: 즉시 시작
      'Asia/Seoul'  // 시간대
    )

    // 다음 실행 시간 설정
    this.status.nextRun = this.job.nextDates().toDate()
    
    console.log('✅ 주간 크롤링 스케줄러 시작 완료')
    console.log(`📅 Cron 스케줄: ${cronSchedule}`)
    console.log(`📅 다음 실행 시간: ${this.status.nextRun.toISOString()}`)
  }

  /**
   * 크롤링 실행
   */
  private executeCrawling(scriptPath: string): void {
    if (this.status.isRunning) {
      console.warn('⚠️ 크롤링이 이미 실행 중입니다. 이전 작업을 건너뜁니다.')
      return
    }

    this.status.isRunning = true
    this.status.lastRun = new Date()
    this.status.lastError = null

    console.log('🚀 주간 크롤링 시작...')
    console.log(`📅 실행 시간: ${this.status.lastRun.toISOString()}`)

    // 크롤링 스크립트 실행
    const command = `node node_modules/tsx/dist/cli.mjs ${scriptPath}`
    
    exec(command, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        MODE: 'production'
      },
      maxBuffer: 10 * 1024 * 1024  // 10MB 버퍼
    }, (error, stdout, stderr) => {
      this.status.isRunning = false
      
      if (error) {
        this.status.lastSuccess = false
        this.status.lastError = error.message
        console.error('❌ 크롤링 실행 실패:', error)
        
        // 에러 로그 저장
        this.logError(error, stderr)
      } else {
        this.status.lastSuccess = true
        this.status.lastError = null
        console.log('✅ 크롤링 완료')
        
        if (stdout) {
          console.log('📊 크롤링 결과:', stdout)
        }
        
        if (stderr) {
          console.warn('⚠️ 크롤링 경고:', stderr)
        }
      }

      // 다음 실행 시간 업데이트
      if (this.job) {
        this.status.nextRun = this.job.nextDates().toDate()
      }
    })
  }

  /**
   * 에러 로그 저장
   */
  private logError(error: Error, stderr: string): void {
    const logDir = path.join(process.cwd(), 'logs')
    const logFile = path.join(logDir, 'weekly-crawling-scheduler-error.log')
    
    try {
      // 로그 디렉토리 생성
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      // 에러 로그 작성
      const logEntry = `[${new Date().toISOString()}] ERROR: ${error.message}\n${stderr}\n\n`
      fs.appendFileSync(logFile, logEntry)
    } catch (logError) {
      console.error('로그 파일 쓰기 실패:', logError)
    }
  }

  /**
   * 스케줄러 중지
   */
  stop(): void {
    if (this.job) {
      this.job.stop()
      this.job = null
      console.log('🛑 주간 크롤링 스케줄러 중지')
    }
  }

  /**
   * 상태 조회
   */
  getStatus(): CrawlingStatus {
    return { ...this.status }
  }

  /**
   * 수동 실행
   */
  runManual(): void {
    if (!this.job) {
      console.error('❌ 스케줄러가 시작되지 않았습니다')
      return
    }

    const scriptPath = path.join(
      process.cwd(),
      'src/backend/scripts/weeklyCrawlingCron.ts'
    )

    this.executeCrawling(scriptPath)
  }
}

// 싱글톤 인스턴스
export const weeklyCrawlingScheduler = new WeeklyCrawlingScheduler()
```

### 백엔드 서버에 통합

```typescript
// src/backend/index.ts

import { weeklyCrawlingScheduler } from '@backend/schedulers/weeklyCrawlingScheduler'

async function startServer(): Promise<void> {
  // ... 기존 코드 ...
  
  const server = app.listen(port, async () => {
    console.log("✅ Backend server is ready!")
    
    // 크롤링 스케줄러 시작
    weeklyCrawlingScheduler.start()
    
    // ... 나머지 코드 ...
  })
  
  // Graceful shutdown 시 스케줄러 중지
  process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully')
    weeklyCrawlingScheduler.stop()
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })
}
```

### API 엔드포인트 추가

```typescript
// src/backend/routes/crawling.ts

import { Router } from 'express'
import { weeklyCrawlingScheduler } from '@backend/schedulers/weeklyCrawlingScheduler'

const router = Router()

// 크롤링 상태 조회
router.get('/status', (req, res) => {
  const status = weeklyCrawlingScheduler.getStatus()
  res.json({
    success: true,
    data: status
  })
})

// 수동 크롤링 실행
router.post('/run', (req, res) => {
  weeklyCrawlingScheduler.runManual()
  res.json({
    success: true,
    message: '크롤링이 시작되었습니다'
  })
})

export default router
```

## 📈 모니터링 및 관리

### 1. 상태 확인 API

```bash
# 크롤링 상태 확인
GET /api/crawling/status

# 응답 예시
{
  "success": true,
  "data": {
    "isRunning": false,
    "lastRun": "2025-11-05T02:00:00.000Z",
    "nextRun": "2025-11-12T02:00:00.000Z",
    "lastSuccess": true,
    "lastError": null
  }
}
```

### 2. 수동 실행 API

```bash
# 수동 크롤링 실행
POST /api/crawling/run

# 응답 예시
{
  "success": true,
  "message": "크롤링이 시작되었습니다"
}
```

## 🔄 PM2 설정 변경

PM2 설정에서 weekly-crawling 프로세스를 제거하고, 백엔드 서버만 실행:

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'deukgeun-backend',
      script: 'dist/backend/backend/index.cjs',
      // ... 기존 설정 ...
      // weekly-crawling은 백엔드 서버 내부에서 실행되므로 제거
    }
    // weekly-crawling 프로세스 제거
  ]
}
```

## ⚙️ 환경 변수 설정

```bash
# .env 또는 환경 변수
WEEKLY_CRAWLING_SCHEDULE=0 2 * * 0  # 매주 일요일 새벽 2시
NODE_ENV=production
```

## 🎯 결론

백엔드 서버 내부 스케줄링은:
- ✅ **더 안정적**: 서버가 실행 중이면 크롤링도 자동 실행
- ✅ **더 모니터링 가능**: 서버 로그와 통합, API로 상태 확인
- ✅ **더 유연함**: 환경별 설정, 수동 실행, 스케줄 변경 가능
- ✅ **PM2 제한사항 없음**: cron의 제한사항 없이 자유롭게 구현

이는 PM2 cron의 제한사항을 해결하는 가장 효과적인 방법입니다.

