const { useState, useEffect  } = require('react')
const { Machine  } = require('@shared/types/dto/machine.dto')
const { machineApi  } = require('@shared/api/machineApi')

function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
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
