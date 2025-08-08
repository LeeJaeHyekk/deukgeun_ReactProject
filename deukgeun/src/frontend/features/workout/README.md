# 운동일지 기능 구조 개선 가이드

## 현재 문제점

1. **프로젝트 구조 불일치**
   - 다른 기능들은 `features/` 폴더 구조 사용
   - 운동일지는 `pages/`에 직접 구현되어 있음

2. **API 호출 방식 불일치**
   - 다른 기능들은 `shared/api/`의 공통 모듈 사용
   - 운동일지는 각 훅에서 직접 fetch 호출

3. **타입 정의 중복**
   - 백엔드 엔티티와 프론트엔드 인터페이스가 중복 정의됨

## 개선 방안

### 1. 폴더 구조 변경

```
src/frontend/features/workout/
├── components/
│   ├── WorkoutPlanCard.tsx
│   ├── WorkoutSessionTimer.tsx
│   ├── WorkoutCalendar.tsx
│   ├── ProgressChart.tsx
│   └── GoalProgressBar.tsx
├── hooks/
│   ├── useWorkoutPlans.ts
│   ├── useWorkoutSessions.ts
│   └── useWorkoutGoals.ts
├── types/
│   └── index.ts
└── WorkoutJournalPage.tsx
```

### 2. API 통합

- `shared/api/workoutApi.ts` 사용
- 공통 타입 정의 활용
- 일관된 에러 처리

### 3. 컴포넌트 재사용성 향상

- 공통 UI 컴포넌트 활용
- 스타일 가이드 준수
- 접근성 개선

## 마이그레이션 단계

1. **백엔드 API 구현 완료** ✅
2. **공통 API 모듈 생성** ✅
3. **훅 업데이트** ✅
4. **폴더 구조 변경** (다음 단계)
5. **컴포넌트 리팩토링** (다음 단계)

## 장점

- 프로젝트 전체 구조 일관성 확보
- 코드 재사용성 향상
- 유지보수성 개선
- 타입 안정성 강화
