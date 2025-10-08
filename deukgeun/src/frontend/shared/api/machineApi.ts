// ============================================================================
// Machine API (Legacy - Use @features/machine-guide instead)
// ============================================================================

// 이 파일은 하위 호환성을 위해 유지됩니다.
// 새로운 MachineGuide 기능에서는 @features/machine-guide/services/machineApi를 사용하세요.

const { api  } = require('./index')
const { API_ENDPOINTS  } = require('@shared/config')
import type {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineListResponse as DTOMachineListResponse,
  MachineResponse as DTOMachineResponse,
} from "@dto/index"

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
      API_ENDPOINTS.MACHINES.LIST
    )
    console.log("머신 API 응답:", response)
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },

  // Get machine by ID
  getMachine: async (id: number): Promise<MachineResponse> => {
    const response = await api.get<DTOMachineResponse>(
      API_ENDPOINTS.MACHINES.DETAIL(id)
    )
    return {
      machine: (response.data.data || response.data) as unknown as Machine,
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
    return {
      machine: (response.data.data || response.data) as unknown as Machine,
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
    return {
      machine: (response.data.data || response.data) as unknown as Machine,
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
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },

  // Get machines by category
  getMachinesByCategory: async (
    category: string
  ): Promise<MachineListResponse> => {
    const response = await api.get<DTOMachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_CATEGORY(category)
    )
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },

  // Get machines by difficulty
  getMachinesByDifficulty: async (
    difficulty: string
  ): Promise<MachineListResponse> => {
    const response = await api.get<DTOMachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_DIFFICULTY(difficulty)
    )
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },

  // Get machines by target
  getMachinesByTarget: async (target: string): Promise<MachineListResponse> => {
    const response = await api.get<DTOMachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_TARGET(target)
    )
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },
}
