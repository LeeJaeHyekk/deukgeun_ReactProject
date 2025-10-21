# 빌드 가이드

## 개요

이 프로젝트는 최적화된 빌드 시스템을 사용하여 TypeScript 코드를 JavaScript로 컴파일하고, ES Modules를 CommonJS로 변환합니다.

## 주요 특징

- **원본 파일 보호**: 프로젝트 원본 파일은 절대 수정되지 않습니다
- **dist 폴더 전용 변환**: 모든 변환 작업은 `dist` 폴더에서만 수행됩니다
- **자동 백업**: 변환 전 자동으로 백업을 생성합니다
- **롤백 지원**: 문제 발생 시 자동으로 원본으로 롤백합니다

## 빌드 스크립트

### 기본 빌드

```bash
# 전체 빌드 (백엔드 + 프론트엔드 + JS to CJS 변환)
npm run build

# 프로덕션 빌드 (상세 로그 포함)
npm run build:production
```

### 최적화된 빌드

```bash
# 최적화된 빌드
npm run build:optimized

# 상세 로그와 함께 빌드
npm run build:optimized:verbose

# 드라이 런 (실제 빌드하지 않고 계획만 확인)
npm run build:optimized:dry
```

### 개별 변환

```bash
# JS to CJS 변환만 실행
npm run convert:fixed

# 상세 로그와 함께 변환
npm run convert:fixed:verbose

# 드라이 런
npm run convert:fixed:dry
```

## 빌드 프로세스

### 1. 빌드 전 준비
- `dist` 폴더 정리
- 임시 폴더 생성
- 백업 생성

### 2. 백엔드 빌드
- TypeScript 컴파일 (`src/backend` → `dist/backend`)
- 설정 파일 복사

### 3. 프론트엔드 빌드
- Vite 빌드 실행
- React 앱 번들링
- 에셋 최적화

### 4. JS to CJS 변환
- `dist` 폴더의 모든 `.js` 파일을 `.cjs`로 변환
- `import.meta.env` → `process.env` 변환
- ES Modules → CommonJS 변환
- `require` 경로 수정

### 5. 빌드 후 정리
- 임시 파일 삭제
- 폴더 구조 정리
- 백업 유지

## 변환 규칙

### import.meta.env 변환

```typescript
// 변환 전
import.meta.env.VITE_API_URL
import.meta.env.MODE
import.meta.env.DEV

// 변환 후
process.env.VITE_API_URL
process.env.NODE_ENV
process.env.NODE_ENV === "development"
```

### ES Modules → CommonJS 변환

```typescript
// 변환 전
import React from 'react'
import { useState } from 'react'
export default Component
export { helper }

// 변환 후
const React = require('react').default
const { useState } = require('react')
module.exports.default = Component
module.exports.helper = helper
```

## 폴더 구조

```
dist/
├── backend/          # 백엔드 빌드 결과
│   ├── *.cjs        # 변환된 CommonJS 파일들
│   └── ...
├── frontend/         # 프론트엔드 빌드 결과
│   ├── assets/      # 정적 에셋
│   ├── js/          # JavaScript 파일들
│   └── ...
├── shared/          # 공유 모듈
└── data/            # 데이터 파일들
```

## 옵션

### 빌드 옵션

- `--no-clean`: dist 폴더 정리하지 않음
- `--no-backend`: 백엔드 빌드 건너뛰기
- `--no-frontend`: 프론트엔드 빌드 건너뛰기
- `--no-convert`: JS to CJS 변환 건너뛰기
- `--verbose`: 상세 로그 활성화
- `--dry-run`: 드라이 런 모드

### 변환 옵션

- `--dist-path <path>`: dist 폴더 경로 지정
- `--no-backup`: 백업 생성하지 않음
- `--verbose`: 상세 로그 활성화
- `--dry-run`: 드라이 런 모드

## 문제 해결

### 빌드 실패 시

1. **백업에서 복원**:
   ```bash
   # 자동 롤백이 실행됩니다
   # 수동으로 백업에서 복원하려면:
   cp -r .conversion-backup/* dist/
   ```

2. **캐시 정리**:
   ```bash
   rm -rf dist/
   rm -rf .conversion-backup/
   rm -rf .temp-build/
   ```

3. **의존성 재설치**:
   ```bash
   rm -rf node_modules/
   npm install
   ```

### 변환 실패 시

1. **개별 파일 확인**:
   ```bash
   # 변환된 파일 확인
   find dist/ -name "*.cjs" -type f
   ```

2. **원본 파일 확인**:
   ```bash
   # 원본 파일 확인
   find dist/ -name "*.js" -type f
   ```

## 성능 최적화

- **병렬 처리**: 여러 파일을 동시에 변환
- **캐싱**: 변환 결과를 캐시하여 재사용
- **메모리 관리**: 대용량 프로젝트 처리 시 메모리 사용량 모니터링
- **증분 빌드**: 변경된 파일만 다시 빌드

## 보안

- **원본 보호**: 프로젝트 원본 파일은 절대 수정되지 않음
- **백업 생성**: 변환 전 자동 백업
- **롤백 지원**: 문제 발생 시 자동 복원
- **검증**: 변환 결과 검증

## 모니터링

빌드 과정에서 다음 정보를 모니터링할 수 있습니다:

- 빌드 시간
- 변환된 파일 수
- 메모리 사용량
- 에러 발생률
- 성공/실패 통계

## 지원

문제가 발생하면 다음을 확인하세요:

1. Node.js 버전 (18.x 이상 권장)
2. TypeScript 버전
3. 프로젝트 의존성
4. 빌드 로그

자세한 로그를 보려면 `--verbose` 옵션을 사용하세요.
