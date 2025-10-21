// ============================================================================
// Machine API (Legacy - Use @features/machine-guide instead)
// ============================================================================

// 이 파일은 하위 호환성을 위해 유지됩니다.
// 새로운 MachineGuide 기능에서는 @features/machine-guide/services/machineApi를 사용하세요.

import { api } from '@frontend/shared/api/index'
import { API_ENDPOINTS } from '@frontend/shared/config'
import type {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineListResponse as DTOMachineListResponse,
  MachineResponse as DTOMachineResponse,
} from "../../../shared/types/dto"
import { 
  safeParseMachineArray, 
  safeParseMachine,
  isMachineDTO,
  isArray 
} from "@shared/types/guards"

// 타입 정의 (DTO 기반으로 통합)
export interface MachineListResponse {
  machines: Machine[]
  count: number
}

export interface MachineResponse {
  machine: Machine
}

// Machine API functions (Legacy) - DTO 타입 적용
const machineApi = {
  // Get all machines
  getMachines: async (): Promise<MachineListResponse> => {
    const response = await api.get<DTOMachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_ALL
    )
    console.log("머신 API 응답:", response)
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machines = safeParseMachineArray(response.data.data)
    const count = isArray(response.data.data) ? response.data.data.length : 0
    
    return {
      machines,
      count,
    }
  },

  // Get machine by ID
  getMachine: async (id: number): Promise<MachineResponse> => {
    const response = await api.get<DTOMachineResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_ID(id)
    )
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machineData = response.data.data || response.data
    const machine = safeParseMachine(machineData)
    
    if (!machine) {
      throw new Error(`Invalid machine data for ID: ${id}`)
    }
    
    return {
      machine,
    }
  },

  // Create new machine
  createMachine: async (
    data: CreateMachineRequest
  ): Promise<MachineResponse> => {
    const response = await api.post<DTOMachineResponse>(
      API_ENDPOINTS.MACHINES.CREATE,
      data
    )
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machineData = response.data.data || response.data
    const machine = safeParseMachine(machineData)
    
    if (!machine) {
      throw new Error('Invalid machine data received from create API')
    }
    
    return {
      machine,
    }
  },

  // Update machine
  updateMachine: async (
    id: number,
    data: UpdateMachineRequest
  ): Promise<MachineResponse> => {
    const response = await api.put<DTOMachineResponse>(
      API_ENDPOINTS.MACHINES.UPDATE(id),
      data
    )
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machineData = response.data.data || response.data
    const machine = safeParseMachine(machineData)
    
    if (!machine) {
      throw new Error(`Invalid machine data received from update API for ID: ${id}`)
    }
    
    return {
      machine,
    }
  },

  // Delete machine
  deleteMachine: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.MACHINES.DELETE(id))
  },

  // Filter machines
  filterMachines: async (filters: {
    category?: string
    difficulty?: string
    search?: string
  }): Promise<MachineListResponse> => {
    const params = new URLSearchParams()
    if (filters.category) params.append("category", filters.category)
    if (filters.difficulty) params.append("difficulty", filters.difficulty)
    if (filters.search) params.append("target", filters.search)

    const response = await api.get<DTOMachineListResponse>(
      `${API_ENDPOINTS.MACHINES.FILTER}?${params.toString()}`
    )
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machines = safeParseMachineArray(response.data.data)
    const count = isArray(response.data.data) ? response.data.data.length : 0
    
    return {
      machines,
      count,
    }
  },

  // Get machines by category
  getMachinesByCategory: async (
    category: string
  ): Promise<MachineListResponse> => {
    const response = await api.get<DTOMachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_CATEGORY(category)
    )
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machines = safeParseMachineArray(response.data.data)
    const count = isArray(response.data.data) ? response.data.data.length : 0
    
    return {
      machines,
      count,
    }
  },

  // Get machines by difficulty
  getMachinesByDifficulty: async (
    difficulty: string
  ): Promise<MachineListResponse> => {
    const response = await api.get<DTOMachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_DIFFICULTY(difficulty)
    )
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machines = safeParseMachineArray(response.data.data)
    const count = isArray(response.data.data) ? response.data.data.length : 0
    
    return {
      machines,
      count,
    }
  },

  // Get machines by target
  getMachinesByTarget: async (target: string): Promise<MachineListResponse> => {
    const response = await api.get<DTOMachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_TARGET(target)
    )
    
    // 타입 가드를 사용하여 안전하게 데이터 파싱
    const machines = safeParseMachineArray(response.data.data)
    const count = isArray(response.data.data) ? response.data.data.length : 0
    
    return {
      machines,
      count,
    }
  },
}

export { machineApi }
