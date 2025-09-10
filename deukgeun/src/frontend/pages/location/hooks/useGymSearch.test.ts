import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGymSearch } from './useGymSearch'
import { fetchGymsByKeyword } from '../API/kakao'
import type { Gym } from '../types'

// Mock the API function
vi.mock('../API/kakao', () => ({
  fetchGymsByKeyword: vi.fn(),
}))

const mockFetchGymsByKeyword = vi.mocked(fetchGymsByKeyword)

describe('useGymSearch', () => {
  const mockGyms: Gym[] = [
    {
      id: '1',
      name: 'Test Gym 1',
      type: '짐',
      address: 'Test Address 1',
      phone: '010-1234-5678',
      latitude: 37.5665,
      longitude: 126.978,
      distance: 0.1,
    },
    {
      id: '2',
      name: 'Test Gym 2',
      type: '짐',
      address: 'Test Address 2',
      phone: '010-8765-4321',
      latitude: 37.5666,
      longitude: 126.979,
      distance: 0.2,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchGymsByKeyword.mockResolvedValue(mockGyms)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useGymSearch())

      expect(result.current.gyms).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.hasSearched).toBe(false)
    })

    it('초기 쿼리가 제공되면 검색이 실행된다', async () => {
      renderHook(() => useGymSearch({ initialQuery: '헬스장' }))

      await waitFor(() => {
        expect(mockFetchGymsByKeyword).toHaveBeenCalledWith('헬스장', {
          lat: 37.5665,
          lng: 126.978,
        })
      })
    })
  })

  describe('검색 기능', () => {
    it('검색이 성공적으로 실행된다', async () => {
      const { result } = renderHook(() => useGymSearch())

      await act(async () => {
        await result.current.searchGyms('헬스장')
      })

      expect(result.current.gyms).toEqual(mockGyms)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.hasSearched).toBe(true)
    })

    it('빈 쿼리로 검색하면 결과가 초기화된다', async () => {
      const { result } = renderHook(() => useGymSearch())

      // 먼저 검색 실행
      await act(async () => {
        await result.current.searchGyms('헬스장')
      })

      expect(result.current.gyms).toEqual(mockGyms)

      // 빈 쿼리로 검색
      await act(async () => {
        await result.current.searchGyms('')
      })

      expect(result.current.gyms).toEqual([])
      expect(result.current.hasSearched).toBe(false)
    })

    it('공백만 있는 쿼리로 검색하면 결과가 초기화된다', async () => {
      const { result } = renderHook(() => useGymSearch())

      // 먼저 검색 실행
      await act(async () => {
        await result.current.searchGyms('헬스장')
      })

      expect(result.current.gyms).toEqual(mockGyms)

      // 공백만 있는 쿼리로 검색
      await act(async () => {
        await result.current.searchGyms('   ')
      })

      expect(result.current.gyms).toEqual([])
      expect(result.current.hasSearched).toBe(false)
    })

    it('검색 중 로딩 상태가 올바르게 설정된다', async () => {
      const { result } = renderHook(() => useGymSearch())

      let searchPromise: Promise<void>

      await act(async () => {
        searchPromise = result.current.searchGyms('헬스장')
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        await searchPromise!
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('에러 처리', () => {
    it('API 에러가 발생하면 에러 상태가 설정된다', async () => {
      const errorMessage = 'API 에러 발생'
      mockFetchGymsByKeyword.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useGymSearch())

      await act(async () => {
        await result.current.searchGyms('헬스장')
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.gyms).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('알 수 없는 에러가 발생하면 기본 에러 메시지가 설정된다', async () => {
      mockFetchGymsByKeyword.mockRejectedValue('알 수 없는 에러')

      const { result } = renderHook(() => useGymSearch())

      await act(async () => {
        await result.current.searchGyms('헬스장')
      })

      expect(result.current.error).toBe('헬스장 검색 중 오류가 발생했습니다.')
      expect(result.current.gyms).toEqual([])
    })
  })

  describe('결과 제한', () => {
    it('maxResults 옵션이 올바르게 적용된다', async () => {
      const manyGyms = Array.from({ length: 10 }, (_, i) => ({
        ...mockGyms[0],
        id: `${i + 1}`,
        name: `Gym ${i + 1}`,
      }))

      mockFetchGymsByKeyword.mockResolvedValue(manyGyms)

      const { result } = renderHook(() => useGymSearch({ maxResults: 5 }))

      await act(async () => {
        await result.current.searchGyms('헬스장')
      })

      expect(result.current.gyms).toHaveLength(5)
    })
  })

  describe('디바운싱', () => {
    it('디바운싱이 올바르게 작동한다', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useGymSearch({ debounceMs: 300 }))

      // 연속으로 검색 호출
      act(() => {
        result.current.searchGyms('헬스장')
        result.current.searchGyms('헬스장2')
        result.current.searchGyms('헬스장3')
      })

      // 아직 API가 호출되지 않았어야 함
      expect(mockFetchGymsByKeyword).not.toHaveBeenCalled()

      // 타이머 진행
      act(() => {
        vi.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockFetchGymsByKeyword).toHaveBeenCalledTimes(1)
        expect(mockFetchGymsByKeyword).toHaveBeenCalledWith('헬스장3', {
          lat: 37.5665,
          lng: 126.978,
        })
      })

      vi.useRealTimers()
    })
  })

  describe('결과 초기화', () => {
    it('clearResults가 올바르게 작동한다', async () => {
      const { result } = renderHook(() => useGymSearch())

      // 먼저 검색 실행
      await act(async () => {
        await result.current.searchGyms('헬스장')
      })

      expect(result.current.gyms).toEqual(mockGyms)
      expect(result.current.hasSearched).toBe(true)

      // 결과 초기화
      act(() => {
        result.current.clearResults()
      })

      expect(result.current.gyms).toEqual([])
      expect(result.current.error).toBeNull()
      expect(result.current.hasSearched).toBe(false)
    })
  })

  describe('컴포넌트 언마운트', () => {
    it('컴포넌트 언마운트 시 타이머가 정리된다', () => {
      vi.useFakeTimers()

      const { unmount } = renderHook(() => useGymSearch({ debounceMs: 300 }))

      // 디바운스 타이머 설정
      act(() => {
        const { result } = renderHook(() => useGymSearch({ debounceMs: 300 }))
        result.current.searchGyms('헬스장')
      })

      // 컴포넌트 언마운트
      unmount()

      // 타이머가 정리되었는지 확인
      expect(() => {
        vi.advanceTimersByTime(300)
      }).not.toThrow()

      vi.useRealTimers()
    })
  })
})
