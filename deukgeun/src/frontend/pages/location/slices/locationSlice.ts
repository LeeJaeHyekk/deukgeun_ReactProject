import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import gymsData from '@data/gyms_raw.json'
import { RootState } from '@frontend/shared/store'
import { Gym, FilterOption, SortOption, SortDirection } from '../types'
import { processGyms } from '../utils/gymFilters'
import { calculateDistance, sortByDistance } from '../utils/distanceUtils'

interface LocationState {
  allGyms: Gym[]
  gyms: Gym[]
  keyword: string
  filters: FilterOption[]
  sortBy: SortOption
  sortDirection: SortDirection
  position: { lat: number; lng: number } | null
  isLoading: boolean
  error: string | null
  maxDistance: number
}

// 고유 ID 생성 함수
const generateUniqueId = (gym: any, index: number): string => {
  if (gym.managementNumber) {
    return `gym_${gym.managementNumber}_${index}`
  }
  return `gym_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`
}

// 서울 시청 위치 (기본값)
const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 }

// 초기 헬스장 데이터 로드 (기본값) - 서울 시청 기준 가까운 6개
const getInitialGyms = (): Gym[] => {
  const transformedGyms = gymsData.slice(0, 20).map((gym: any, index: number) => {
    const baseGym: Gym = {
      id: generateUniqueId(gym, index),
      name: gym.name || '이름 없음',
      type: gym.serviceType === 'pt' ? '피트니스' : '피트니스',
      address: gym.address || gym.roadAddress || '주소 없음',
      phone: gym.phone || '',
      latitude: gym.latitude || 37.5665 + (Math.random() - 0.5) * 0.01,
      longitude: gym.longitude || 126.9780 + (Math.random() - 0.5) * 0.01,
      rating: Math.random() * 2 + 3,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      hasPT: gym.serviceType === 'pt' || Math.random() > 0.5,
      hasGX: Math.random() > 0.5,
      is24Hours: Math.random() > 0.7,
      hasParking: Math.random() > 0.3,
      hasShower: Math.random() > 0.6,
      price: `${Math.floor(Math.random() * 20 + 10)}만원`,
      imageUrl: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&sig=${Date.now()}_${index}`,
    }

    // 서울 시청 기준 거리 계산
    baseGym.distance = calculateDistance(
      { lat: SEOUL_CITY_HALL.lat, lng: SEOUL_CITY_HALL.lng },
      { lat: baseGym.latitude, lng: baseGym.longitude }
    )

    return baseGym
  })

  // 거리순으로 정렬하고 상위 9개만 반환 (3x3 그리드용)
  return sortByDistance(transformedGyms, 'asc').slice(0, 9)
}

const initialState: LocationState = {
  allGyms: getInitialGyms(),
  gyms: getInitialGyms(),
  keyword: '',
  filters: [],
  sortBy: 'distance',
  sortDirection: 'asc',
  position: SEOUL_CITY_HALL, // 서울 시청을 기본 위치로 설정
  isLoading: false,
  error: null,
  maxDistance: 5, // 기본 5km
}

// 🔍 JSON 데이터 기반 검색
export const fetchGymsByKeyword = createAsyncThunk(
  'location/fetchGymsByKeyword',
  async (keyword: string, { getState }) => {
    const state = getState() as RootState
    const currentPosition = state.location.position
    
    const lower = keyword.toLowerCase()
    const results = gymsData.filter(
      (gym: any) =>
        gym.name?.toLowerCase().includes(lower) ||
        gym.address?.toLowerCase().includes(lower) ||
        gym.phone?.includes(lower)
    )

    // Gym 타입으로 변환 (고유 ID 보장)
    const transformedResults: Gym[] = results.map((gym: any, index: number) => {
      const baseGym: Gym = {
        id: generateUniqueId(gym, index), // 고유 ID 보장
        name: gym.name || '이름 없음',
        type: gym.serviceType === 'pt' ? '피트니스' : '피트니스',
        address: gym.address || gym.roadAddress || '주소 없음',
        phone: gym.phone || '',
        latitude: gym.latitude || (currentPosition?.lat || 37.5665) + (Math.random() - 0.5) * 0.01,
        longitude: gym.longitude || (currentPosition?.lng || 126.9780) + (Math.random() - 0.5) * 0.01,
        rating: Math.random() * 2 + 3, // 임시 평점 (3-5)
        reviewCount: Math.floor(Math.random() * 100) + 10, // 임시 리뷰 수
        hasPT: gym.serviceType === 'pt' || Math.random() > 0.5,
        hasGX: Math.random() > 0.5,
        is24Hours: Math.random() > 0.7,
        hasParking: Math.random() > 0.3,
        hasShower: Math.random() > 0.6,
        price: `${Math.floor(Math.random() * 20 + 10)}만원`,
        imageUrl: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&sig=${Date.now()}_${index}`,
      }

      // 현재 위치가 있으면 거리 계산
      if (currentPosition) {
        baseGym.distance = calculateDistance(
          { lat: currentPosition.lat, lng: currentPosition.lng },
          { lat: baseGym.latitude, lng: baseGym.longitude }
        )
      }

      return baseGym
    })

    // 검색 결과를 거리순으로 정렬하고 상위 9개만 반환
    return sortByDistance(transformedResults, 'asc').slice(0, 9)
  }
)

