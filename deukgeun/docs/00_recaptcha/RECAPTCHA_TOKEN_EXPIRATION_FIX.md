# reCAPTCHA v3 토큰 만료 검증 로직 수정 가이드

## 개요

이 문서는 Google reCAPTCHA v3 공식 문서를 기반으로 토큰 만료 검증 로직을 수정한 내용을 설명합니다.

## 문제 분석

### 발생한 문제

1. **회원가입 시 403 Forbidden 오류**
   - 로그: `reCAPTCHA 토큰 만료`
   - 원인: 토큰 만료 검증 로직이 너무 엄격함 (2분)

2. **로그인 시 401 Unauthorized 오류**
   - 원인: reCAPTCHA 검증 실패 또는 사용자 인증 실패

### 기존 로직의 문제점

1. **challenge_ts 기반 검증이 너무 엄격함**
   - 기존: 2분(120초) 이상 지나면 즉시 실패
   - 문제: 네트워크 지연, 서버 처리 시간 등을 고려하지 않음

2. **Google API 응답을 우선 확인하지 않음**
   - 기존: challenge_ts 기반 검증을 먼저 수행
   - 문제: Google API가 이미 토큰 만료를 확인한 경우 중복 검증

## Google reCAPTCHA v3 공식 문서 기준

### 토큰 유효 시간

- **공식 문서**: reCAPTCHA v3 토큰은 일반적으로 **2분 동안 유효**하지만, 실제로는 더 길 수 있음
- **권장 사항**: Google API 응답의 `success`와 `error-codes`를 우선 확인해야 함

### error-codes 참조

공식 문서: https://developers.google.com/recaptcha/docs/verify

주요 error-codes:
- `timeout-or-duplicate`: 토큰이 만료되었거나 이미 사용되었음
- `invalid-input-response`: 토큰이 유효하지 않음
- `invalid-input-secret`: Secret Key가 유효하지 않음
- `missing-input-response`: reCAPTCHA 토큰이 누락됨
- `missing-input-secret`: Secret Key가 설정되지 않음

### 검증 순서 (공식 문서 권장)

1. **Google API 응답 확인** (우선)
   - `success: false` 확인
   - `error-codes` 확인
   - `timeout-or-duplicate` 에러 코드가 있으면 즉시 실패

2. **challenge_ts 기반 보조 검증** (보조)
   - Google API가 확인하지 않은 경우에만 사용
   - 네트워크 지연 등을 고려하여 5분까지 허용

## 수정 내용

### 1. Google API 응답 우선 확인

```typescript
// Google API 응답의 success와 error-codes를 먼저 확인 (공식 문서 권장)
const errorCodes = response.data["error-codes"] || []

// Google API 응답에서 토큰 만료 확인 (우선 검증)
if (errorCodes.includes("timeout-or-duplicate")) {
  logger.warn("reCAPTCHA 토큰 만료 또는 재사용 (Google API 확인)")
  return false
}
```

### 2. challenge_ts 기반 보조 검증 완화

```typescript
// challenge_ts 기반 보조 검증 (Google API가 확인하지 않은 경우에만)
// reCAPTCHA v3 토큰은 일반적으로 2분 동안 유효하지만, 실제로는 더 길 수 있음
// 보조 검증으로는 5분까지 허용 (네트워크 지연 등을 고려)
if (tokenAge !== null && tokenAge > 300) { // 5분 (300초)
  logger.warn("reCAPTCHA 토큰 만료 (보조 검증)")
  return false
}
```

### 3. error-codes 처리 강화

```typescript
// reCAPTCHA v3 공식 문서: https://developers.google.com/recaptcha/docs/v3
// error-codes 참조: https://developers.google.com/recaptcha/docs/verify
if (errorCodes.includes("timeout-or-duplicate")) {
  errorMessage = "토큰이 만료되었거나 이미 사용되었습니다 (재사용 불가). 새로고침 후 다시 시도해주세요."
} else if (errorCodes.includes("invalid-input-response")) {
  errorMessage = "토큰이 유효하지 않습니다. 가능한 원인: 1) 토큰 만료, 2) 토큰 재사용, 3) Site Key와 Secret Key 불일치, 4) 토큰 형식 오류"
} else if (errorCodes.includes("invalid-input-secret")) {
  errorMessage = "Secret Key가 유효하지 않습니다. Google Console에서 Secret Key를 확인하세요."
} else if (errorCodes.includes("missing-input-response")) {
  errorMessage = "reCAPTCHA 토큰이 누락되었습니다."
} else if (errorCodes.includes("missing-input-secret")) {
  errorMessage = "Secret Key가 설정되지 않았습니다."
}
```

## 검증 흐름도

```
1. Google API 응답 수신
   ↓
2. 응답 데이터 유효성 검증
   ↓
3. Google API 응답의 success와 error-codes 확인 (우선)
   ├─ error-codes에 "timeout-or-duplicate" 있음 → 즉시 실패
   └─ error-codes에 "timeout-or-duplicate" 없음 → 다음 단계
   ↓
4. challenge_ts 기반 보조 검증 (보조)
   ├─ tokenAge > 5분 (300초) → 실패
   └─ tokenAge ≤ 5분 → 다음 단계
   ↓
5. action 검증
   ↓
6. 점수 검증
   ↓
7. 검증 성공
```

## 테스트 방법

### 1. 정상 토큰 테스트

```bash
# 정상적인 로그인/회원가입 시도
# 예상 결과: 성공
```

### 2. 만료 토큰 테스트

```bash
# 토큰 생성 후 5분 이상 대기 후 사용
# 예상 결과: Google API가 "timeout-or-duplicate" 에러 코드 반환
```

### 3. 재사용 토큰 테스트

```bash
# 동일한 토큰을 두 번 사용
# 예상 결과: Google API가 "timeout-or-duplicate" 에러 코드 반환
```

## 참고 자료

- [Google reCAPTCHA v3 공식 문서](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA 검증 API 문서](https://developers.google.com/recaptcha/docs/verify)
- [error-codes 참조](https://developers.google.com/recaptcha/docs/verify#error-code-reference)

## 변경 이력

- 2025-11-07: 토큰 만료 검증 로직 수정 (Google API 응답 우선 확인, challenge_ts 기반 보조 검증 완화)

