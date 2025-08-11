# 🔄 Auto-Update Scheduler 가이드

## 개요

헬스장 데이터베이스를 주기적으로 자동 업데이트하는 스케줄러 시스템입니다.

## 기능

- **자동 실행**: 설정된 시간에 3일마다 자동으로 헬스장 데이터 업데이트
- **API + 크롤링**: API 우선 시도, 실패 시 크롤링으로 대체
- **데이터 참조**: 업데이트 후 2일간 row 데이터 참조
- **스마트 스케줄링**: 업데이트가 필요한 경우에만 실행
- **다양한 업데이트 방식**: enhanced, basic, multisource, advanced
- **API 제어**: REST API를 통한 스케줄러 제어
- **로깅**: 상세한 실행 로그 제공
- **PM2 지원**: 프로덕션 환경에서 안정적인 실행

## 설정

### 환경 변수

```bash
# 스케줄러 활성화
AUTO_UPDATE_ENABLED=true

# 실행 시간 (24시간 형식) - 3일마다 실행
AUTO_UPDATE_HOUR=6    # 오전 6시
AUTO_UPDATE_MINUTE=0  # 0분

# 업데이트 방식
AUTO_UPDATE_TYPE=enhanced  # enhanced, basic, multisource, advanced

# 실행 간격 (일)
AUTO_UPDATE_INTERVAL_DAYS=3  # 3일마다 실행
```

### 업데이트 방식

1. **enhanced**: 향상된 크롤링 (기본값)
2. **basic**: 기본 크롤링
3. **multisource**: 다중 소스 크롤링
4. **advanced**: 고급 크롤링

## 사용법

### 개발 환경

```bash
# 백엔드 개발 서버 실행 (스케줄러 포함)
npm run backend:dev

# 전체 개발 서버 실행
npm run dev:full
```

### 프로덕션 환경 (PM2)

```bash
# 백엔드 빌드
npm run backend:build

# PM2로 실행
npm run pm2:start

# PM2 상태 확인
npm run pm2:status

# PM2 로그 확인
npm run pm2:logs

# PM2 재시작
npm run pm2:restart

# PM2 중지
npm run pm2:stop
```

## API 엔드포인트

### 스케줄러 상태 확인

```bash
GET /api/scheduler/status
```

### 스케줄러 시작

```bash
POST /api/scheduler/start
Content-Type: application/json

{
  "enabled": true,
  "hour": 6,
  "minute": 0,
  "updateType": "enhanced"
}
```

### 스케줄러 중지

```bash
POST /api/scheduler/stop
```

### 설정 업데이트

```bash
PUT /api/scheduler/config
Content-Type: application/json

{
  "hour": 8,
  "minute": 30,
  "updateType": "advanced"
}
```

### 수동 업데이트 실행

```bash
# 기본 업데이트
POST /api/scheduler/manual-update

# 특정 방식으로 업데이트
POST /api/scheduler/manual-update
Content-Type: application/json

{
  "updateType": "enhanced"
}

# 또는 직접 엔드포인트 사용
POST /api/scheduler/update/enhanced
POST /api/scheduler/update/basic
POST /api/scheduler/update/multisource
POST /api/scheduler/update/advanced
```

### 데이터 참조 상태 확인

```bash
# 전체 데이터 참조 통계
GET /api/scheduler/data-reference-stats

# 특정 헬스장 데이터 참조 상태
GET /api/scheduler/gym/1/data-reference

# 업데이트가 필요한 헬스장 목록
GET /api/scheduler/gyms-needing-update
```

### 에러 처리 및 모니터링

```bash
# 에러 통계 조회
GET /api/scheduler/error-stats

# 에러 히스토리 초기화
DELETE /api/scheduler/error-history

# 배치 처리 통계
GET /api/scheduler/batch-stats
```

## 로그 확인

### 개발 환경

```bash
# 백엔드 로그 확인
cd src/backend
npm run dev
```

### 프로덕션 환경

```bash
# PM2 로그 확인
npm run pm2:logs

# 특정 앱 로그만 확인
pm2 logs deukgeun-backend
```

## 문제 해결

### 스케줄러가 실행되지 않는 경우

1. **환경 변수 확인**

   ```bash
   echo $AUTO_UPDATE_ENABLED
   echo $AUTO_UPDATE_HOUR
   echo $AUTO_UPDATE_MINUTE
   ```

2. **스케줄러 상태 확인**

   ```bash
   curl http://localhost:5000/api/scheduler/status
   ```

3. **수동 실행 테스트**
   ```bash
   curl -X POST http://localhost:5000/api/scheduler/manual-update
   ```

### PM2에서 문제가 있는 경우

1. **PM2 상태 확인**

   ```bash
   pm2 status
   ```

2. **PM2 로그 확인**

   ```bash
   pm2 logs deukgeun-backend
   ```

3. **PM2 재시작**
   ```bash
   pm2 restart deukgeun-backend
   ```

## 모니터링

### 스케줄러 상태 모니터링

````bash
# 상태 확인
curl http://localhost:5000/api/scheduler/status

# 응답 예시
{
  "success": true,
  "data": {
    "enabled": true,
    "updateType": "enhanced",
    "nextRun": "2024-01-18T06:00:00.000Z", // 3일 후
    "isRunning": false,
    "schedule": "06:00",
    "intervalDays": 3
  }
}

### 데이터 참조 통계 응답 예시
```json
{
  "success": true,
  "data": {
    "totalGyms": 228,
    "apiDataCount": 45,
    "crawlingDataCount": 23,
    "referenceDataCount": 160,
    "needsUpdateCount": 12,
    "status": [...]
  }
}
````

### 헬스장 데이터 참조 상태 응답 예시

```json
{
  "success": true,
  "data": {
    "lastUpdateDate": "2024-01-15T06:00:00.000Z",
    "nextUpdateDate": "2024-01-18T06:00:00.000Z",
    "daysUntilNextUpdate": 2,
    "dataSource": "api",
    "isUsingReferenceData": true
  }
}
```

### 에러 통계 응답 예시

```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalErrors": 15,
      "errorTypes": {
        "API_RATE_LIMIT": 8,
        "CRAWLING_TIMEOUT": 4,
        "NETWORK_ERROR": 3
      },
      "successRate": 85.5
    },
    "patterns": {
      "mostCommonError": "API_RATE_LIMIT",
      "errorTrend": "decreasing",
      "recommendations": [
        "API 호출 빈도를 줄이거나 API 키를 추가로 발급받으세요."
      ]
    }
  }
}
```

### 배치 처리 통계 응답 예시

```json
{
  "success": true,
  "data": {
    "totalGyms": 228,
    "optimalBatchSize": 10,
    "availableMemory": "512.00 MB",
    "estimatedBatches": 23
  }
}
```

````

### 헬스 체크

```bash
curl http://localhost:5000/api/health
````

## 주의사항

1. **데이터베이스 연결**: 스케줄러 실행 전 데이터베이스 연결이 필요합니다.
2. **메모리 사용량**: 크롤링 과정에서 메모리 사용량이 증가할 수 있습니다.
3. **네트워크 요청**: 외부 사이트 크롤링으로 인한 네트워크 부하가 있을 수 있습니다.
4. **에러 처리**: 크롤링 실패 시 자동으로 다음 실행을 기다립니다.

## 성능 최적화

1. **실행 시간 조정**: 서버 부하가 적은 시간대에 실행
2. **업데이트 방식 선택**: 필요에 따라 적절한 크롤링 방식 선택
3. **로깅 레벨 조정**: 프로덕션에서는 불필요한 로그 제거
