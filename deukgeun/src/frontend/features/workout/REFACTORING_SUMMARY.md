# 운동관리 페이지 리팩토링 요약

## 개선 사항

### 1. 모듈화 개선

#### 초기화 로직 분리
- ✅ **`useWorkoutPageInitialization` Hook 생성**: `WorkoutPage`의 초기화 로직을 별도 Hook으로 분리
  - localStorage 데이터 로드
  - 백엔드 데이터 로드 및 병합
  - completedWorkouts 추출 로직 분리

#### 공통 컴포넌트 분리
- ✅ **`EmptyState` 컴포넌트**: 빈 상태 표시를 위한 공통 컴포넌트
  - `GoalSettingPanel`, `ActiveWorkoutPanel`, `CompletedList`에서 중복 제거
  - 재사용 가능한 props 인터페이스 제공

- ✅ **`ErrorState` 컴포넌트**: 오류 상태 표시를 위한 공통 컴포넌트
  - `ActiveWorkoutPanel`에서 중복 제거
  - 재시도 기능 포함

- ✅ **`LoadingState` 컴포넌트**: 로딩 상태 표시를 위한 공통 컴포넌트
  - `WorkoutPage`의 `PanelLoader`에서 사용
  - 일관된 로딩 UI 제공

#### 폴더 구조 개편
- ✅ **`components/common/` 폴더 생성**: 공통 UI 컴포넌트 통합 관리
  - `EmptyState.tsx` / `EmptyState.module.css`
  - `ErrorState.tsx` / `ErrorState.module.css`
  - `LoadingState.tsx` / `LoadingState.module.css`
  - `index.ts` (통합 export)

### 2. 코드 중복 제거

#### 중복된 빈 상태 UI 제거
- ✅ `GoalSettingPanel`: 빈 목표 상태 → `EmptyState` 사용
- ✅ `ActiveWorkoutPanel`: 빈 세션 상태 → `EmptyState` 사용
- ✅ `CompletedList`: 빈 완료 운동 상태 → `EmptyState` 사용
- ✅ `WorkoutPage`: 로그인 필요 상태 → `EmptyState` 사용

#### 중복된 오류 상태 UI 제거
- ✅ `ActiveWorkoutPanel`: 목표 찾기 실패 → `ErrorState` 사용

#### 중복된 로딩 상태 UI 제거
- ✅ `WorkoutPage`: 패널 로딩 → `LoadingState` 사용

### 3. 파일 구조 개선

#### Hook 구조
```
hooks/
├── useWorkoutPageInitialization.ts  (신규)
├── useWorkoutGoals.ts
├── useWorkoutSession.ts
└── useRestTimer.ts
```

#### Components 구조
```
components/
├── common/                          (신규)
│   ├── EmptyState.tsx
│   ├── EmptyState.module.css
│   ├── ErrorState.tsx
│   ├── ErrorState.module.css
│   ├── LoadingState.tsx
│   ├── LoadingState.module.css
│   └── index.ts
├── GoalSettingPanel.tsx
├── ActiveWorkoutPanel.tsx
├── CompletedWorkoutPanel.tsx
├── AddGoalModal.tsx
└── ...
```

### 4. Export 구조 개선

- ✅ `components/index.ts` 업데이트: 공통 컴포넌트 및 주요 컴포넌트 명시적 export
- ✅ `hooks/index.ts` 업데이트: `useWorkoutPageInitialization` 추가

### 5. 코드 품질 개선

#### 관심사 분리
- ✅ 초기화 로직: `useWorkoutPageInitialization` Hook으로 분리
- ✅ UI 상태 표시: 공통 컴포넌트로 통합

#### 재사용성 향상
- ✅ 공통 컴포넌트를 통한 일관된 UI 제공
- ✅ props 인터페이스 표준화

#### 유지보수성 향상
- ✅ 중복 코드 제거로 수정 포인트 감소
- ✅ 명확한 폴더 구조로 파일 위치 파악 용이

## 주요 변경 파일

### 신규 생성 파일
- `src/frontend/features/workout/hooks/useWorkoutPageInitialization.ts`
- `src/frontend/features/workout/components/common/EmptyState.tsx`
- `src/frontend/features/workout/components/common/EmptyState.module.css`
- `src/frontend/features/workout/components/common/ErrorState.tsx`
- `src/frontend/features/workout/components/common/ErrorState.module.css`
- `src/frontend/features/workout/components/common/LoadingState.tsx`
- `src/frontend/features/workout/components/common/LoadingState.module.css`
- `src/frontend/features/workout/components/common/index.ts`

### 수정된 파일
- `src/frontend/features/workout/WorkoutPage.tsx`
  - 초기화 로직을 `useWorkoutPageInitialization` Hook으로 분리
  - 공통 컴포넌트 사용 (`EmptyState`, `LoadingState`)

- `src/frontend/features/workout/components/GoalSettingPanel.tsx`
  - `EmptyState` 컴포넌트 사용

- `src/frontend/features/workout/components/ActiveWorkoutPanel.tsx`
  - `EmptyState`, `ErrorState` 컴포넌트 사용

- `src/frontend/features/workout/components/CompletedList.tsx`
  - `EmptyState` 컴포넌트 사용

- `src/frontend/features/workout/components/index.ts`
  - 공통 컴포넌트 및 주요 컴포넌트 명시적 export

- `src/frontend/features/workout/hooks/index.ts`
  - `useWorkoutPageInitialization` export 추가

## 향후 개선 사항

1. **파일명 카멜케이스 일관성**
   - 현재 파일명은 대부분 카멜케이스를 따르고 있으나, 일부 파일명 검토 필요

2. **컴포넌트 폴더 구조 개편**
   - 패널 컴포넌트들을 `panels/` 폴더로 그룹화 검토
   - 모달 컴포넌트들은 이미 `modals/` 폴더에 있음

3. **타입 정의 통합**
   - 공통 타입들을 별도 파일로 분리 검토

