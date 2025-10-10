// ============================================================================
// Use Machines Hook (Legacy - Use @features/machine-guide instead)
// ============================================================================

// 이 파일은 하위 호환성을 위해 유지됩니다.
// 새로운 MachineGuide 기능에서는 @features/machine-guide/hooks/useMachines를 사용하세요.

import { useState, useEffect, useCallback, useRef } from 'react'
import { machineApi } from '@shared/api/machineApi'
import { showToast } from '@shared/lib'
import type { 
  Machine, 
  CreateMachineRequest, 
  UpdateMachineRequest,
  ApiResponse,
  ErrorResponse 
} from "../../shared/types"

// 훅 반환 타입 정의
interface UseMachinesReturn {
  machines: Machine[]
  loading: boolean
  error: string | null
  fetchMachines: () => Promise<Machine[]>
  fetchMachine: (id: number) => Promise<Machine>
  createMachine: (machineData: CreateMachineRequest) => Promise<Machine>
  updateMachine: (id: number, machineData: UpdateMachineRequest) => Promise<Machine>
  deleteMachine: (id: number) => Promise<void>
  getMachinesByCategory: (category: string) => Promise<Machine[]>
  getMachinesByDifficulty: (difficulty: string) => Promise<Machine[]>
  getMachinesByTarget: (target: string) => Promise<Machine[]>
}

const useMachines = (): UseMachinesReturn => {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // API 호출 제한을 위한 ref
  const lastFetchTime = useRef<number>(0)
  const FETCH_COOLDOWN = 1000 // 1초 쿨다운

  // API 응답 타입 검증 함수
  const validateMachineArray = (response: unknown): Machine[] => {
    if (!Array.isArray(response)) {
      console.warn("API 응답이 배열이 아닙니다:", response)
      return []
    }
    
    return response.filter((item): item is Machine => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as any).id === 'number' &&
        typeof (item as any).name === 'string'
      )
    })
  }

  // 모든 머신 조회
  const fetchMachines = useCallback(async (): Promise<Machine[]> => {
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
      
      const newMachines = validateMachineArray(response)
      console.log("검증된 머신 목록:", newMachines)
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

  // 단일 머신 타입 검증 함수
  const validateMachine = (response: unknown): Machine | null => {
    if (
      typeof response === 'object' &&
      response !== null &&
      typeof (response as any).id === 'number' &&
      typeof (response as any).name === 'string'
    ) {
      return response as Machine
    }
    console.warn("유효하지 않은 머신 데이터:", response)
    return null
  }

  // 특정 머신 조회
  const fetchMachine = useCallback(async (id: number): Promise<Machine> => {
    setLoading(true)
    setError(null)
    try {
      const response = await machineApi.getMachineById(id)
      const validatedMachine = validateMachine(response)
      
      if (!validatedMachine) {
        throw new Error("유효하지 않은 머신 데이터를 받았습니다.")
      }
      
      return validatedMachine
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
    async (machineData: CreateMachineRequest): Promise<Machine> => {
      setLoading(true)
      setError(null)
      try {
        const response = await machineApi.createMachine(machineData)
        const validatedMachine = validateMachine(response)
        
        if (!validatedMachine) {
          throw new Error("생성된 머신 데이터가 유효하지 않습니다.")
        }
        
        setMachines(prev => [validatedMachine, ...prev])
        showToast("머신이 성공적으로 생성되었습니다.", "success")
        return validatedMachine
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
    async (id: number, machineData: UpdateMachineRequest): Promise<Machine> => {
      setLoading(true)
      setError(null)
      try {
        const response = await machineApi.updateMachine(id, machineData)
        const validatedMachine = validateMachine(response)
        
        if (!validatedMachine) {
          throw new Error("수정된 머신 데이터가 유효하지 않습니다.")
        }
        
        setMachines(prev =>
          prev.map(machine => (machine.id === id ? validatedMachine : machine))
        )
        showToast("머신이 성공적으로 수정되었습니다.", "success")
        return validatedMachine
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
  const deleteMachine = useCallback(async (id: number): Promise<void> => {
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
    async (category: string): Promise<Machine[]> => {
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
        const validatedMachines = validateMachineArray(response)
        setMachines(validatedMachines)
        return validatedMachines
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
    async (difficulty: string): Promise<Machine[]> => {
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
        const validatedMachines = validateMachineArray(response)
        setMachines(validatedMachines)
        return validatedMachines
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
    async (target: string): Promise<Machine[]> => {
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
        const validatedMachines = validateMachineArray(response)
        setMachines(validatedMachines)
        return validatedMachines
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

export default useMachines