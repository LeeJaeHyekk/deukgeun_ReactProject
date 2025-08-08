// Machine 관련 타입 정의
export interface Machine {
  id: number
  machine_key: string
  name_ko: string
  name_en?: string
  image_url: string
  short_desc: string
  detail_desc: string
  category: "상체" | "하체" | "전신" | "기타"
  difficulty_level?: "초급" | "중급" | "고급"
  target_muscle?: string[]
  positive_effect?: string
  video_url?: string
  created_at: string
  updated_at: string
}

// Machine 생성 요청 타입
export interface CreateMachineRequest {
  machine_key: string
  name_ko: string
  name_en?: string
  image_url: string
  short_desc: string
  detail_desc: string
  category: "상체" | "하체" | "전신" | "기타"
  difficulty_level?: "초급" | "중급" | "고급"
  target_muscle?: string[]
  positive_effect?: string
  video_url?: string
}

// Machine 수정 요청 타입
export interface UpdateMachineRequest {
  machine_key?: string
  name_ko?: string
  name_en?: string
  image_url?: string
  short_desc?: string
  detail_desc?: string
  category?: "상체" | "하체" | "전신" | "기타"
  difficulty_level?: "초급" | "중급" | "고급"
  target_muscle?: string[]
  positive_effect?: string
  video_url?: string
}

// Machine 필터링 쿼리 타입
export interface MachineFilterQuery {
  category?: "상체" | "하체" | "전신" | "기타"
  difficulty?: "초급" | "중급" | "고급"
  target?: string
}

// Machine API 응답 타입
export interface MachineResponse {
  message: string
  data: Machine
}

export interface MachineListResponse {
  message: string
  data: Machine[]
  count: number
}

export interface MachineFilterResponse {
  message: string
  data: Machine[]
  count: number
}

// Machine 카테고리 옵션
export const MACHINE_CATEGORIES = [
  { value: "상체", label: "상체" },
  { value: "하체", label: "하체" },
  { value: "전신", label: "전신" },
  { value: "기타", label: "기타" },
] as const

// Machine 난이도 옵션
export const MACHINE_DIFFICULTIES = [
  { value: "초급", label: "초급" },
  { value: "중급", label: "중급" },
  { value: "고급", label: "고급" },
] as const

// 타겟 근육 옵션
export const TARGET_MUSCLES = [
  "삼두근",
  "이두근",
  "대흉근",
  "광배근",
  "승모근",
  "삼각근",
  "대퇴사두근",
  "햄스트링",
  "둔근",
  "비복근",
  "복근",
  "척추기립근",
] as const
