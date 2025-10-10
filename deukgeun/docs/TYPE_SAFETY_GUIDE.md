# 타입 안전성 가이드라인

## 개요

이 문서는 Deukgeun 프로젝트에서 TypeScript 타입 안전성을 보장하기 위한 가이드라인과 베스트 프랙티스를 제공합니다.

## 목차

1. [기본 원칙](#기본-원칙)
2. [타입 정의 가이드라인](#타입-정의-가이드라인)
3. [API 검증](#api-검증)
4. [컴포넌트 타입 안전성](#컴포넌트-타입-안전성)
5. [훅 타입 안전성](#훅-타입-안전성)
6. [에러 처리](#에러-처리)
7. [테스트 가이드라인](#테스트-가이드라인)
8. [성능 최적화](#성능-최적화)
9. [도구 및 자동화](#도구-및-자동화)

## 기본 원칙

### 1. 엄격한 타입 체크
```typescript
// ✅ 좋은 예: 명시적 타입 정의
interface User {
  id: number
  email: string
  name: string
}

// ❌ 나쁜 예: any 타입 사용
function processUser(user: any) {
  return user.name
}
```

### 2. 타입 가드 활용
```typescript
// ✅ 좋은 예: 타입 가드 함수 사용
function isValidUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).id === 'number' &&
    typeof (value as any).email === 'string'
  )
}

// 사용 예시
if (isValidUser(data)) {
  // TypeScript가 data를 User 타입으로 인식
  console.log(data.email)
}
```

### 3. 런타임 검증
```typescript
// ✅ 좋은 예: 런타임에서 타입 검증
const validateApiResponse = <T>(response: unknown): T => {
  if (!isValidApiResponse<T>(response)) {
    throw new Error('Invalid API response format')
  }
  return response.data
}
```

## 타입 정의 가이드라인

### 1. 인터페이스 vs 타입 별칭
```typescript
// ✅ 인터페이스 사용 (확장 가능)
interface BaseEntity {
  id: number
  createdAt: Date
  updatedAt: Date
}

interface User extends BaseEntity {
  email: string
  name: string
}

// ✅ 타입 별칭 사용 (유니온 타입)
type Status = 'pending' | 'approved' | 'rejected'
type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}
```

### 2. 제네릭 활용
```typescript
// ✅ 좋은 예: 제네릭으로 재사용성 향상
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
  }
}
```

### 3. 유틸리티 타입 활용
```typescript
// ✅ 좋은 예: 유틸리티 타입으로 타입 변환
interface CreateUserRequest {
  email: string
  name: string
  password: string
}

interface UpdateUserRequest extends Partial<Pick<CreateUserRequest, 'name'>> {
  id: number
}

// Omit을 사용한 타입 변환
type UserWithoutPassword = Omit<User, 'password'>
```

## API 검증

### 1. API 응답 검증
```typescript
// ✅ 좋은 예: API 응답 타입 검증
export function parseApiResponse<T>(response: unknown): ApiResponse<T> {
  if (!isValidApiResponse<T>(response)) {
    throw new Error('Invalid API response format')
  }
  return response
}

// 사용 예시
try {
  const response = await fetch('/api/users')
  const data = await response.json()
  const validatedData = parseApiResponse<User[]>(data)
  return validatedData.data
} catch (error) {
  console.error('API validation failed:', error)
  throw error
}
```

### 2. TypedApiClient 사용
```typescript
// ✅ 좋은 예: 타입 안전한 API 클라이언트
const apiClient = new TypedApiClient('http://localhost:3000')

// GET 요청
const users = await apiClient.get<User[]>('/users')

// POST 요청
const newUser = await apiClient.post<User>('/users', {
  email: 'test@example.com',
  name: 'Test User'
})
```

### 3. 엔티티별 검증 함수
```typescript
// ✅ 좋은 예: 특정 엔티티 검증 함수
export function isValidUser(value: unknown): value is User {
  if (!isObject(value)) return false
  
  const user = value as Record<string, unknown>
  
  return (
    isNumber(user.id) &&
    isString(user.email) &&
    isString(user.name) &&
    (user.phone === undefined || isString(user.phone))
  )
}

// 배열 검증
export function isValidUserArray(value: unknown): value is User[] {
  return isValidArray(value, isValidUser)
}
```

## 컴포넌트 타입 안전성

### 1. Props 인터페이스 정의
```typescript
// ✅ 좋은 예: 명시적 Props 인터페이스
interface UserCardProps {
  user: User
  onEdit: (userId: number) => void
  onDelete: (userId: number) => void
  showActions?: boolean
}

const UserCard = memo(function UserCard({
  user,
  onEdit,
  onDelete,
  showActions = true
}: UserCardProps) {
  // 컴포넌트 로직
})
```

### 2. 이벤트 핸들러 타입
```typescript
// ✅ 좋은 예: 이벤트 핸들러 타입 정의
interface FormProps {
  onSubmit: (data: FormData) => void
  onCancel: () => void
  onChange: (field: string, value: string) => void
}

const Form = ({ onSubmit, onCancel, onChange }: FormProps) => {
  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(formData)
  }, [onSubmit])

  // 컴포넌트 로직
}
```

### 3. 에러 바운더리 적용
```typescript
// ✅ 좋은 예: 에러 바운더리로 컴포넌트 보호
const UserList = () => {
  return (
    <ErrorBoundary
      fallback={
        <ComponentErrorFallback
          componentName="UserList"
          onRetry={() => window.location.reload()}
        />
      }
      onError={(error, errorInfo) => {
        console.error('UserList error:', error, errorInfo)
      }}
    >
      <div className="user-list">
        {/* 컴포넌트 내용 */}
      </div>
    </ErrorBoundary>
  )
}
```

## 훅 타입 안전성

### 1. 반환 타입 명시
```typescript
// ✅ 좋은 예: 명시적 반환 타입 정의
interface UseMachinesReturn {
  machines: Machine[]
  loading: boolean
  error: string | null
  fetchMachines: () => Promise<Machine[]>
  createMachine: (data: CreateMachineRequest) => Promise<Machine>
  updateMachine: (id: number, data: UpdateMachineRequest) => Promise<Machine>
  deleteMachine: (id: number) => Promise<void>
}

const useMachines = (): UseMachinesReturn => {
  // 훅 로직
}
```

### 2. API 응답 검증
```typescript
// ✅ 좋은 예: 훅 내에서 API 응답 검증
const useMachines = (): UseMachinesReturn => {
  const fetchMachines = useCallback(async (): Promise<Machine[]> => {
    try {
      const response = await machineApi.getMachines()
      const validatedMachines = validateMachineArray(response)
      setMachines(validatedMachines)
      return validatedMachines
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      throw error
    }
  }, [])

  // 나머지 로직
}
```

### 3. useCallback과 useMemo 활용
```typescript
// ✅ 좋은 예: 성능 최적화와 타입 안전성
const useMachines = (): UseMachinesReturn => {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 메모이제이션된 데이터 처리
  const { validatedMachines, filteredMachines } = useMemo(() => {
    const validated = machines
      .map(machine => validateMachine(machine))
      .filter((machine): machine is Machine => machine !== null)
    
    return {
      validatedMachines: validated,
      filteredMachines: validated.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [machines])

  // 메모이제이션된 이벤트 핸들러
  const handleCreateMachine = useCallback(async (data: CreateMachineRequest) => {
    setLoading(true)
    try {
      const response = await machineApi.createMachine(data)
      const validatedMachine = validateMachine(response)
      if (!validatedMachine) {
        throw new Error('Invalid machine data received')
      }
      setMachines(prev => [validatedMachine, ...prev])
      return validatedMachine
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Creation failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    machines: validatedMachines,
    loading,
    error,
    fetchMachines,
    createMachine: handleCreateMachine,
    // 나머지 메서드들
  }
}
```

## 에러 처리

### 1. 타입 안전한 에러 처리
```typescript
// ✅ 좋은 예: 타입 안전한 에러 처리
interface ApiError {
  message: string
  statusCode: number
  error?: string
}

const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: (error as any).statusCode || 500,
      error: error.name
    }
  }
  
  return {
    message: 'Unknown error occurred',
    statusCode: 500
  }
}
```

### 2. 에러 바운더리 활용
```typescript
// ✅ 좋은 예: 계층적 에러 바운더리
const App = () => {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        // 에러 리포팅
        reportError(error, errorInfo)
      }}
    >
      <Router>
        <Routes>
          <Route path="/users" element={
            <ErrorBoundary
              fallback={<ComponentErrorFallback componentName="UserPage" />}
            >
              <UserPage />
            </ErrorBoundary>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}
```

## 테스트 가이드라인

### 1. 타입 안전성 테스트
```typescript
// ✅ 좋은 예: 타입 안전성 테스트
describe('useMachines', () => {
  it('반환 타입이 올바르게 정의되어야 한다', () => {
    const { result } = renderHook(() => useMachines())

    expect(typeof result.current.machines).toBe('object')
    expect(typeof result.current.loading).toBe('boolean')
    expect(typeof result.current.error).toBe('string' || 'object')
    expect(typeof result.current.fetchMachines).toBe('function')
  })

  it('API 응답 타입 검증이 작동해야 한다', async () => {
    const invalidResponse = { id: 'invalid', name: 123 }
    mockMachineApi.getMachines.mockResolvedValue(invalidResponse as any)

    const { result } = renderHook(() => useMachines())

    await act(async () => {
      await result.current.fetchMachines()
    })

    // 유효하지 않은 데이터는 필터링되어야 함
    expect(result.current.machines).toHaveLength(0)
  })
})
```

### 2. 에러 시나리오 테스트
```typescript
// ✅ 좋은 예: 에러 시나리오 테스트
describe('ErrorBoundary', () => {
  it('에러가 발생했을 때 ErrorFallback을 렌더링해야 한다', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()
  })

  it('다시 시도 버튼을 클릭하면 에러 상태를 리셋해야 한다', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByText('다시 시도')
    fireEvent.click(retryButton)

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })
})
```

## 성능 최적화

### 1. React.memo 활용
```typescript
// ✅ 좋은 예: React.memo로 불필요한 리렌더링 방지
const UserCard = memo(function UserCard({ user, onEdit, onDelete }: UserCardProps) {
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

### 2. useCallback과 useMemo 활용
```typescript
// ✅ 좋은 예: 이벤트 핸들러와 계산된 값 메모이제이션
const UserList = ({ users, onUserSelect }: UserListProps) => {
  // 계산된 값 메모이제이션
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name))
  }, [users])

  // 이벤트 핸들러 메모이제이션
  const handleUserSelect = useCallback((userId: number) => {
    onUserSelect(userId)
  }, [onUserSelect])

  return (
    <div className="user-list">
      {sortedUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onSelect={handleUserSelect}
        />
      ))}
    </div>
  )
}
```

## 도구 및 자동화

### 1. 타입 안전성 체크 자동화
```bash
# 타입 안전성 체크 실행
npm run type-safety

# 상세 리포트 확인
npm run type-safety:report

# CI/CD에서 자동 실행
npm run test:ci
```

### 2. ESLint 규칙
```json
// .eslintrc.js
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

### 3. TypeScript 설정
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 베스트 프랙티스 요약

1. **항상 명시적 타입 정의**: any 타입 사용 금지
2. **런타임 검증**: API 응답과 외부 데이터 검증
3. **타입 가드 활용**: 런타임에서 타입 안전성 보장
4. **에러 바운더리**: 컴포넌트별 에러 처리
5. **성능 최적화**: React.memo, useCallback, useMemo 활용
6. **포괄적 테스트**: 타입 안전성과 에러 시나리오 테스트
7. **자동화된 체크**: CI/CD에서 타입 안전성 검증

이 가이드라인을 따라 개발하면 타입 안전하고 유지보수 가능한 코드를 작성할 수 있습니다.