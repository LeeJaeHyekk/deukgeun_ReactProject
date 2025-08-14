import type {
  User,
  Machine,
  Post,
  UserLevel,
  WorkoutGoal,
  Gym,
} from "../../../types"

// Mock 데이터 생성 함수들
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: "test@example.com",
  nickname: "테스트 사용자",
  role: "user",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

export const createMockMachine = (
  overrides: Partial<Machine> = {}
): Machine => ({
  id: 1,
  name: "테스트 머신",
  category: "strength",
  description: "테스트 머신 설명",
  instructions: "테스트 머신 사용법",
  targetMuscles: ["삼두근", "이두근"],
  difficulty: "beginner",
  imageUrl: "/test-image.jpg",
  videoUrl: "/test-video.mp4",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

export const createMockWorkoutGoal = (
  overrides: Partial<WorkoutGoal> = {}
): WorkoutGoal => ({
  id: 1,
  userId: 1,
  title: "테스트 목표",
  description: "테스트 목표 설명",
  type: "weight",
  targetValue: 100,
  currentValue: 50,
  unit: "kg",
  deadline: new Date("2024-12-31"),
  isCompleted: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

export const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  title: "테스트 포스트",
  content: "테스트 포스트 내용",
  userId: 1,
  category: "workout_tip",
  viewCount: 100,
  likeCount: 10,
  commentCount: 5,
  isPublished: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

export const createMockUserLevel = (
  overrides: Partial<UserLevel> = {}
): UserLevel => ({
  id: 1,
  userId: 1,
  level: 5,
  currentExp: 1500,
  totalExp: 5000,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

export const createMockGym = (overrides: Partial<Gym> = {}): Gym => ({
  id: 1,
  name: "테스트 헬스장",
  address: "서울시 강남구 테스트로 123",
  phone: "02-1234-5678",
  latitude: 37.5665,
  longitude: 126.978,
  rating: 4.5,
  reviewCount: 100,
  priceRange: "medium",
  facilities: ["헬스장", "수영장", "사우나"],
  operatingHours: [
    {
      day: "monday",
      openTime: "06:00",
      closeTime: "24:00",
      isOpen: true,
    },
  ],
  images: ["/gym1.jpg"],
  isVerified: true,
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

// Mock 데이터 배열 생성 함수들
export const createMockUsers = (count: number = 3): User[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: index + 1,
      email: `test${index + 1}@example.com`,
      nickname: `테스트 사용자 ${index + 1}`,
    })
  )
}

export const createMockMachines = (count: number = 5): Machine[] => {
  const categories = ["strength", "cardio", "flexibility"] as const
  const difficulties = ["beginner", "intermediate", "advanced"] as const

  return Array.from({ length: count }, (_, index) =>
    createMockMachine({
      id: index + 1,
      name: `테스트 머신 ${index + 1}`,
      category: categories[index % categories.length],
      difficulty: difficulties[index % difficulties.length],
    })
  )
}

export const createMockPosts = (count: number = 10): Post[] => {
  const categories = ["workout_tip", "motivation", "question"] as const

  return Array.from({ length: count }, (_, index) =>
    createMockPost({
      id: index + 1,
      title: `테스트 포스트 ${index + 1}`,
      content: `테스트 포스트 ${index + 1} 내용입니다.`,
      category: categories[index % categories.length],
      viewCount: Math.floor(Math.random() * 1000),
      likeCount: Math.floor(Math.random() * 100),
      commentCount: Math.floor(Math.random() * 50),
    })
  )
}

export const createMockGyms = (count: number = 5): Gym[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockGym({
      id: index + 1,
      name: `테스트 헬스장 ${index + 1}`,
      address: `서울시 강남구 테스트로 ${123 + index}`,
      phone: `02-1234-${5678 + index}`,
      latitude: 37.5665 + index * 0.01,
      longitude: 126.978 + index * 0.01,
    })
  )
}

// Mock API 응답 데이터
export const createMockApiResponse = <T>(
  data: T,
  message = "성공",
  success = true
) => ({
  success,
  message,
  data,
})

export const createMockApiError = (
  message = "오류가 발생했습니다.",
  status = 500
) => ({
  success: false,
  message,
  status,
})

// Mock 페이지네이션 데이터
export const createMockPaginationData = <T>(
  items: T[],
  page = 1,
  limit = 10,
  total?: number
) => ({
  items,
  pagination: {
    page,
    limit,
    total: total || items.length,
    totalPages: Math.ceil((total || items.length) / limit),
    hasNext: page < Math.ceil((total || items.length) / limit),
    hasPrev: page > 1,
  },
})
