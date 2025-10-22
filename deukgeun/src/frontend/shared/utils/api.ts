import axios from 'axios'
import type { UserStats, PlatformStats, DetailedStats } from '../types/stats'

export const fetchUserStatsApi = async (): Promise<UserStats> => {
  const res = await axios.get('/api/stats/user', { withCredentials: true })
  return res.data
}

export const fetchPlatformStatsApi = async (): Promise<PlatformStats> => {
  const res = await axios.get('/api/stats/platform', { withCredentials: true })
  return res.data
}

export const fetchDetailedStatsApi = async (): Promise<DetailedStats> => {
  const res = await axios.get('/api/stats/detailed', { withCredentials: true })
  return res.data
}
