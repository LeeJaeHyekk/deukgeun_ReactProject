// ============================================================================
// Frontend 머신 훅
// ============================================================================

import { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api-client"
import type { Machine } from "../types/common"

interface UseMachinesReturn {
  machines: Machine[]
  isLoading: boolean
  error: string | null
  refreshMachines: () => Promise<void>
  getMachineById: (id: string) => Machine | undefined
  getMachinesByCategory: (category: string) => Machine[]
  getMachinesByDifficulty: (difficulty: string) => Machine[]
}

export function useMachines(): UseMachinesReturn {
  const [machines, setMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMachines = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get("/api/machines")
      const data = response.data

      if (data.success && data.data) {
        setMachines(data.data)
      } else {
        throw new Error(data.message || "머신 정보를 가져올 수 없습니다")
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "머신 정보를 가져오는데 실패했습니다"
      setError(errorMessage)
      console.error("머신 정보 조회 실패:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshMachines = useCallback(async () => {
    await fetchMachines()
  }, [fetchMachines])

  const getMachineById = useCallback(
    (id: string): Machine | undefined => {
      return machines.find(machine => machine.id === id)
    },
    [machines]
  )

  const getMachinesByCategory = useCallback(
    (category: string): Machine[] => {
      return machines.filter(machine => machine.category === category)
    },
    [machines]
  )

  const getMachinesByDifficulty = useCallback(
    (difficulty: string): Machine[] => {
      return machines.filter(machine => machine.difficulty === difficulty)
    },
    [machines]
  )

  useEffect(() => {
    fetchMachines()
  }, [fetchMachines])

  return {
    machines,
    isLoading,
    error,
    refreshMachines,
    getMachineById,
    getMachinesByCategory,
    getMachinesByDifficulty,
  }
}
