# JS to CJS 변환 스크립트 모듈화

## 개요

`enhanced-js-to-cjs-converter.ts` 스크립트를 기능별로 모듈화하여 중복을 제거하고 유지보수성을 향상시켰습니다.

## 모듈 구조

### 1. `converter-types.ts`
- 타입 정의 모듈
- `ConversionOptions`, `ConversionStats`, `PathAliasMap` 등 모든 타입 정의

### 2. `converter-utils.ts`
- 유틸리티 함수 모듈
- 로깅 함수 (`log`, `logStep`, `logSuccess`, `logError`, `logWarning`)
- 파일 유틸리티 (`findFileWithExtensions`, `normalizeRelativePath`, `removeExtension`)
- 파일 검증 함수 (`isFileTooLarge`, `isEmptyFile`, `isExternalPath`)

### 3. `file-scanner.ts`
- 파일 스캔 모듈
- `FileScanner` 클래스: JS/TS 파일 및 CJS 파일 찾기
- 캐시 기능으로 성능 최적화

### 4. `path-finder.ts`
- 파일 경로 찾기 모듈
- `PathFinder` 클래스: 실제 파일 위치를 찾아서 올바른 상대 경로 반환
- 다단계 경로 탐색 (1~3단계 상위 디렉토리)
- 중첩 경로 처리 (예: `modules/crawling/core/DataProcessor`)

### 5. `path-alias-resolver.ts`
- 경로 별칭 해석 모듈
- `PathAliasResolver` 클래스: `@backend/*`, `@shared/*` 등의 경로 별칭을 실제 경로로 변환
- `fixPathAliasRequires`: require 경로에서 경로 별칭 변환

### 6. `require-path-fixer.ts`
- require 경로 수정 모듈
- `RequirePathFixer` 클래스: require 경로를 .cjs 확장자로 수정
- `fixRequireExtensions`: .js 확장자를 .cjs로 변경
- `fixRelativePaths`: 확장자가 없는 상대 경로 처리
- `fixAdditionalPatterns`: path-errors.json 기반 추가 패턴 처리

### 7. `esm-converter.ts`
- ESM 문법 변환 모듈
- `EsmConverter` 클래스: ESM 문법을 CommonJS로 변환
- `hasEsmSyntax`: ESM 문법 감지
- `isAlreadyCommonJS`: CommonJS 형태 확인
- `convertImportExport`: import/export 변환
- `convertImportMetaEnv`: import.meta.env 변환
- `convertOtherEsmSyntax`: 기타 ESM 문법 변환

### 8. `dirname-remover.ts`
- __dirname 선언 제거 모듈
- `DirnameRemover` 클래스: CommonJS에서 자동 제공되는 __dirname 선언 제거
- 구체적인 패턴부터 일반적인 패턴 순서로 처리

## 주요 개선 사항

### 1. 모듈화
- 단일 파일(1794줄)을 8개의 모듈로 분리
- 각 모듈은 단일 책임 원칙 준수
- 재사용 가능한 함수들로 구성

### 2. 중복 제거
- 공통 로직을 유틸리티 함수로 추출
- 경로 찾기 로직 통합
- ESM 변환 로직 통합

### 3. 경로 처리 개선
- `PathFinder` 클래스로 모든 경로 패턴 처리
- 다단계 상위 디렉토리 탐색 (1~3단계)
- 중첩 경로 처리 (예: `modules/crawling/core/DataProcessor`)
- path-errors.json 기반 추가 패턴 처리

### 4. 로직 정교화
- path-errors.json의 모든 오류 패턴 처리
- 확장자가 이미 .cjs인 경우도 처리
- 같은 디렉토리 내 잘못된 경로 수정
- 상위 디렉토리 탐색 로직 개선

## 사용법

```bash
# 기본 실행
npm run build:backend

# 상세 로그
npx ts-node scripts/enhanced-js-to-cjs-converter.ts --verbose

# 드라이 런
npx ts-node scripts/enhanced-js-to-cjs-converter.ts --dry-run
```

## 처리되는 경로 패턴

1. **같은 디렉토리 내 파일**: `./module` → `./module.cjs`
2. **상위 디렉토리**: `./services/module` → `../services/module.cjs`
3. **상위 상위 디렉토리**: `./entities/module` → `../entities/module.cjs`
4. **중첩 경로**: `./modules/crawling/core/DataProcessor` → `../../core/DataProcessor.cjs`
5. **같은 디렉토리 내 잘못된 경로**: `./modules/crawling/sources/search/BaseSearchEngine` → `./BaseSearchEngine.cjs`
6. **경로 별칭**: `@backend/utils/pathUtils` → `../utils/pathUtils.cjs`

## 통계

- **모듈 수**: 8개
- **코드 라인 수**: 약 1200줄 (모듈화 전 1794줄)
- **중복 제거**: 약 30% 감소
- **유지보수성**: 향상 (각 모듈 독립적 수정 가능)

