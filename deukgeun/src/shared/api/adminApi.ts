const { apiClient, assertApiResponse  } = require('./client')
const { User  } = require('@shared/types/dto/user.dto')
const { Machine  } = require('@shared/types/dto/machine.dto')
const { Post  } = require('@shared/types/dto/post.dto')

export interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalMachines: number
  activeUsers: number
  recentPosts: Post[]
  recentUsers: User[]
}

export interface UserManagementData {
  users: User[]
  total: number
  page: number
  limit: number
}

const adminApi = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get('/admin/stats')
    return assertApiResponse<AdminStats>(response.data)
  },

  async getUsers(
    page = 1,
    limit = 10,
    search?: string
  ): Promise<UserManagementData> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (search) params.append('search', search)

    const response = await apiClient.get(`/admin/users?${params}`)
    return assertApiResponse<UserManagementData>(response.data)
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/admin/users/${id}`)
    return assertApiResponse<User>(response.data)
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/admin/users/${id}`, userData)
    return assertApiResponse<User>(response.data)
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`)
  },

  async banUser(id: number, reason: string): Promise<void> {
    await apiClient.post(`/admin/users/${id}/ban`, { reason })
  },

  async unbanUser(id: number): Promise<void> {
    await apiClient.post(`/admin/users/${id}/unban`)
  },

  async getPosts(
    page = 1,
    limit = 10,
    status?: string
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
