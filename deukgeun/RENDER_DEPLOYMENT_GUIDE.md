# Render 배포 가이드

## 문제 해결

기존 오류: `ModuleNotFoundError: No module named 'dist'`

**원인**: 이 프로젝트는 Node.js/TypeScript 백엔드인데, Render에서 Python/Flask로 배포하려고 시도했습니다.

## 해결 방법

### 1. Render 대시보드에서 설정 변경

1. **Environment**: `Python` → `Node.js`로 변경
2. **Build Command**: `npm install && npm run build:backend`
3. **Start Command**: `npm run start:backend`

### 2. 환경 변수 설정

다음 환경 변수들을 Render 대시보드에서 설정하세요:

```
NODE_ENV=production
PORT=10000
DB_HOST=your_database_host
DB_PORT=3306
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

### 3. 자동 배포 설정 (선택사항)

`render.yaml` 파일을 사용하여 자동 배포를 설정할 수 있습니다:

```yaml
services:
  - type: web
    name: deukgeun-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build:backend
    startCommand: npm run start:backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      # ... 기타 환경 변수들
```

### 4. 데이터베이스 연결

- MySQL 데이터베이스를 사용하는 경우, Render의 PostgreSQL 대신 외부 MySQL 서비스를 사용해야 합니다.
- 또는 Render의 PostgreSQL로 마이그레이션을 고려해보세요.

### 5. 배포 후 확인

배포가 완료되면 다음 엔드포인트들을 확인하세요:

- `https://your-app.onrender.com/` - API 상태 확인
- `https://your-app.onrender.com/health` - 헬스체크
- `https://your-app.onrender.com/api/` - API 엔드포인트들

## 추가 참고사항

- 이 프로젝트는 TypeScript로 작성되어 있으므로 빌드 과정이 필요합니다.
- `dist/backend/` 폴더에 컴파일된 JavaScript 파일들이 생성됩니다.
- 환경 변수는 반드시 설정해야 하며, 특히 데이터베이스 연결 정보는 필수입니다.
