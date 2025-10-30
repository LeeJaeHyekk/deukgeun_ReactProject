# 에러 처리 가이드

## 개요

이 문서는 Deukgeun 프로젝트에서 효과적인 에러 처리 전략과 베스트 프랙티스를 제공합니다.

## 목차

1. [에러 처리 전략](#에러-처리-전략)
2. [에러 바운더리](#에러-바운더리)
3. [API 에러 처리](#api-에러-처리)
4. [폼 검증 에러](#폼-검증-에러)
5. [비동기 에러 처리](#비동기-에러-처리)
6. [에러 리포팅](#에러-리포팅)
7. [사용자 경험](#사용자-경험)
8. [테스트 전략](#테스트-전략)

## 에러 처리 전략

### 1. 에러 분류

#### 예상 가능한 에러 (Expected Errors)
```typescript
// ✅ 좋은 예: 예상 가능한 에러 처리
interface ValidationError {
  field: string
  message: string
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'TOO_LONG'
}

const validateUserInput = (input: UserInput): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (!input.email) {
    errors.push({
      field: 'email',
      message: '이메일은 필수입니다',
      code: 'REQUIRED'
    })
  } else if (!isValidEmail(input.email)) {
    errors.push({
      field: 'email',
      message: '올바른 이메일 형식이 아닙니다',
      code: 'INVALID_FORMAT'
    })
  }
  
  return errors
}
```

#### 예상치 못한 에러 (Unexpected Errors)
```typescript
// ✅ 좋은 예: 예상치 못한 에러 처리
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
  }
}

const handleUnexpectedError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(
      '예상치 못한 오류가 발생했습니다',
      'UNEXPECTED_ERROR',
      500,
      false
    )
  }
  
  return new AppError(
    '알 수 없는 오류가 발생했습니다',
    'UNKNOWN_ERROR',
    500,
    false
  )
}
```

### 2. 에러 타입 정의
```typescript
// ✅ 좋은 예: 체계적인 에러 타입 정의
interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: Record<string, any>
  timestamp: string
}

interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

interface NetworkError {
  message: string
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'CORS_ERROR'
  url: string
  method: string
}

type AppError = ApiError | ValidationError | NetworkError
```

## 에러 바운더리

### 1. 기본 에러 바운더리 사용
```typescript
// ✅ 좋은 예: 에러 바운더리로 컴포넌트 보호
const UserProfile = () => {
  return (
    <ErrorBoundary
      fallback={
        <ComponentErrorFallback
          componentName="UserProfile"
          onRetry={() => window.location.reload()}
        />
      }
      onError={(error, errorInfo) => {
        console.error('UserProfile error:', error, errorInfo)
        // 에러 리포팅
        reportError(error, errorInfo)
      }}
    >
      <div className="user-profile">
        <UserInfo />
        <UserSettings />
        <UserStats />
      </div>
    </ErrorBoundary>
  )
}
```

### 2. 계층적 에러 바운더리
```typescript
// ✅ 좋은 예: 계층적 에러 바운더리 구조
const App = () => {
  return (
    <ErrorBoundary
      fallback={<GlobalErrorFallback />}
      onError={(error, errorInfo) => {
        // 글로벌 에러 리포팅
        reportGlobalError(error, errorInfo)
      }}
    >
      <Router>
        <Routes>
          <Route path="/workout" element={
            <ErrorBoundary
              fallback={<WorkoutErrorFallback />}
              resetKeys={['workoutId']}
            >
              <WorkoutPage />
            </ErrorBoundary>
          } />
          <Route path="/profile" element={
            <ErrorBoundary
              fallback={<ProfileErrorFallback />}
            >
              <ProfilePage />
            </ErrorBoundary>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}
```

### 3. 특화된 에러 폴백
```typescript
// ✅ 좋은 예: 상황별 에러 폴백
const WorkoutPage = () => {
  const [workoutData, setWorkoutData] = useState(null)
  const [error, setError] = useState<ApiError | null>(null)

  if (error) {
    return (
      <ApiErrorFallback
        error={error}
        onRetry={() => {
          setError(null)
          fetchWorkoutData()
        }}
      />
    )
  }

  return (
    <div className="workout-page">
      <WorkoutHeader />
      <WorkoutContent data={workoutData} />
    </div>
  )
}
```

## API 에러 처리

### 1. API 클라이언트 에러 처리
```typescript
// ✅ 좋은 예: API 클라이언트 에러 처리
class ApiClient {
  async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
    try {
      const response = await fetch(endpoint, options)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || 'API 요청이 실패했습니다',
          errorData.code || 'API_ERROR',
          response.status,
          errorData.details
        )
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(
          '네트워크 연결을 확인해주세요',
          'NETWORK_ERROR',
          endpoint,
          options.method || 'GET'
        )
      }
      
      throw new AppError(
        '예상치 못한 오류가 발생했습니다',
        'UNEXPECTED_ERROR',
        500
      )
    }
  }
}
```

### 2. 훅에서 API 에러 처리
```typescript
// ✅ 좋은 예: 훅에서 API 에러 처리
const useApiData = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiClient.get<T>(endpoint)
      setData(result)
    } catch (err) {
      const apiError = handleApiError(err)
      setError(apiError)
      
      // 사용자에게 알림
      showToast(apiError.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  const retry = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, retry }
}
```

### 3. 에러 복구 전략
```typescript
// ✅ 좋은 예: 에러 복구 전략
const useRetryableApi = <T>(endpoint: string, maxRetries: number = 3) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchWithRetry = useCallback(async (retryAttempt: number = 0) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiClient.get<T>(endpoint)
      setData(result)
      setRetryCount(0)
    } catch (err) {
      const apiError = handleApiError(err)
      
      if (retryAttempt < maxRetries && isRetryableError(apiError)) {
        // 지수 백오프로 재시도
        const delay = Math.pow(2, retryAttempt) * 1000
        setTimeout(() => {
          setRetryCount(retryAttempt + 1)
          fetchWithRetry(retryAttempt + 1)
        }, delay)
      } else {
        setError(apiError)
        showToast(apiError.message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, maxRetries])

  return { data, loading, error, retryCount, retry: () => fetchWithRetry() }
}
```

## 폼 검증 에러

### 1. 폼 에러 상태 관리
```typescript
// ✅ 좋은 예: 폼 에러 상태 관리
interface FormErrors {
  [field: string]: string | undefined
}

const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback((field: keyof T, value: any) => {
    const fieldSchema = validationSchema[field]
    if (!fieldSchema) return undefined

    try {
      fieldSchema.validate(value)
      return undefined
    } catch (error) {
      return error.message
    }
  }, [validationSchema])

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(validationSchema).forEach(field => {
      const error = validateField(field as keyof T, values[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validationSchema, validateField])

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // 실시간 검증
    if (touched[field as string]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }, [touched, validateField])

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // 터치된 필드 검증
    const error = validateField(field, values[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [values, validateField])

  return {
    values,
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,
    setFieldValue,
    setFieldTouched,
    validateForm
  }
}
```

### 2. 에러 메시지 표시
```typescript
// ✅ 좋은 예: 에러 메시지 표시 컴포넌트
const FormField = ({ 
  name, 
  label, 
  type = 'text', 
  error, 
  touched, 
  value, 
  onChange, 
  onBlur 
}: FormFieldProps) => {
  const hasError = touched && error

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`form-input ${hasError ? 'error' : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      {hasError && (
        <div id={`${name}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
```

## 비동기 에러 처리

### 1. Promise 에러 처리
```typescript
// ✅ 좋은 예: Promise 에러 처리
const handleAsyncOperation = async () => {
  try {
    const result = await Promise.allSettled([
      fetchUserData(),
      fetchWorkoutData(),
      fetchMachineData()
    ])

    const [userResult, workoutResult, machineResult] = result

    // 각 결과 처리
    if (userResult.status === 'rejected') {
      console.error('사용자 데이터 로딩 실패:', userResult.reason)
      showToast('사용자 데이터를 불러올 수 없습니다', 'error')
    }

    if (workoutResult.status === 'rejected') {
      console.error('운동 데이터 로딩 실패:', workoutResult.reason)
      showToast('운동 데이터를 불러올 수 없습니다', 'error')
    }

    if (machineResult.status === 'rejected') {
      console.error('머신 데이터 로딩 실패:', machineResult.reason)
      showToast('머신 데이터를 불러올 수 없습니다', 'error')
    }

    return {
      user: userResult.status === 'fulfilled' ? userResult.value : null,
      workout: workoutResult.status === 'fulfilled' ? workoutResult.value : null,
      machine: machineResult.status === 'fulfilled' ? machineResult.value : null
    }
  } catch (error) {
    console.error('예상치 못한 오류:', error)
    showToast('데이터를 불러오는 중 오류가 발생했습니다', 'error')
    throw error
  }
}
```

### 2. async/await 에러 처리
```typescript
// ✅ 좋은 예: async/await 에러 처리
const useAsyncOperation = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      console.error('Async operation failed:', error)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, retry: execute }
}
```

## 에러 리포팅

### 1. 에러 리포팅 서비스
```typescript
// ✅ 좋은 예: 에러 리포팅 서비스
interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: string
  userId?: string
  timestamp: string
  userAgent: string
  url: string
  additionalInfo?: Record<string, any>
}

class ErrorReportingService {
  private apiKey: string
  private endpoint: string

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey
    this.endpoint = endpoint
  }

  async reportError(error: Error, additionalInfo?: Record<string, any>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      additionalInfo
    }

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(report)
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  reportBoundaryError(error: Error, errorInfo: ErrorInfo, errorBoundary: string) {
    this.reportError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary
    })
  }
}

// 전역 에러 리포팅 서비스
const errorReporting = new ErrorReportingService(
  process.env.VITE_ERROR_REPORTING_API_KEY || '',
  process.env.VITE_ERROR_REPORTING_ENDPOINT || ''
)
```

### 2. 에러 리포팅 훅
```typescript
// ✅ 좋은 예: 에러 리포팅 훅
const useErrorReporting = () => {
  const reportError = useCallback((error: Error, context?: string) => {
    // 개발 환경에서는 콘솔에 출력
    if (import.meta.env.DEV) {
      console.error(`Error in ${context || 'unknown context'}:`, error)
    }

    // 프로덕션 환경에서는 에러 리포팅 서비스로 전송
    if (import.meta.env.PROD) {
      errorReporting.reportError(error, { context })
    }
  }, [])

  const reportBoundaryError = useCallback((
    error: Error, 
    errorInfo: ErrorInfo, 
    errorBoundary: string
  ) => {
    if (import.meta.env.DEV) {
      console.error(`ErrorBoundary ${errorBoundary}:`, error, errorInfo)
    }

    if (import.meta.env.PROD) {
      errorReporting.reportBoundaryError(error, errorInfo, errorBoundary)
    }
  }, [])

  return { reportError, reportBoundaryError }
}
```

## 사용자 경험

### 1. 에러 메시지 디자인
```typescript
// ✅ 좋은 예: 사용자 친화적인 에러 메시지
const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  const getErrorMessage = (error: AppError) => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return '인터넷 연결을 확인해주세요'
      case 'VALIDATION_ERROR':
        return '입력한 정보를 다시 확인해주세요'
      case 'AUTHENTICATION_ERROR':
        return '로그인이 필요합니다'
      case 'PERMISSION_ERROR':
        return '접근 권한이 없습니다'
      default:
        return '문제가 발생했습니다. 잠시 후 다시 시도해주세요'
    }
  }

  const getErrorIcon = (error: AppError) => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return '🌐'
      case 'VALIDATION_ERROR':
        return '⚠️'
      case 'AUTHENTICATION_ERROR':
        return '🔐'
      case 'PERMISSION_ERROR':
        return '🚫'
      default:
        return '❌'
    }
  }

  return (
    <div className="error-message">
      <div className="error-icon">
        {getErrorIcon(error)}
      </div>
      <div className="error-content">
        <h3>문제가 발생했습니다</h3>
        <p>{getErrorMessage(error)}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            다시 시도
          </button>
        )}
      </div>
    </div>
  )
}
```

### 2. 로딩 상태와 에러 상태
```typescript
// ✅ 좋은 예: 로딩 상태와 에러 상태 관리
const DataComponent = () => {
  const { data, loading, error, retry } = useApiData('/api/data')

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onRetry={retry}
      />
    )
  }

  if (!data) {
    return <EmptyState />
  }

  return <DataDisplay data={data} />
}
```

## 테스트 전략

### 1. 에러 시나리오 테스트
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

### 2. API 에러 테스트
```typescript
// ✅ 좋은 예: API 에러 테스트
describe('API Error Handling', () => {
  it('네트워크 에러를 올바르게 처리해야 한다', async () => {
    mockFetch.mockRejectedValue(new TypeError('Network error'))

    const { result } = renderHook(() => useApiData('/api/test'))

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.code).toBe('NETWORK_ERROR')
    })
  })

  it('서버 에러를 올바르게 처리해야 한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' })
    })

    const { result } = renderHook(() => useApiData('/api/test'))

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.statusCode).toBe(500)
    })
  })
})
```

## 에러 처리 체크리스트

### 개발 단계
- [ ] 에러 바운더리가 적절히 배치되었는가?
- [ ] API 에러가 올바르게 처리되는가?
- [ ] 폼 검증 에러가 사용자에게 명확히 표시되는가?
- [ ] 비동기 에러가 적절히 처리되는가?
- [ ] 에러 메시지가 사용자 친화적인가?

### 테스트 단계
- [ ] 에러 시나리오가 테스트되었는가?
- [ ] 에러 복구 기능이 테스트되었는가?
- [ ] 에러 리포팅이 올바르게 작동하는가?
- [ ] 사용자 경험이 테스트되었는가?

### 배포 단계
- [ ] 에러 리포팅 서비스가 설정되었는가?
- [ ] 에러 모니터링이 활성화되었는가?
- [ ] 에러 알림이 설정되었는가?

이 가이드라인을 따라 개발하면 견고하고 사용자 친화적인 에러 처리 시스템을 구축할 수 있습니다.
