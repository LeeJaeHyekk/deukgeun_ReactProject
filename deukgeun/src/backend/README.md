# Backend API

TypeORM과 MySQL을 사용하는 Express.js 백엔드 API입니다.

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password_here
DB_NAME=deukgeun_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. MySQL 데이터베이스 설정

1. MySQL 서버가 실행 중인지 확인
2. `deukgeun_db` 데이터베이스 생성:

```sql
CREATE DATABASE deukgeun_db;
```

## 실행

### 개발 모드

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## API 엔드포인트

### Posts

- `GET /api/posts` - 모든 포스트 조회
- `GET /api/posts/:id` - 특정 포스트 조회
- `POST /api/posts` - 새 포스트 생성 (인증 필요)
- `PUT /api/posts/:id` - 포스트 수정 (인증 필요)
- `DELETE /api/posts/:id` - 포스트 삭제 (인증 필요)

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: TypeORM 0.2.45
- **Database**: MySQL
- **Language**: TypeScript
- **Authentication**: JWT
- **Logging**: Winston
