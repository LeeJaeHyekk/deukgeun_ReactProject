import { apiClient } from './client'
import { Machine } from '@shared/types/dto/machine.dto'

export const machineApi = {
  async getMachines(): Promise<Machine[]> {
    const response = await apiClient.get('/api/machines')
    return response.data as Machine[]
  },

  async getMachineById(id: number): Promise<Machine> {
    const response = await apiClient.get(`/api/machines/${id}`)
    return response.data as Machine
  },

  async getMachinesByCategory(category: string): Promise<Machine[]> {
    const response = await apiClient.get(`/api/machines/category/${category}`)
    return response.data as Machine[]
  },

  async searchMachines(query: string): Promise<Machine[]> {
    const response = await apiClient.get(
      `/api/machines/search?q=${encodeURIComponent(query)}`
    )
    return response.data as Machine[]
  },

  async createMachine(machineData: Partial<Machine>): Promise<Machine> {
    const response = await apiClient.post('/api/machines', machineData)
    return response.data as Machine
  },

  async updateMachine(
    id: number,
    machineData: Partial<Machine>
  ): Promise<Machine> {
    const response = await apiClient.put(`/api/machines/${id}`, machineData)
    return response.data as Machine
  },

  async deleteMachine(id: number): Promise<void> {
    await apiClient.delete(`/api/machines/${id}`)
  },
}
