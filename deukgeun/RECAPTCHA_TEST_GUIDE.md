# reCAPTCHA 테스트 가이드

이 문서는 Deukgeun 프로젝트에서 reCAPTCHA v3를 테스트하는 방법을 설명합니다.

## 📋 개요

reCAPTCHA v3는 사용자 상호작용 없이 백그라운드에서 점수를 계산하여 봇과 실제 사용자를 구분합니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# .env 파일에 다음 변수들을 설정하세요
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET=your_recaptcha_secret_key
```

### 2. 테스트 환경 설정

```bash
# 개발 서버 시작
npm run dev

# 백엔드 서버 시작
npm run backend:dev
```

## 🧪 테스트 방법

### 1. 프론트엔드 테스트

#### 기본 테스트
```typescript
// reCAPTCHA 컴포넌트 테스트
import { RecaptchaButton } from './components/RecaptchaButton'

function TestPage() {
  const handleRecaptcha = (token: string) => {
    console.log('reCAPTCHA 토큰:', token)
  }

  return (
    <RecaptchaButton
      action="test"
      onSuccess={handleRecaptcha}
      onError={(error) => console.error('reCAPTCHA 오류:', error)}
    >
      테스트 버튼
    </RecaptchaButton>
  )
}
```

#### 점수 기반 테스트
```typescript
// 점수 확인 테스트
const testScore = async () => {
  const response = await fetch('/api/recaptcha/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'test_token' })
  })
  
  const result = await response.json()
  console.log('reCAPTCHA 점수:', result.score)
}
```

### 2. 백엔드 테스트

#### 서버 검증 테스트
```typescript
// 백엔드에서 reCAPTCHA 검증 테스트
import { verifyRecaptcha } from './utils/recaptcha'

const testVerification = async () => {
  try {
    const result = await verifyRecaptcha('test_token', 'test_action')
    console.log('검증 결과:', result)
  } catch (error) {
    console.error('검증 실패:', error)
  }
}
```

## 🔍 테스트 시나리오

### 1. 정상 사용자 시뮬레이션

```bash
# 1. 브라우저에서 페이지 로드
curl http://localhost:3000

# 2. reCAPTCHA 토큰 생성
# 브라우저 개발자 도구에서 실행
grecaptcha.ready(() => {
  grecaptcha.execute('your_site_key', {action: 'test'})
    .then(token => console.log('토큰:', token))
})
```

### 2. 봇 시뮬레이션

```bash
# 낮은 점수를 받는 요청 시뮬레이션
curl -X POST http://localhost:5000/api/recaptcha/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"low_score_token"}'
```

### 3. 에러 상황 테스트

```bash
# 잘못된 토큰으로 테스트
curl -X POST http://localhost:5000/api/recaptcha/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid_token"}'

# 만료된 토큰으로 테스트
curl -X POST http://localhost:5000/api/recaptcha/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"expired_token"}'
```

## 📊 점수 기준

| 점수 범위 | 설명 | 조치 |
|-----------|------|------|
| 0.9 - 1.0 | 매우 높은 신뢰도 | 즉시 허용 |
| 0.7 - 0.9 | 높은 신뢰도 | 허용 |
| 0.5 - 0.7 | 중간 신뢰도 | 추가 검증 필요 |
| 0.3 - 0.5 | 낮은 신뢰도 | 제한적 허용 |
| 0.0 - 0.3 | 매우 낮은 신뢰도 | 차단 |

## 🛠️ 디버깅

### 1. 브라우저 개발자 도구

```javascript
// reCAPTCHA 상태 확인
console.log('reCAPTCHA 로드됨:', typeof grecaptcha !== 'undefined')

// 토큰 생성 테스트
grecaptcha.ready(() => {
  grecaptcha.execute('your_site_key', {action: 'test'})
    .then(token => {
      console.log('생성된 토큰:', token)
      console.log('토큰 길이:', token.length)
    })
    .catch(error => console.error('토큰 생성 실패:', error))
})
```

### 2. 네트워크 탭 확인

- reCAPTCHA API 호출 확인
- 토큰 전송 확인
- 응답 상태 확인

### 3. 서버 로그 확인

```bash
# PM2 로그 확인
pm2 logs deukgeun-backend

# 직접 로그 확인
tail -f logs/backend-combined.log
```

## 🧪 자동화 테스트

### 1. Jest 테스트

```javascript
// recaptcha.test.js
describe('reCAPTCHA 테스트', () => {
  test('토큰 생성', async () => {
    const token = await generateRecaptchaToken('test')
    expect(token).toBeDefined()
    expect(token.length).toBeGreaterThan(0)
  })

  test('서버 검증', async () => {
    const result = await verifyRecaptcha('test_token', 'test')
    expect(result.success).toBe(true)
    expect(result.score).toBeGreaterThan(0.5)
  })
})
```

### 2. Cypress E2E 테스트

```javascript
// cypress/integration/recaptcha.spec.js
describe('reCAPTCHA E2E 테스트', () => {
  it('reCAPTCHA 버튼 클릭', () => {
    cy.visit('/test-page')
    cy.get('[data-testid="recaptcha-button"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
  })
})
```

## 📝 테스트 체크리스트

### 프론트엔드
- [ ] reCAPTCHA 스크립트 로드 확인
- [ ] 토큰 생성 기능 확인
- [ ] 에러 처리 확인
- [ ] 로딩 상태 표시 확인

### 백엔드
- [ ] 토큰 검증 기능 확인
- [ ] 점수 기반 처리 확인
- [ ] 에러 응답 확인
- [ ] 로깅 기능 확인

### 통합
- [ ] 전체 플로우 테스트
- [ ] 다양한 점수 시나리오 테스트
- [ ] 에러 상황 처리 테스트
- [ ] 성능 테스트

## 🚨 문제 해결

### 1. 토큰 생성 실패

```javascript
// 원인: 사이트 키 오류
// 해결: 환경 변수 확인
console.log('사이트 키:', process.env.VITE_RECAPTCHA_SITE_KEY)
```

### 2. 서버 검증 실패

```javascript
// 원인: 시크릿 키 오류
// 해결: 환경 변수 확인
console.log('시크릿 키 설정됨:', !!process.env.RECAPTCHA_SECRET)
```

### 3. CORS 오류

```javascript
// 원인: 도메인 설정 오류
// 해결: Google reCAPTCHA 콘솔에서 도메인 확인
```

## 📚 추가 리소스

- [reCAPTCHA v3 공식 문서](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA 테스트 도구](https://www.google.com/recaptcha/admin)
- [점수 해석 가이드](https://developers.google.com/recaptcha/docs/v3#interpreting_the_score)

---

이 가이드를 따라하면 reCAPTCHA v3가 올바르게 작동하는지 확인할 수 있습니다.
