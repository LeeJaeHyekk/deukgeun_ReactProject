# reCAPTCHA v3 설정 가이드

이 문서는 Deukgeun 프로젝트에서 Google reCAPTCHA v3를 설정하는 방법을 설명합니다.

## 📋 개요

reCAPTCHA v3는 사용자 상호작용 없이 백그라운드에서 점수를 계산하여 봇과 실제 사용자를 구분하는 Google의 보안 서비스입니다.

## 🚀 설정 단계

### 1. Google reCAPTCHA 콘솔 설정

#### 1.1 사이트 등록
1. [Google reCAPTCHA 콘솔](https://www.google.com/recaptcha/admin)에 접속
2. "사이트 추가" 클릭
3. 다음 정보 입력:
   - **레이블**: Deukgeun Production
   - **reCAPTCHA 유형**: reCAPTCHA v3
   - **도메인**: 
     - `localhost` (개발용)
     - `yourdomain.com` (프로덕션용)
     - `www.yourdomain.com` (프로덕션용)

#### 1.2 키 생성
- **사이트 키**: 프론트엔드에서 사용 (공개)
- **시크릿 키**: 백엔드에서 사용 (비공개)

### 2. 환경 변수 설정

#### 2.1 프론트엔드 (.env)
```bash
# reCAPTCHA 설정
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

#### 2.2 백엔드 (src/backend/.env)
```bash
# reCAPTCHA 설정
RECAPTCHA_SECRET=your_recaptcha_secret_key_here
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

### 3. 프론트엔드 설정

#### 3.1 HTML에 스크립트 추가
```html
<!-- public/index.html -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

#### 3.2 React 컴포넌트 생성
```typescript
// src/components/RecaptchaButton.tsx
import React, { useEffect } from 'react'

interface RecaptchaButtonProps {
  action: string
  onSuccess: (token: string) => void
  onError: (error: any) => void
  children: React.ReactNode
}

declare global {
  interface Window {
    grecaptcha: any
  }
}

export const RecaptchaButton: React.FC<RecaptchaButtonProps> = ({
  action,
  onSuccess,
  onError,
  children
}) => {
  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          console.log('reCAPTCHA 로드됨')
        })
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadRecaptcha)
    } else {
      loadRecaptcha()
    }
  }, [])

  const handleClick = async () => {
    try {
      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA가 로드되지 않았습니다.')
      }

      const token = await window.grecaptcha.execute(
        process.env.VITE_RECAPTCHA_SITE_KEY,
        { action }
      )

      onSuccess(token)
    } catch (error) {
      onError(error)
    }
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}
```

#### 3.3 사용 예시
```typescript
// src/pages/LoginPage.tsx
import { RecaptchaButton } from '../components/RecaptchaButton'

const LoginPage = () => {
  const handleRecaptcha = (token: string) => {
    console.log('reCAPTCHA 토큰:', token)
    // 로그인 로직 실행
  }

  const handleError = (error: any) => {
    console.error('reCAPTCHA 오류:', error)
  }

  return (
    <div>
      <RecaptchaButton
        action="login"
        onSuccess={handleRecaptcha}
        onError={handleError}
      >
        로그인
      </RecaptchaButton>
    </div>
  )
}
```

### 4. 백엔드 설정

#### 4.1 reCAPTCHA 검증 유틸리티
```typescript
// src/backend/utils/recaptcha.ts
import axios from 'axios'

interface RecaptchaResponse {
  success: boolean
  score: number
  action: string
  challenge_ts: string
  hostname: string
  'error-codes'?: string[]
}

export const verifyRecaptcha = async (
  token: string,
  expectedAction: string
): Promise<{ success: boolean; score: number; error?: string }> => {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET!,
        response: token
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const data: RecaptchaResponse = response.data

    if (!data.success) {
      return {
        success: false,
        score: 0,
        error: data['error-codes']?.join(', ')
      }
    }

    // 액션 검증
    if (data.action !== expectedAction) {
      return {
        success: false,
        score: data.score,
        error: 'Action mismatch'
      }
    }

    return {
      success: true,
      score: data.score
    }
  } catch (error) {
    console.error('reCAPTCHA 검증 오류:', error)
    return {
      success: false,
      score: 0,
      error: 'Verification failed'
    }
  }
}
```

#### 4.2 미들웨어 생성
```typescript
// src/backend/middlewares/recaptcha.ts
import { Request, Response, NextFunction } from 'express'
import { verifyRecaptcha } from '../utils/recaptcha'

