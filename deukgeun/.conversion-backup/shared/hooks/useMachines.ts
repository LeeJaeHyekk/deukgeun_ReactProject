import { useState, useEffect } from 'react'
import type { MachineDTO } from '@shared/types/dto/machine.dto'
import { machineApi } from '@shared/api/machineApi'

export function useMachines() {
  const [machines, setMachines] = useState<MachineDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMachines = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await machineApi.getMachines()
      setMachines(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch machines')
    } finally {
      setIsLoading(false)
    }
  }

  const getMachineById = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const machine = await machineApi.getMachineById(id)
      return machine
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch machine')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()
  }, [])

  return {
    machines,
    isLoading,
    error,
    fetchMachines,
    getMachineById,
  }
}
