import { useState, useEffect, useCallback } from "react"
import { machineApi } from "@shared/api/machineApi"
import { showToast } from "@shared/lib"
import type { Machine } from "@shared/types/machine"
import type {
  CreateMachineRequest,
  UpdateMachineRequest,
} from "@shared/api/machineApi"

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 모든 머신 조회
  const fetchMachines = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await machineApi.getMachines()
      console.log("머신 응답:", response)
      const machines = response?.machines || []
      console.log("머신 목록:", machines)
      setMachines(machines)
      return machines
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "머신 목록을 불러오는데 실패했습니다."
      setError(errorMessage)
      showToast(errorMessage, "error")
      setMachines([]) // 오류 시 빈 배열로 설정
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 특정 머신 조회
  const fetchMachine = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await machineApi.getMachine(id)
      return response.machine
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "머신 정보를 불러오는데 실패했습니다."
      setError(errorMessage)
      showToast(errorMessage, "error")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 머신 생성
  const createMachine = useCallback(
    async (machineData: CreateMachineRequest) => {
      setLoading(true)
      setError(null)
      try {
        const response = await machineApi.createMachine(machineData)
        showToast("머신이 성공적으로 생성되었습니다.", "success")
        await fetchMachines() // 목록 새로고침
        return response.machine
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "머신 생성에 실패했습니다."
        setError(errorMessage)
        showToast(errorMessage, "error")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchMachines]
  )

  // 머신 수정
  const updateMachine = useCallback(
    async (id: number, updateData: UpdateMachineRequest) => {
      setLoading(true)
      setError(null)
      try {
        const response = await machineApi.updateMachine(id, updateData)
        showToast("머신이 성공적으로 수정되었습니다.", "success")
        await fetchMachines() // 목록 새로고침
        return response.machine
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "머신 수정에 실패했습니다."
        setError(errorMessage)
        showToast(errorMessage, "error")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchMachines]
  )

  // 머신 삭제
  const deleteMachine = useCallback(
    async (id: number) => {
      setLoading(true)
      setError(null)
      try {
        await machineApi.deleteMachine(id)
        showToast("머신이 성공적으로 삭제되었습니다.", "success")
        await fetchMachines() // 목록 새로고침
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "머신 삭제에 실패했습니다."
        setError(errorMessage)
        showToast(errorMessage, "error")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchMachines]
  )

  // 머신 필터링
  const filterMachines = useCallback(
    async (filters: {
      category?: string
      difficulty?: string
      search?: string
    }) => {
      setLoading(true)
      setError(null)
      try {
        const response = await machineApi.filterMachines(filters)
        const machines = response.machines || []
        setMachines(machines)
        return machines
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "머신 필터링에 실패했습니다."
        setError(errorMessage)
        showToast(errorMessage, "error")
        setMachines([]) // 오류 시 빈 배열로 설정
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 카테고리별 머신 조회
  const getMachinesByCategory = useCallback(
    async (category: string) => {
      return filterMachines({ category })
    },
    [filterMachines]
  )

  // 난이도별 머신 조회
  const getMachinesByDifficulty = useCallback(
    async (difficulty: string) => {
      return filterMachines({ difficulty })
    },
    [filterMachines]
  )

  // 타겟별 머신 조회
  const getMachinesByTarget = useCallback(
    async (target: string) => {
      return filterMachines({ search: target })
    },
    [filterMachines]
  )

  // 컴포넌트 마운트 시 머신 목록 로드
  useEffect(() => {
    fetchMachines()
  }, [fetchMachines])

  return {
    machines,
    loading,
    error,
    fetchMachines,
    fetchMachine,
    createMachine,
    updateMachine,
    deleteMachine,
    filterMachines,
    getMachinesByCategory,
    getMachinesByDifficulty,
    getMachinesByTarget,
  }
}
