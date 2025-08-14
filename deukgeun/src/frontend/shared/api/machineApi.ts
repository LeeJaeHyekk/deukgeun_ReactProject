import { api } from "./index"
import { API_ENDPOINTS } from "@shared/config"
import type { Machine } from "../../../types"

// 타입 정의
export interface MachineListResponse {
  machines: Machine[]
  count: number
}

export interface MachineResponse {
  machine: Machine
}

export interface CreateMachineRequest {
  name: string
  category: string
  difficulty: string
  description: string
  instructions: string
  imageUrl?: string
  videoUrl?: string
}

export interface UpdateMachineRequest extends Partial<CreateMachineRequest> {
  id: number
}

// Machine API functions
export const machineApi = {
  // Get all machines
  getMachines: async (): Promise<MachineListResponse> => {
    const response = await api.get<MachineListResponse>(
      API_ENDPOINTS.MACHINES.LIST
    )
    console.log("머신 API 응답:", response)
    // 백엔드 응답 구조에 맞게 수정
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },

  // Get machine by ID
  getMachine: async (id: number): Promise<MachineResponse> => {
    const response = await api.get<MachineResponse>(
      API_ENDPOINTS.MACHINES.DETAIL(id)
    )
    return {
      machine: (response.data.data || response.data) as any,
    }
  },

  // Create new machine
  createMachine: async (
    data: CreateMachineRequest
  ): Promise<MachineResponse> => {
    const response = await api.post<MachineResponse>(
      API_ENDPOINTS.MACHINES.CREATE,
      data
    )
    return {
      machine: (response.data.data || response.data) as any,
    }
  },

  // Update machine
  updateMachine: async (
    id: number,
    data: UpdateMachineRequest
  ): Promise<MachineResponse> => {
    const response = await api.put<MachineResponse>(
      API_ENDPOINTS.MACHINES.UPDATE(id),
      data
    )
    return {
      machine: (response.data.data || response.data) as any,
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

    const response = await api.get<MachineListResponse>(
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
    const response = await api.get<MachineListResponse>(
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
    const response = await api.get<MachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_DIFFICULTY(difficulty)
    )
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },

  // Get machines by target
  getMachinesByTarget: async (target: string): Promise<MachineListResponse> => {
    const response = await api.get<MachineListResponse>(
      API_ENDPOINTS.MACHINES.GET_BY_TARGET(target)
    )
    return {
      machines: Array.isArray(response.data.data) ? response.data.data : [],
      count: (response.data as any).count || 0,
    }
  },
}
