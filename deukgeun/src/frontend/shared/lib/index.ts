import { config } from '../config'

// Validation Functions
export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return (
      emailRegex.test(email) &&
      email.length >= config.VALIDATION.EMAIL_MIN_LENGTH &&
      email.length <= config.VALIDATION.EMAIL_MAX_LENGTH
    )
  },

  password: (password: string): boolean => {
    return (
      password.length >= config.VALIDATION.PASSWORD_MIN_LENGTH &&
      password.length <= config.VALIDATION.PASSWORD_MAX_LENGTH
    )
  },

  nickname: (nickname: string): boolean => {
    return (
      nickname.length >= config.VALIDATION.NICKNAME_MIN_LENGTH &&
      nickname.length <= config.VALIDATION.NICKNAME_MAX_LENGTH
    )
  },

  required: (value: string): boolean => {
    return value.trim().length > 0
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },
}

// Error Handling
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.message) {
    return error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}

// Toast Message (Simple implementation)
let activeToasts: Set<HTMLElement> = new Set()

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  console.log('🍞 [showToast] 토스트 메시지 표시 시작:', { message, type })

  // 기존 토스트 정리
  activeToasts.forEach(toast => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast)
    }
  })
  activeToasts.clear()

  // Create toast element
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message

  console.log('🍞 [showToast] 토스트 엘리먼트 생성됨:', toast)

  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    zIndex: '99999',
    transform: 'translateX(100%) scale(0.9)',
    opacity: '0',
    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    maxWidth: '400px',
    minWidth: '300px',
    wordBreak: 'break-word',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '15px',
    lineHeight: '1.5',
    display: 'block',
    visibility: 'visible',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
  })

  // Set background color based on type
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800',
  }
  toast.style.backgroundColor = colors[type]

  // 클릭으로 토스트 닫기 기능
  toast.addEventListener('click', () => {
    console.log('🍞 [showToast] 사용자가 토스트를 클릭하여 닫음')
    toast.style.transform = 'translateX(100%) scale(0.9)'
    toast.style.opacity = '0'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
      activeToasts.delete(toast)
    }, 500)
  })

  // Add to DOM
  console.log('🍞 [showToast] DOM에 토스트 추가 중...')
  document.body.appendChild(toast)
  activeToasts.add(toast)
  console.log('🍞 [showToast] DOM에 토스트 추가 완료')

  // Animate in
  setTimeout(() => {
    console.log('🍞 [showToast] 토스트 애니메이션 시작')
    console.log('🍞 [showToast] 애니메이션 전 위치:', {
      transform: toast.style.transform,
      opacity: toast.style.opacity,
    })
    toast.style.transform = 'translateX(0) scale(1)'
    toast.style.opacity = '1'
    console.log('🍞 [showToast] 애니메이션 후 위치:', {
      transform: toast.style.transform,
      opacity: toast.style.opacity,
    })
  }, 100)

  // Remove after delay (7초로 연장)
  const displayDuration = 7000 // 7초
  setTimeout(() => {
    console.log('🍞 [showToast] 토스트 제거 시작')
    toast.style.transform = 'translateX(100%) scale(0.9)'
    toast.style.opacity = '0'
    setTimeout(() => {
      console.log('🍞 [showToast] 토스트 DOM에서 제거')
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
      activeToasts.delete(toast)
    }, 500)
  }, displayDuration)
}

// Local Storage Utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      // 토큰의 경우 JSON 파싱하지 않고 그대로 반환
      if (key === 'accessToken' || key === 'refreshToken') {
        return item
      }

      return JSON.parse(item)
    } catch {
      return null
    }
  },

  set: (key: string, value: any) => {
    try {
      // 토큰의 경우 JSON 직렬화하지 않고 그대로 저장
      if (key === 'accessToken' || key === 'refreshToken') {
        localStorage.setItem(key, value)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
      return true
    } catch {
      return false
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  // 토큰 관련 특별 함수들
  getToken: (key: string = 'accessToken') => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      // 따옴표가 포함된 경우 제거
      if (item.startsWith('"') && item.endsWith('"')) {
        return item.slice(1, -1)
      }

      return item
    } catch {
      return null
    }
  },

  setToken: (key: string, token: string) => {
    try {
      localStorage.setItem(key, token)
      return true
    } catch {
      return false
    }
  },

  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  },
} as {
  get: (key: string) => any
  set: (key: string, value: any) => boolean
  remove: (key: string) => boolean
  getToken: (key?: string) => string | null
  setToken: (key: string, token: string) => boolean
  clear: () => boolean
}

// Debounce Function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Format Functions
export const format = {
  email: (email: string): string => {
    return email.toLowerCase().trim()
  },

  nickname: (nickname: string): string => {
    return nickname.trim().replace(/\s+/g, ' ')
  },
}
