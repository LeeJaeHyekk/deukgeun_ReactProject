const { apiClient, assertApiResponse  } = require('client')

  ): Promise<{ posts: Post[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (status) params.append('status', status)

    const response = await apiClient.get(`/admin/posts?${params}`)
    return assertApiResponse<{ posts: Post[]; total: number }>(response.data)
  },

  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`/admin/posts/${id}`)
  },

  async getMachines(
    page = 1,
    limit = 10
  ): Promise<{ machines: Machine[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await apiClient.get(`/admin/machines?${params}`)
    return assertApiResponse<{ machines: Machine[]; total: number }>(response.data)
  },

  async createMachine(machineData: Partial<Machine>): Promise<Machine> {
    const response = await apiClient.post('/admin/machines', machineData)
    return assertApiResponse<Machine>(response.data)
  },

  async updateMachine(
    id: number,
    machineData: Partial<Machine>
  ): Promise<Machine> {
    const response = await apiClient.put(`/admin/machines/${id}`, machineData)
    return assertApiResponse<Machine>(response.data)
  },

  async deleteMachine(id: number): Promise<void> {
    await apiClient.delete(`/admin/machines/${id}`)
  },
}