// 🔍 모든 헬스장 데이터 로드 (위치 기반)
export const fetchAllGyms = createAsyncThunk(
  'location/fetchAllGyms',
  async (_, { getState }) => {
    const state = getState() as RootState
    const currentPosition = state.location.position

    // 모든 헬스장 데이터를 Gym 타입으로 변환 (고유 ID 보장)
    const transformedResults: Gym[] = gymsData.map((gym: any, index: number) => {
      const baseGym: Gym = {
        id: generateUniqueId(gym, index), // 고유 ID 보장
        name: gym.name || '이름 없음',
        type: gym.serviceType === 'pt' ? '피트니스' : '피트니스',
        address: gym.address || gym.roadAddress || '주소 없음',
        phone: gym.phone || '',
        latitude: gym.latitude || (currentPosition?.lat || 37.5665) + (Math.random() - 0.5) * 0.01,
        longitude: gym.longitude || (currentPosition?.lng || 126.9780) + (Math.random() - 0.5) * 0.01,
        rating: Math.random() * 2 + 3,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        hasPT: gym.serviceType === 'pt' || Math.random() > 0.5,
        hasGX: Math.random() > 0.5,
        is24Hours: Math.random() > 0.7,
        hasParking: Math.random() > 0.3,
        hasShower: Math.random() > 0.6,
        price: `${Math.floor(Math.random() * 20 + 10)}만원`,
        imageUrl: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&sig=${Date.now()}_${index}`,
      }

      // 현재 위치가 있으면 거리 계산
      if (currentPosition) {
        baseGym.distance = calculateDistance(
          { lat: currentPosition.lat, lng: currentPosition.lng },
          { lat: baseGym.latitude, lng: baseGym.longitude }
        )
      }

      return baseGym
    })

    return transformedResults
  }
)

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload
    },
    setFilters(state, action: PayloadAction<FilterOption[]>) {
      state.filters = action.payload
      state.gyms = processGyms(state.allGyms, state.filters, state.sortBy, state.sortDirection)
    },
    setSort(state, action: PayloadAction<{ sortBy: SortOption; sortDirection: SortDirection }>) {
      state.sortBy = action.payload.sortBy
      state.sortDirection = action.payload.sortDirection
      state.gyms = processGyms(state.allGyms, state.filters, state.sortBy, state.sortDirection)
    },
    // ✅ 현재 위치 설정 후 거리 계산 및 정렬
    setPosition(state, action: PayloadAction<{ lat: number; lng: number }>) {
      state.position = action.payload
      
      // 모든 헬스장에 거리 정보 추가
      state.allGyms = state.allGyms.map((gym) => {
        const distance = calculateDistance(
          { lat: action.payload.lat, lng: action.payload.lng },
          { lat: gym.latitude, lng: gym.longitude }
        )
        return { ...gym, distance }
      })

      // 거리순으로 정렬하고 상위 9개만 유지 (view 섹션용)
      state.allGyms = sortByDistance(state.allGyms, 'asc').slice(0, 9)

      // 현재 표시 중인 헬스장에도 거리 정보 추가
      state.gyms = state.gyms.map((gym) => {
        const distance = calculateDistance(
          { lat: action.payload.lat, lng: action.payload.lng },
          { lat: gym.latitude, lng: gym.longitude }
        )
        return { ...gym, distance }
      })

      // distance 기준 자동 정렬
      if (state.sortBy === 'distance') {
        state.gyms = sortByDistance(state.gyms, state.sortDirection)
      }
    },
    setMaxDistance(state, action: PayloadAction<number>) {
      state.maxDistance = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGymsByKeyword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGymsByKeyword.fulfilled, (state, action) => {
        state.isLoading = false
        state.allGyms = action.payload
        state.gyms = processGyms(
          action.payload,
          state.filters,
          state.sortBy,
          state.sortDirection
        )
      })
      .addCase(fetchGymsByKeyword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '헬스장 데이터를 불러오지 못했습니다.'
      })
      .addCase(fetchAllGyms.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllGyms.fulfilled, (state, action) => {
        state.isLoading = false
        state.allGyms = action.payload
        state.gyms = processGyms(
          action.payload,
          state.filters,
          state.sortBy,
          state.sortDirection
        )
      })
      .addCase(fetchAllGyms.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '헬스장 데이터를 불러오지 못했습니다.'
      })
  },
})

export const { 
  setKeyword, 
  setFilters, 
  setSort, 
  setPosition, 
  setMaxDistance, 
  clearError 
} = locationSlice.actions

// Selectors
export const selectGyms = (state: RootState) => state.location.gyms
export const selectAllGyms = (state: RootState) => state.location.allGyms
export const selectLoading = (state: RootState) => state.location.isLoading
export const selectPosition = (state: RootState) => state.location.position
export const selectKeyword = (state: RootState) => state.location.keyword
export const selectFilters = (state: RootState) => state.location.filters
export const selectSortBy = (state: RootState) => state.location.sortBy
export const selectSortDirection = (state: RootState) => state.location.sortDirection
export const selectMaxDistance = (state: RootState) => state.location.maxDistance
export const selectError = (state: RootState) => state.location.error

export default locationSlice.reducer
