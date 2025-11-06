# 🔒 보안 감사 보고서 (Security Audit Report)

## 📅 감사 일시
- **날짜**: 2025-01-XX
- **범위**: 전체 프로젝트 코드베이스
- **목적**: 하드코딩된 API 키 및 보안 자격 증명 검색

---

## 🚨 발견된 보안 문제

### ⚠️ **심각 (Critical)**

#### 1. **ecosystem.config.cjs - 프로덕션 환경 설정 파일**

**위치**: `/ecosystem.config.cjs`

**문제점**: 실제 프로덕션 데이터베이스 비밀번호 및 JWT 시크릿 키가 하드코딩되어 있음

```javascript
env_production: {
  // ...
  DB_PASSWORD: 'deukgeun_password_2024',  // ⚠️ 실제 비밀번호 노출
  JWT_SECRET: 'deukgeun_jwt_secret_2024_change_in_production',  // ⚠️ JWT 시크릿 노출
  JWT_ACCESS_SECRET: 'deukgeun_access_secret_2024_change_in_production',  // ⚠️ JWT 액세스 시크릿 노출
  JWT_REFRESH_SECRET: 'deukgeun_refresh_secret_2024_change_in_production',  // ⚠️ JWT 리프레시 시크릿 노출
  VITE_RECAPTCHA_SITE_KEY: '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',  // ⚠️ reCAPTCHA Site Key 노출
  RECAPTCHA_SITE_KEY: '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',  // ⚠️ reCAPTCHA Site Key 노출
}
```

**위험도**: 🔴 **매우 높음**
- 이 파일이 Git에 커밋되면 모든 비밀번호가 노출됨
- 프로덕션 데이터베이스 접근 가능
- JWT 토큰 위조 가능
- **즉시 수정 필요**

**권장 조치**:
1. 모든 하드코딩된 값을 환경 변수로 이동
2. `.env` 파일 사용 (Git에 커밋되지 않음)
3. `.gitignore`에 `ecosystem.config.cjs` 추가 또는 민감한 정보만 제거

---

#### 2. **index.html - reCAPTCHA Site Key 하드코딩**

**위치**: `/index.html`

**문제점**: reCAPTCHA Site Key가 HTML 파일에 직접 하드코딩되어 있음

```html
<script src="https://www.google.com/recaptcha/enterprise.js?render=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P"></script>
```

**위험도**: 🟡 **중간**
- reCAPTCHA Site Key는 공개되어도 괜찮지만, 환경별로 다를 수 있음
- 빌드 시점에 고정되어 환경 변수 변경이 반영되지 않음

**권장 조치**:
1. 빌드 시점에 환경 변수로 주입
2. 또는 런타임에 동적으로 로드

---

### ⚠️ **중간 (Medium)**

#### 3. **시드 스크립트 - 개발용 비밀번호**

**위치**: 
- `/src/backend/scripts/unifiedSeedScript.ts`
- `/src/backend/scripts/unifiedSeedScriptSimple.ts`

**문제점**: 개발용 테스트 계정 비밀번호가 하드코딩되어 있음

```typescript
{
  email: 'admin@deukgeun.com',
  password: 'admin123!',  // ⚠️ 개발용 비밀번호
  // ...
}
```

**위험도**: 🟡 **낮음** (개발/테스트 환경 한정)
- 시드 스크립트는 개발/테스트 환경에서만 사용
- 프로덕션에서는 실행되지 않아야 함

**권장 조치**:
1. 프로덕션 환경에서 시드 스크립트 실행 방지
2. 환경 변수로 비밀번호 설정 가능하도록 개선

---

### ℹ️ **정보 (Info)**

#### 4. **문서 파일 - 하드코딩된 키**

**위치**: 
- `RECAPTCHA_V3_FIX_COMPLETE.md`
- `recaptcha_v3_summary.md`
- `Recaptcha_troubleshooting.md`
- `DB_CONNECTION_STATUS.md`
- `MYSQL_SETUP_COMPLETE.md`
- `DATABASE_CONNECTION_FIX.md`
- `MIXED_CONTENT_FIX.md`
- `PM2_DEPLOYMENT_COMPLETE.md`
- `scripts/setup-database.sh`
- `scripts/build-optimized.ts`

**문제점**: 문서 파일에 실제 키 및 비밀번호가 포함되어 있음

**위험도**: 🟢 **낮음** (문서 파일)
- 문서 파일이지만 Git에 커밋되면 노출됨
- 민감한 정보는 예제 값으로 대체 권장

**권장 조치**:
1. 문서의 실제 키를 예제 값으로 변경 (`your_xxx_here` 형식)
2. 또는 문서 파일을 `.gitignore`에 추가

