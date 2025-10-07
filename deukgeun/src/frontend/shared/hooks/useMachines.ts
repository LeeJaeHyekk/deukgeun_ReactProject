// ============================================================================
// Use Machines Hook (Legacy - Use @features/machine-guide instead)
// ============================================================================

// 이 파일은 하위 호환성을 위해 유지됩니다.
// 새로운 MachineGuide 기능에서는 @features/machine-guide/hooks/useMachines를 사용하세요.

import { useState, useEffect, useCallback, useRef } from "react"
import { machineApi } from "@shared/api/machineApi"
import { showToast } from "@shared/lib"
import type { Machine } from "@dto/index"
import type { CreateMachineRequest, UpdateMachineRequest } from "@dto/index"

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API 호출 제한을 위한 ref
  const lastFetchTime = useRef<number>(0)
  const FETCH_COOLDOWN = 1000 // 1초 쿨다운

  // 모든 머신 조회
  const fetchMachines = useCallback(async () => {
    // API 호출 제한 확인
    const now = Date.now()
    if (now - lastFetchTime.current < FETCH_COOLDOWN) {
      console.log("API 호출 제한: 머신 목록 조회 스킵")
      return machines
    }

    setLoading(true)
    setError(null)
    try {
      lastFetchTime.current = now
      const response = await machineApi.getMachines()
      console.log("머신 응답:", response)
      const newMachines = Array.isArray(response) ? response : []
      console.log("머신 목록:", newMachines)
      setMachines(newMachines)
      return newMachines
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
  }, [machines])

  // 특정 머신 조회
  const fetchMachine = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await machineApi.getMachineById(id)
      return response
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
        const newMachine = response
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
        const updatedMachine = response
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
  const getMachinesByCategory = useCallback(
    async (category: string) => {
      const now = Date.now()
      if (now - lastFetchTime.current < FETCH_COOLDOWN) {
        console.log("API 호출 제한: 카테고리별 머신 조회 스킵")
        return machines
      }

      setLoading(true)
      setError(null)
      try {
        lastFetchTime.current = now
        const response = await machineApi.getMachinesByCategory(category)
        const newMachines = Array.isArray(response) ? response : []
        setMachines(newMachines)
        return newMachines
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
    },
    [machines]
  )

  // 난이도별 머신 조회
  const getMachinesByDifficulty = useCallback(
    async (difficulty: string) => {
      const now = Date.now()
      if (now - lastFetchTime.current < FETCH_COOLDOWN) {
        console.log("API 호출 제한: 난이도별 머신 조회 스킵")
        return machines
      }

      setLoading(true)
      setError(null)
      try {
        lastFetchTime.current = now
        const response = await machineApi.getMachinesByCategory(difficulty)
        const newMachines = Array.isArray(response) ? response : []
        setMachines(newMachines)
        return newMachines
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
    },
    [machines]
  )

  // 타겟별 머신 조회
  const getMachinesByTarget = useCallback(
    async (target: string) => {
      const now = Date.now()
      if (now - lastFetchTime.current < FETCH_COOLDOWN) {
        console.log("API 호출 제한: 타겟별 머신 조회 스킵")
        return machines
      }

      setLoading(true)
      setError(null)
      try {
        lastFetchTime.current = now
        const response = await machineApi.getMachinesByCategory(target)
        const newMachines = Array.isArray(response) ? response : []
        setMachines(newMachines)
        return newMachines
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "타겟별 머신 조회에 실패했습니다."
        setError(errorMessage)
        showToast(errorMessage, "error")
        setMachines([])
        throw err
      } finally {
        setLoading(false)
      }
    },
    [machines]
  )

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
