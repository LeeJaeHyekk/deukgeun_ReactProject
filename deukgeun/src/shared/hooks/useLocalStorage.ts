// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

// ============================================================================
// 로컬 스토리지 관리 훅
// ============================================================================

const { useState, useEffect, useCallback  } = require('react')

// 로컬 스토리지 훅 옵션
export interface UseLocalStorageOptions<T> {
  defaultValue?: T
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}

// 로컬 스토리지 훅 반환 타입
export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void
  isLoading: boolean
}

// 기본 직렬화 함수
const defaultSerializer = <T>(value: T): string => {
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.error("Failed to serialize value:", error)
    return ""
  }
}

// 기본 역직렬화 함수
const defaultDeserializer = <T>(value: string): T => {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error("Failed to deserialize value:", error)
    return value as T
  }
}

// 로컬 스토리지 훅
function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    defaultValue,
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
  } = options

  // 초기값 설정
  const getInitialValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return defaultValue as T
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? deserializer(item) : (defaultValue as T)
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue as T
    }
  }, [key, defaultValue, deserializer])

  const [value, setValue] = useState<T>(getInitialValue)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로딩 처리
  useEffect(() => {
    setIsLoading(false)
  }, [])

  // 값 설정 함수
  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue
        setValue(valueToStore)

        if (typeof window !== "undefined") {
          const serializedValue = serializer(valueToStore)
          window.localStorage.setItem(key, serializedValue)
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, value, serializer]
  )

  // 값 제거 함수
  const removeStoredValue = useCallback(() => {
    try {
      setValue(defaultValue as T)

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, defaultValue])

  // 다른 탭에서의 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserializer(e.newValue)
          setValue(newValue)
        } catch (error) {
          console.error(
            `Error handling storage change for key "${key}":`,
            error
          )
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }
  }, [key, deserializer])

  return {
    value,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
    isLoading,
  }
}

// 로컬 스토리지 유틸리티 함수들
const localStorageUtils = {
  // 값 가져오기
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === "undefined") {
      return defaultValue || null
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue || null
    }
  },

  // 값 설정하기
  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const serializedValue = JSON.stringify(value)
      window.localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  },

  // 값 제거하기
  remove: (key: string): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },

  // 모든 값 제거하기
  clear: (): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  },

  // 키 존재 여부 확인
  has: (key: string): boolean => {
    if (typeof window === "undefined") {
      return false
    }

    return window.localStorage.getItem(key) !== null
  },

  // 모든 키 가져오기
  keys: (): string[] => {
    if (typeof window === "undefined") {
      return []
    }

    return Object.keys(window.localStorage)
  },

  // 크기 가져오기
  size: (): number => {
    if (typeof window === "undefined") {
      return 0
    }

    return window.localStorage.length
  },
}
