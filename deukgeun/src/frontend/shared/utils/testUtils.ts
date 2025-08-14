// Mock 데이터 생성 함수들
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: "test@example.com",
  nickname: "테스트 사용자",
  birthDate: new Date("1990-01-01"),
  gender: "male",
  phoneNumber: "010-1234-5678",
  level: 1,
  exp: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockAuthToken = (overrides = {}) => ({
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expiresIn: 3600,
  ...overrides,
})

export const createMockWorkoutSession = (overrides = {}) => ({
  id: 1,
  userId: 1,
  duration: 60,
  intensity: "medium" as const,
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockWorkoutGoal = (overrides = {}) => ({
  id: 1,
  userId: 1,
  type: "frequency" as const,
  target: 5,
  current: 3,
  period: "week" as const,
  isCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockGym = (overrides = {}) => ({
  id: 1,
  name: "테스트 헬스장",
  address: "서울시 강남구 테스트로 123",
  phone: "02-1234-5678",
  latitude: 37.5665,
  longitude: 126.978,
  rating: 4.5,
  reviewCount: 10,
  distance: 1.2,
  ...overrides,
})

export const createMockMachine = (overrides = {}) => ({
  id: 1,
  name: "벤치프레스",
  category: "chest",
  description: "가슴 근육을 발달시키는 운동기구",
  imageUrl: "/img/machine/chest-press.png",
  instructions: "벤치에 누워 바벨을 들어올리는 운동",
  ...overrides,
})

export const createMockPost = (overrides = {}) => ({
  id: 1,
  userId: 1,
  title: "테스트 포스트",
  content: "테스트 내용입니다.",
  imageUrl: null,
  likeCount: 5,
  commentCount: 3,
  isLiked: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: createMockUser(),
  ...overrides,
})

// API 응답 Mock 함수들
export const createMockApiResponse = (
  data: any,
  success = true,
  message = ""
) => ({
  success,
  message,
  data,
})

export const createMockErrorResponse = (message: string, status = 400) => ({
  success: false,
  message,
  status,
})

// 테스트용 이벤트 시뮬레이션
export const simulateUserInteraction = {
  click: async (element: HTMLElement) => {
    element.click()
    await new Promise(resolve => setTimeout(resolve, 0))
  },

  type: async (element: HTMLElement, text: string) => {
    element.focus()
    element.textContent = text
    element.dispatchEvent(new Event("input", { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
  },

  submit: async (form: HTMLFormElement) => {
    form.dispatchEvent(new Event("submit", { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
  },
}

// 테스트용 유효성 검사 함수들
export const validationHelpers = {
  isEmailValid: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isPasswordStrong: (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    )
  },

  isPhoneNumberValid: (phone: string) => {
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/
    return phoneRegex.test(phone)
  },
}

// 테스트용 날짜/시간 유틸리티
export const dateHelpers = {
  formatDate: (date: Date) => {
    return date.toISOString().split("T")[0]
  },

  formatDateTime: (date: Date) => {
    return date.toLocaleString("ko-KR")
  },

  getDaysAgo: (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
  },

  getWeeksAgo: (weeks: number) => {
    const date = new Date()
    date.setDate(date.getDate() - weeks * 7)
    return date
  },
}

// 테스트용 거리 계산 유틸리티
export const distanceHelpers = {
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371 // 지구의 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  formatDistance: (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  },
}

// 테스트용 레벨 시스템 유틸리티
export const levelHelpers = {
  calculateLevel: (exp: number) => {
    // 간단한 레벨 계산 공식
    return Math.floor(exp / 100) + 1
  },

  calculateExpToNextLevel: (currentExp: number) => {
    const currentLevel = levelHelpers.calculateLevel(currentExp)
    const expForCurrentLevel = (currentLevel - 1) * 100
    return 100 - (currentExp - expForCurrentLevel)
  },

  formatLevel: (level: number) => {
    const titles = ["초보자", "초급자", "중급자", "고급자", "전문가"]
    const titleIndex = Math.min(Math.floor(level / 10), titles.length - 1)
    return `${titles[titleIndex]} Lv.${level}`
  },
}

// 테스트용 운동 관련 유틸리티
export const workoutHelpers = {
  calculateExp: (duration: number, intensity: "low" | "medium" | "high") => {
    const multipliers = { low: 1, medium: 1.5, high: 2 }
    return Math.round(duration * multipliers[intensity])
  },

  formatDuration: (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  },

  getIntensityColor: (intensity: "low" | "medium" | "high") => {
    const colors = { low: "#4CAF50", medium: "#FF9800", high: "#F44336" }
    return colors[intensity]
  },
}

// 테스트용 스토리지 Mock
export const createMockStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// 테스트용 네트워크 요청 Mock
export const createMockFetch = (mockResponses: Record<string, any>) => {
  return jest.fn((url: string, options?: RequestInit) => {
    const mockResponse = mockResponses[url] || mockResponses["*"]

    if (mockResponse) {
      return Promise.resolve({
        ok: mockResponse.ok !== false,
        status: mockResponse.status || 200,
        json: () => Promise.resolve(mockResponse.data),
        text: () => Promise.resolve(JSON.stringify(mockResponse.data)),
      })
    }

    return Promise.reject(new Error(`No mock found for URL: ${url}`))
  })
}

// 테스트용 타이머 Mock
export const createMockTimers = () => {
  const timers: NodeJS.Timeout[] = []

  return {
    setTimeout: jest.fn((callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay)
      timers.push(timer)
      return timer
    }),

    clearTimeout: jest.fn((timer: NodeJS.Timeout) => {
      clearTimeout(timer)
      const index = timers.indexOf(timer)
      if (index > -1) {
        timers.splice(index, 1)
      }
    }),

    clearAll: () => {
      timers.forEach(clearTimeout)
      timers.length = 0
    },
  }
}

// 테스트용 지오로케이션 Mock
export const createMockGeolocation = () => ({
  getCurrentPosition: jest.fn((success: PositionCallback) => {
    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 37.5665,
        longitude: 126.978,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: Date.now(),
      toJSON: () => ({}),
    }
    success(mockPosition)
  }),

  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
})
