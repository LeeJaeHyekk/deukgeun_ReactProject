import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWorkoutPlans } from './useWorkoutPlans'
import { workoutApi } from '../api/workoutApi'
import type { WorkoutPlan } from '../types'

// Mock the API
vi.mock('../api/workoutApi', () => ({
  workoutApi: {
    getPlans: vi.fn(),
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
    deletePlan: vi.fn(),
  },
}))

const mockWorkoutApi = vi.mocked(workoutApi)

describe('useWorkoutPlans', () => {
  const mockPlans: WorkoutPlan[] = [
    {
      id: 1,
      userId: 1,
      name: 'Test Plan 1',
      description: 'Test Description 1',
      difficulty: 'beginner',
      estimatedDurationMinutes: 60,
      targetMuscleGroups: [],
      isTemplate: false,
      isPublic: false,
      exercises: [],
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      userId: 1,
      name: 'Test Plan 2',
      description: 'Test Description 2',
      difficulty: 'intermediate',
      estimatedDurationMinutes: 90,
      targetMuscleGroups: [],
      isTemplate: false,
      isPublic: false,
      exercises: [],
      status: 'active',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ]

  const mockNewPlan: WorkoutPlan = {
    id: 3,
    userId: 1,
    name: 'New Plan',
    description: 'New Description',
    difficulty: 'beginner',
    estimatedDurationMinutes: 45,
    targetMuscleGroups: [],
    isTemplate: false,
    isPublic: false,
    exercises: [],
    status: 'active',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useWorkoutPlans())

      expect(result.current.plans).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('getUserPlans', () => {
    it('운동 계획 목록을 성공적으로 가져온다', async () => {
      mockWorkoutApi.getPlans.mockResolvedValue(mockPlans)

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(result.current.plans).toEqual(mockPlans)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockWorkoutApi.getPlans).toHaveBeenCalledTimes(1)
    })

    it('API 에러가 발생하면 에러 상태가 설정된다', async () => {
      const errorMessage = 'API 에러 발생'
      mockWorkoutApi.getPlans.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.plans).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('알 수 없는 에러가 발생하면 기본 에러 메시지가 설정된다', async () => {
      mockWorkoutApi.getPlans.mockRejectedValue('알 수 없는 에러')

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(result.current.error).toBe('운동 계획을 불러오는데 실패했습니다.')
    })

    it('로딩 상태가 올바르게 관리된다', async () => {
      let resolvePromise: (value: WorkoutPlan[]) => void
      const promise = new Promise<WorkoutPlan[]>(resolve => {
        resolvePromise = resolve
      })
      mockWorkoutApi.getPlans.mockReturnValue(promise)

      const { result } = renderHook(() => useWorkoutPlans())

      // 비동기 작업 시작
      act(() => {
        result.current.getUserPlans()
      })

      expect(result.current.loading).toBe(true)

      // 비동기 작업 완료
      await act(async () => {
        resolvePromise!(mockPlans)
        await promise
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('createPlan', () => {
    it('새로운 운동 계획을 성공적으로 생성한다', async () => {
      const planData = {
        name: 'New Plan',
        description: 'New Description',
        difficulty: 'beginner' as const,
        estimatedDurationMinutes: 45,
        targetMuscleGroups: [],
        isTemplate: false,
        isPublic: false,
        exercises: [],
      }

      mockWorkoutApi.createPlan.mockResolvedValue(mockNewPlan)

      const { result } = renderHook(() => useWorkoutPlans())

      let createdPlan: WorkoutPlan
      await act(async () => {
        createdPlan = await result.current.createPlan(planData)
      })

      expect(createdPlan!).toEqual(mockNewPlan)
      expect(result.current.plans).toContain(mockNewPlan)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockWorkoutApi.createPlan).toHaveBeenCalledWith(planData)
    })

    it('userId가 제거된 데이터로 API를 호출한다', async () => {
      const planData = {
        userId: 1, // 이 필드는 제거되어야 함
        name: 'New Plan',
        description: 'New Description',
        difficulty: 'beginner' as const,
        estimatedDurationMinutes: 45,
        targetMuscleGroups: [],
        isTemplate: false,
        isPublic: false,
        exercises: [],
      }

      mockWorkoutApi.createPlan.mockResolvedValue(mockNewPlan)

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.createPlan(planData)
      })

      expect(mockWorkoutApi.createPlan).toHaveBeenCalledWith({
        name: 'New Plan',
        description: 'New Description',
        difficulty: 'beginner',
        estimatedDurationMinutes: 45,
        targetMuscleGroups: [],
        isTemplate: false,
        isPublic: false,
        exercises: [],
      })
    })

    it('생성 실패 시 에러 상태가 설정된다', async () => {
      const planData = {
        name: 'New Plan',
        description: 'New Description',
        difficulty: 'beginner' as const,
        estimatedDurationMinutes: 45,
        targetMuscleGroups: [],
        isTemplate: false,
        isPublic: false,
        exercises: [],
      }

      const errorMessage = '생성 실패'
      mockWorkoutApi.createPlan.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.createPlan(planData)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('updatePlan', () => {
    it('운동 계획을 성공적으로 업데이트한다', async () => {
      const updatedPlan = {
        ...mockPlans[0],
        name: 'Updated Plan',
        description: 'Updated Description',
      }

      mockWorkoutApi.updatePlan.mockResolvedValue(updatedPlan)

      const { result } = renderHook(() => useWorkoutPlans())

      // 초기 상태 설정
      act(() => {
        result.current.plans = mockPlans
      })

      let returnedPlan: WorkoutPlan
      await act(async () => {
        returnedPlan = await result.current.updatePlan(1, {
          name: 'Updated Plan',
          description: 'Updated Description',
        })
      })

      expect(returnedPlan!).toEqual(updatedPlan)
      expect(result.current.plans[0]).toEqual(updatedPlan)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('업데이트 실패 시 에러 상태가 설정된다', async () => {
      const errorMessage = '업데이트 실패'
      mockWorkoutApi.updatePlan.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.updatePlan(1, { name: 'Updated Plan' })
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('deletePlan', () => {
    it('운동 계획을 성공적으로 삭제한다', async () => {
      mockWorkoutApi.deletePlan.mockResolvedValue(undefined)

      const { result } = renderHook(() => useWorkoutPlans())

      // 초기 상태 설정
      act(() => {
        result.current.plans = mockPlans
      })

      await act(async () => {
        await result.current.deletePlan(1)
      })

      expect(result.current.plans).toHaveLength(1)
      expect(result.current.plans[0].id).toBe(2)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockWorkoutApi.deletePlan).toHaveBeenCalledWith(1)
    })

    it('삭제 실패 시 에러 상태가 설정된다', async () => {
      const errorMessage = '삭제 실패'
      mockWorkoutApi.deletePlan.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.deletePlan(1)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('로딩 상태 관리', () => {
    it('모든 작업에서 로딩 상태가 올바르게 관리된다', async () => {
      const { result } = renderHook(() => useWorkoutPlans())

      // getUserPlans 로딩 테스트
      let resolveGetPlans: (value: WorkoutPlan[]) => void
      const getPlansPromise = new Promise<WorkoutPlan[]>(resolve => {
        resolveGetPlans = resolve
      })
      mockWorkoutApi.getPlans.mockReturnValue(getPlansPromise)

      act(() => {
        result.current.getUserPlans()
      })
      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolveGetPlans!(mockPlans)
        await getPlansPromise
      })
      expect(result.current.loading).toBe(false)

      // createPlan 로딩 테스트
      let resolveCreatePlan: (value: WorkoutPlan) => void
      const createPlanPromise = new Promise<WorkoutPlan>(resolve => {
        resolveCreatePlan = resolve
      })
      mockWorkoutApi.createPlan.mockReturnValue(createPlanPromise)

      act(() => {
        result.current.createPlan({
          name: 'Test',
          difficulty: 'beginner' as const,
          estimatedDurationMinutes: 30,
          targetMuscleGroups: [],
          isTemplate: false,
          isPublic: false,
          exercises: [],
        })
      })
      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolveCreatePlan!(mockNewPlan)
        await createPlanPromise
      })
      expect(result.current.loading).toBe(false)
    })
  })

  describe('에러 처리', () => {
    it('에러 발생 시 이전 상태가 유지된다', async () => {
      const { result } = renderHook(() => useWorkoutPlans())

      // 초기 상태 설정
      act(() => {
        result.current.plans = mockPlans
      })

      mockWorkoutApi.getPlans.mockRejectedValue(new Error('API 에러'))

      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(result.current.plans).toEqual(mockPlans) // 이전 상태 유지
      expect(result.current.error).toBe('API 에러')
    })
  })
})
