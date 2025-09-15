import { apiClient } from './client'
import { User } from '@shared/types/dto/user.dto'
import { Machine } from '@shared/types/dto/machine.dto'
import { Post } from '@shared/types/dto/post.dto'

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

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get('/admin/stats')
    return response.data as AdminStats
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
    return response.data as UserManagementData
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/admin/users/${id}`)
    return response.data as User
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/admin/users/${id}`, userData)
    return response.data as User
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
    return response.data as { posts: Post[]; total: number }
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
    return response.data as { machines: Machine[]; total: number }
  },

  async createMachine(machineData: Partial<Machine>): Promise<Machine> {
    const response = await apiClient.post('/admin/machines', machineData)
    return response.data as Machine
  },

  async updateMachine(
    id: number,
    machineData: Partial<Machine>
  ): Promise<Machine> {
    const response = await apiClient.put(`/admin/machines/${id}`, machineData)
    return response.data as Machine
  },

  async deleteMachine(id: number): Promise<void> {
    await apiClient.delete(`/admin/machines/${id}`)
  },
}
