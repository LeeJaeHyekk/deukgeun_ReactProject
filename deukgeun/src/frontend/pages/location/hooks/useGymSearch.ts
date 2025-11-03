import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@frontend/shared/store'
import {
  fetchGymsByKeyword,
  fetchAllGyms,
  setKeyword,
  setPosition,
  setFilters,
  setSort,
  selectGyms,
  selectAllGyms,
  selectLoading,
  selectKeyword,
  selectPosition,
  selectFilters,
  selectSortBy,
  selectSortDirection,
  selectMaxDistance,
  selectError,
} from '../slices/locationSlice'
import { FilterOption, SortOption, SortDirection, Gym } from '../types'

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export const useGymSearch = () => {
  const dispatch = useDispatch<AppDispatch>()
  const gyms = useSelector(selectGyms)
  const allGyms = useSelector(selectAllGyms)
  const isLoading = useSelector(selectLoading)
  const keyword = useSelector(selectKeyword)
  const position = useSelector(selectPosition)
  const filters = useSelector(selectFilters)
  const sortBy = useSelector(selectSortBy)
  const sortDirection = useSelector(selectSortDirection)
  const maxDistance = useSelector(selectMaxDistance)
  const error = useSelector(selectError)

  // 디바운싱된 키워드 업데이트
  const updateKeyword = useCallback((value: string) => {
    dispatch(setKeyword(value))
    
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = setTimeout(() => {
      if (value.trim()) {
        dispatch(fetchGymsByKeyword(value))
      } else {
        dispatch(fetchAllGyms())
      }
    }, 400)
  }, [dispatch])

  // 필터 업데이트
  const updateFilters = useCallback((newFilters: FilterOption[]) => {
    dispatch(setFilters(newFilters))
  }, [dispatch])

  // 정렬 업데이트
  const updateSort = useCallback((sortBy: SortOption, sortDirection: SortDirection) => {
    dispatch(setSort({ sortBy, sortDirection }))
  }, [dispatch])

  // 최대 거리 업데이트
  const updateMaxDistance = useCallback((distance: number) => {
    dispatch({ type: 'location/setMaxDistance', payload: distance })
  }, [dispatch])

  // ✅ 현재 위치 감지 (최초 로드 시 한 번)
  useEffect(() => {
    if (!position) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            dispatch(setPosition({ lat: latitude, lng: longitude }))
            console.log('📍 현재 위치 감지 성공:', { latitude, longitude })
          },
          (err) => {
            console.warn('⚠️ 위치 정보를 가져올 수 없습니다:', err.message)
            // 위치 권한이 거부된 경우 서울 시청 좌표를 기본값으로 사용
            dispatch(setPosition({ lat: 37.5665, lng: 126.9780 }))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5분
          }
        )
      } else {
        console.warn('⚠️ Geolocation API를 지원하지 않습니다.')
        // 기본값으로 서울 시청 좌표 사용
        dispatch(setPosition({ lat: 37.5665, lng: 126.9780 }))
      }
    }
  }, [dispatch, position])

  // 최초 데이터 로드 (한 번만 실행) - 초기 데이터가 이미 있으므로 필요시에만 추가 로드
  useEffect(() => {
    // 초기 데이터가 없고 로딩 중이 아닐 때만 추가 데이터 로드
    if (allGyms.length <= 5 && !isLoading) {
      dispatch(fetchAllGyms())
    }
  }, [dispatch, allGyms.length, isLoading])

  // 위치가 변경되면 모든 헬스장 데이터 다시 로드
  useEffect(() => {
    if (position && allGyms.length > 0) {
      // 위치가 설정되면 거리 정보가 자동으로 계산되고 정렬됨
      console.log('📍 위치 변경으로 인한 데이터 업데이트')
    }
  }, [position, allGyms.length])

  // 거리 기반 필터링된 헬스장 목록
  const nearbyGyms = gyms.filter((gym: Gym) => {
    if (!gym.distance) return false
    return gym.distance <= maxDistance
  })

  // 표시할 헬스장 목록 (검색 결과가 있으면 gyms, 없으면 allGyms)
  const displayGyms = gyms.length > 0 ? gyms : allGyms

  // 검색 결과가 없을 때 표시할 메시지
  const getEmptyMessage = () => {
    if (keyword.trim()) {
      return `"${keyword}"에 대한 검색 결과가 없습니다.`
    }
    if (filters.length > 0) {
      return '선택한 필터에 맞는 헬스장이 없습니다.'
    }
    if (maxDistance < 50) {
      return `${maxDistance}km 이내의 헬스장이 없습니다.`
    }
    return '표시할 헬스장이 없습니다.'
  }

  return {
    // 데이터
    gyms: displayGyms, // 표시할 헬스장 목록
    allGyms,
    nearbyGyms,
    isLoading,
    error,
    
    // 상태
    keyword,
    position,
    filters,
    sortBy,
    sortDirection,
    maxDistance,
    
    // 액션
    updateKeyword,
    updateFilters,
    updateSort,
    updateMaxDistance,
    
    // 유틸리티
    getEmptyMessage,
    
    // 상태 체크
    hasPosition: !!position,
    hasGyms: displayGyms.length > 0,
    hasNearbyGyms: nearbyGyms.length > 0,
  }
}