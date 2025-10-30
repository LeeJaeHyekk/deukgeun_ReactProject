# 성능 최적화 가이드

## 개요

이 문서는 Deukgeun 프로젝트에서 React 애플리케이션의 성능을 최적화하기 위한 가이드라인과 베스트 프랙티스를 제공합니다.

## 목차

1. [React 성능 최적화](#react-성능-최적화)
2. [메모이제이션 전략](#메모이제이션-전략)
3. [렌더링 최적화](#렌더링-최적화)
4. [번들 최적화](#번들-최적화)
5. [네트워크 최적화](#네트워크-최적화)
6. [상태 관리 최적화](#상태-관리-최적화)
7. [이미지 및 에셋 최적화](#이미지-및-에셋-최적화)
8. [모니터링 및 프로파일링](#모니터링-및-프로파일링)

## React 성능 최적화

### 1. React.memo 활용

#### 기본 사용법
```typescript
// ✅ 좋은 예: React.memo로 불필요한 리렌더링 방지
const UserCard = memo(function UserCard({ 
  user, 
  onEdit, 
  onDelete 
}: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>Edit</button>
      <button onClick={() => onDelete(user.id)}>Delete</button>
    </div>
  )
})
```

#### 커스텀 비교 함수
```typescript
// ✅ 좋은 예: 커스텀 비교 함수로 세밀한 제어
const UserCard = memo(function UserCard({ user, isSelected }: UserCardProps) {
  return (
    <div className={`user-card ${isSelected ? 'selected' : ''}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
}, (prevProps, nextProps) => {
  // 사용자 데이터와 선택 상태만 비교
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name &&
    prevProps.user.email === nextProps.user.email &&
    prevProps.isSelected === nextProps.isSelected
  )
})
```

### 2. useCallback과 useMemo 활용

#### 이벤트 핸들러 최적화
```typescript
// ✅ 좋은 예: 이벤트 핸들러 메모이제이션
const UserList = ({ users, onUserSelect }: UserListProps) => {
  const handleUserSelect = useCallback((userId: number) => {
    onUserSelect(userId)
  }, [onUserSelect])

  const handleUserEdit = useCallback((userId: number) => {
    // 편집 로직
  }, [])

  const handleUserDelete = useCallback((userId: number) => {
    // 삭제 로직
  }, [])

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onSelect={handleUserSelect}
          onEdit={handleUserEdit}
          onDelete={handleUserDelete}
        />
      ))}
    </div>
  )
}
```

#### 계산된 값 최적화
```typescript
// ✅ 좋은 예: 계산된 값 메모이제이션
const WorkoutPlanList = ({ plans, sortBy, filterBy }: WorkoutPlanListProps) => {
  // 필터링된 계획 목록
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      if (filterBy === 'all') return true
      return plan.difficulty === filterBy
    })
  }, [plans, filterBy])

  // 정렬된 계획 목록
  const sortedPlans = useMemo(() => {
    return [...filteredPlans].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'difficulty':
          return a.difficulty.localeCompare(b.difficulty)
        default:
          return 0
      }
    })
  }, [filteredPlans, sortBy])

  // 통계 계산
  const planStats = useMemo(() => {
    return {
      total: sortedPlans.length,
      beginner: sortedPlans.filter(p => p.difficulty === 'beginner').length,
      intermediate: sortedPlans.filter(p => p.difficulty === 'intermediate').length,
      advanced: sortedPlans.filter(p => p.difficulty === 'advanced').length
    }
  }, [sortedPlans])

  return (
    <div className="workout-plan-list">
      <div className="stats">
        <p>총 {planStats.total}개 계획</p>
        <p>초급: {planStats.beginner}개</p>
        <p>중급: {planStats.intermediate}개</p>
        <p>고급: {planStats.advanced}개</p>
      </div>
      {sortedPlans.map(plan => (
        <WorkoutPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
```

## 메모이제이션 전략

### 1. 선택적 메모이제이션
```typescript
// ✅ 좋은 예: 필요한 경우에만 메모이제이션
const ExpensiveComponent = ({ data, options }: ExpensiveComponentProps) => {
  // 비용이 큰 계산만 메모이제이션
  const expensiveValue = useMemo(() => {
    return data.reduce((acc, item) => {
      // 복잡한 계산 로직
      return acc + item.value * options.multiplier
    }, 0)
  }, [data, options.multiplier])

  // 간단한 계산은 메모이제이션하지 않음
  const simpleValue = data.length

  return (
    <div>
      <p>Expensive: {expensiveValue}</p>
      <p>Simple: {simpleValue}</p>
    </div>
  )
}
```

### 2. 의존성 배열 최적화
```typescript
// ✅ 좋은 예: 의존성 배열 최적화
const UserProfile = ({ userId, userPreferences }: UserProfileProps) => {
  // 객체 참조 안정화
  const stablePreferences = useMemo(() => ({
    theme: userPreferences.theme,
    language: userPreferences.language
  }), [userPreferences.theme, userPreferences.language])

  // 함수 참조 안정화
  const handlePreferenceChange = useCallback((key: string, value: string) => {
    // 설정 변경 로직
  }, [])

  // 배열 참조 안정화
  const menuItems = useMemo(() => [
    { id: 'profile', label: '프로필', icon: '👤' },
    { id: 'settings', label: '설정', icon: '⚙️' },
    { id: 'logout', label: '로그아웃', icon: '🚪' }
  ], [])

  return (
    <div className="user-profile">
      <UserMenu items={menuItems} onItemClick={handlePreferenceChange} />
      <UserSettings preferences={stablePreferences} />
    </div>
  )
}
```

## 렌더링 최적화

### 1. 조건부 렌더링 최적화
```typescript
// ✅ 좋은 예: 조건부 렌더링 최적화
const ConditionalComponent = ({ showDetails, data }: ConditionalComponentProps) => {
  // 조건부로 렌더링되는 컴포넌트를 메모이제이션
  const DetailsComponent = useMemo(() => {
    if (!showDetails) return null
    
    return (
      <div className="details">
        {data.map(item => (
          <DetailItem key={item.id} item={item} />
        ))}
      </div>
    )
  }, [showDetails, data])

  return (
    <div className="conditional-component">
      <h2>Main Content</h2>
      {DetailsComponent}
    </div>
  )
}
```

### 2. 가상화 (Virtualization)
```typescript
// ✅ 좋은 예: 대용량 리스트 가상화
import { FixedSizeList as List } from 'react-window'

const VirtualizedUserList = ({ users }: VirtualizedUserListProps) => {
  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <UserCard user={users[index]} />
    </div>
  ))

  return (
    <List
      height={600}
      itemCount={users.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### 3. 지연 로딩 (Lazy Loading)
```typescript
// ✅ 좋은 예: 컴포넌트 지연 로딩
const LazyUserProfile = lazy(() => import('./UserProfile'))
const LazyWorkoutPlan = lazy(() => import('./WorkoutPlan'))
const LazyMachineGuide = lazy(() => import('./MachineGuide'))

const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/profile" element={<LazyUserProfile />} />
          <Route path="/workout-plan" element={<LazyWorkoutPlan />} />
          <Route path="/machine-guide" element={<LazyMachineGuide />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
```

## 번들 최적화

### 1. 코드 분할 (Code Splitting)
```typescript
// ✅ 좋은 예: 라우트별 코드 분할
const HomePage = lazy(() => import('./pages/HomePage'))
const WorkoutPage = lazy(() => import('./pages/WorkoutPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

// 기능별 코드 분할
const WorkoutPlanModal = lazy(() => import('./features/workout/components/WorkoutPlanModal'))
const MachineGuideModal = lazy(() => import('./features/machine/components/MachineGuideModal'))
```

### 2. 트리 셰이킹 (Tree Shaking)
```typescript
// ✅ 좋은 예: 필요한 것만 import
import { debounce } from 'lodash/debounce'
import { format } from 'date-fns/format'

// ❌ 나쁜 예: 전체 라이브러리 import
import _ from 'lodash'
import * as dateFns from 'date-fns'
```

### 3. 동적 import
```typescript
// ✅ 좋은 예: 동적 import로 필요할 때만 로드
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js')
  return Chart
}

const ChartComponent = ({ data }: ChartComponentProps) => {
  const [Chart, setChart] = useState<any>(null)

  useEffect(() => {
    loadChartLibrary().then(setChart)
  }, [])

  if (!Chart) return <div>차트 로딩 중...</div>

  return <Chart data={data} />
}
```

## 네트워크 최적화

### 1. API 요청 최적화
```typescript
// ✅ 좋은 예: API 요청 최적화
const useOptimizedApi = () => {
  const [cache, setCache] = useState<Map<string, any>>(new Map())
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async (url: string) => {
    // 캐시 확인
    if (cache.has(url)) {
      return cache.get(url)
    }

    // 중복 요청 방지
    if (pendingRequests.has(url)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (cache.has(url)) {
            resolve(cache.get(url))
          } else {
            setTimeout(checkCache, 100)
          }
        }
        checkCache()
      })
    }

    setPendingRequests(prev => new Set(prev).add(url))

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      // 캐시에 저장
      setCache(prev => new Map(prev).set(url, data))
      
      return data
    } finally {
      setPendingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    }
  }, [cache])

  return { fetchData }
}
```

### 2. 요청 디바운싱
```typescript
// ✅ 좋은 예: 검색 요청 디바운싱
const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useMemo(
    () => debounce(async (term: string) => {
      if (!term.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await searchApi(term)
        setResults(response.data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, delay),
    [delay]
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
    
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm, debouncedSearch])

  return { results, loading }
}
```

## 상태 관리 최적화

### 1. 상태 구조 최적화
```typescript
// ✅ 좋은 예: 정규화된 상태 구조
interface NormalizedState {
  entities: {
    users: Record<number, User>
    machines: Record<number, Machine>
    workoutPlans: Record<number, WorkoutPlan>
  }
  ui: {
    selectedUserId: number | null
    selectedMachineId: number | null
    loading: {
      users: boolean
      machines: boolean
      workoutPlans: boolean
    }
  }
}

// 선택자 최적화
const selectUserById = (state: NormalizedState, userId: number) => 
  state.entities.users[userId]

const selectUsersByMachine = (state: NormalizedState, machineId: number) => {
  const machine = state.entities.machines[machineId]
  if (!machine) return []
  
  return Object.values(state.entities.users).filter(user => 
    user.preferredMachines?.includes(machineId)
  )
}
```

### 2. 상태 업데이트 최적화
```typescript
// ✅ 좋은 예: 상태 업데이트 최적화
const useOptimizedState = () => {
  const [state, setState] = useState<AppState>(initialState)

  // 배치 업데이트
  const batchUpdate = useCallback((updates: Partial<AppState>[]) => {
    setState(prevState => {
      return updates.reduce((acc, update) => ({
        ...acc,
        ...update
      }), prevState)
    })
  }, [])

  // 함수형 업데이트
  const updateUser = useCallback((userId: number, userData: Partial<User>) => {
    setState(prevState => ({
      ...prevState,
      entities: {
        ...prevState.entities,
        users: {
          ...prevState.entities.users,
          [userId]: {
            ...prevState.entities.users[userId],
            ...userData
          }
        }
      }
    }))
  }, [])

  return { state, batchUpdate, updateUser }
}
```

## 이미지 및 에셋 최적화

### 1. 이미지 지연 로딩
```typescript
// ✅ 좋은 예: 이미지 지연 로딩
const LazyImage = ({ src, alt, placeholder }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className="lazy-image-container">
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
      {!isLoaded && placeholder && (
        <div className="image-placeholder">{placeholder}</div>
      )}
    </div>
  )
}
```

### 2. 이미지 최적화
```typescript
// ✅ 좋은 예: 반응형 이미지
const ResponsiveImage = ({ src, alt, sizes }: ResponsiveImageProps) => {
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 1024, 1920]
    return widths
      .map(width => `${baseSrc}?w=${width} ${width}w`)
      .join(', ')
  }

  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      alt={alt}
      loading="lazy"
    />
  )
}
```

## 모니터링 및 프로파일링

### 1. 성능 모니터링
```typescript
// ✅ 좋은 예: 성능 모니터링 훅
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // 60fps 기준
        console.warn(`${componentName} 렌더링 시간: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])
}

// 사용 예시
const ExpensiveComponent = () => {
  usePerformanceMonitor('ExpensiveComponent')
  
  // 컴포넌트 로직
  return <div>Expensive Component</div>
}
```

### 2. 메모리 사용량 모니터링
```typescript
// ✅ 좋은 예: 메모리 사용량 모니터링
const useMemoryMonitor = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('메모리 사용량:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        })
      }
    }

    const interval = setInterval(checkMemory, 5000)
    return () => clearInterval(interval)
  }, [])
}
```

### 3. 번들 분석
```bash
# 번들 분석 도구 설치
npm install --save-dev webpack-bundle-analyzer

# 번들 분석 실행
npm run build
npx webpack-bundle-analyzer dist/assets/*.js
```

## 성능 최적화 체크리스트

### 개발 단계
- [ ] React.memo를 적절히 사용했는가?
- [ ] useCallback과 useMemo를 올바르게 사용했는가?
- [ ] 불필요한 리렌더링이 발생하지 않는가?
- [ ] 큰 리스트에 가상화를 적용했는가?
- [ ] 이미지에 지연 로딩을 적용했는가?

### 빌드 단계
- [ ] 코드 분할이 적절히 적용되었는가?
- [ ] 트리 셰이킹이 올바르게 작동하는가?
- [ ] 번들 크기가 최적화되었는가?
- [ ] 압축이 올바르게 적용되었는가?

### 런타임 단계
- [ ] API 요청이 최적화되었는가?
- [ ] 캐싱 전략이 적용되었는가?
- [ ] 에러 바운더리가 적절히 배치되었는가?
- [ ] 성능 모니터링이 설정되었는가?

이 가이드라인을 따라 개발하면 고성능 React 애플리케이션을 구축할 수 있습니다.