---

## ✅ 양호한 부분

### 1. **소스 코드 - 환경 변수 사용**
- 대부분의 소스 코드에서 `process.env` 또는 `import.meta.env`를 사용
- 하드코딩된 민감한 정보가 직접적으로 노출되지 않음

**예시**:
```typescript
// ✅ 좋은 예
password: process.env.DB_PASSWORD || "",
secret: process.env.JWT_SECRET || "",
```

### 2. **.gitignore 설정**
- `.env` 파일들이 `.gitignore`에 포함되어 있음
- 환경 변수 파일들이 Git에 커밋되지 않도록 설정됨

---

## 🛠️ 권장 수정 사항

### 1. **ecosystem.config.cjs 수정**

**현재**:
```javascript
env_production: {
  DB_PASSWORD: 'deukgeun_password_2024',
  JWT_SECRET: 'deukgeun_jwt_secret_2024_change_in_production',
  // ...
}
```

**권장**:
```javascript
env_production: {
  // 환경 변수에서 읽어오도록 변경
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY || '',
  RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || '',
  // ...
}
```

**또는**:
- `ecosystem.config.cjs`에서 민감한 정보를 완전히 제거
- PM2 실행 시 환경 변수 파일(`.env`)을 자동으로 로드하도록 설정

---

### 2. **index.html 수정**

**현재**:
```html
<script src="https://www.google.com/recaptcha/enterprise.js?render=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P"></script>
```

**권장**:
```html
<!-- 빌드 시점에 환경 변수로 주입 -->
<script src="https://www.google.com/recaptcha/enterprise.js?render=%VITE_RECAPTCHA_SITE_KEY%"></script>
```

**또는**:
- HTML 파일에서 reCAPTCHA 스크립트 제거
- JavaScript에서 동적으로 로드 (현재 `src/frontend/shared/lib/recaptcha.ts`에서 처리)

---

### 3. **문서 파일 수정**

**권장**:
- 모든 문서의 실제 키를 예제 값으로 변경
- 예: `6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P` → `your_recaptcha_site_key_here`
- 예: `deukgeun_password_2024` → `your_database_password_here`

---

## 📋 체크리스트

### 즉시 수정 필요 (Critical)
- [ ] `ecosystem.config.cjs`에서 하드코딩된 비밀번호 제거
- [ ] `ecosystem.config.cjs`에서 하드코딩된 JWT 시크릿 제거
- [ ] 환경 변수 파일(`.env`) 생성 및 설정
- [ ] `.gitignore`에 `ecosystem.config.cjs` 추가 (또는 민감한 정보만 제거)

### 권장 수정 (Medium)
- [ ] `index.html`에서 reCAPTCHA Site Key 제거 또는 환경 변수 주입
- [ ] 시드 스크립트의 하드코딩된 비밀번호를 환경 변수로 변경

### 선택적 수정 (Low)
- [ ] 문서 파일의 실제 키를 예제 값으로 변경
- [ ] 보안 감사 문서 생성 및 정기적 검토

---

## 🔐 보안 모범 사례

### 1. **환경 변수 사용**
- 모든 민감한 정보는 환경 변수로 관리
- `.env` 파일은 Git에 커밋하지 않음
- `.env.example` 파일에 예제 값만 포함

### 2. **설정 파일 관리**
- 프로덕션 설정은 환경 변수로만 관리
- 설정 파일에 기본값을 하드코딩하지 않음
- 필수 환경 변수 검증 로직 추가

### 3. **문서 관리**
- 문서 파일에는 실제 키를 포함하지 않음
- 예제 값만 사용 (`your_xxx_here` 형식)
- 실제 키는 별도의 보안 문서로 관리

### 4. **정기적 감사**
- 주기적으로 보안 감사 수행
- Git 히스토리에서 하드코딩된 키 검색
- 자동화된 보안 스캔 도구 활용

---

## 📝 추가 권장 사항

### 1. **환경 변수 검증**
프로덕션 환경에서 필수 환경 변수가 설정되지 않았을 때 서버 시작을 차단하는 로직 추가

### 2. **보안 스크립트 추가**
```bash
# 보안 스캔 스크립트
npm run security:scan
```

### 3. **Git Hooks**
- 커밋 전에 하드코딩된 키 검사
- `.env` 파일 커밋 방지

### 4. **비밀 관리 도구**
- AWS Secrets Manager
- HashiCorp Vault
- 환경 변수 관리 서비스

---

## 📞 문의

보안 관련 이슈 발견 시 즉시 팀에 알려주세요.

---

**보안 감사 완료일**: 2025-01-XX
**다음 감사 예정일**: 2025-04-XX (분기별)

