import { Repository } from "typeorm"
import { Machine } from "../entities/Machine"
import type {
  Machine as SharedMachine,
  MachineCategory,
  DifficultyLevel,
  CreateMachineRequest as SharedCreateMachineRequest,
  UpdateMachineRequest as SharedUpdateMachineRequest,
} from "../../shared/types/dto/machine.dto"

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
export * from "../../shared/types/dto/machine.dto"

// MachineCategory와 DifficultyLevel 타입 재내보내기
export type { MachineCategory, DifficultyLevel }
