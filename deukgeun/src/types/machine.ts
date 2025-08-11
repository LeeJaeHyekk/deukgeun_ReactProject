// ============================================================================
// 머신 관련 타입
// ============================================================================

export type MachineCategory = "상체" | "하체" | "전신" | "기타"
export type DifficultyLevel = "초급" | "중급" | "고급" | "beginner" | "intermediate" | "advanced"

export interface Machine {
  id: number
  machine_key: string
  name_ko: string
  name_en?: string
  image_url: string
  short_desc: string
  detail_desc: string
  category: MachineCategory
  difficulty_level?: DifficultyLevel
  target_muscle?: string[]
  positive_effect?: string
  video_url?: string
  instructions?: string
  createdAt: Date
  updatedAt: Date
}

export interface MachineListResponse {
  machines: Machine[]
  count: number
}
