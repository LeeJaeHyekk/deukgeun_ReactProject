# TypeScript 설정 가이드

## 📋 개요

이 프로젝트는 개발 환경과 빌드 환경을 분리하여 관리합니다. 각 환경에 최적화된 TypeScript 설정을 제공합니다.

## 🏗️ 설정 파일 구조

### 1. `tsconfig.json` (기본 설정)
- **용도**: 개발 환경의 기본 설정
- **모듈**: ESNext (개발용)
- **출력**: `noEmit: true` (타입 체크만)
- **타겟**: ES2022

### 2. `tsconfig.build.json` (빌드 설정)
- **용도**: 프로덕션 빌드용
- **모듈**: CommonJS (Node.js 호환)
- **출력**: `../../dist/backend`
- **타겟**: ES2022
- **최적화**: 주석 제거, 소스맵 비활성화

### 3. `tsconfig.dev.json` (개발 전용)
- **용도**: 개발 시 타입 체크 및 IDE 지원
- **기능**: 증분 컴파일, 소스맵 생성
- **출력**: 타입 체크만 (`noEmit: true`)

## 🚀 사용법

### 개발 환경
```bash
# 개발 서버 실행 (tsx 사용)
npm run dev

# 타입 체크만 실행
npm run dev:check

# ts-node로 개발 서버 실행
npm run dev:ts-node
```

### 빌드 환경
```bash
# 프로덕션 빌드
npm run build

# 빌드 + 감시 모드
npm run build:watch

# 클린 빌드 (기존 빌드 삭제 후 재빌드)
npm run build:clean
```

### 프로덕션 실행
```bash
# 빌드된 파일 실행
npm start

# 개발 모드로 직접 실행
npm run start:dev
```

## 🔧 경로 매핑

### 백엔드 모듈 경로
```typescript
"@/*": ["./*"]                    // 루트
"@/config/*": ["./config/*"]      // 설정
"@/controllers/*": ["./controllers/*"]  // 컨트롤러
"@/entities/*": ["./entities/*"]  // 엔티티
"@/middlewares/*": ["./middlewares/*"]  // 미들웨어
"@/routes/*": ["./routes/*"]      // 라우트
"@/services/*": ["./services/*"]  // 서비스
"@/utils/*": ["./utils/*"]        // 유틸리티
"@/modules/*": ["./modules/*"]    // 모듈
```

### 공유 모듈 경로
```typescript
"@shared/*": ["../shared/*"]      // 공유 모듈
"@shared/types/*": ["../shared/types/*"]  // 공유 타입
"@shared/utils/*": ["../shared/utils/*"]  // 공유 유틸리티
"@shared/constants/*": ["../shared/constants/*"]  // 공유 상수
"@shared/validation/*": ["../shared/validation/*"]  // 공유 검증
"@shared/api/*": ["../shared/api/*"]  // 공유 API
```

### 레거시 호환성
```typescript
"@backend/*": ["./*"]             // 레거시 백엔드 경로
"@backend/modules/*": ["./modules/*"]  // 레거시 모듈 경로
```

## ⚙️ 주요 설정 차이점

| 설정 | 개발 (tsconfig.json) | 빌드 (tsconfig.build.json) |
|------|---------------------|---------------------------|
| 모듈 시스템 | ESNext | CommonJS |
| 출력 | 없음 (noEmit: true) | JavaScript 파일 |
| 소스맵 | 활성화 | 비활성화 |
| 주석 | 유지 | 제거 |
| 증분 컴파일 | 활성화 | 비활성화 |
| 타겟 | ES2022 | ES2022 |

## 🎯 최적화 포인트

### 개발 환경
- **빠른 타입 체크**: `noEmit: true`로 컴파일 시간 단축
- **증분 컴파일**: 변경된 파일만 재컴파일
- **소스맵**: 디버깅 지원

### 빌드 환경
- **CommonJS**: Node.js 호환성
- **최적화**: 주석 제거, 소스맵 비활성화
- **안정성**: `noEmitOnError: false`로 부분 빌드 허용

## 🔍 문제 해결

### 경로 해결 오류
```bash
# 타입 체크로 경로 문제 확인
npm run dev:check
```

### 빌드 오류
```bash
# 클린 빌드로 해결
npm run build:clean
```

### 모듈 해결 문제
- `tsconfig-paths` 패키지가 설치되어 있는지 확인
- 경로 매핑이 올바른지 확인
- `baseUrl` 설정 확인

## 📝 주의사항

1. **개발 시**: `tsconfig.json` 또는 `tsconfig.dev.json` 사용
2. **빌드 시**: `tsconfig.build.json` 사용
3. **경로 매핑**: `@backend/*`는 레거시 호환성을 위해 유지
4. **모듈 시스템**: 개발은 ESNext, 빌드는 CommonJS 사용

## 🚀 향후 개선 계획

1. **레거시 경로 제거**: `@backend/*` 경로를 점진적으로 제거
2. **모듈 통합**: ESM과 CommonJS 통합 검토
3. **성능 최적화**: 빌드 시간 단축 방안 모색
4. **타입 안전성**: 더 엄격한 타입 체크 도입
