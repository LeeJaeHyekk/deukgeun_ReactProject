# ⚙️ 개발 환경 설정 가이드

## 📋 개요

이 문서는 Deukgeun 프로젝트의 개발 환경을 설정하는 방법을 상세히 안내합니다.

## 🗂️ 환경 변수 관리

### 파일 구조
```
deukgeun/
├── env.unified          # 통합 환경 변수 파일
├── env.example          # 환경 변수 템플릿
├── .env                 # 프론트엔드 환경 변수
└── src/backend/.env     # 백엔드 환경 변수
```

### 환경 변수 설정 방법

#### 1. 자동 설정 (권장)
```bash
# 개발 환경 설정
npm run env:dev

# 프로덕션 환경 설정
npm run env:prod

# 환경 변수 검증
npm run env:validate
```

#### 2. 수동 설정
```bash
# 1. 환경 변수 파일 복사
cp env.example .env
cp env.example src/backend/.env

# 2. 각 파일에서 필요한 값들 설정
# .env (프론트엔드)
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Deukgeun

# src/backend/.env (백엔드)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=deukgeun_db
JWT_SECRET=your_jwt_secret
```

### 필수 환경 변수

#### 프론트엔드 (.env)
```bash
# API 설정
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Deukgeun
VITE_APP_VERSION=1.0.0

# 환경 설정
VITE_NODE_ENV=development
VITE_DEBUG_MODE=true
```

#### 백엔드 (src/backend/.env)
```bash
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_database_password
DB_NAME=deukgeun_db

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# 서버 설정
PORT=5000
NODE_ENV=development

# API 키 설정
KAKAO_API_KEY=your_kakao_api_key
SEOUL_API_KEY=your_seoul_api_key
```

## 🗄️ 데이터베이스 설정

### MySQL 설치 및 설정

#### Windows
```bash
# 1. MySQL 8.4 다운로드 및 설치
# https://dev.mysql.com/downloads/mysql/

# 2. MySQL 서비스 시작
net start MySQL80

# 3. MySQL 연결 테스트
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p
```

#### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# macOS (Homebrew)
brew install mysql

# MySQL 서비스 시작
sudo service mysql start
# 또는
brew services start mysql
```

### 데이터베이스 생성

```sql
-- 1. MySQL에 연결
mysql -u root -p

-- 2. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS deukgeun_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 3. 사용자 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'deukgeun_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON deukgeun_db.* TO 'deukgeun_user'@'localhost';
FLUSH PRIVILEGES;

-- 4. 연결 테스트
USE deukgeun_db;
SELECT 'Database connection successful!' as status;
```

### 데이터베이스 문제 해결

#### MySQL 서비스가 시작되지 않는 경우
```bash
# Windows
# 1. 서비스 상태 확인
sc query MySQL80

# 2. 서비스 수동 시작
net start MySQL80

# 3. MySQL 재설치 (필요시)
# MySQL 8.4 재설치 후 루트 비밀번호 설정

# Linux/Mac
# 1. 서비스 상태 확인
sudo service mysql status

# 2. 서비스 시작
sudo service mysql start

# 3. 로그 확인
sudo tail -f /var/log/mysql/error.log
```

#### 연결 오류 해결
```bash
# 1. 포트 사용 확인
netstat -an | findstr 3306  # Windows
netstat -an | grep 3306     # Linux/Mac

# 2. 방화벽 설정 확인
# Windows: 방화벽에서 MySQL 포트 3306 허용
# Linux: sudo ufw allow 3306

# 3. MySQL 설정 확인
mysql --version
```

## 🔧 빌드 시스템

### 빌드 시스템 특징
- **소스 파일 보호**: `src/` 폴더는 변경하지 않음
- **dist 폴더 전용 변환**: 빌드 결과물만 변환
- **자동 백업**: 빌드 전 기존 파일 백업
- **롤백 지원**: 문제 발생 시 이전 버전으로 복원

### 빌드 프로세스

#### 1. Pre-build 단계
```bash
# 1. 기존 dist 폴더 백업
# 2. 환경 변수 검증
# 3. 의존성 확인
```

#### 2. Backend 빌드
```bash
# 1. TypeScript 컴파일
# 2. 엔티티 파일 복사
# 3. 환경 변수 파일 복사
```

#### 3. Frontend 빌드
```bash
# 1. Vite 빌드 실행
# 2. 정적 파일 복사
# 3. 에셋 최적화
```

#### 4. JS to CJS 변환
```bash
# 1. ES Modules → CommonJS 변환
# 2. import.meta.env → process.env 변환
# 3. 경로 수정
```

#### 5. Post-build 단계
```bash
# 1. 빌드 검증
# 2. 로그 생성
# 3. 성공 알림
```

### 빌드 명령어

```bash
# 전체 빌드
npm run build

