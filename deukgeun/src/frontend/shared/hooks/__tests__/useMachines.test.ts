// ============================================================================
// useMachines 훅 테스트
// ============================================================================

import { renderHook, act, waitFor } from '@testing-library/react'
import { useMachines } from '../useMachines'
import { machineApi } from '@shared/api/machineApi'
import { showToast } from '@shared/lib'
import type { Machine, CreateMachineRequest, UpdateMachineRequest } from '@shared/types'

// Mock dependencies
jest.mock('@shared/api/machineApi')
jest.mock('@shared/lib', () => ({
  showToast: jest.fn()
}))

const mockMachineApi = machineApi as jest.Mocked<typeof machineApi>
const mockShowToast = showToast as jest.MockedFunction<typeof showToast>

// Test data
const mockMachine: Machine = {
  id: 1,
  name: 'Test Machine',
  description: 'Test Description',
  category: 'strength',
  difficulty: 'beginner',
  targetMuscle: 'chest',
  imageUrl: 'test.jpg',
  videoUrl: 'test.mp4',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
}

const mockMachines: Machine[] = [mockMachine]

describe('useMachines', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useMachines())

      expect(result.current.machines).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  describe('fetchMachines', () => {
    it('머신 목록을 성공적으로 가져와야 한다', async () => {
      mockMachineApi.getMachines.mockResolvedValue(mockMachines)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        await result.current.fetchMachines()
      })

      expect(result.current.machines).toEqual(mockMachines)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('API 에러 시 에러 상태를 설정해야 한다', async () => {
      const errorMessage = 'API Error'
      mockMachineApi.getMachines.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        try {
          await result.current.fetchMachines()
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.machines).toEqual([])
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error')
    })

    it('유효하지 않은 응답 데이터를 필터링해야 한다', async () => {
      const invalidResponse = [
        mockMachine,
        { id: 'invalid', name: 123 }, // Invalid data
        { id: 2, name: 'Valid Machine', description: 'Valid' } // Missing required fields
      ]
      mockMachineApi.getMachines.mockResolvedValue(invalidResponse as any)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        await result.current.fetchMachines()
      })

      // Only valid machines should be included
      expect(result.current.machines).toHaveLength(1)
      expect(result.current.machines[0]).toEqual(mockMachine)
    })

    it('API 호출 제한이 작동해야 한다', async () => {
      mockMachineApi.getMachines.mockResolvedValue(mockMachines)

      const { result } = renderHook(() => useMachines())

      // First call
      await act(async () => {
        await result.current.fetchMachines()
      })

      // Second call within cooldown period
      await act(async () => {
        await result.current.fetchMachines()
      })

      // Should only call API once due to cooldown
      expect(mockMachineApi.getMachines).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchMachine', () => {
    it('특정 머신을 성공적으로 가져와야 한다', async () => {
      mockMachineApi.getMachineById.mockResolvedValue(mockMachine)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        const machine = await result.current.fetchMachine(1)
        expect(machine).toEqual(mockMachine)
      })

      expect(mockMachineApi.getMachineById).toHaveBeenCalledWith(1)
    })

    it('유효하지 않은 머신 데이터 시 에러를 던져야 한다', async () => {
      const invalidMachine = { id: 'invalid', name: 123 }
      mockMachineApi.getMachineById.mockResolvedValue(invalidMachine as any)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        try {
          await result.current.fetchMachine(1)
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toBe('유효하지 않은 머신 데이터를 받았습니다.')
        }
      })
    })
  })

  describe('createMachine', () => {
    it('머신을 성공적으로 생성해야 한다', async () => {
      const newMachine: CreateMachineRequest = {
        name: 'New Machine',
        description: 'New Description',
        category: 'strength',
        difficulty: 'beginner',
        targetMuscle: 'chest'
      }

      mockMachineApi.createMachine.mockResolvedValue(mockMachine)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        const createdMachine = await result.current.createMachine(newMachine)
        expect(createdMachine).toEqual(mockMachine)
      })

      expect(result.current.machines).toContain(mockMachine)
      expect(mockShowToast).toHaveBeenCalledWith('머신이 성공적으로 생성되었습니다.', 'success')
    })

    it('생성 실패 시 에러를 처리해야 한다', async () => {
      const newMachine: CreateMachineRequest = {
        name: 'New Machine',
        description: 'New Description',
        category: 'strength',
        difficulty: 'beginner',
        targetMuscle: 'chest'
      }

      const errorMessage = 'Creation failed'
      mockMachineApi.createMachine.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        try {
          await result.current.createMachine(newMachine)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe(errorMessage)
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error')
    })
  })

  describe('updateMachine', () => {
    it('머신을 성공적으로 업데이트해야 한다', async () => {
      const updatedMachine = { ...mockMachine, name: 'Updated Machine' }
      const updateData: UpdateMachineRequest = {
        name: 'Updated Machine'
      }

      mockMachineApi.updateMachine.mockResolvedValue(updatedMachine)

      const { result } = renderHook(() => useMachines())
      
      // Set initial machines
      act(() => {
        result.current.machines.push(mockMachine)
      })

      await act(async () => {
        const result = await result.current.updateMachine(1, updateData)
        expect(result).toEqual(updatedMachine)
      })

      expect(mockShowToast).toHaveBeenCalledWith('머신이 성공적으로 수정되었습니다.', 'success')
    })
  })

  describe('deleteMachine', () => {
    it('머신을 성공적으로 삭제해야 한다', async () => {
      mockMachineApi.deleteMachine.mockResolvedValue(undefined)

      const { result } = renderHook(() => useMachines())
      
      // Set initial machines
      act(() => {
        result.current.machines.push(mockMachine)
      })

      await act(async () => {
        await result.current.deleteMachine(1)
      })

      expect(result.current.machines).not.toContain(mockMachine)
      expect(mockShowToast).toHaveBeenCalledWith('머신이 성공적으로 삭제되었습니다.', 'success')
    })
  })

  describe('getMachinesByCategory', () => {
    it('카테고리별 머신을 가져와야 한다', async () => {
      mockMachineApi.getMachinesByCategory.mockResolvedValue(mockMachines)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        const machines = await result.current.getMachinesByCategory('strength')
        expect(machines).toEqual(mockMachines)
      })

      expect(mockMachineApi.getMachinesByCategory).toHaveBeenCalledWith('strength')
    })
  })

  describe('getMachinesByDifficulty', () => {
    it('난이도별 머신을 가져와야 한다', async () => {
      mockMachineApi.getMachinesByCategory.mockResolvedValue(mockMachines)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        const machines = await result.current.getMachinesByDifficulty('beginner')
        expect(machines).toEqual(mockMachines)
      })

      expect(mockMachineApi.getMachinesByCategory).toHaveBeenCalledWith('beginner')
    })
  })

  describe('getMachinesByTarget', () => {
    it('타겟별 머신을 가져와야 한다', async () => {
      mockMachineApi.getMachinesByCategory.mockResolvedValue(mockMachines)

      const { result } = renderHook(() => useMachines())

      await act(async () => {
        const machines = await result.current.getMachinesByTarget('chest')
        expect(machines).toEqual(mockMachines)
      })

      expect(mockMachineApi.getMachinesByCategory).toHaveBeenCalledWith('chest')
    })
  })

  describe('타입 안전성', () => {
    it('반환 타입이 올바르게 정의되어야 한다', () => {
      const { result } = renderHook(() => useMachines())

      // TypeScript 컴파일 타임에 타입 체크
      expect(typeof result.current.machines).toBe('object')
      expect(typeof result.current.loading).toBe('boolean')
      expect(typeof result.current.error).toBe('string' || 'object')
      expect(typeof result.current.fetchMachines).toBe('function')
      expect(typeof result.current.fetchMachine).toBe('function')
      expect(typeof result.current.createMachine).toBe('function')
      expect(typeof result.current.updateMachine).toBe('function')
      expect(typeof result.current.deleteMachine).toBe('function')
      expect(typeof result.current.getMachinesByCategory).toBe('function')
      expect(typeof result.current.getMachinesByDifficulty).toBe('function')
      expect(typeof result.current.getMachinesByTarget).toBe('function')
    })
  })
})
