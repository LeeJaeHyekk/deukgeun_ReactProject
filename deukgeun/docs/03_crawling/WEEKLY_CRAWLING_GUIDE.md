# 주간 크롤링 가이드

## 📋 개요

이 프로젝트는 **gyms_raw.json 데이터만 사용**하며, 7일 주기로 크롤링을 실행하여 데이터를 업데이트합니다. 현재는 **백엔드 서버 내부 스케줄링** 방식을 사용하여 매주 일요일 오전 6시에 자동으로 실행됩니다.

## 🏗️ 스케줄링 구조

### 현재 방식: 백엔드 서버 내부 스케줄링

백엔드 서버 내부 스케줄링은 **백엔드 서버 프로세스가 실행 중일 때, 서버 내부에서 직접 cron 작업을 실행**하는 방식입니다.

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
│  │  │ - 매주 일요일 오전 6시 실행          │  │  │
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

### 이전 방식: PM2 Cron (문제점)

PM2의 `cron_restart`를 사용하는 방식은 다음과 같은 문제가 있었습니다:
- 크롤링 스크립트는 일회성 작업 (실행 후 `process.exit()`)
- PM2 cron은 실행 중인 프로세스를 재시작하는 기능
- 프로세스가 종료되면 cron이 다시 시작하지 않음
- `autorestart: false`로 설정되어 자동 재시작 안 됨

## 🎯 데이터 구조

### gyms_raw.json
- **위치**: `src/data/gyms_raw.json`
- **용도**: 프론트엔드에서 사용하는 유일한 헬스장 데이터 소스
- **업데이트**: 매주 일요일 오전 6시 자동 업데이트

### 데이터 흐름
```
공공 API → 웹 크롤링 → gyms_raw.json → 프론트엔드
```

**중요**: 이 프로젝트는 데이터베이스를 사용하지 않고 파일 기반으로만 동작합니다.

## 🔄 크롤링 프로세스

### 1단계: 공공 API 데이터 수집
- 서울시 공공데이터 API에서 기본 헬스장 정보 수집
- 영업 중인 시설만 필터링
- 헬스장 관련 업종만 필터링

### 2단계: gyms_raw.json에 저장
- 기존 데이터와 병합
- 중복 제거 (이름 + 주소 기반)

### 3단계: 웹 크롤링
- gyms_raw.json의 각 헬스장에 대해 5개 검색 엔진에서 상세 정보 크롤링
  - Naver Search
  - Google Search
  - Daum Search
  - Naver Blog
  - Naver Cafe

### 4단계: 데이터 병합 및 최종 저장
- 크롤링 데이터와 기존 데이터 병합
- 신뢰도 기반 충돌 해결
- gyms_raw.json에 최종 저장

## 🚀 사용 방법

### 자동 실행 (기본)

백엔드 서버가 실행되면 자동으로 스케줄러가 시작됩니다:

```bash
# 백엔드 서버 시작
npm run start:prod

# 또는 PM2로 시작
pm2 start ecosystem.config.cjs --env production
```

### 수동 실행

```bash
# API를 통한 수동 실행
curl -X POST http://localhost:5000/api/crawling/run

# 또는 직접 스크립트 실행
npx tsx src/backend/scripts/weeklyCrawlingCron.ts
```

### 크롤링 상태 확인

```bash
# API를 통한 상태 확인
curl http://localhost:5000/api/crawling/status

# 또는 브라우저에서 확인
http://localhost:5000/api/crawling/status
```

## 📊 크롤링 통계

크롤링 실행 후 다음 정보를 확인할 수 있습니다:

- 총 세션 수
- 완료된 세션 수
- 평균 소요 시간
- 수집된 헬스장 수
- 업데이트된 헬스장 수
- 다음 실행 예정 시간

## 🔧 설정 옵션

### Cron 스케줄 설정

환경 변수를 통해 스케줄을 설정할 수 있습니다:

