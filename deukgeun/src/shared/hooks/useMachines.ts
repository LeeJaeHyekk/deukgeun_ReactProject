import { useState, useEffect } from 'react'
import { Machine } from '@shared/types/dto/machine.dto'
import axios from 'axios'

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMachines = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get('/api/machines')
      const data = response.data
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
      const response = await axios.get(`/api/machines/${id}`)
      const machine = response.data
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
