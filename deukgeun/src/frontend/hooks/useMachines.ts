import { useState, useCallback, useEffect } from "react"
import { apiClient } from "../api/client"
import type { Machine } from "../types/workout"

// API 응답 타입
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface MachinesResponse {
  machines: Machine[]
}

interface MachineResponse {
  machine: Machine
}

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 모든 기계 가져오기
  const fetchMachines = useCallback(async (params?: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : ""
      const url = queryParams ? `/api/machines?${queryParams}` : "/api/machines"
      const response = await apiClient.get<ApiResponse<MachinesResponse>>(url)

      if (response.success && response.data) {
        const newMachines = response.data.machines
        setMachines(newMachines)
        return newMachines
      }
      return []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "기계 목록을 가져오는데 실패했습니다."
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 특정 기계 가져오기
  const fetchMachine = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<ApiResponse<MachineResponse>>(`/api/machines/${id}`)

      if (response.success && response.data) {
        const newMachine = response.data.machine
        setMachines(prev => {
          const existingIndex = prev.findIndex(m => m.id === Number(id))
          if (existingIndex >= 0) {
            return prev.map(machine => machine.id === Number(id) ? newMachine : machine)
          }
          return [...prev, newMachine]
        })
        return newMachine
      }
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "기계 정보를 가져오는데 실패했습니다."
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 기계 생성
  const createMachine = useCallback(async (machineData: Partial<Machine>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.post<ApiResponse<MachineResponse>>("/api/machines", machineData)

      if (response.success && response.data) {
        const newMachine = response.data.machine
        setMachines(prev => [...prev, newMachine])
        return newMachine
      }
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "기계 생성에 실패했습니다."
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 기계 업데이트
  const updateMachine = useCallback(async (id: string, machineData: Partial<Machine>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.put<ApiResponse<MachineResponse>>(`/api/machines/${id}`, machineData)

      if (response.success && response.data) {
        const updatedMachine = response.data.machine
        setMachines(prev =>
          prev.map(machine => machine.id === Number(id) ? updatedMachine : machine)
        )
        return updatedMachine
      }
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "기계 업데이트에 실패했습니다."
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 기계 삭제
  const deleteMachine = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/api/machines/${id}`)

      if (response.success) {
        setMachines(prev => prev.filter(machine => machine.id !== Number(id)))
        return true
      }
      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "기계 삭제에 실패했습니다."
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 카테고리별 기계 가져오기
  const fetchMachinesByCategory = useCallback(async (category: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<ApiResponse<MachinesResponse>>(`/api/machines/category/${category}`)

      if (response.success && response.data) {
        return response.data.machines
      }
      return []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "카테고리별 기계를 가져오는데 실패했습니다."
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 초기 로드
  useEffect(() => {
    fetchMachines()
  }, [fetchMachines])

  return {
    machines,
    isLoading,
    error,
    fetchMachines,
    fetchMachine,
    createMachine,
    updateMachine,
    deleteMachine,
    fetchMachinesByCategory,
    clearError,
  }
}
