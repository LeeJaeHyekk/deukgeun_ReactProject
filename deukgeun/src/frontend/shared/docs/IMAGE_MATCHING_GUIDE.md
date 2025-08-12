# 이미지 매칭 시스템 확장 가이드

## 개요

이 문서는 머신 가이드의 이미지 매칭 시스템을 확장하는 방법을 설명합니다. 새로운 머신과 이미지를 추가할 때 이 가이드를 참조하세요.

## 현재 구조

### 1. 설정 파일 분리

- `imageMatchingConfig.ts`: 이미지 매칭 규칙과 설정
- `machineImageUtils.ts`: 실제 매칭 로직과 유틸리티 함수

### 2. 매칭 우선순위

1. **DB 이미지 URL** (우선순위 최고)
2. **정확한 매칭** (exactMatches)
3. **부분 매칭** (partialMatches)
4. **기본 이미지** (fallback)

## 새로운 머신/이미지 추가 방법

### 방법 1: 설정 파일 직접 수정

`src/frontend/shared/config/imageMatchingConfig.ts` 파일을 수정:

```typescript
export const IMAGE_MATCHING_CONFIG: ImageMatchingConfig = {
  // 1. 새로운 이미지 파일 추가
  availableImages: [
    // ... 기존 이미지들
    "new-machine.png", // 새로 추가
  ],

  // 2. 정확한 매칭 규칙 추가
  exactMatches: {
    // ... 기존 규칙들
    "새로운 머신": "new-machine.png",
    "new machine": "new-machine.png",
  },

  // 3. 부분 매칭 규칙 추가 (선택사항)
  partialMatches: {
    // ... 기존 규칙들
    새로운: "new-machine.png",
    new: "new-machine.png",
  },
}
```

### 방법 2: 런타임에 동적 추가

```typescript
import { ImageUtils } from "@shared/utils/machineImageUtils"

// 새로운 이미지 파일 추가
ImageUtils.addAvailableImage("new-machine.png")

// 정확한 매칭 규칙 추가
ImageUtils.addExactMatch("새로운 머신", "new-machine.png")
ImageUtils.addExactMatch("new machine", "new-machine.png")

// 부분 매칭 규칙 추가
ImageUtils.addPartialMatch("새로운", "new-machine.png")
ImageUtils.addPartialMatch("new", "new-machine.png")
```

### 방법 3: 배치로 여러 규칙 추가

```typescript
// 여러 매칭 규칙을 한 번에 추가
ImageUtils.addBatchMatches([
  { keyword: "새로운 머신", imageFileName: "new-machine.png", isExact: true },
  { keyword: "new machine", imageFileName: "new-machine.png", isExact: true },
  { keyword: "새로운", imageFileName: "new-machine.png", isExact: false },
  { keyword: "new", imageFileName: "new-machine.png", isExact: false },
])
```

## 확장성 기능

### 1. 캐시 관리

```typescript
// 캐시 통계 확인
const stats = ImageUtils.getCacheStats()
console.log(`이미지 캐시: ${stats.imageCacheSize}개`)
console.log(`실패한 이미지: ${stats.failedImagesSize}개`)

// 캐시 초기화
clearImageCache()
```

### 2. 설정 관리

```typescript
// 현재 설정 조회
const config = ImageUtils.getConfig()
console.log("현재 매칭 규칙:", config.exactMatches)

// 설정 초기화
ImageUtils.resetConfig()
```

### 3. 매칭 규칙 제거

```typescript
// 정확한 매칭 규칙 제거
ImageUtils.removeMatch("새로운 머신", true)

// 부분 매칭 규칙 제거
ImageUtils.removeMatch("새로운", false)
```

## 모범 사례

### 1. 이미지 파일명 규칙

- **kebab-case** 사용: `new-machine.png`
- **영문 우선**: `new-machine.png` > `새로운-머신.png`
- **확장자 통일**: `.png`, `.jpg`, `.gif` 등

### 2. 매칭 키워드 규칙

- **정확한 매칭**: 전체 이름 또는 주요 키워드
- **부분 매칭**: 일반적인 용어나 카테고리
- **한글/영문 병행**: `"새로운 머신": "new-machine.png"`

### 3. 우선순위 고려

```typescript
// 좋은 예: 구체적인 키워드가 먼저
exactMatches: {
  "새로운 머신": "new-machine.png",     // 구체적
  "new machine": "new-machine.png",     // 구체적
}

partialMatches: {
  "새로운": "new-machine.png",          // 일반적
  "new": "new-machine.png",             // 일반적
}
```

## 성능 최적화

### 1. 캐싱 활용

- 이미지 매칭 결과는 자동으로 캐시됨
- 캐시 크기는 1000개로 제한 (메모리 누수 방지)

### 2. 매칭 순서 최적화

- 정확한 매칭을 먼저 시도
- 긴 키워드부터 부분 매칭 시도

### 3. 에러 처리

- 무한 루프 방지
- 실패한 이미지 추적
- 기본 이미지 fallback

## 디버깅

### 1. 콘솔 로그 확인

브라우저 개발자 도구에서 다음 로그들을 확인:

- `🔍 findMatchingImage 호출`: 매칭 시작
- `📸 DB 이미지 URL 사용`: DB URL 사용
- `🔍 로컬 이미지 매칭 시도`: 로컬 매칭 시도
- `✅ 로컬 이미지 매칭 성공`: 매칭 성공
- `❌ 매칭 실패, 기본 이미지 사용`: 매칭 실패
- `🎯 최종 이미지 경로`: 최종 결과

### 2. 캐시 상태 확인

```typescript
const stats = ImageUtils.getCacheStats()
console.log("캐시 상태:", stats)
```

## 예시: 새로운 머신 추가

### 시나리오: "스미스 머신" 추가

1. **이미지 파일 추가**
   - `public/img/machine/smith-machine.png` 파일 추가

2. **설정 파일 수정**

```typescript
export const IMAGE_MATCHING_CONFIG: ImageMatchingConfig = {
  availableImages: [
    // ... 기존 이미지들
    "smith-machine.png",
  ],
  exactMatches: {
    // ... 기존 규칙들
    "스미스 머신": "smith-machine.png",
    "smith machine": "smith-machine.png",
  },
  partialMatches: {
    // ... 기존 규칙들
    스미스: "smith-machine.png",
    smith: "smith-machine.png",
  },
}
```

3. **테스트**
   - 머신 가이드 페이지에서 "스미스 머신" 확인
   - 콘솔 로그에서 매칭 과정 확인

## 주의사항

1. **이미지 파일 존재 확인**: 매칭 규칙을 추가하기 전에 실제 이미지 파일이 존재하는지 확인
2. **키워드 중복 방지**: 동일한 키워드가 여러 이미지에 매칭되지 않도록 주의
3. **성능 고려**: 너무 많은 매칭 규칙은 성능에 영향을 줄 수 있음
4. **캐시 관리**: 새로운 규칙 추가 후 캐시를 초기화하는 것을 고려

## 문제 해결

### Q: 이미지가 표시되지 않음

A: 다음을 확인하세요:

1. 이미지 파일이 올바른 경로에 있는지
2. 매칭 규칙이 올바른지
3. 콘솔 로그에서 에러 메시지 확인

### Q: 잘못된 이미지가 표시됨

A: 다음을 확인하세요:

1. 매칭 규칙의 우선순위
2. 키워드 중복 여부
3. 캐시 초기화 필요 여부

### Q: 성능이 느림

A: 다음을 확인하세요:

1. 캐시 크기
2. 매칭 규칙 수
3. 불필요한 매칭 규칙 제거
