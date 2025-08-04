# Backend API Documentation

## 개요

이 프로젝트는 Next.js 프론트엔드와 연동되는 Express.js 백엔드 API입니다. JWT 기반 인증, reCAPTCHA 보안, 그리고 체육관 정보 관리 기능을 제공합니다.

## 주요 기능

### 🔐 인증 시스템

- **JWT 기반 인증**: Access Token (15분) + Refresh Token (7일)
- **reCAPTCHA 통합**: 로그인 및 회원가입 시 봇 방지
- **보안 쿠키**: HttpOnly, Secure, SameSite 설정
- **토큰 갱신**: 자동 토큰 갱신 시스템

### 🏋️ 체육관 관리

- **체육관 정보 크롤링**: 다중 소스에서 체육관 데이터 수집
- **위치 기반 검색**: 카카오맵 API 연동
- **자동 업데이트**: 스케줄러를 통한 데이터 자동 갱신

### 💬 커뮤니티 기능

- **게시글 관리**: CRUD 작업 지원
- **댓글 시스템**: 게시글별 댓글 기능
- **좋아요 기능**: 게시글 및 댓글 좋아요

## 보안 개선사항

### 🔒 JWT 보안 강화

```typescript
// 분리된 시크릿 키 사용
JWT_ACCESS_SECRET = your - access - secret - key;
JWT_REFRESH_SECRET = your - refresh - secret - key;
```

### 🛡️ reCAPTCHA 보안

- 토큰 유효성 검증
- 타임아웃 설정 (10초)
- 상세한 에러 로깅

### 🔍 입력 검증

- 이메일 형식 검증
- 비밀번호 강도 검증 (최소 8자)
- 필수 필드 검증

### 📝 로깅 시스템

- Winston 기반 구조화된 로깅
- 보안 이벤트 추적
- IP 주소 및 사용자 정보 기록

## API 엔드포인트

### 인증 관련

```
POST /api/auth/login     - 로그인
POST /api/auth/register  - 회원가입
POST /api/auth/refresh   - 토큰 갱신
POST /api/auth/logout    - 로그아웃
```

### 체육관 관련

```
GET  /api/gyms          - 체육관 목록 조회
GET  /api/gyms/:id      - 특정 체육관 조회
POST /api/gyms/search   - 체육관 검색
```

### 커뮤니티 관련

```
GET    /api/posts       - 게시글 목록
GET    /api/posts/:id   - 게시글 조회
POST   /api/posts       - 게시글 작성 (인증 필요)
PUT    /api/posts/:id   - 게시글 수정 (인증 필요)
DELETE /api/posts/:id   - 게시글 삭제 (인증 필요)
```

## 환경 변수 설정

### 필수 환경 변수

```bash
# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=gym_db

# JWT (분리된 시크릿 키)
JWT_ACCESS_SECRET=your-super-secure-access-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key

# reCAPTCHA
RECAPTCHA_SECRET=your-google-recaptcha-secret-key

# API 키
KAKAO_REST_MAP_API_KEY=your_kakao_api_key
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값으로 설정
```

### 3. 데이터베이스 설정

```bash
# MySQL 데이터베이스 생성
CREATE DATABASE gym_db;
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 보안 모범 사례

### ✅ 구현된 보안 기능

- JWT 토큰 분리 (Access/Refresh)
- reCAPTCHA 통합
- 입력 검증 및 sanitization
- 보안 쿠키 설정
- 구조화된 로깅
- 에러 처리 개선

### 🔄 권장 추가 보안 조치

- Rate Limiting 구현
- CORS 정책 강화
- Helmet.js 보안 헤더
- SQL Injection 방지
- XSS 방지

## 로깅

### 로그 레벨

- `error`: 심각한 오류
- `warn`: 경고 (보안 이벤트 포함)
- `info`: 일반 정보
- `debug`: 디버깅 정보

### 보안 이벤트 로깅

- 로그인 시도 (성공/실패)
- reCAPTCHA 검증 실패
- 토큰 검증 실패
- 비정상적인 요청 패턴

## 에러 처리

### 표준 에러 응답 형식

```json
{
  "message": "에러 메시지",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP 상태 코드

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌
- `500`: 서버 오류

## 개발 가이드

### 코드 스타일

- TypeScript strict 모드 사용
- ESLint + Prettier 설정
- 함수형 프로그래밍 지향
- 명확한 타입 정의

### 테스트

```bash
# 단위 테스트
npm test

# 통합 테스트
npm run test:integration
```

## 라이센스

MIT License
