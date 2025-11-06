# 빌드 시 환경 변수 안전장치

## 📋 개요

빌드 시 환경 변수 설정 부분에 안전장치를 추가하여 안전하게 환경 변수가 적용되도록 개선했습니다.

## ✅ 추가된 안전장치

### 1. **파일 로드 안전장치**

#### 1.1 파일 존재 확인
```typescript
if (!fs.existsSync(envProductionPath)) {
  logWarning(`⚠️ .env.production 파일이 존재하지 않습니다`)
  // 빌드는 계속 진행되지만 기본값 또는 process.env의 값이 사용됩니다.
  return {}
}
```

#### 1.2 파일 읽기 권한 확인
```typescript
try {
  fs.accessSync(envProductionPath, fs.constants.R_OK)
} catch (error) {
  logError(`❌ .env.production 파일 읽기 권한이 없습니다`)
  throw new Error(`.env.production 파일 읽기 권한 오류`)
}
```

#### 1.3 파일 내용 확인 (빈 파일 방지)
```typescript
const fileContent = fs.readFileSync(envProductionPath, 'utf-8').trim()
if (fileContent.length === 0) {
  logWarning('⚠️ .env.production 파일이 비어있습니다.')
  return {}
}
```

#### 1.4 dotenv 파싱 에러 처리
```typescript
try {
  envProductionResult = dotenv.config({ 
    path: envProductionPath,
    debug: this.options.verbose
  })
} catch (parseError) {
  logError(`❌ .env.production 파일 파싱 실패`)
  throw new Error(`.env.production 파일 파싱 오류`)
}
```

#### 1.5 파싱 결과 검증
```typescript
if (!envProductionResult.parsed || Object.keys(envProductionResult.parsed).length === 0) {
  logWarning('⚠️ .env.production 파일에 유효한 변수가 없습니다.')
  return {}
}
```

### 2. **환경 변수 유효성 검증**

#### 2.1 URL 형식 검증
```typescript
case 'VITE_BACKEND_URL':
case 'VITE_FRONTEND_URL': {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { isValid: false, error: `${key}는 http:// 또는 https://로 시작해야 합니다.` }
    }
  } catch {
    return { isValid: false, error: `${key}는 유효한 URL 형식이어야 합니다.` }
  }
}
```

#### 2.2 포트 번호 검증
```typescript
case 'VITE_FRONTEND_PORT': {
  const port = parseInt(value, 10)
  if (isNaN(port) || port < 1 || port > 65535) {
    return { isValid: false, error: `${key}는 1-65535 범위의 유효한 포트 번호여야 합니다.` }
  }
}
```

#### 2.3 reCAPTCHA 키 형식 검증
```typescript
case 'VITE_RECAPTCHA_SITE_KEY': {
  if (value.length < 20) {
    return { isValid: false, error: `${key}는 유효한 reCAPTCHA Site Key 형식이어야 합니다.` }
  }
}
```

### 3. **필수 환경 변수 검증**

#### 3.1 필수 변수 정의
```typescript
const requiredVars = [
  { key: 'VITE_BACKEND_URL', isRequired: true },
  { key: 'VITE_FRONTEND_URL', isRequired: true },
  { key: 'VITE_RECAPTCHA_SITE_KEY', isRequired: true }
]
```

#### 3.2 검증 실패 시 처리
```typescript
if (!validation.isValid) {
  logError('❌ 필수 환경 변수 검증 실패:')
  validation.errors.forEach(error => {
    logError(`   - ${error}`)
  })
  
  logError('\n💡 해결 방법:')
  logError('   1. .env.production 파일을 확인하고 필수 환경 변수를 설정하세요')
  logError('   2. 또는 환경 변수로 직접 설정하세요 (process.env)')
  logError('   3. 필수 환경 변수: VITE_BACKEND_URL, VITE_FRONTEND_URL, VITE_RECAPTCHA_SITE_KEY')
  
  throw new Error(`환경 변수 검증 실패`)
}
```

### 4. **안전한 환경 변수 병합**

#### 4.1 우선순위 처리
```typescript
// 우선순위: .env.production > process.env > 기본값

// 1. 기본값으로 시작
const env: Record<string, string> = {
  ...process.env,
  NODE_ENV: 'production',
  MODE: 'production',
}

// 2. .env.production의 모든 VITE_* 변수 먼저 추가 (최우선)
Object.keys(productionEnv)
  .filter(key => key.startsWith('VITE_'))
  .forEach(key => {
    const value = productionEnv[key]
    if (value && value.trim() !== '') {
      env[key] = value.trim()
    }
  })

// 3. 명시적으로 정의된 변수들 처리
envKeys.forEach(key => {
  env[key] = productionEnv[key] || process.env[key] || envDefaults[key]
})
```

#### 4.2 빈 값 처리
```typescript
// 빈 문자열을 기본값으로 대체하지 않음 (의도적으로 빈 값일 수 있음)
if (env[key] === '' && envDefaults[key] !== '') {
  env[key] = envDefaults[key]
}
```

### 5. **안전한 로깅**

#### 5.1 민감 정보 마스킹
```typescript
// 민감 정보 마스킹 (KEY, SECRET 포함)
if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
  if (value.length > 15) {
    displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 4)
  } else if (value.length > 0) {
    displayValue = '***' + value.substring(value.length - 4)
  } else {
    displayValue = '(empty)'
  }
}
```

#### 5.2 소스 표시
```typescript
// 소스 표시 (어디서 왔는지)
const source = productionEnv[key] ? '.env.production' : 
              process.env[key] ? 'process.env' : 
              'default'

