import { Repository } from "typeorm"
import { Machine } from "../../domains/machine/entities/Machine"
import type {
  MachineDTO as SharedMachine,
  MachineCategoryDTO as MachineCategory,
  DifficultyLevelDTO as DifficultyLevel,
  CreateMachineDTO as SharedCreateMachineRequest,
  UpdateMachineDTO as SharedUpdateMachineRequest,
} from "./dto.js"

// Machine Repository 타입 정의
export type MachineRepository = Repository<Machine>

// Machine 생성 요청 타입 (shared/types와 일치)
export type CreateMachineRequest = SharedCreateMachineRequest

// Machine 수정 요청 타입 (shared/types와 일치)
export type UpdateMachineRequest = SharedUpdateMachineRequest

// Machine 필터링 쿼리 타입
export interface MachineFilterQuery {
  category?: string
  difficulty?: string
  target?: string
  search?: string
}

// Machine 응답 타입
export interface MachineResponse {
  message: string
  data: Machine
}

// Machine 목록 응답 타입
export interface MachineListResponse {
  message: string
  data: Machine[]
  count: number
}

// Machine 필터링 응답 타입
export interface MachineFilterResponse {
  message: string
  data: Machine[]
  count: number
  filters: MachineFilterQuery
}

// 중앙 타입 시스템 재내보내기
export * from "./dto.js"

// MachineCategory와 DifficultyLevel 타입 재내보내기
export type { MachineCategory, DifficultyLevel }
