# 자동 컴파일 및 실행 가이드

이 가이드는 TypeScript 스크립트를 자동으로 컴파일하고 실행하는 방법을 설명합니다.

## 🚀 빠른 시작

### 1. js-to-cjs-converter 자동 실행
```bash
# 가장 간단한 방법
npm run quick:js-to-cjs

# 또는 자동화된 방법
npm run script:auto:js-to-cjs
```

### 2. 다른 스크립트 자동 실행
```bash
# 빌드 스크립트
npm run script:auto:build

# 배포 스크립트
npm run script:auto:deploy

# 헬스 체크 스크립트
npm run script:auto:health
```

## 📋 사용 가능한 명령어

### 빠른 컴파일 (Quick Compile)
```bash
# js-to-cjs-converter만 컴파일
npm run quick:compile

# 모든 스크립트 컴파일
npm run quick:compile:all

# 컴파일 후 즉시 실행
npm run quick:js-to-cjs
```

### 자동화된 실행 (Auto Run)
```bash
# 특정 스크립트 자동 실행
npm run script:auto <스크립트명>

# js-to-cjs-converter 자동 실행
npm run script:auto:js-to-cjs

# 빌드 + 배포 자동 실행
npm run script:auto:js-to-cjs:all
```

### 개별 스크립트 자동 실행
```bash
# 빌드 관련
npm run script:auto:build
npm run script:auto:deploy

# 시스템 관리
npm run script:auto:health
npm run script:auto:pm2
npm run script:auto:nginx

# 개발 도구
npm run script:auto:test
npm run script:auto:env
npm run script:auto:data
```

## 🔧 고급 사용법

### 여러 스크립트 순차 실행
```bash
# 여러 스크립트를 순차적으로 실행
npm run script:auto:multiple js-to-cjs-converter.ts build.ts
```

### 옵션과 함께 실행
```bash
# 빌드 옵션과 함께
npm run script:auto:js-to-cjs:build

# 배포 옵션과 함께
npm run script:auto:js-to-cjs:deploy

# 모든 옵션과 함께
npm run script:auto:js-to-cjs:all
```

## 📁 파일 구조

```
scripts/
├── auto-compile-runner.ts      # 자동 컴파일 및 실행 메인 스크립트
├── auto-js-to-cjs-converter.ts # js-to-cjs-converter 자동화 스크립트
├── quick-compile.ts            # 빠른 컴파일 스크립트
└── js-to-cjs-converter.ts     # 원본 변환 스크립트

dist/scripts/
├── js-to-cjs-converter.js      # 컴파일된 JavaScript
├── js-to-cjs-converter.cjs     # CommonJS 버전
└── ...                        # 기타 컴파일된 스크립트들
```

## 🛠️ 문제 해결

### 컴파일 오류 발생 시
```bash
# 캐시 정리 후 재시도
rm -rf dist/scripts
npm run quick:compile
```

### 스크립트 실행 오류 시
```bash
# TypeScript 컴파일 확인
npx tsc --noEmit scripts/*.ts

# 수동 컴파일 시도
npx tsc scripts/js-to-cjs-converter.ts --outDir dist/scripts --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck
```

## 💡 팁과 요령

### 1. 개발 중 자주 사용하는 명령어
```bash
# 가장 자주 사용하는 명령어
npm run quick:js-to-cjs

# 또는 더 간단하게
npm run script:auto:js-to-cjs
```

### 2. 배치 작업
```bash
# 여러 작업을 한 번에 실행
npm run script:auto:js-to-cjs:all
```

### 3. 디버깅
```bash
# 컴파일만 하고 실행하지 않기
npm run quick:compile
# 그 다음 수동으로 실행
node dist/scripts/js-to-cjs-converter.cjs
```

## 🔄 기존 수동 과정과 비교

### 기존 방식 (수동)
```bash
# 1. TypeScript 컴파일
npx tsc scripts/js-to-cjs-converter.ts --outDir dist/scripts --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck

# 2. .js를 .cjs로 복사
Copy-Item dist/scripts/js-to-cjs-converter.js dist/scripts/js-to-cjs-converter.cjs

# 3. 실행
node dist/scripts/js-to-cjs-converter.cjs
```

### 새로운 방식 (자동화)
```bash
# 한 번의 명령어로 모든 과정 완료
npm run quick:js-to-cjs
```

## 📊 성능 비교

| 방식 | 명령어 수 | 소요 시간 | 오류 가능성 |
|------|-----------|-----------|-------------|
| 수동 | 3개 | ~30초 | 높음 |
| 자동화 | 1개 | ~15초 | 낮음 |

## 🎯 권장 사용법

1. **일반적인 사용**: `npm run quick:js-to-cjs`
2. **개발 중**: `npm run script:auto:js-to-cjs`
3. **배포 전**: `npm run script:auto:js-to-cjs:all`
4. **디버깅**: `npm run quick:compile` 후 수동 실행

이제 매번 수동으로 컴파일할 필요 없이 간단한 명령어로 모든 작업을 자동화할 수 있습니다! 🎉