# 백엔드만 빌드
npm run build:backend

# 프론트엔드만 빌드
npm run build:frontend

# 빌드 + 자동 변환
npm run build:convert

# 빌드 검증
npm run build:verify
```

### 변환 규칙

#### ES Modules → CommonJS
```javascript
// Before (ES Modules)
import express from 'express'
export default app

// After (CommonJS)
const express = require('express')
module.exports = app
```

#### 환경 변수 변환
```javascript
// Before (Vite)
import.meta.env.VITE_API_URL

// After (Node.js)
process.env.VITE_API_URL
```

## 🚀 개발 서버 실행

### 백엔드 서버 실행

#### 방법 1: npm 스크립트 (권장)
```bash
# 개발 서버 실행
npm run dev:backend

# 간단한 서버 실행
npm run dev:simple

# 폴백 서버 실행
npm run dev:simple:fallback
```

#### 방법 2: 직접 실행
```bash
# TypeScript 직접 실행
npx tsx src/backend/index.ts

# 백엔드 디렉토리에서 실행
cd src/backend
npx tsx index.ts
```

### 프론트엔드 서버 실행

```bash
# 개발 서버 실행
npm run dev:frontend

# 또는 Vite 직접 실행
npx vite
```

### 전체 개발 환경 실행

```bash
# 백엔드와 프론트엔드를 병렬로 실행
npm run dev

# 또는 개별 실행
# 터미널 1
npm run dev:backend

# 터미널 2
npm run dev:frontend
```

## 🔍 환경 진단

### 진단 명령어

```bash
# 환경 변수 진단
npm run debug:env

# 데이터베이스 진단
npm run debug:db

# 서버 진단
npm run debug:server

# 전체 진단
npm run debug:all

# 최소 재현 테스트
npm run debug:minimal
```

### 진단 결과 해석

#### 성공적인 시작 로그
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

#### 실패 시 에러 로그
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

## 🛠️ 개발 도구 설정

### VS Code 확장 프로그램 (권장)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

### ESLint 설정

```json
// .eslintrc.js
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error"
  }
}
```

### Prettier 설정

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## 📊 모니터링 및 로깅

### 로그 파일 위치
```
logs/
├── backend-combined-0.log    # 백엔드 통합 로그
├── backend-error-0.log       # 백엔드 에러 로그
├── frontend-combined-0.log   # 프론트엔드 통합 로그
├── frontend-error-0.log      # 프론트엔드 에러 로그
├── error.log                 # 에러 로그
└── combined.log              # 전체 통합 로그
```

### 로그 확인 명령어

```bash
# 실시간 로그 확인
npm run logs:watch

# 에러 로그만 확인
npm run logs:error

# 특정 서비스 로그 확인
npm run logs:backend
npm run logs:frontend
```

## ✅ 환경 설정 체크리스트

### 필수 확인사항
- [ ] Node.js 18+ 설치됨
- [ ] MySQL 8.0+ 설치 및 실행 중
- [ ] 환경 변수 파일 생성됨
- [ ] 데이터베이스 생성됨
- [ ] 의존성 설치됨 (`npm install`)

### 개발 환경 확인
- [ ] 백엔드 서버 정상 시작 (`npm run dev:backend`)
- [ ] 프론트엔드 서버 정상 시작 (`npm run dev:frontend`)
- [ ] 데이터베이스 연결 성공
- [ ] API 엔드포인트 응답 확인
- [ ] 헬스 체크 통과 (`/health`)

### 문제 해결
- [ ] 환경 변수 진단 실행 (`npm run debug:env`)
- [ ] 데이터베이스 진단 실행 (`npm run debug:db`)
- [ ] 서버 진단 실행 (`npm run debug:server`)
- [ ] 로그 파일 확인
- [ ] 포트 사용 확인

## 🆘 문제 해결

### 자주 발생하는 문제

#### 1. 환경 변수 로딩 실패
```bash
# 해결 방법
npm run debug:env
# .env 파일 위치와 내용 확인
```

#### 2. 데이터베이스 연결 실패
```bash
# 해결 방법
npm run debug:db
# MySQL 서비스 상태 확인
```

#### 3. 포트 충돌
```bash
# 해결 방법
# 포트 사용 확인
netstat -an | findstr 5000
# 다른 포트 사용 또는 프로세스 종료
```

#### 4. 의존성 문제
```bash
# 해결 방법
rm -rf node_modules package-lock.json
npm install
```

---

**💡 팁**: 문제가 지속되면 [에러 처리 및 디버깅 가이드](./06_ERROR_HANDLING_DEBUGGING.md)를 참고하세요!
