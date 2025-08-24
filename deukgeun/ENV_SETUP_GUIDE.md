# 🌍 Deukgeun 프로젝트 환경 변수 설정 가이드

## 📋 개요

이 문서는 Deukgeun 프로젝트의 환경 변수 설정 방법을 안내합니다.

## 🚀 빠른 시작

### 1. 환경 변수 파일 생성

```bash
# 프로젝트 루트에서
cp env.sample .env

# 백엔드 디렉토리에서
cd src/backend
cp env.sample .env
```

### 2. 필수 설정

다음 항목들은 **반드시** 설정해야 합니다:

#### 🗄️ 데이터베이스 설정

```env
DB_PASSWORD=your_actual_mysql_password
```

#### 🔐 JWT 설정

```env
JWT_SECRET=your-secret-key-for-development
JWT_ACCESS_SECRET=your-access-secret-for-development
JWT_REFRESH_SECRET=your-refresh-secret-for-development
```

## 📁 환경 변수 파일 구조

### 프로젝트 루트 (`.env`)

- 전체 프로젝트 공통 설정
- 프론트엔드와 백엔드 모두에서 사용

### 백엔드 디렉토리 (`src/backend/.env`)

- 백엔드 전용 설정
- 데이터베이스 연결, JWT, API 키 등

## 🔧 상세 설정 가이드

### 🗄️ MySQL 데이터베이스 설정

1. **MySQL 설치 확인**

   ```bash
   mysql --version
   ```

2. **데이터베이스 생성**

   ```sql
   CREATE DATABASE deukgeun_db;
   ```

3. **환경 변수 설정**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=deukgeun_db
   ```

### 📧 이메일 설정 (Gmail)

1. **Gmail 앱 비밀번호 생성**
   - Gmail 계정 설정 → 보안 → 2단계 인증 활성화
   - 앱 비밀번호 생성

2. **환경 변수 설정**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

### 🗺️ 카카오 API 설정

1. **카카오 개발자 계정 생성**
   - https://developers.kakao.com 에서 애플리케이션 생성

2. **환경 변수 설정**
   ```env
   KAKAO_API_KEY=your_kakao_api_key
   KAKAO_JAVASCRIPT_MAP_API_KEY=your_javascript_key
   KAKAO_REST_MAP_API_KEY=your_rest_api_key
   ```

### 🔍 구글 API 설정

1. **Google Cloud Console에서 API 키 생성**
   - Places API 활성화

2. **환경 변수 설정**
   ```env
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   ```

## 🛡️ 보안 주의사항

### ❌ 절대 하지 말아야 할 것들

- `.env` 파일을 Git에 커밋하지 마세요
- 실제 API 키를 샘플 파일에 포함하지 마세요
- 프로덕션 환경에서 기본값을 사용하지 마세요

### ✅ 안전한 설정 방법

- `.env` 파일을 `.gitignore`에 추가
- 환경별로 다른 `.env` 파일 사용
- 민감한 정보는 환경 변수로 관리

## 🔍 환경 변수 검증

### 백엔드 실행 테스트

```bash
cd src/backend
npm run dev
```

### 프론트엔드 실행 테스트

```bash
npm run dev
```

## 🐛 문제 해결

### 데이터베이스 연결 오류

```
Error: Access denied for user 'root'@'localhost'
```

**해결 방법:**

1. MySQL 비밀번호 확인
2. `DB_PASSWORD` 환경 변수 설정
3. MySQL 서비스 실행 확인

### JWT 오류

```
JWT secrets not set in environment variables
```

**해결 방법:**

1. JWT 관련 환경 변수 설정
2. 환경 변수 파일이 올바른 위치에 있는지 확인

### CORS 오류

```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked
```

**해결 방법:**

1. `CORS_ORIGIN` 환경 변수에 프론트엔드 URL 추가
2. 백엔드 CORS 설정 확인

## 📚 추가 리소스

- [MySQL 설치 가이드](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/)
- [Gmail 앱 비밀번호 설정](https://support.google.com/accounts/answer/185833)
- [카카오 개발자 가이드](https://developers.kakao.com/docs/latest/ko/getting-started/sdk-js)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🤝 도움 요청

문제가 발생하면 다음을 확인해주세요:

1. 환경 변수 파일이 올바른 위치에 있는지
2. 모든 필수 설정이 완료되었는지
3. MySQL 서비스가 실행 중인지
4. 포트 충돌이 없는지
