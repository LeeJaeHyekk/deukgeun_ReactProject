// ============================================================================
// 머신 관련 훅
// ============================================================================

import { useState, useCallback, useEffect } from "react"
import { machineApi } from "@shared/api"
import { MachineDTO } from "@shared/types/dto"

interface UseMachinesOptions {
  autoFetch?: boolean
  initialFilters?: Record<string, any>
}

export function useMachines(options: UseMachinesOptions = {}) {
  const { autoFetch = true, initialFilters = {} } = options

  const [machines, setMachines] = useState<MachineDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState(initialFilters)

  // 머신 목록 조회
  const fetchMachines = useCallback(async (params?: any) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await machineApi.getMachines(params)
      const newMachines = (response.machines || []) as MachineDTO[]
      setMachines(newMachines)

      return newMachines
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "머신 목록 조회에 실패했습니다."
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 머신 상세 조회
  const fetchMachine = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await machineApi.getMachine(id)
      const newMachine = response.machine as MachineDTO

      if (newMachine) {
        setMachines(prev => {
          const existingIndex = prev.findIndex(m => m.id.toString() === id)
          if (existingIndex >= 0) {
            return prev.map(machine =>
              machine.id.toString() === id ? newMachine : machine
            )
          } else {
            return [...prev, newMachine]
          }
        })
      }

      return newMachine
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "머신 조회에 실패했습니다."
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 머신 생성
  const createMachine = useCallback(async (machineData: any) => {
    try {
      setIsLoading(true)
      setError(null)

      const newMachine = (await machineApi.createMachine(
        machineData
      )) as MachineDTO

      if (newMachine) {
        setMachines(prev => [...prev, newMachine])
      }

      return newMachine
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "머신 생성에 실패했습니다."
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 머신 수정
  const updateMachine = useCallback(async (id: string, machineData: any) => {
    try {
      setIsLoading(true)
      setError(null)

      const updatedMachine = (await machineApi.updateMachine(
        id,
        machineData
      )) as unknown as MachineDTO

      if (updatedMachine) {
        setMachines(prev =>
          prev.map(machine =>
            machine.id.toString() === id ? updatedMachine : machine
          )
        )
      }

      return updatedMachine
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "머신 수정에 실패했습니다."
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 머신 삭제
  const deleteMachine = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await machineApi.deleteMachine(id)

      setMachines(prev => prev.filter(machine => machine.id.toString() !== id))

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "머신 삭제에 실패했습니다."
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 머신 검색
  const searchMachines = useCallback(
    async (query: string) => {
      try {
        setIsLoading(true)
        setError(null)

        // 검색 기능이 없는 경우 기본 필터링 사용
        try {
          const response = await machineApi.searchMachines(query)
          return (response.machines || []) as MachineDTO[]
        } catch {
          // 기본 검색 구현
          const allMachines = await fetchMachines()
          return allMachines.filter((machine: MachineDTO) =>
            machine.name.toLowerCase().includes(query.toLowerCase())
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "머신 검색에 실패했습니다."
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [fetchMachines]
  )

  // 머신 필터링
  const filterMachines = useCallback(
    async (filterParams: any) => {
      try {
        setIsLoading(true)
        setError(null)

        // 필터 기능이 없는 경우 기본 필터링 사용
        try {
          const response = await machineApi.filterMachines(filterParams)
          return (response.machines || []) as MachineDTO[]
        } catch {
          // 기본 필터링 구현
          const allMachines = await fetchMachines()
          return allMachines.filter((machine: MachineDTO) => {
            if (
              filterParams.category &&
              machine.category !== filterParams.category
            ) {
              return false
            }
            // MachineDTO에 status 속성이 없으므로 제거
            return true
          })
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "머신 필터링에 실패했습니다."
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [fetchMachines]
  )

  // 초기 데이터 로드
  useEffect(() => {
    if (autoFetch) {
      fetchMachines()
    }
  }, [autoFetch, fetchMachines])

  return {
    machines,
    isLoading,
    error,
    filters,
    fetchMachines,
    fetchMachine,
    createMachine,
    updateMachine,
    deleteMachine,
    searchMachines,
    filterMachines,
    setFilters,
  }
}