```bash
# .env 파일에 설정
WEEKLY_CRAWLING_SCHEDULE=0 6 * * 0  # 매주 일요일 오전 6시 (기본값)
```

**주의**: 스케줄은 반드시 **매주 일요일 오전 6시**로 설정되어야 합니다. 다른 시간이나 날짜는 허용되지 않습니다.

### 크롤링 스크립트 설정

```typescript
crawlingService.updateConfig({
  enablePublicApi: true,        // 공공 API 수집 활성화
  enableCrawling: true,          // 웹 크롤링 활성화
  enableDataMerging: true,       // 데이터 병합 활성화
  enableQualityCheck: true,      // 품질 검사 활성화
  batchSize: 10,                 // 배치 크기
  maxConcurrentRequests: 3,      // 최대 동시 요청 수
  delayBetweenBatches: 2000,     // 배치 간 지연 (ms)
  maxRetries: 3,                 // 최대 재시도 횟수
  timeout: 30000,                // 타임아웃 (ms)
  saveToFile: true,              // 파일 저장 여부
  saveToDatabase: false          // DB 저장 비활성화
})
```

## 📝 로그

크롤링 로그는 다음 위치에 저장됩니다:

- **크롤링 히스토리**: `logs/crawling-history.json`
- **에러 로그**: `logs/error.log`
- **통합 로그**: `logs/combined.log`
- **백엔드 로그**: `logs/backend-combined.log`

## 🔍 모니터링

### 크롤링 실행 확인

```bash
# API를 통한 상태 확인
curl http://localhost:5000/api/crawling/status

# 백엔드 로그 확인
pm2 logs deukgeun-backend

# 크롤링 결과 파일 확인
cat src/data/gyms_raw.json | jq '. | length'  # 헬스장 개수 확인
```

### 크롤링 성공 여부 확인

- **로그 파일**: `logs/backend-combined.log`
- **결과 파일**: `src/data/gyms_raw.json` (마지막 수정 시간 확인)
- **API 상태**: `GET /api/crawling/status`

## ⚠️ 주의사항

1. **데이터베이스 미사용**: 이 프로젝트는 데이터베이스를 사용하지 않습니다. 모든 데이터는 gyms_raw.json에 저장됩니다.

2. **API 제한**: 공공 API와 웹 크롤링 모두 API 제한이 있을 수 있으므로, 적절한 지연 시간을 설정해야 합니다.

3. **파일 백업**: gyms_raw.json 파일은 정기적으로 백업하는 것이 좋습니다.

4. **디스크 공간**: 크롤링 데이터와 로그가 누적될 수 있으므로 디스크 공간을 확인해야 합니다.

5. **스케줄 고정**: 크롤링 스케줄은 매주 일요일 오전 6시로 고정되어 있습니다. 다른 시간이나 날짜로 변경할 수 없습니다.

## 🐛 문제 해결

### 크롤링이 실패하는 경우

1. 로그 파일 확인: `logs/backend-combined.log`
2. API 키 확인 (환경 변수)
3. 네트워크 연결 확인
4. 디스크 공간 확인
5. API 상태 확인: `GET /api/crawling/status`

### gyms_raw.json이 업데이트되지 않는 경우

1. 파일 권한 확인
2. 디렉토리 존재 확인
3. JSON 형식 유효성 확인
4. 크롤링 스크립트 실행 로그 확인

### 서버가 시작되지 않는 경우

1. 환경 변수 확인
2. 포트 충돌 확인
3. 데이터베이스 연결 확인 (선택사항)
4. 의존성 설치 확인

## 📚 관련 문서

- [백엔드 내부 스케줄링 구조](./BACKEND_INTERNAL_SCHEDULING.md)
- [크롤링 시스템 가이드](./CRAWLING_SYSTEM_SUMMARY.md)
- [향상된 크롤링 기능](./ENHANCED_CRAWLING_GUIDE.md)
- [크롤링 모듈 README](./CRAWLING_MODULE_README.md)
