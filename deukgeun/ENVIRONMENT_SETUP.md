# 환경변수 설정 가이드

## 프론트엔드 환경변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Google reCAPTCHA Site Key (v3)
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

## 백엔드 환경변수

백엔드 프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL=your-database-connection-string

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Google reCAPTCHA Secret Key
RECAPTCHA_SECRET=your-recaptcha-secret-key

# CORS Configuration (Optional)
CORS_ORIGIN=http://localhost:5173
```

## reCAPTCHA 설정

1. [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)에 접속
2. 새 사이트 등록
3. reCAPTCHA v3 선택
4. 도메인 등록 (개발 시: `localhost`, `127.0.0.1`)
5. Site Key와 Secret Key를 환경변수에 설정

## 개발용 더미 reCAPTCHA

개발 환경에서는 Google에서 제공하는 테스트 키를 사용할 수 있습니다:

- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

## 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 강력한 비밀키를 사용하세요
- JWT_SECRET은 최소 32자 이상의 랜덤 문자열을 사용하세요

## 환경변수 확인

프로젝트 실행 전 다음 사항들을 확인하세요:

1. 프론트엔드와 백엔드의 `.env` 파일이 올바르게 설정되었는지 확인
2. 백엔드 서버가 실행 중인지 확인
3. 데이터베이스 연결이 정상적인지 확인
4. reCAPTCHA 키가 올바른지 확인