log(`  ${key}=${displayValue} [${source}]`, 'blue')
```

#### 5.3 누락된 중요 환경 변수 경고
```typescript
const importantVars = ['VITE_BACKEND_URL', 'VITE_FRONTEND_URL', 'VITE_RECAPTCHA_SITE_KEY']
const missingImportant = importantVars.filter(key => !env[key] || env[key].trim() === '')

if (missingImportant.length > 0) {
  logWarning(`⚠️ 중요 환경 변수가 설정되지 않았습니다: ${missingImportant.join(', ')}`)
  logWarning('   기본값이 사용되지만, 프로덕션 환경에서는 명시적으로 설정하는 것을 권장합니다.')
}
```

## 🔄 에러 처리 흐름

### 파일 로드 실패 시
1. 파일 존재 확인 → 파일 없음 → 경고 출력 후 계속 진행 (기본값 사용)
2. 파일 읽기 권한 확인 → 권한 없음 → 에러 출력 후 빌드 중단
3. 파일 내용 확인 → 빈 파일 → 경고 출력 후 계속 진행
4. dotenv 파싱 → 파싱 실패 → 에러 출력 후 빌드 중단
5. 파싱 결과 확인 → 변수 없음 → 경고 출력 후 계속 진행

### 환경 변수 검증 실패 시
1. 필수 환경 변수 검증 → 실패 → 에러 출력 후 빌드 중단
2. URL 형식 검증 → 실패 → 에러 출력 후 빌드 중단
3. 포트 번호 검증 → 실패 → 에러 출력 후 빌드 중단
4. reCAPTCHA 키 검증 → 실패 → 에러 출력 후 빌드 중단

## 📊 검증 결과 예시

### 성공 케이스
```
✅ .env.production 파일 로드 완료 (5개 변수)
[VALIDATE] 환경 변수 유효성 검증 중...
✅ 환경 변수 검증 완료
📋 프론트엔드 빌드 환경 변수:
  VITE_BACKEND_URL=${VITE_BACKEND_URL} [.env.production]
  VITE_FRONTEND_URL=${VITE_FRONTEND_URL} [.env.production]
  VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY} [.env.production]
```

**⚠️ 중요:** 실제 값은 환경 변수 파일에 설정하거나 환경 변수로 직접 설정해야 합니다.

### 실패 케이스
```
⚠️ .env.production 파일이 존재하지 않습니다
[VALIDATE] 환경 변수 유효성 검증 중...
❌ 필수 환경 변수 검증 실패:
   - VITE_BACKEND_URL는 유효한 URL 형식이어야 합니다.
   - VITE_RECAPTCHA_SITE_KEY는 필수 환경 변수입니다.

💡 해결 방법:
   1. .env.production 파일을 확인하고 필수 환경 변수를 설정하세요
   2. 또는 환경 변수로 직접 설정하세요 (process.env)
   3. 필수 환경 변수: VITE_BACKEND_URL, VITE_FRONTEND_URL, VITE_RECAPTCHA_SITE_KEY
```

## 🎯 장점

1. **안전성**: 파일 로드 실패, 파싱 오류, 유효성 검증 실패 시 명확한 에러 메시지
2. **투명성**: 환경 변수 소스 표시 (`.env.production`, `process.env`, `default`)
3. **유연성**: 파일이 없어도 빌드 계속 진행 (기본값 사용)
4. **보안**: 민감 정보 마스킹
5. **검증**: 필수 환경 변수 및 형식 검증

## 📝 사용 방법

### 정상 빌드
```bash
npm run build
# 또는
NODE_ENV=production MODE=production npm run build
```

### 상세 로그로 빌드
```bash
npm run build:production --verbose
```

### 드라이 런 (검증만 수행)
```bash
npm run build --dry-run
```

## ⚠️ 주의사항

1. **필수 환경 변수**: `VITE_BACKEND_URL`, `VITE_FRONTEND_URL`, `VITE_RECAPTCHA_SITE_KEY`는 반드시 설정해야 합니다.
2. **URL 형식**: `VITE_BACKEND_URL`, `VITE_FRONTEND_URL`은 `http://` 또는 `https://`로 시작해야 합니다.
3. **포트 번호**: `VITE_FRONTEND_PORT`는 1-65535 범위의 유효한 숫자여야 합니다.
4. **reCAPTCHA 키**: `VITE_RECAPTCHA_SITE_KEY`는 최소 20자 이상이어야 합니다.

## 🔧 문제 해결

### 파일이 없는 경우
- `.env.production` 파일 생성
- 또는 환경 변수로 직접 설정

### 파싱 오류
- `.env.production` 파일 형식 확인 (KEY=VALUE 형식)
- 주석 처리된 줄 확인 (#으로 시작하는 줄은 무시됨)

### 유효성 검증 실패
- URL 형식 확인 (http:// 또는 https://로 시작)
- 포트 번호 범위 확인 (1-65535)
- reCAPTCHA 키 길이 확인 (최소 20자)

