# 🔧 Deukgeun Backend 디버깅 가이드

## 📋 개요

이 문서는 Deukgeun 백엔드 서버의 문제 진단 및 해결을 위한 체계적인 가이드입니다.

## 🚨 일반적인 문제들

### 1. 환경변수 로딩 문제
- **증상**: `process.env.DB_HOST`가 `undefined`
- **원인**: `.env` 파일 경로 문제 또는 로딩 순서 문제
- **해결**: `npm run debug:env` 실행

### 2. 데이터베이스 연결 실패
- **증상**: `ECONNREFUSED` 또는 `ER_ACCESS_DENIED_ERROR`
- **원인**: MySQL 서버 미실행 또는 인증 정보 오류
- **해결**: `npm run debug:db` 실행

### 3. 라우트 등록 실패
- **증상**: API 엔드포인트가 404 반환
- **원인**: DB 초기화 전 라우트 등록 시도
- **해결**: `npm run debug:server` 실행

## 🔍 진단 도구

### 환경변수 진단
```bash
npm run debug:env
```
- 현재 작업 디렉토리 확인
- 환경 파일 경로 검색
- 중요한 환경변수 상태 확인
- 권장사항 제시

### 데이터베이스 진단
```bash
npm run debug:db
```
- MySQL 서버 연결 테스트
- 데이터베이스 존재 확인
- TypeORM DataSource 설정 테스트
- 엔티티 파일 경로 확인

### 서버 시작 진단
```bash
npm run debug:server
```
- Express 앱 생성 테스트
- 미들웨어 설정 확인
- 라우트 모듈 로드 테스트
- 실제 서버 시작 테스트

### 최소 재현 테스트
```bash
npm run debug:minimal
```
- 최소한의 코드로 문제 재현
- 단계별 테스트 수행
- 문제 원인 격리

## 📝 재현 조건 문서화

### 성공하는 명령어들
```bash
# 개발 환경
npm run dev:backend
npm run dev:simple
npm run dev:simple:robust

# 테스트 환경
npm run debug:minimal
npm run debug:server
```

### 실패하는 명령어들
```bash
# 프로덕션 빌드 후 실행
npm run build:backend
node dist/backend/index.js

# PM2 실행
npm run pm2:start
```

### 환경별 차이점

| 구분 | 개발 환경 | 프로덕션 환경 |
|------|-----------|---------------|
| 실행 명령 | `npx tsx src/backend/index.ts` | `node dist/backend/index.js` |
| 작업 디렉토리 | 프로젝트 루트 | 프로젝트 루트 |
| 환경 파일 | `src/backend/.env` | `dist/backend/.env` |
| 엔티티 경로 | `src/backend/entities/**/*.ts` | `dist/backend/entities/**/*.js` |

## 🔧 문제 해결 단계

### Step 1: 환경변수 확인
```bash
npm run debug:env
```
- 환경 파일 존재 여부 확인
- 중요한 환경변수 설정 확인
- 경로 문제 해결

### Step 2: 데이터베이스 연결 확인
```bash
npm run debug:db
```
- MySQL 서버 상태 확인
- 연결 정보 검증
- 데이터베이스 생성/확인

### Step 3: 서버 시작 확인
```bash
npm run debug:server
```
- Express 앱 생성 확인
- 미들웨어 설정 확인
- 라우트 등록 확인

### Step 4: 최소 재현 테스트
```bash
npm run debug:minimal
```
- 기본 기능만으로 테스트
- 문제 원인 격리
- 해결책 적용

## 🛠️ 수정된 코드 구조

### 1. 환경변수 로딩 순서
```typescript
// src/backend/index.ts
import "reflect-metadata"
import "@backend/config/env"  // 가장 먼저 로딩
```

### 2. 데이터베이스 연결 순서
```typescript
// src/backend/index.ts
async function startServer() {
  // Step 1: DB 연결 시도
  try {
    await connectDatabase()
  } catch (dbError) {
    console.warn("DB 연결 실패, 제한 모드로 시작")
  }
  
  // Step 2: Express 앱 생성
  const app = createApp()
  
  // Step 3: 서버 시작
  const server = app.listen(PORT, ...)
}
```

### 3. 라우트 등록 순서
```typescript
// src/backend/index.ts
function createApp() {
  const app = express()
  // 미들웨어 설정
  app.use("/api", apiRoutes)  // DB 초기화 후 라우트 등록
  return app
}
```

## 📊 로깅 및 모니터링

### 시작 시 로그
```
🔧 DEUKGEUN BACKEND SERVER STARTUP DEBUG START
🔧 Environment: development
🔧 Working Directory: /path/to/project
🔧 Database Host: localhost
🔄 Step 1: Attempting database connection...
✅ Database connection successful
🔄 Step 2: Creating Express application...
✅ Express application created
🔄 Step 3: Starting server on port 5000...
🚀 DEUKGEUN BACKEND SERVER STARTED
```

### 에러 로그
```
❌ DATABASE CONNECTION FAILED
❌ Error occurred during database connection:
   - Error type: Error
   - Error message: ECONNREFUSED
🔍 Error Analysis:
   - Issue: Connection refused
   - Cause: MySQL 서버가 실행되지 않았습니다
   - Solution: MySQL 서버 상태를 확인해주세요
```

## 🚀 빠른 해결 방법

### 1. 환경변수 문제
```bash
# 환경변수 확인
npm run debug:env

# .env 파일 생성 (예시)
cp env.example .env
# 또는
cp env.example src/backend/.env
```

### 2. 데이터베이스 문제
```bash
# 데이터베이스 확인
npm run debug:db

# MySQL 서버 시작
sudo service mysql start
# 또는
brew services start mysql
```

### 3. 서버 시작 문제
```bash
# 서버 진단
npm run debug:server

# 최소 재현 테스트
npm run debug:minimal
```

## 📚 추가 리소스

- [TypeORM 공식 문서](https://typeorm.io/)
- [Express.js 공식 문서](https://expressjs.com/)
- [Node.js 환경변수 가이드](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

## 🤝 문제 보고

문제가 지속되면 다음 정보와 함께 보고해주세요:

1. 실행한 명령어
2. 에러 메시지 전체
3. `npm run debug:all` 결과
4. 환경 정보 (OS, Node.js 버전 등)
