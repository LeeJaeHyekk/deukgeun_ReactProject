const { apiClient, assertApiResponse  } = require('./client')
const { Machine  } = require('@shared/types/dto/machine.dto')

const machineApi = {
  async getMachines(): Promise<Machine[]> {
    const response = await apiClient.get('/machines')
    return assertApiResponse<Machine[]>(response.data)
  },

  async getMachineById(id: number): Promise<Machine> {
    const response = await apiClient.get(`/machines/${id}`)
    return assertApiResponse<Machine>(response.data)
  },

  async getMachinesByCategory(category: string): Promise<Machine[]> {
    const response = await apiClient.get(`/machines/category/${category}`)
    return assertApiResponse<Machine[]>(response.data)
  },

  async searchMachines(query: string): Promise<Machine[]> {
    const response = await apiClient.get(
      `/machines/search?q=${encodeURIComponent(query)}`
    )
    return assertApiResponse<Machine[]>(response.data)
  },

  async createMachine(machineData: Partial<Machine>): Promise<Machine> {
    const response = await apiClient.post('/machines', machineData)
    return assertApiResponse<Machine>(response.data)
  },

  async updateMachine(
    id: number,
    machineData: Partial<Machine>
  ): Promise<Machine> {
    const response = await apiClient.put(`/machines/${id}`, machineData)
    return assertApiResponse<Machine>(response.data)
  },

  async deleteMachine(id: number): Promise<void> {
    await apiClient.delete(`/machines/${id}`)
  },
}