export const recaptchaMiddleware = (action: string, minScore: number = 0.5) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.body.recaptchaToken || req.headers['x-recaptcha-token']

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'reCAPTCHA token is required'
        })
      }

      const result = await verifyRecaptcha(token, action)

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'reCAPTCHA verification failed'
        })
      }

      if (result.score < minScore) {
        return res.status(400).json({
          success: false,
          error: `Score too low: ${result.score} (minimum: ${minScore})`
        })
      }

      // 점수를 요청 객체에 추가
      req.recaptchaScore = result.score
      next()
    } catch (error) {
      console.error('reCAPTCHA 미들웨어 오류:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}
```

#### 4.3 라우터에 적용
```typescript
// src/backend/routes/auth.ts
import { Router } from 'express'
import { recaptchaMiddleware } from '../middlewares/recaptcha'

const router = Router()

// 로그인에 reCAPTCHA 적용
router.post('/login', 
  recaptchaMiddleware('login', 0.5),
  async (req, res) => {
    // 로그인 로직
    res.json({ success: true, score: req.recaptchaScore })
  }
)

// 회원가입에 reCAPTCHA 적용
router.post('/register',
  recaptchaMiddleware('register', 0.7),
  async (req, res) => {
    // 회원가입 로직
    res.json({ success: true, score: req.recaptchaScore })
  }
)

export default router
```

## 📊 점수 기반 처리

### 1. 점수 기준 설정
```typescript
// src/backend/config/recaptcha.ts
export const RECAPTCHA_SCORES = {
  LOGIN: 0.5,        // 로그인: 낮은 임계값
  REGISTER: 0.7,     // 회원가입: 중간 임계값
  SENSITIVE: 0.8,    // 민감한 작업: 높은 임계값
  ADMIN: 0.9         // 관리자 작업: 매우 높은 임계값
} as const
```

### 2. 동적 임계값 처리
```typescript
// src/backend/controllers/authController.ts
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const score = req.recaptchaScore

  // 점수에 따른 추가 검증
  if (score < 0.3) {
    // 매우 낮은 점수: 추가 보안 검증
    return res.status(400).json({
      success: false,
      error: 'Additional verification required'
    })
  }

  if (score < 0.5) {
    // 낮은 점수: 로그 기록
    console.log(`Low reCAPTCHA score for login: ${score}`)
  }

  // 정상 로그인 처리
  // ...
}
```

## 🧪 테스트

### 1. 개발 환경 테스트
```bash
# 환경 변수 설정
export VITE_RECAPTCHA_SITE_KEY="your_test_site_key"
export RECAPTCHA_SECRET="your_test_secret_key"

# 서버 시작
npm run dev
```

### 2. 테스트 스크립트
```typescript
// scripts/test-recaptcha.ts
import { verifyRecaptcha } from '../src/backend/utils/recaptcha'

const testRecaptcha = async () => {
  try {
    const result = await verifyRecaptcha('test_token', 'test_action')
    console.log('reCAPTCHA 테스트 결과:', result)
  } catch (error) {
    console.error('테스트 실패:', error)
  }
}

testRecaptcha()
```

## 🚨 문제 해결

### 1. 일반적인 문제들

#### 토큰 생성 실패
```javascript
// 원인: 사이트 키 오류
// 해결: 환경 변수 확인
console.log('사이트 키:', process.env.VITE_RECAPTCHA_SITE_KEY)
```

#### 서버 검증 실패
```javascript
// 원인: 시크릿 키 오류
// 해결: 환경 변수 확인
console.log('시크릿 키 설정됨:', !!process.env.RECAPTCHA_SECRET)
```

#### CORS 오류
```javascript
// 원인: 도메인 설정 오류
// 해결: Google reCAPTCHA 콘솔에서 도메인 확인
```

### 2. 디버깅

#### 프론트엔드 디버깅
```javascript
// 브라우저 개발자 도구에서 실행
grecaptcha.ready(() => {
  grecaptcha.execute('your_site_key', {action: 'test'})
    .then(token => console.log('토큰:', token))
    .catch(error => console.error('오류:', error))
})
```

#### 백엔드 디버깅
```typescript
// 로그 추가
console.log('reCAPTCHA 검증 시작:', { token: token.substring(0, 10) + '...' })
const result = await verifyRecaptcha(token, action)
console.log('reCAPTCHA 검증 결과:', result)
```

## 📚 추가 리소스

- [reCAPTCHA v3 공식 문서](https://developers.google.com/recaptcha/docs/v3)
- [점수 해석 가이드](https://developers.google.com/recaptcha/docs/v3#interpreting_the_score)
- [reCAPTCHA 테스트 도구](https://www.google.com/recaptcha/admin)

---

이 가이드를 따라하면 reCAPTCHA v3를 Deukgeun 프로젝트에 성공적으로 통합할 수 있습니다.
