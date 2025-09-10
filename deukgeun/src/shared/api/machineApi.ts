import { apiClient } from './client'
import { Machine } from '@shared/types/dto/machine.dto'

export const machineApi = {
  async getMachines(): Promise<Machine[]> {
    const response = await apiClient.get('/machines')
    return response.data
  },

  async getMachineById(id: number): Promise<Machine> {
    const response = await apiClient.get(`/machines/${id}`)
    return response.data
  },

  async getMachinesByCategory(category: string): Promise<Machine[]> {
    const response = await apiClient.get(`/machines/category/${category}`)
    return response.data
  },

  async searchMachines(query: string): Promise<Machine[]> {
    const response = await apiClient.get(
      `/machines/search?q=${encodeURIComponent(query)}`
    )
    return response.data
  },

  async createMachine(machineData: Partial<Machine>): Promise<Machine> {
    const response = await apiClient.post('/machines', machineData)
    return response.data
  },

  async updateMachine(
    id: number,
    machineData: Partial<Machine>
  ): Promise<Machine> {
    const response = await apiClient.put(`/machines/${id}`, machineData)
    return response.data
  },

  async deleteMachine(id: number): Promise<void> {
    await apiClient.delete(`/machines/${id}`)
  },
}
