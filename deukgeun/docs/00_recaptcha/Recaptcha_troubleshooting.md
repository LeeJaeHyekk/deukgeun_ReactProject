# reCAPTCHA v3 "키 유형이 올바르지 않습니다" 오류 해결 가이드

## 📋 오류 원인

"키 유형이 올바르지 않습니다" 오류는 다음과 같은 경우에 발생합니다:

1. **Site Key 유형 불일치**: Site Key가 v3가 아닌 Enterprise 또는 v2로 설정됨
2. **도메인 미등록**: 현재 접속 중인 도메인이 Google reCAPTCHA 콘솔에 등록되지 않음
3. **스크립트 URL 불일치**: HTML과 JavaScript에서 다른 Site Key 사용

## ✅ 해결 방법

### 1단계: Google reCAPTCHA 콘솔에서 키 확인

1. [Google reCAPTCHA 관리자 페이지](https://www.google.com/recaptcha/admin) 접속
2. Site Key `your_recaptcha_site_key_here` 클릭
3. 다음 항목 확인:

#### 필수 확인 사항:

- **키 유형**: 반드시 `reCAPTCHA v3` 또는 `reCAPTCHA v3 (Invisible)`이어야 함
  - ❌ `reCAPTCHA Enterprise`는 사용 불가
  - ❌ `reCAPTCHA v2`는 사용 불가
  - ✅ `reCAPTCHA v3`만 사용 가능

- **도메인 등록**: 다음 도메인들이 모두 등록되어 있어야 함:
  - `localhost`
  - `127.0.0.1`
  - 실제 프로덕션 도메인 (예: `deukgeun.site`, `www.deukgeun.site`)

### 2단계: v3 키가 아닌 경우

현재 Site Key가 v3가 아닌 경우:

#### 옵션 A: 새 v3 키 생성 (권장)

1. Google reCAPTCHA 콘솔에서 새 사이트 추가
2. **키 유형**: `reCAPTCHA v3` 선택
3. **도메인**: 필요한 도메인 모두 등록
4. 생성된 새 Site Key를 환경 변수에 설정

#### 옵션 B: 기존 키 수정 (가능한 경우)

일부 키는 수정할 수 있지만, Enterprise 키는 v3로 변경할 수 없습니다.

### 3단계: 환경 변수 확인

`.env` 파일 또는 `env.unified` 파일에서:

```env
# 프론트엔드 (반드시 v3 Site Key)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# 백엔드 (v3 Secret Key)
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_v3_secret_key
RECAPTCHA_SECRET=your_v3_secret_key
```

### 4단계: 코드 확인

#### HTML (`index.html`)

✅ **올바른 설정**:
```html
<!-- reCAPTCHA v3 스크립트는 JavaScript에서 동적으로 로드됩니다 -->
```

❌ **잘못된 설정** (하드코딩된 키):
```html
<!-- 이렇게 하지 마세요 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_KEY"></script>
```

#### JavaScript (`src/frontend/shared/lib/recaptcha.ts`)

스크립트는 환경 변수에서 동적으로 로드됩니다:
```typescript
const scriptUrl = `https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA.SITE_KEY}`
```

### 5단계: 브라우저 콘솔 확인

브라우저 개발자 도구(F12)에서 다음을 확인:

1. **네트워크 탭**: `api.js?render=...` 스크립트가 성공적으로 로드되었는지 확인
2. **콘솔 탭**: 오류 메시지 확인
   - `✅ reCAPTCHA v3 스크립트 로드 성공` - 정상
   - `❌ reCAPTCHA 키 유형 오류 감지` - 키 유형 문제
   - `❌ reCAPTCHA 스크립트 로드 실패` - 네트워크 또는 Site Key 문제

## 🔍 문제 진단

### 오류 메시지별 해결 방법

| 오류 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| "키 유형이 올바르지 않습니다" | Site Key가 v3가 아님 | Google 콘솔에서 v3 키로 변경 또는 새로 생성 |
| "사이트 소유자가 확인해야 하는 오류" | Site Key 유형 불일치 | v3 키인지 확인 |
| "reCAPTCHA Site Key가 설정되지 않았습니다" | 환경 변수 미설정 | `VITE_RECAPTCHA_SITE_KEY` 확인 |
| "reCAPTCHA 스크립트 로드 실패" | 네트워크 오류 또는 Site Key 오류 | 네트워크 연결 및 Site Key 확인 |

## 📝 체크리스트

오류 해결을 위한 확인 사항:

- [ ] Google reCAPTCHA 콘솔에서 Site Key의 키 유형이 `v3`인지 확인
- [ ] 도메인 등록에 `localhost`, `127.0.0.1`, 실제 도메인이 모두 포함되어 있는지 확인
- [ ] 환경 변수 `VITE_RECAPTCHA_SITE_KEY`가 올바른 v3 Site Key로 설정되어 있는지 확인
- [ ] `index.html`에 하드코딩된 스크립트가 없는지 확인
- [ ] 브라우저 콘솔에서 스크립트 로드 성공 메시지 확인
- [ ] Secret Key가 v3 Secret Key인지 확인 (Site Key와 쌍이 맞아야 함)

## 🚨 주의사항

1. **Site Key와 Secret Key는 쌍이 맞아야 함**
   - 같은 프로젝트에서 생성된 Site Key와 Secret Key를 사용해야 함
   - v3 Site Key에는 v3 Secret Key가 필요함

2. **도메인 등록은 필수**
   - 등록되지 않은 도메인에서는 reCAPTCHA가 작동하지 않음
   - 개발 환경: `localhost`, `127.0.0.1` 필수
   - 프로덕션 환경: 실제 도메인 필수

3. **키 유형은 변경할 수 없음**
   - Enterprise 키를 v3로 변경할 수 없음
   - v3가 아닌 키는 새로 생성해야 함

## 📚 참고 자료

- [reCAPTCHA v3 문서](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA 관리자 페이지](https://www.google.com/recaptcha/admin)
- [키 설정 가이드](./RECAPTCHA_KEY_SETUP_GUIDE.md)

