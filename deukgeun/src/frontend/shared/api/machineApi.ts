import { api } from "./index"
import { API_ENDPOINTS } from "@shared/config"
import type { Machine } from "@shared/types/machine"

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
    return response.data.data as MachineListResponse
  },

  // Get machine by ID
  getMachine: async (id: number): Promise<MachineResponse> => {
    const response = await api.get<MachineResponse>(
      API_ENDPOINTS.MACHINES.DETAIL(id)
    )
    return response.data.data as MachineResponse
  },

  // Create new machine
  createMachine: async (
    data: CreateMachineRequest
  ): Promise<MachineResponse> => {
    const response = await api.post<MachineResponse>(
      API_ENDPOINTS.MACHINES.CREATE,
      data
    )
    return response.data.data as MachineResponse
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
    return response.data.data as MachineResponse
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
    const response = await api.post<MachineListResponse>(
      API_ENDPOINTS.MACHINES.FILTER,
      filters
    )
    return response.data.data as MachineListResponse
  },
}
