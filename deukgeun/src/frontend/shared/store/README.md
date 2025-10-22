# Redux Store 구조 개선 - 무한 루프 해결

## 🔧 **수정된 내용**

### 1. **중복 슬라이스 제거**
- `statsSlice` 제거 → `appSlice`에서 통합 관리
- 동일한 데이터를 두 슬라이스에서 중복 관리하던 문제 해결

### 2. **Thunk Condition 추가**
```typescript
// 중복 요청 방지
export const fetchUserStats = createAsyncThunk(
  'app/fetchUserStats',
  async (_, { rejectWithValue }) => { /* ... */ },
  {
    condition: (_, { getState }) => {
      const state = getState() as any
      if (state.app?.loadingStates?.userStats) {
        return false // 이미 로딩 중이면 dispatch 차단
      }
      return true
    }
  }
)
```

### 3. **Selector 메모이제이션**
```typescript
// createSelector로 메모이제이션
export const selectUserStats = createSelector(
  [selectAppState],
  (app) => app.userStats
)
```

### 4. **useEffect 의존성 최적화**
```typescript
// ❌ 잘못된 예 (무한 루프 유발)
useEffect(() => {
  dispatch(fetchUserStats())
}, [userStats]) // 객체 참조 변경으로 인한 무한 루프

// ✅ 올바른 예
useEffect(() => {
  dispatch(fetchUserStats())
}, [isAuthenticated, userId, dispatch, userStatsLoading]) // primitive 값만 의존성으로 사용
```

## 🚀 **성능 개선 효과**

1. **무한 루프 방지**: condition 옵션으로 중복 요청 차단
2. **불필요한 리렌더 방지**: 메모이제이션된 셀렉터 사용
3. **메모리 사용량 감소**: 중복 슬라이스 제거
4. **코드 복잡도 감소**: 단일 슬라이스로 통합 관리

## 📋 **사용 가이드**

### 컴포넌트에서 사용
```typescript
import { 
  selectUserStats, 
  selectUserStatsLoading,
  selectIsAuthenticated 
} from '@frontend/shared/store/selectors'

function MyComponent() {
  const userStats = useAppSelector(selectUserStats)
  const isLoading = useAppSelector(selectUserStatsLoading)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  
  // 안전한 useEffect
  useEffect(() => {
    if (isAuthenticated && !userStats && !isLoading) {
      dispatch(fetchUserStats())
    }
  }, [isAuthenticated, userStats, isLoading, dispatch])
}
```

### Thunk 사용 시 주의사항
- condition 옵션으로 중복 요청 방지
- getState()로 현재 상태 확인 후 요청
- 에러 처리 시 rejectWithValue 사용

## 🔍 **디버깅 팁**

1. **콘솔 로그 확인**: 각 액션의 pending/fulfilled/rejected 로그 추적
2. **Redux DevTools**: 상태 변화와 액션 디스패치 순서 확인
3. **네트워크 탭**: API 호출 빈도와 중복 요청 확인
4. **React DevTools**: 컴포넌트 리렌더링 원인 분석

## ⚠️ **주의사항**

1. **useEffect 의존성**: 객체나 함수를 직접 넣지 말고 primitive 값 사용
2. **Selector 사용**: createSelector로 메모이제이션 필수
3. **Thunk condition**: 중복 요청 방지를 위해 condition 옵션 활용
4. **상태 구조**: 단일 슬라이스에서 관련 데이터 통합 관리
