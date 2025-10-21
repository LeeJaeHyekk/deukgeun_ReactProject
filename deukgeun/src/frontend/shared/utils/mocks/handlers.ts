import { http, HttpResponse } from 'msw'
import { API_ENDPOINTS } from '@frontend/shared/config'

// Mock 데이터
const mockUsers = [
  {
    id: 1,
    email: "test@example.com",
    nickname: "테스트 사용자",
    role: "user",
    isActive: true,
    isEmailVerified: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
]

const mockMachines = [
  {
    id: 1,
    machineKey: "bench-press",
    name: "벤치프레스",
    nameEn: "Bench Press",
    imageUrl: "/images/machines/bench-press.png",
    shortDesc: "가슴 근육을 발달시키는 운동",
    detailDesc: "벤치프레스는 가슴, 어깨, 삼두근을 발달시키는 복합 운동입니다.",
    category: "strength",
    difficulty: "intermediate",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
]

const mockPosts = [
  {
    id: 1,
    title: "테스트 포스트",
    content: "테스트 포스트 내용입니다.",
    author: "테스트 작성자",
    userId: 1,
    category: "운동루틴",
    like_count: 10,
    comment_count: 5,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
]

const mockUserLevel = {
  id: 1,
  userId: 1,
  level: 5,
  currentExp: 1500,
  totalExp: 5000,
  seasonExp: 1000,
  totalLevelUps: 4,
  currentSeason: 1,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

// API 핸들러들
const handlers = [
  // 인증 관련 API
  http.post(API_ENDPOINTS.AUTH.LOGIN, () => {
    return HttpResponse.json({
      success: true,
      message: "로그인 성공",
      data: {
        user: mockUsers[0],
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      },
    })
  }),

  http.post(API_ENDPOINTS.AUTH.REGISTER, () => {
    return HttpResponse.json({
      success: true,
      message: "회원가입 성공",
      data: {
        user: mockUsers[0],
      },
    })
  }),

  http.post(API_ENDPOINTS.AUTH.LOGOUT, () => {
    return HttpResponse.json({
      success: true,
      message: "로그아웃 성공",
    })
  }),

  http.post(API_ENDPOINTS.AUTH.REFRESH, () => {
    return HttpResponse.json({
      success: true,
      message: "토큰 갱신 성공",
      data: {
        accessToken: "new-mock-access-token",
      },
    })
  }),

  // 머신 관련 API
  http.get(API_ENDPOINTS.MACHINES.GET_ALL, () => {
    return HttpResponse.json({
      success: true,
      message: "머신 목록 조회 성공",
      data: {
        machines: mockMachines,
        total: mockMachines.length,
      },
    })
  }),

  http.get(`${API_ENDPOINTS.MACHINES.GET_BY_ID}/:id`, ({ params }: { params: { id: string } }) => {
    const machine = mockMachines.find(m => m.id === Number(params.id))
    if (!machine) {
      return HttpResponse.json(
        {
          success: false,
          message: "머신을 찾을 수 없습니다.",
        },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      success: true,
      message: "머신 조회 성공",
      data: { machine },
    })
  }),

  // 커뮤니티 관련 API
  http.get(API_ENDPOINTS.POSTS.GET_ALL, () => {
    return HttpResponse.json({
      success: true,
      message: "게시글 목록 조회 성공",
      data: {
        posts: mockPosts,
        total: mockPosts.length,
      },
    })
  }),

  http.get(`${API_ENDPOINTS.POSTS.GET_BY_ID}/:id`, ({ params }: { params: { id: string } }) => {
    const post = mockPosts.find(p => p.id === Number(params.id))
    if (!post) {
      return HttpResponse.json(
        {
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      success: true,
      message: "게시글 조회 성공",
      data: { post },
    })
  }),

  http.post(API_ENDPOINTS.POSTS.CREATE, async ({ request }: { request: Request }) => {
    const body = await request.json()
    const newPost = {
      id: mockPosts.length + 1,
      ...(body as any),
      author: "테스트 작성자",
      userId: 1,
      like_count: 0,
      comment_count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({
      success: true,
      message: "게시글 작성 성공",
      data: { post: newPost },
    })
  }),

  // 레벨 시스템 API
  http.get(`${API_ENDPOINTS.LEVELS.GET_USER_LEVEL}/:userId`, ({ params }: { params: { userId: string } }) => {
    return HttpResponse.json({
      success: true,
      message: "사용자 레벨 조회 성공",
      data: { userLevel: mockUserLevel },
    })
  }),

  http.post(API_ENDPOINTS.LEVELS.GRANT_EXP, () => {
    return HttpResponse.json({
      success: true,
      message: "경험치 부여 성공",
      data: {
        userLevel: {
          ...mockUserLevel,
          currentExp: mockUserLevel.currentExp + 100,
          totalExp: mockUserLevel.totalExp + 100,
        },
      },
    })
  }),

  // 운동 목표 API
  http.get(API_ENDPOINTS.WORKOUT_GOALS.GET_ALL, () => {
    return HttpResponse.json({
      success: true,
      message: "운동 목표 목록 조회 성공",
      data: {
        workoutGoals: [],
        total: 0,
      },
    })
  }),

  // 헬스장 API
  http.get(API_ENDPOINTS.GYMS.GET_ALL, () => {
    return HttpResponse.json({
      success: true,
      message: "헬스장 목록 조회 성공",
      data: {
        gyms: [],
        total: 0,
      },
    })
  }),

  // 에러 핸들러
  http.all("*", () => {
    return HttpResponse.json(
      {
        success: false,
        message: "API 엔드포인트를 찾을 수 없습니다.",
      },
      { status: 404 }
    )
  }),
]

// Export handlers
export { handlers }