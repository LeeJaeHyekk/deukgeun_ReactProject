# 🚀 Deukgeun 개발 환경 설정 가이드

## 1. 환경 변수 설정

### 백엔드 환경 변수

```bash
# 백엔드 환경 변수 파일 생성
cp src/backend/env.sample src/backend/.env
```

### 프론트엔드 환경 변수

```bash
# 프론트엔드 환경 변수 파일 생성
cp env.example .env
```

## 2. 필수 환경 변수 설정

### 백엔드 (.env)

```env
# 필수 설정
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_NAME=deukgeun_db
JWT_SECRET=your-jwt-secret-key
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

### 프론트엔드 (.env)

```env
# 필수 설정
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_PORT=5173
```

## 3. 데이터베이스 설정

### MySQL 설치 및 설정

1. MySQL 8.0 이상 설치
2. 데이터베이스 생성:

```sql
CREATE DATABASE deukgeun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 데이터베이스 초기화

```bash
# 데이터베이스 동기화
npm run db:sync

# 초기 데이터 시드
npm run db:seed
```

## 4. 개발 서버 실행

### 전체 개발 서버 실행 (권장)

```bash
npm run dev:full
```

### 개별 실행

```bash
# 백엔드만 실행
npm run backend:dev

# 프론트엔드만 실행
npm run dev
```

## 5. 접속 확인

- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:5000
- **API 문서**: http://localhost:5000/api-docs (Swagger)

## 6. 문제 해결

### 포트 충돌 시

```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# 프로세스 종료
taskkill /PID <PID번호> /F
```

### 의존성 문제 시

```bash
# 루트 의존성 재설치
npm install

# 백엔드 의존성 재설치
cd src/backend && npm install
```

### 데이터베이스 연결 문제 시

1. MySQL 서비스 실행 확인
2. 환경 변수의 DB 설정 확인
3. 방화벽 설정 확인

## 7. 개발 도구

### 코드 포맷팅

```bash
npm run format
```

### 린트 검사

```bash
npm run lint
npm run lint:fix
```

### 타입 검사

```bash
npm run type-check
```

## 8. 테스트

### 백엔드 테스트

```bash
cd src/backend
npm test
```

### 프론트엔드 테스트

```bash
npm run test
```
