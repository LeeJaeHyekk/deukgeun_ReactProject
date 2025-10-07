# reCAPTCHA Enterprise 통합 가이드

이 문서는 Deukgeun 프로젝트에서 Google reCAPTCHA Enterprise를 통합하는 방법을 설명합니다.

## 📋 개요

reCAPTCHA Enterprise는 기업용 reCAPTCHA 서비스로, 더 정교한 봇 탐지와 위험 분석을 제공합니다.

## 🔑 키 정보

- **사이트 키**: `6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG`
- **프로젝트 ID**: `secure-theme-468004-f1`
- **API 엔드포인트**: `https://recaptchaenterprise.googleapis.com/v1/projects/secure-theme-468004-f1/assessments`

## 🚀 설정 완료 사항

### 1. 환경 변수 설정

#### 프론트엔드 (.env)
```bash
# reCAPTCHA Enterprise 설정
VITE_RECAPTCHA_SITE_KEY=6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG
```

#### 백엔드 (src/backend/.env)
```bash
# reCAPTCHA Enterprise 보안 설정
RECAPTCHA_SECRET=your_recaptcha_enterprise_secret_key
RECAPTCHA_SITE_KEY=6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG
RECAPTCHA_PROJECT_ID=secure-theme-468004-f1
RECAPTCHA_API_KEY=your_recaptcha_enterprise_api_key
```

### 2. 프론트엔드 컴포넌트

#### HTML 스크립트 로드
```html
<script src="https://www.google.com/recaptcha/enterprise.js?render=6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG"></script>
```

#### React 컴포넌트 사용
```tsx
import { RecaptchaEnterpriseButton, RecaptchaEnterpriseScript } from '../shared/components/RecaptchaEnterpriseButton'

function LoginPage() {
  const handleRecaptcha = (token: string) => {
    console.log('reCAPTCHA 토큰:', token)
    // 로그인 로직 실행
  }

  return (
    <div>
      <RecaptchaEnterpriseScript />
      <RecaptchaEnterpriseButton
        action="LOGIN"
        onSuccess={handleRecaptcha}
        onError={(error) => console.error('reCAPTCHA 오류:', error)}
      >
        로그인
      </RecaptchaEnterpriseButton>
    </div>
  )
}
```

### 3. 백엔드 검증

#### 미들웨어 적용
```typescript
import { recaptchaEnterpriseMiddleware } from '../utils/recaptcha-enterprise'

// 로그인에 reCAPTCHA 적용
router.post('/login', 
  recaptchaEnterpriseMiddleware('LOGIN', 0.5),
  loginController
)

// 회원가입에 reCAPTCHA 적용
router.post('/register',
  recaptchaEnterpriseMiddleware('REGISTER', 0.7),
  registerController
)
```

#### 직접 검증
```typescript
import { verifyRecaptchaEnterprise } from '../utils/recaptcha-enterprise'

const result = await verifyRecaptchaEnterprise(token, 'LOGIN')
if (result.success) {
  console.log('점수:', result.score)
} else {
  console.error('검증 실패:', result.error)
}
```

## 🧪 테스트 방법

### 1. 테스트 페이지 접근
```
http://localhost:3000/recaptcha-test
```

### 2. API 엔드포인트 테스트
```bash
# reCAPTCHA 검증 테스트
curl -X POST http://localhost:5000/api/recaptcha/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"test_token","action":"LOGIN"}'

# 헬스체크
curl http://localhost:5000/api/recaptcha/health

# 설정 정보 확인
curl http://localhost:5000/api/recaptcha/config
```

### 3. 브라우저 개발자 도구 테스트
```javascript
// reCAPTCHA Enterprise 상태 확인
console.log('reCAPTCHA Enterprise 로드됨:', typeof window.grecaptcha?.enterprise !== 'undefined')

// 토큰 생성 테스트
grecaptcha.enterprise.ready(() => {
  grecaptcha.enterprise.execute('6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG', {action: 'LOGIN'})
    .then(token => console.log('생성된 토큰:', token))
    .catch(error => console.error('토큰 생성 실패:', error))
})
```

