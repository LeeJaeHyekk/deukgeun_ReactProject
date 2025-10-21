# 주간 크롤링 가이드

## 📋 개요

이 프로젝트는 **gyms_raw.json 데이터만 사용**하며, 7일 주기로 크롤링을 실행하여 데이터를 업데이트합니다.

## 🎯 데이터 구조

### gyms_raw.json
- **위치**: `src/data/gyms_raw.json`
- **용도**: 프론트엔드에서 사용하는 유일한 헬스장 데이터 소스
- **업데이트**: 7일마다 자동 업데이트 (cron)

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

### 수동 실행

```bash
# 백엔드 디렉토리로 이동
cd src/backend

# 크롤링 스크립트 실행
npx ts-node scripts/weekly-crawling-cron.ts
```

### Cron 등록 (Linux/Mac)

```bash
# crontab 편집
crontab -e

# 매주 일요일 새벽 2시에 실행
0 2 * * 0 cd /path/to/deukgeun && npx ts-node src/backend/scripts/weekly-crawling-cron.ts >> logs/weekly-crawling.log 2>&1
```

### Windows Task Scheduler

1. **작업 스케줄러** 열기
2. **기본 작업 만들기** 선택
3. 이름: "Deukgeun Weekly Crawling"
4. 트리거: 매주 일요일 새벽 2시
5. 작업: 프로그램 시작
   - 프로그램: `npx.cmd`
   - 인수: `ts-node src/backend/scripts/weekly-crawling-cron.ts`
   - 시작 위치: `C:\path\to\deukgeun`

### PM2를 사용한 스케줄링 (권장)

```bash
# PM2 설치
npm install -g pm2

# 전체 프로세스 시작 (크롤링 포함)
pm2 start ecosystem.config.cjs

# 크롤링만 시작
pm2 start ecosystem.config.cjs --only weekly-crawling

# PM2 상태 확인
pm2 status

# 크롤링 로그 확인
pm2 logs weekly-crawling

# 크롤링 상태 상세 확인
pm2 show weekly-crawling
```

#### PM2 매니저 스크립트 사용

```bash
# PM2 매니저로 크롤링 관리
npx ts-node scripts/pm2-manager.ts crawl      # 수동 크롤링 실행
npx ts-node scripts/pm2-manager.ts crawl-logs # 크롤링 로그 확인
npx ts-node scripts/pm2-manager.ts crawl-status # 크롤링 상태 확인
```

#### ecosystem.config.cjs 설정

```javascript
module.exports = {
  apps: [
    {
      name: 'weekly-crawling',
      script: 'npx',
      args: 'ts-node src/backend/scripts/weekly-crawling-cron.ts',
      cron_restart: '0 2 * * 0', // 매주 일요일 새벽 2시
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      // 로그 설정
      error_file: './logs/weekly-crawling-error.log',
      out_file: './logs/weekly-crawling-out.log',
      log_file: './logs/weekly-crawling-combined.log'
    }
  ]
}
```

## 📊 크롤링 통계

크롤링 실행 후 다음 정보를 확인할 수 있습니다:

- 총 세션 수
- 완료된 세션 수
- 평균 소요 시간
- 수집된 헬스장 수
- 업데이트된 헬스장 수

## 🚀 EC2 환경 배포

### 자동 배포 스크립트

```bash
# EC2에 배포
chmod +x src/backend/scripts/ec2-deploy-crawling.sh
./src/backend/scripts/ec2-deploy-crawling.sh
```

### 수동 배포

```bash
# 1. PM2 설치
npm install -g pm2

# 2. 환경 변수 설정
cp env.ec2 .env

# 3. 프로세스 시작
pm2 start ecosystem.config.cjs

# 4. 자동 시작 설정
pm2 startup
pm2 save
```

### 모니터링

```bash
# 크롤링 상태 확인
npx ts-node src/backend/scripts/ec2-monitor-crawling.ts

# PM2 상태 확인
pm2 status
pm2 logs weekly-crawling

# 수동 크롤링 실행
npx ts-node scripts/pm2-manager.ts crawl
```

## 🔧 설정 옵션

### EC2 환경 설정 (env.ec2)

```bash
# 기본 환경 설정
NODE_ENV=production
CRAWLING_BATCH_SIZE=10
CRAWLING_MAX_CONCURRENT=3
CRAWLING_RETRY_DELAY=2000
CRAWLING_TIMEOUT=30000

# 안전 설정
SAFE_FILE_RETRIES=3
SAFE_FILE_DELAY=1000
SAFE_PROCESS_TIMEOUT=300000

# 로그 설정
LOG_LEVEL=info
LOG_MAX_SIZE=10M
LOG_RETAIN=5
```

### 스크립트 내 설정

```typescript
crawlingService.updateConfig({
  enablePublicApi: true,        // 공공 API 수집 활성화
  enableCrawling: true,          // 웹 크롤링 활성화
  enableDataMerging: true,       // 데이터 병합 활성화
  enableQualityCheck: true,      // 품질 검사 활성화
  batchSize: 10,                 // 배치 크기 (EC2 최적화)
  maxConcurrentRequests: 3,      // 최대 동시 요청 수 (EC2 최적화)
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

## ⚠️ 주의사항

1. **데이터베이스 미사용**: 이 프로젝트는 데이터베이스를 사용하지 않습니다. 모든 데이터는 gyms_raw.json에 저장됩니다.

2. **API 제한**: 공공 API와 웹 크롤링 모두 API 제한이 있을 수 있으므로, 적절한 지연 시간을 설정해야 합니다.

3. **파일 백업**: gyms_raw.json 파일은 정기적으로 백업하는 것이 좋습니다.

4. **디스크 공간**: 크롤링 데이터와 로그가 누적될 수 있으므로 디스크 공간을 확인해야 합니다.

## 🐛 문제 해결

### 크롤링이 실패하는 경우

1. 로그 파일 확인
2. API 키 확인 (환경 변수)
3. 네트워크 연결 확인
4. 디스크 공간 확인

### gyms_raw.json이 업데이트되지 않는 경우

1. 파일 권한 확인
2. 디렉토리 존재 확인
3. JSON 형식 유효성 확인

## 📚 관련 문서

- [크롤링 시스템 가이드](./CRAWLING_SYSTEM_SUMMARY.md)
- [향상된 크롤링 기능](./ENHANCED_CRAWLING_GUIDE.md)
- [빌드 가이드](./BUILD_GUIDE.md)

