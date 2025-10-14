# 🚀 Deukgeun Backend 환경 설정 가이드

## 📋 개요

이 가이드는 Deukgeun 백엔드 서버의 환경별 실행 방법을 설명합니다. 환경 분기 스크립트를 통해 개발/프로덕션 환경을 명확히 구분하여 실행할 수 있습니다.

## 🔧 환경별 실행 방법

### 1. 개발 환경 (Development)

```bash
# 개발 환경으로 서버 시작
npm run dev
# 또는
npm run start:dev
```

**특징:**
- 개발용 환경 변수 자동 로드
- 데이터베이스 연결 실패 시에도 서버 실행 계속
- 핫 리로드 지원
- 상세한 로깅

### 2. 간소화된 모드 (Simple)

```bash
# 간소화된 서버 시작 (데이터베이스 연결 없이)
npm run dev:simple
# 또는
npm run start:simple
```

**특징:**
- 최소한의 환경 설정
- 데이터베이스 연결 없이도 실행 가능
- 빠른 개발 및 테스트용
- 기본 API 엔드포인트만 제공

### 3. 프로덕션 환경 (Production)

```bash
# 프로덕션 환경으로 서버 시작
npm run prod
# 또는
npm run start:prod
```

**특징:**
- 프로덕션용 환경 변수 검증
- 필수 환경 변수 누락 시 서버 시작 중단
- 최적화된 성능 설정
- 보안 강화

## 📁 환경 변수 파일 구조

```
src/backend/
├── env.development     # 개발 환경 설정
├── env.production      # 프로덕션 환경 설정
├── env.sample          # 환경 변수 샘플
└── .env                # 로컬 환경 설정 (선택사항)
```

## 🔑 필수 환경 변수

### 개발 환경
- `NODE_ENV=development`
- `PORT=5000`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USERNAME=root`
- `DB_PASSWORD=deukgeun6204`
- `DB_NAME=deukgeun_db`

### 프로덕션 환경
- `NODE_ENV=production`
- `PORT=5000`
- `DB_HOST` (실제 프로덕션 DB 호스트)
- `DB_PORT=3306`
- `DB_USERNAME` (실제 프로덕션 DB 사용자)
- `DB_PASSWORD` (실제 프로덕션 DB 비밀번호)
- `DB_NAME` (실제 프로덕션 DB 이름)
- `JWT_SECRET` (강력한 시크릿 키)
- `JWT_ACCESS_SECRET` (강력한 액세스 시크릿)
- `JWT_REFRESH_SECRET` (강력한 리프레시 시크릿)

## 🚀 서버 시작 순서

1. **환경 변수 파일 확인**
   ```bash
   # 개발 환경
   ls src/backend/env.development
   
   # 프로덕션 환경
   ls src/backend/env.production
   ```

2. **필요한 환경 변수 설정**
   - 개발: `env.development` 파일 수정
   - 프로덕션: `env.production` 파일 수정

3. **서버 시작**
   ```bash
   # 개발 환경
   cd src/backend
   npm run dev
   
   # 간소화된 모드
   npm run dev:simple
   
   # 프로덕션 환경
   npm run prod
   ```

## 🔍 문제 해결

### 1. 환경 변수 로딩 실패
```bash
# 환경 변수 파일 존재 확인
ls -la src/backend/env.*

# 환경 변수 로딩 테스트
node -e "require('dotenv').config({path: 'src/backend/env.development'}); console.log(process.env.NODE_ENV)"
```

### 2. 데이터베이스 연결 실패
- 개발 환경: 서버는 계속 실행되며 경고 메시지 출력
- 프로덕션 환경: 서버 시작 중단

### 3. 포트 충돌
```bash
# 포트 사용 확인
netstat -ano | findstr :5000

# 다른 포트로 실행
PORT=5001 npm run dev
```

## 📊 서버 상태 확인

### 헬스 체크
```bash
curl http://localhost:5000/health
```

### API 정보 확인
```bash
curl http://localhost:5000/api/info
```

### 서버 상태 확인
```bash
curl http://localhost:5000/
```

## 🔄 환경 전환

### 개발 → 프로덕션
1. `env.production` 파일에 실제 프로덕션 값 설정
2. `npm run prod` 실행

### 프로덕션 → 개발
1. `env.development` 파일 확인
2. `npm run dev` 실행

## 📝 로그 확인

### 개발 환경
- 콘솔에 상세한 로그 출력
- 데이터베이스 연결 상태 표시
- 환경 변수 로딩 상태 표시

### 프로덕션 환경
- 필수 환경 변수 검증 로그
- 서버 시작 상태 로그
- 에러 발생 시 상세 정보 출력

## 🛡️ 보안 주의사항

1. **환경 변수 파일 보안**
   - `.env*` 파일은 Git에 커밋하지 않음
   - 프로덕션 비밀번호는 강력하게 설정
   - API 키는 실제 값으로 교체

2. **프로덕션 배포**
   - 환경 변수 파일을 서버에 안전하게 배포
   - 파일 권한 설정 (600 또는 400)
   - 정기적인 비밀번호 변경

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 파일 존재 여부
2. 필수 환경 변수 설정 여부
3. 데이터베이스 연결 정보 정확성
4. 포트 사용 가능 여부
