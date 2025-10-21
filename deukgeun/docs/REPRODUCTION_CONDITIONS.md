# 🔍 재현 조건 문서화

## 📋 개요

이 문서는 Deukgeun 백엔드 서버의 문제 재현을 위한 정확한 조건과 해결 방법을 기록합니다.

## 🎯 정확한 실행 명령어 기록

### ✅ 성공하는 명령어들

#### 개발 환경 (TypeScript 직접 실행)
```bash
# 메인 개발 명령어
npm run dev:backend
# 실제 실행: cd src/backend && npm run dev

# 대안 개발 명령어들
npm run dev:simple
npm run dev:simple:robust
npm run dev:simple:fallback

# 직접 TypeScript 실행
npx tsx src/backend/index.ts
cd src/backend && npx tsx index.ts
```

#### 테스트/진단 명령어들
```bash
# 환경변수 진단
npm run debug:env
npx tsx src/backend/scripts/debug-environment.ts

# 데이터베이스 진단
npm run debug:db
npx tsx src/backend/scripts/debug-database.ts

# 서버 시작 진단
npm run debug:server
npx tsx src/backend/scripts/debug-server.ts

# 최소 재현 테스트
npm run debug:minimal
npx tsx src/backend/scripts/minimal-reproduction.ts
```

### ❌ 실패하는 명령어들

#### 프로덕션 빌드 후 실행
```bash
# 빌드 후 실행 (실패)
npm run build:backend
node dist/backend/index.js

# PM2 실행 (실패)
npm run pm2:start
npm run pm2:restart
```

#### Docker 실행 (환경에 따라 실패)
```bash
# Docker 실행
docker-compose up
docker run -p 5000:5000 deukgeun-backend
```

## 🔍 환경별 차이점 분석

### 개발 환경 vs 프로덕션 환경

| 구분 | 개발 환경 | 프로덕션 환경 |
|------|-----------|---------------|
| **실행 명령어** | `npx tsx src/backend/index.ts` | `node dist/backend/index.js` |
| **작업 디렉토리** | 프로젝트 루트 | 프로젝트 루트 |
| **환경 파일 위치** | `src/backend/.env` | `dist/backend/.env` |
| **엔티티 경로** | `src/backend/entities/**/*.ts` | `dist/backend/entities/**/*.js` |
| **TypeScript 컴파일** | 실시간 (tsx) | 사전 빌드 (tsc) |
| **환경변수 로딩** | `@backend/config/env` | `@backend/config/env` |

### ts-node vs 컴파일된 JS 차이점

| 구분 | ts-node 실행 | 컴파일된 JS 실행 |
|------|--------------|------------------|
| **파일 확장자** | `.ts` | `.js` |
| **경로 해석** | TypeScript 경로 | JavaScript 경로 |
| **환경변수 로딩** | 소스 경로 기준 | 빌드 경로 기준 |
| **엔티티 로딩** | `src/**/*.ts` | `dist/**/*.js` |

## 🗄️ 데이터베이스 연결 문제

### 환경변수 로딩 순서 문제

#### 문제 상황
```typescript
// src/backend/index.ts
import "@backend/config/env"  // 환경변수 로딩
import { connectDatabase } from "@backend/config/database"

// src/backend/config/database.ts
import { config } from "dotenv"
config()  // 중복 로딩!
```

#### 해결 방법
```typescript
// src/backend/index.ts
import "reflect-metadata"
import "@backend/config/env"  // 가장 먼저 로딩
// ... 다른 import들
```

### 데이터베이스 초기화 순서 문제

#### 문제 상황
```typescript
// 라우트가 DB 초기화 전에 등록됨
app.use("/api", apiRoutes)  // DB 연결 전
await connectDatabase()     // DB 연결 후
```

#### 해결 방법
```typescript
// DB 연결 후 라우트 등록
await connectDatabase()
const app = createApp()  // 라우트 포함
```

## 🔧 수정된 코드 구조

### 1. 환경변수 로딩 개선

#### Before (문제)
```typescript
// src/backend/index.ts
import "reflect-metadata"
import express from "express"
// ... 다른 import들
import "@backend/config/env"  // 늦은 로딩
```

#### After (해결)
```typescript
// src/backend/index.ts
import "reflect-metadata"
import "@backend/config/env"  // 가장 먼저 로딩
import express from "express"
// ... 다른 import들
```

### 2. 데이터베이스 연결 순서 개선

#### Before (문제)
```typescript
async function startServer() {
  const app = createSimpleApp()  // DB 연결 없이 앱 생성
  const server = app.listen(PORT, ...)
}
```

#### After (해결)
```typescript
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

### 3. 라우트 등록 순서 개선

#### Before (문제)
```typescript
function createSimpleApp() {
  const app = express()
  // 미들웨어만 설정
  return app
}
```

#### After (해결)
```typescript
function createApp() {
  const app = express()
  // 미들웨어 설정
  app.use("/api", apiRoutes)  // DB 초기화 후 라우트 등록
  return app
}
```

## 🚀 빠른 문제 해결

### 1. 환경변수 문제 해결
```bash
# 환경변수 진단
npm run debug:env

# .env 파일 생성
cp env.example .env
# 또는
cp env.example src/backend/.env

# 환경변수 확인
echo $DB_HOST
echo $DB_PORT
echo $DB_USERNAME
```

### 2. 데이터베이스 문제 해결
```bash
# 데이터베이스 진단
npm run debug:db

# MySQL 서버 상태 확인
sudo service mysql status
# 또는
brew services list | grep mysql

# MySQL 서버 시작
sudo service mysql start
# 또는
brew services start mysql
```

### 3. 서버 시작 문제 해결
```bash
# 서버 진단
npm run debug:server

# 최소 재현 테스트
npm run debug:minimal

# 전체 진단
npm run debug:all
```

## 📊 로깅 및 모니터링

### 성공적인 시작 로그
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

### 실패 시 에러 로그
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

## 🎯 문제 해결 체크리스트

### 환경변수 문제
- [ ] `.env` 파일이 올바른 위치에 있는가?
- [ ] 환경변수가 올바르게 설정되었는가?
- [ ] `npm run debug:env` 결과 확인

### 데이터베이스 문제
- [ ] MySQL 서버가 실행 중인가?
- [ ] 연결 정보가 올바른가?
- [ ] `npm run debug:db` 결과 확인

### 서버 시작 문제
- [ ] TypeScript 컴파일이 성공했는가?
- [ ] 라우트 모듈이 올바르게 로드되는가?
- [ ] `npm run debug:server` 결과 확인

## 📚 추가 리소스

- [TypeORM 공식 문서](https://typeorm.io/)
- [Express.js 공식 문서](https://expressjs.com/)
- [Node.js 환경변수 가이드](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [MySQL 연결 문제 해결](https://dev.mysql.com/doc/refman/8.0/en/problems-connecting.html)
