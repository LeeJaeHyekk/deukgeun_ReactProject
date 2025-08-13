import { useState, useEffect, useCallback } from "react"
import { machineApi } from "@shared/api/machineApi"
import { showToast } from "@shared/lib"
import type { Machine } from "../../../types"
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
        const newMachine = response.machine
        setMachines(prev => [newMachine, ...prev])
        showToast("머신이 성공적으로 생성되었습니다.", "success")
        return newMachine
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
    []
  )

  // 머신 수정
  const updateMachine = useCallback(
    async (id: number, machineData: UpdateMachineRequest) => {
      setLoading(true)
      setError(null)
      try {
        const response = await machineApi.updateMachine(id, machineData)
        const updatedMachine = response.machine
        setMachines(prev =>
          prev.map(machine => (machine.id === id ? updatedMachine : machine))
        )
        showToast("머신이 성공적으로 수정되었습니다.", "success")
        return updatedMachine
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
    []
  )

  // 머신 삭제
  const deleteMachine = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await machineApi.deleteMachine(id)
      setMachines(prev => prev.filter(machine => machine.id !== id))
      showToast("머신이 성공적으로 삭제되었습니다.", "success")
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "머신 삭제에 실패했습니다."
      setError(errorMessage)
      showToast(errorMessage, "error")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 카테고리별 머신 조회
  const getMachinesByCategory = useCallback(async (category: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await machineApi.getMachinesByCategory(category)
      const machines = response?.machines || []
      setMachines(machines)
      return machines
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "카테고리별 머신 조회에 실패했습니다."
      setError(errorMessage)
      showToast(errorMessage, "error")
      setMachines([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 난이도별 머신 조회
  const getMachinesByDifficulty = useCallback(async (difficulty: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await machineApi.getMachinesByDifficulty(difficulty)
      const machines = response?.machines || []
      setMachines(machines)
      return machines
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "난이도별 머신 조회에 실패했습니다."
      setError(errorMessage)
      showToast(errorMessage, "error")
      setMachines([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 타겟별 머신 조회
  const getMachinesByTarget = useCallback(async (target: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await machineApi.getMachinesByTarget(target)
      const machines = response?.machines || []
      setMachines(machines)
      return machines
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "타겟별 머신 조회에 실패했습니다."
      setError(errorMessage)
      showToast(errorMessage, "error")
      setMachines([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

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
    getMachinesByCategory,
    getMachinesByDifficulty,
    getMachinesByTarget,
  }
}
