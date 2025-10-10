// ============================================================================
// API 검증 유틸리티 테스트
// ============================================================================

import {
  isValidApiResponse,
  parseApiResponse,
  createApiError,
  TypedApiClient,
  isValidUser,
  isValidMachine,
  isValidWorkoutPlan,
  isValidWorkoutGoal,
  isValidArray,
  isValidUserArray,
  isValidMachineArray,
  isValidWorkoutPlanArray,
  isValidWorkoutGoalArray
} from '../apiValidation'
import type { User, Machine, WorkoutPlan, WorkoutGoal, ApiResponse } from '@shared/types'

// Mock fetch
global.fetch = jest.fn()

describe('API 검증 유틸리티', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isValidApiResponse', () => {
    it('유효한 API 응답을 검증해야 한다', () => {
      const validResponse: ApiResponse<string> = {
        success: true,
        data: 'test data',
        message: 'Success',
        timestamp: '2023-01-01T00:00:00Z'
      }

      expect(isValidApiResponse(validResponse)).toBe(true)
    })

    it('최소한의 유효한 API 응답을 검증해야 한다', () => {
      const minimalResponse: ApiResponse<number> = {
        success: false,
        data: 123
      }

      expect(isValidApiResponse(minimalResponse)).toBe(true)
    })

    it('유효하지 않은 API 응답을 거부해야 한다', () => {
      const invalidResponses = [
        null,
        undefined,
        'string',
        123,
        { success: 'true' }, // boolean이 아님
        { data: 'test' }, // success 필드 없음
        { success: true }, // data 필드 없음
        { success: true, data: 'test', message: 123 }, // message가 string이 아님
      ]

      invalidResponses.forEach(response => {
        expect(isValidApiResponse(response)).toBe(false)
      })
    })
  })

  describe('parseApiResponse', () => {
    it('유효한 응답을 파싱해야 한다', () => {
      const validResponse: ApiResponse<string> = {
        success: true,
        data: 'test data'
      }

      const result = parseApiResponse<string>(validResponse)
      expect(result).toEqual(validResponse)
    })

    it('유효하지 않은 응답에 대해 에러를 던져야 한다', () => {
      const invalidResponse = { invalid: 'response' }

      expect(() => {
        parseApiResponse(invalidResponse)
      }).toThrow('Invalid API response format')
    })
  })

  describe('createApiError', () => {
    it('API 에러를 생성해야 한다', () => {
      const error = createApiError('Test error', 400)
      
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error')
      expect((error as any).statusCode).toBe(400)
    })

    it('기본 상태 코드를 사용해야 한다', () => {
      const error = createApiError('Test error')
      
      expect((error as any).statusCode).toBe(500)
    })
  })

  describe('TypedApiClient', () => {
    let client: TypedApiClient

    beforeEach(() => {
      client = new TypedApiClient('http://localhost:3000')
    })

    describe('GET 요청', () => {
      it('성공적인 GET 요청을 처리해야 한다', async () => {
        const mockResponse: ApiResponse<string> = {
          success: true,
          data: 'test data'
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await client.get<string>('/test')
        
        expect(result).toBe('test data')
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3000/test',
          expect.objectContaining({
            method: 'GET',
            headers: expect.any(Object)
          })
        )
      })

      it('HTTP 에러를 처리해야 한다', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })

        await expect(client.get('/test')).rejects.toThrow('HTTP 404: Not Found')
      })

      it('네트워크 에러를 처리해야 한다', async () => {
        ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        await expect(client.get('/test')).rejects.toThrow('Network error')
      })
    })

    describe('POST 요청', () => {
      it('성공적인 POST 요청을 처리해야 한다', async () => {
        const mockResponse: ApiResponse<{ id: number }> = {
          success: true,
          data: { id: 1 }
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const requestData = { name: 'test' }
        const result = await client.post<{ id: number }>('/test', requestData)
        
        expect(result).toEqual({ id: 1 })
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3000/test',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(requestData)
          })
        )
      })
    })

    describe('PUT 요청', () => {
      it('성공적인 PUT 요청을 처리해야 한다', async () => {
        const mockResponse: ApiResponse<{ updated: boolean }> = {
          success: true,
          data: { updated: true }
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const requestData = { name: 'updated' }
        const result = await client.put<{ updated: boolean }>('/test/1', requestData)
        
        expect(result).toEqual({ updated: true })
      })
    })

    describe('DELETE 요청', () => {
      it('성공적인 DELETE 요청을 처리해야 한다', async () => {
        const mockResponse: ApiResponse<null> = {
          success: true,
          data: null
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await client.delete<null>('/test/1')
        
        expect(result).toBeNull()
      })
    })
  })

  describe('엔티티 타입 검증', () => {
    const validUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      phone: '010-1234-5678',
      birthDate: new Date('1990-01-01'),
      gender: 'male',
      height: 175,
      weight: 70,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }

    const validMachine: Machine = {
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

    const validWorkoutPlan: WorkoutPlan = {
      id: 1,
      userId: 1,
      name: 'Test Plan',
      description: 'Test Description',
      difficulty: 'beginner',
      estimatedDurationMinutes: 60,
      targetMuscleGroups: ['chest'],
      isTemplate: false,
      isPublic: false,
      exercises: [],
      status: 'active',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }

    const validWorkoutGoal: WorkoutGoal = {
      id: 1,
      userId: 1,
      title: 'Test Goal',
      description: 'Test Description',
      type: 'weight',
      unit: 'kg',
      targetValue: 80,
      currentValue: 70,
      isCompleted: false,
      deadline: '2023-12-31',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }

    describe('isValidUser', () => {
      it('유효한 사용자를 검증해야 한다', () => {
        expect(isValidUser(validUser)).toBe(true)
      })

      it('유효하지 않은 사용자를 거부해야 한다', () => {
        const invalidUsers = [
          null,
          undefined,
          'string',
          { id: 'invalid' },
          { id: 1, email: 123 },
          { id: 1, email: 'test@example.com' }, // name 필드 없음
        ]

        invalidUsers.forEach(user => {
          expect(isValidUser(user)).toBe(false)
        })
      })
    })

    describe('isValidMachine', () => {
      it('유효한 머신을 검증해야 한다', () => {
        expect(isValidMachine(validMachine)).toBe(true)
      })

      it('유효하지 않은 머신을 거부해야 한다', () => {
        const invalidMachines = [
          null,
          undefined,
          'string',
          { id: 'invalid' },
          { id: 1, name: 123 },
          { id: 1, name: 'Test', description: 123 },
        ]

        invalidMachines.forEach(machine => {
          expect(isValidMachine(machine)).toBe(false)
        })
      })
    })

    describe('isValidWorkoutPlan', () => {
      it('유효한 운동 계획을 검증해야 한다', () => {
        expect(isValidWorkoutPlan(validWorkoutPlan)).toBe(true)
      })

      it('유효하지 않은 운동 계획을 거부해야 한다', () => {
        const invalidPlans = [
          null,
          undefined,
          'string',
          { id: 'invalid' },
          { id: 1, name: 123 },
          { id: 1, name: 'Test', difficulty: 'invalid' },
        ]

        invalidPlans.forEach(plan => {
          expect(isValidWorkoutPlan(plan)).toBe(false)
        })
      })
    })

    describe('isValidWorkoutGoal', () => {
      it('유효한 운동 목표를 검증해야 한다', () => {
        expect(isValidWorkoutGoal(validWorkoutGoal)).toBe(true)
      })

      it('유효하지 않은 운동 목표를 거부해야 한다', () => {
        const invalidGoals = [
          null,
          undefined,
          'string',
          { id: 'invalid' },
          { id: 1, title: 123 },
          { id: 1, title: 'Test', targetValue: 'invalid' },
        ]

        invalidGoals.forEach(goal => {
          expect(isValidWorkoutGoal(goal)).toBe(false)
        })
      })
    })

    describe('배열 검증', () => {
      it('isValidArray가 올바르게 작동해야 한다', () => {
        const validItems = [validUser, validUser]
        const invalidItems = [validUser, { id: 'invalid' }]

        expect(isValidArray(validItems, isValidUser)).toBe(true)
        expect(isValidArray(invalidItems, isValidUser)).toBe(false)
        expect(isValidArray('not array', isValidUser)).toBe(false)
      })

      it('isValidUserArray가 올바르게 작동해야 한다', () => {
        const validUsers = [validUser, validUser]
        const invalidUsers = [validUser, { id: 'invalid' }]

        expect(isValidUserArray(validUsers)).toBe(true)
        expect(isValidUserArray(invalidUsers)).toBe(false)
      })

      it('isValidMachineArray가 올바르게 작동해야 한다', () => {
        const validMachines = [validMachine, validMachine]
        const invalidMachines = [validMachine, { id: 'invalid' }]

        expect(isValidMachineArray(validMachines)).toBe(true)
        expect(isValidMachineArray(invalidMachines)).toBe(false)
      })

      it('isValidWorkoutPlanArray가 올바르게 작동해야 한다', () => {
        const validPlans = [validWorkoutPlan, validWorkoutPlan]
        const invalidPlans = [validWorkoutPlan, { id: 'invalid' }]

        expect(isValidWorkoutPlanArray(validPlans)).toBe(true)
        expect(isValidWorkoutPlanArray(invalidPlans)).toBe(false)
      })

      it('isValidWorkoutGoalArray가 올바르게 작동해야 한다', () => {
        const validGoals = [validWorkoutGoal, validWorkoutGoal]
        const invalidGoals = [validWorkoutGoal, { id: 'invalid' }]

        expect(isValidWorkoutGoalArray(validGoals)).toBe(true)
        expect(isValidWorkoutGoalArray(invalidGoals)).toBe(false)
      })
    })
  })

  describe('타입 안전성', () => {
    it('타입 가드 함수들이 올바른 타입을 반환해야 한다', () => {
      const user: unknown = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }

      if (isValidUser(user)) {
        // TypeScript가 user를 User 타입으로 인식해야 함
        expect(typeof user.id).toBe('number')
        expect(typeof user.email).toBe('string')
        expect(typeof user.name).toBe('string')
      }
    })

    it('TypedApiClient가 올바른 타입을 반환해야 한다', async () => {
      const client = new TypedApiClient('http://localhost:3000')
      
      const mockResponse: ApiResponse<{ id: number }> = {
        success: true,
        data: { id: 1 }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await client.get<{ id: number }>('/test')
      
      // TypeScript가 result를 { id: number } 타입으로 인식해야 함
      expect(typeof result.id).toBe('number')
    })
  })
})