## 📊 점수 기준

| 액션 | 최소 점수 | 설명 |
|------|-----------|------|
| LOGIN | 0.5 | 로그인 (낮은 임계값) |
| REGISTER | 0.7 | 회원가입 (중간 임계값) |
| SENSITIVE | 0.8 | 민감한 작업 (높은 임계값) |
| ADMIN | 0.9 | 관리자 작업 (매우 높은 임계값) |

## 🔧 문제 해결

### 1. 토큰 생성 실패
```javascript
// 원인: 사이트 키 오류
// 해결: 환경 변수 확인
console.log('사이트 키:', import.meta.env.VITE_RECAPTCHA_SITE_KEY)
```

### 2. 서버 검증 실패
```javascript
// 원인: API 키 또는 프로젝트 ID 오류
// 해결: 백엔드 환경 변수 확인
console.log('프로젝트 ID:', process.env.RECAPTCHA_PROJECT_ID)
console.log('API 키 설정됨:', !!process.env.RECAPTCHA_API_KEY)
```

### 3. CORS 오류
```javascript
// 원인: 도메인 설정 오류
// 해결: Google reCAPTCHA Enterprise 콘솔에서 도메인 확인
```

## 📚 API 참조

### 프론트엔드 API
```typescript
// reCAPTCHA Enterprise 버튼 컴포넌트
<RecaptchaEnterpriseButton
  action="LOGIN"                    // 액션 이름
  onSuccess={(token) => {}}        // 성공 콜백
  onError={(error) => {}}          // 오류 콜백
  className="custom-class"          // CSS 클래스
  disabled={false}                 // 비활성화 상태
  loading={false}                  // 로딩 상태
>
  버튼 텍스트
</RecaptchaEnterpriseButton>

// reCAPTCHA Enterprise 훅
const { isLoaded, isLoading, executeRecaptcha } = useRecaptchaEnterprise()
```

### 백엔드 API
```typescript
// 검증 함수
const result = await verifyRecaptchaEnterprise(token, action)

// 미들웨어
router.post('/endpoint', recaptchaEnterpriseMiddleware('ACTION', 0.5), handler)

// 헬스체크
const health = await checkRecaptchaEnterpriseHealth()
```

## 🚨 보안 고려사항

1. **API 키 보안**: 백엔드 API 키는 절대 클라이언트에 노출하지 마세요.
2. **점수 임계값**: 액션별로 적절한 점수 임계값을 설정하세요.
3. **토큰 만료**: reCAPTCHA 토큰은 2분 후 만료됩니다.
4. **도메인 제한**: Google 콘솔에서 허용된 도메인만 사용하세요.

## 📝 체크리스트

### 설정 완료
- [x] 사이트 키 설정
- [x] 프로젝트 ID 설정
- [x] API 키 설정 (백엔드)
- [x] 프론트엔드 컴포넌트 구현
- [x] 백엔드 검증 로직 구현
- [x] 테스트 페이지 생성

### 테스트 완료
- [ ] 토큰 생성 테스트
- [ ] 서버 검증 테스트
- [ ] 점수 기반 처리 테스트
- [ ] 에러 처리 테스트
- [ ] 성능 테스트

## 🔗 관련 파일

- `src/frontend/shared/components/RecaptchaEnterpriseButton.tsx`
- `src/backend/utils/recaptcha-enterprise.ts`
- `src/backend/routes/recaptcha.ts`
- `src/backend/routes/auth.ts`
- `src/frontend/pages/RecaptchaTestPage.tsx`

---

이 가이드를 따라하면 reCAPTCHA Enterprise가 Deukgeun 프로젝트에 성공적으로 통합됩니다.
