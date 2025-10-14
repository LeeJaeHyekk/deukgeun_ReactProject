import { useState, useEffect, useMemo } from "react"
import styles from "./GymFinderPage.module.css"
import { Navigation } from "@widgets/Navigation/Navigation"
import { SearchBar } from "./components/Map/SearchBar"
import { FilterTag } from "./components/FilterTag/FilterTag"
import { GymList } from "./components/Map/GymList"
import { GymCard } from "./components/Map/GymCard"
import { fetchGymsByKeyword } from "./API/kakao"
import { Gym, FilterOption, SortOption, SortDirection } from "./types"
import { useAuth } from "@frontend/shared/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { processGyms } from "./utils/gymFilters"
import gymsData from "../../../data/gyms_raw.json"


const filters: FilterOption[] = ["PT", "GX", "24시간", "주차", "샤워"]

export default function GymFinderPage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [allGyms, setAllGyms] = useState<Gym[]>([])
  const [nearbyGyms, setNearbyGyms] = useState<Gym[]>([])
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("")
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("distance")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [maxDistance, setMaxDistance] = useState<number>(5) // 기본 5km
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  
  // 상세보기 관련 상태
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [isDetailView, setIsDetailView] = useState(false)
  
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  console.log("🧪 GymFinderPage 렌더링")
  console.log("🧪 현재 gyms 상태:", gyms.length, "개")
  console.log("🧪 현재 position:", position)

  // 좌표 유효성 검사 함수
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    // 서울 지역 좌표 범위 체크 (대략적인 범위)
    return lat >= 37.4 && lat <= 37.7 && lng >= 126.7 && lng <= 127.2
  }

  // gyms_raw.json 데이터를 Gym 타입으로 변환하는 함수
  const transformGymData = (rawGym: any): Gym => {
    // 좌표 데이터 검증 및 수정
    let latitude = rawGym.latitude
    let longitude = rawGym.longitude

    // 잘못된 좌표인 경우 서울 시청 근처 랜덤 좌표로 대체
    if (!isValidCoordinate(latitude, longitude)) {
      // 서울 시청(37.5665, 126.978) 기준으로 ±0.1도 범위 내 랜덤 좌표 생성
      latitude = 37.5665 + (Math.random() - 0.5) * 0.2
      longitude = 126.978 + (Math.random() - 0.5) * 0.2
    }

    return {
      id: rawGym.id,
      name: rawGym.name,
      type: rawGym.type,
      address: rawGym.address,
      phone: rawGym.phone,
      latitude,
      longitude,
      is24Hours: rawGym.is24Hours,
      hasParking: rawGym.hasParking,
      hasShower: rawGym.hasShower,
      // 추가 필드들은 기본값으로 설정
      rating: Math.random() * 2 + 3, // 임시 평점 (3-5)
      reviewCount: Math.floor(Math.random() * 100) + 10, // 임시 리뷰 수
      hasPT: Math.random() > 0.5,
      hasGX: Math.random() > 0.5,
      price: `${Math.floor(Math.random() * 20 + 10)}만원`,
    }
  }

  // 거리 계산 함수 (하버사인 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // gyms_raw.json 데이터 로드
  useEffect(() => {
    console.log("🧪 gyms_raw.json 데이터 로드 시작")
    try {
      if (!gymsData || !Array.isArray(gymsData)) {
        throw new Error("헬스장 데이터가 올바르지 않습니다.")
      }

      const transformedGyms = gymsData.map(transformGymData)
      
      // 데이터 유효성 검사
      if (transformedGyms.length === 0) {
        throw new Error("변환된 헬스장 데이터가 없습니다.")
      }

      setAllGyms(transformedGyms)
      console.log("🧪 로드된 헬스장 데이터:", transformedGyms.length, "개")
      
      // 데이터 로드 성공 시 로그
      const validCoords = transformedGyms.filter(gym => 
        isValidCoordinate(gym.latitude, gym.longitude)
      )
      console.log("🧪 유효한 좌표를 가진 헬스장:", validCoords.length, "개")
      
    } catch (error) {
      console.error("❌ gyms_raw.json 데이터 로드 실패:", error)
      
      // 데이터 로드 실패 시 기본 헬스장 데이터 생성
      const fallbackGyms: Gym[] = [
        {
          id: "fallback-1",
          name: "서울시청 헬스장",
          type: "짐",
          address: "서울특별시 중구 세종대로 110",
          phone: "02-120",
          latitude: 37.5665,
          longitude: 126.978,
          is24Hours: true,
          hasParking: true,
          hasShower: true,
          rating: 4.5,
          reviewCount: 50,
          hasPT: true,
          hasGX: true,
          price: "15만원"
        },
        {
          id: "fallback-2", 
          name: "명동 피트니스",
          type: "피트니스",
          address: "서울특별시 중구 명동",
          phone: "02-123-4567",
          latitude: 37.5636,
          longitude: 126.9826,
          is24Hours: false,
          hasParking: false,
          hasShower: true,
          rating: 4.2,
          reviewCount: 30,
          hasPT: true,
          hasGX: false,
          price: "12만원"
        },
        {
          id: "fallback-3",
          name: "동대문 스포츠센터",
          type: "크로스핏", 
          address: "서울특별시 중구 동대문",
          phone: "02-987-6543",
          latitude: 37.5683,
          longitude: 126.9778,
          is24Hours: true,
          hasParking: true,
          hasShower: true,
          rating: 4.0,
          reviewCount: 25,
          hasPT: false,
          hasGX: true,
          price: "10만원"
        }
      ]
      
      setAllGyms(fallbackGyms)
      console.log("🧪 기본 헬스장 데이터로 대체:", fallbackGyms.length, "개")
    }
  }, [])

  // 좌표 설정 함수 (우선순위: 현재 좌표 > 검색어 기반 > 서울 시청)
  const getCoordinateWithPriority = (searchQuery?: string) => {
    console.log("🧪 좌표 결정 시작, 검색어:", searchQuery)
    
    // 1. 현재 좌표가 있는 경우 - 현재 좌표 사용
    if (position) {
      console.log("🧪 현재 좌표 사용:", position)
      return position
    }
    
    // 2. 현재 좌표가 없지만 검색어가 있는 경우 - 서울 시청 좌표 사용
    if (searchQuery && searchQuery.trim() !== '') {
      console.log("🧪 검색어 기반으로 서울 시청 좌표 사용")
      return { lat: 37.5665, lng: 126.9780 }
    }
    
    // 3. 현재 좌표도 없고 검색도 없는 경우 - 서울 시청 좌표 사용
    console.log("🧪 기본 서울 시청 좌표 사용")
    return { lat: 37.5665, lng: 126.9780 }
  }

  // 좌표 설정 함수 (상태 업데이트용)
  const setCoordinateWithPriority = (searchQuery?: string) => {
    const targetCoordinate = getCoordinateWithPriority(searchQuery)
    
    // position이 없을 때만 설정 (무한 루프 방지)
    if (!position) {
      console.log("🧪 좌표 상태 업데이트:", targetCoordinate)
      setPosition(targetCoordinate)
    }
    
    return targetCoordinate
  }

  // 로그인 상태 확인 및 현재 위치 가져오기
  useEffect(() => {
    console.log("🧪 위치 정보 가져오기 시작")
    if (!isLoggedIn) {
      console.log("🧪 로그인되지 않음, 로그인 페이지로 이동")
      navigate("/login")
      return
    }

    // 브라우저가 geolocation을 지원하지 않는 경우
    if (!navigator.geolocation) {
      console.error("Geolocation을 지원하지 않는 브라우저입니다.")
      setCoordinateWithPriority()
      return
    }

    // 현재 위치 가져오기 시도
    navigator.geolocation.getCurrentPosition(
      pos => {
        const currentPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        console.log("🧪 위치 정보 획득:", currentPos)
        setPosition(currentPos)
      },
      error => {
        console.error("위치 정보를 가져오지 못했습니다.", error)
        
        // 위치 정보 거부 시 사용자에게 알림
        if (error.code === 1) {
          console.log("🧪 위치 정보 접근 거부됨")
        } else if (error.code === 2) {
          console.log("🧪 위치 정보를 가져올 수 없음")
        } else if (error.code === 3) {
          console.log("🧪 위치 정보 요청 시간 초과")
        }
        
        // 위치 정보를 가져올 수 없는 경우 기본 좌표 설정
        setCoordinateWithPriority()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    )
  }, [isLoggedIn, navigate])

  // 데이터가 로드되면 주변 헬스장 찾기
  useEffect(() => {
    if (allGyms.length > 0) {
      console.log("🧪 데이터 로드됨, 주변 헬스장 찾기 시작")
      findNearbyGyms()
    }
  }, [allGyms])

  // 거리 변경 시 처리
  useEffect(() => {
    if (allGyms.length > 0) {
      console.log("🧪 거리 변경됨:", maxDistance, "km")
      
      // 이전 데이터가 있는 경우 해당 데이터를 거리 기준으로 필터링
      if (gyms.length > 0) {
        console.log("🧪 이전 검색 데이터가 있음, 거리 기준으로 필터링")
        const currentPosition = getCoordinateWithPriority(currentSearchQuery)
        if (currentPosition) {
          const filteredGyms = gyms
            .map(gym => {
              const distance = calculateDistance(
                currentPosition.lat,
                currentPosition.lng,
                gym.latitude,
                gym.longitude
              )
              return { ...gym, distance }
            })
            .filter(gym => gym.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance)
          
          setGyms(filteredGyms)
        }
      } else {
        // 이전 데이터가 없는 경우 서울 시청 기준으로 새로 검색
        console.log("🧪 이전 데이터 없음, 서울 시청 기준으로 새로 검색")
        findNearbyGyms()
      }
    }
  }, [maxDistance])

  // 검색어가 변경되면 검색 결과 업데이트 (무한 루프 방지를 위해 의존성 제거)
  useEffect(() => {
    if (currentSearchQuery.trim() !== '' && allGyms.length > 0) {
      console.log("🧪 검색어 변경됨, 검색 실행:", currentSearchQuery)
      // handleSearch 함수를 직접 호출하지 않고 내부 로직만 실행
      const executeSearch = async () => {
        const currentPosition = getCoordinateWithPriority(currentSearchQuery)
        if (!currentPosition) return

        setIsLoading(true)
        try {
          const searchResults = allGyms.filter(gym => 
            gym.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            gym.address.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            gym.type.toLowerCase().includes(currentSearchQuery.toLowerCase())
          )

          const resultsWithDistance = searchResults
            .map(gym => {
              const distance = calculateDistance(
                currentPosition.lat,
                currentPosition.lng,
                gym.latitude,
                gym.longitude
              )
              return { ...gym, distance }
            })
            .sort((a, b) => a.distance - b.distance)

          let filteredResults = resultsWithDistance.filter(gym => gym.distance <= maxDistance)
          
          if (filteredResults.length < 3) {
            let expandedDistance = maxDistance
            while (filteredResults.length < 3 && expandedDistance < 50) {
              expandedDistance += 5
              filteredResults = resultsWithDistance.filter(gym => gym.distance <= expandedDistance)
            }
            
            if (filteredResults.length < 3) {
              filteredResults = resultsWithDistance.slice(0, 3)
            }
          }

          setGyms(filteredResults)
        } catch (error) {
          console.error("🧪 검색 실패:", error)
        } finally {
          setIsLoading(false)
        }
      }
      
      executeSearch()
    }
  }, [currentSearchQuery, allGyms, maxDistance])

  // 주변 헬스장 찾기 함수 (최소 3개 보장)
  const findNearbyGyms = () => {
    if (allGyms.length === 0) return

    console.log("🧪 주변 헬스장 찾기 시작")
    
    // 좌표 결정 (검색어가 있으면 검색어 기반, 없으면 현재 좌표)
    const currentPosition = getCoordinateWithPriority(currentSearchQuery)
    
    if (!currentPosition) {
      console.warn("⚠️ 좌표 결정 실패")
      return
    }
    
    // 거리 계산 및 정렬
    const gymsWithDistance = allGyms
      .map(gym => {
        const distance = calculateDistance(
          currentPosition.lat,
          currentPosition.lng,
          gym.latitude,
          gym.longitude
        )
        return { ...gym, distance }
      })
      .sort((a, b) => a.distance - b.distance)

    // 현재 거리 내에서 헬스장 찾기
    let nearby = gymsWithDistance.filter(gym => gym.distance <= maxDistance)
    
    // 최소 3개가 없으면 검색 범위를 점진적으로 확장
    if (nearby.length < 3) {
      console.log("🧪 현재 범위 내 헬스장 부족, 검색 범위 확장 중...")
      
      let expandedDistance = maxDistance
      while (nearby.length < 3 && expandedDistance < 50) { // 최대 50km까지 확장
        expandedDistance += 5 // 5km씩 확장
        nearby = gymsWithDistance.filter(gym => gym.distance <= expandedDistance)
        console.log(`🧪 ${expandedDistance}km 범위에서 ${nearby.length}개 헬스장 발견`)
      }
      
      // 여전히 3개 미만이면 가장 가까운 3개 선택
      if (nearby.length < 3) {
        nearby = gymsWithDistance.slice(0, 3)
        console.log("🧪 최대 범위 확장 후에도 부족, 가장 가까운 3개 선택")
      }
    }

    // 최대 6개로 제한
    nearby = nearby.slice(0, 6)
    
    console.log("🧪 최종 선택된 헬스장:", nearby.length, "개")
    setNearbyGyms(nearby)
  }

  // Map API 관련 코드 제거됨

  // Map API 관련 함수들 제거됨

  // 검색 처리 (gyms_raw.json 데이터에서 검색, 최소 3개 보장)
  const handleSearch = async (query: string) => {
    console.log("🧪 검색 시작:", query)
    
    // 검색어가 비어있으면 주변 헬스장으로 돌아가기
    if (!query || query.trim() === '') {
      console.log("🧪 검색어 비어있음, 주변 헬스장으로 돌아가기")
      setCurrentSearchQuery("")
      setGyms([])
      return
    }
    
    setCurrentSearchQuery(query)
    
    // 좌표 결정 (검색어가 있으면 서울 시청 기준)
    const currentPosition = getCoordinateWithPriority(query)
    
    if (!currentPosition) {
      console.warn("⚠️ 좌표 결정 실패")
      return
    }

    setIsLoading(true)
    try {
      // gyms_raw.json 데이터에서 검색
      const searchResults = allGyms.filter(gym => 
        gym.name.toLowerCase().includes(query.toLowerCase()) ||
        gym.address.toLowerCase().includes(query.toLowerCase()) ||
        gym.type.toLowerCase().includes(query.toLowerCase())
      )

      // 거리 계산 및 정렬
      const resultsWithDistance = searchResults
        .map(gym => {
          const distance = calculateDistance(
            currentPosition.lat,
            currentPosition.lng,
            gym.latitude,
            gym.longitude
          )
          return { ...gym, distance }
        })
        .sort((a, b) => a.distance - b.distance)

      // 현재 거리 내에서 결과 필터링
      let filteredResults = resultsWithDistance.filter(gym => gym.distance <= maxDistance)
      
      // 최소 3개가 없으면 검색 범위를 점진적으로 확장
      if (filteredResults.length < 3) {
        console.log("🧪 검색 결과 부족, 검색 범위 확장 중...")
        
        let expandedDistance = maxDistance
        while (filteredResults.length < 3 && expandedDistance < 50) {
          expandedDistance += 5
          filteredResults = resultsWithDistance.filter(gym => gym.distance <= expandedDistance)
        }
        
        // 여전히 3개 미만이면 가장 가까운 3개 선택
        if (filteredResults.length < 3) {
          filteredResults = resultsWithDistance.slice(0, 3)
        }
      }

      console.log("🧪 최종 검색 결과:", filteredResults.length, "개")
      setGyms(filteredResults)
    } catch (error) {
      console.error("🧪 검색 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 필터 토글
  const toggleFilter = (filter: FilterOption) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    )
  }

  // 정렬 변경
  const handleSortChange = (
    newSortBy: SortOption,
    newDirection: SortDirection
  ) => {
    setSortBy(newSortBy)
    setSortDirection(newDirection)
  }

  // 헬스장 클릭 처리 (상세보기로 전환)
  const handleGymClick = (gym: Gym) => {
    console.log("헬스장 클릭:", gym)
    setSelectedGym(gym)
    setIsDetailView(true)
  }

  // 새로고침/초기화 기능
  const handleRefresh = () => {
    console.log("🧪 새로고침 버튼 클릭")
    
    // 상세보기 모드 해제
    setIsDetailView(false)
    setSelectedGym(null)
    
    // 검색어가 있는 경우 검색어 기준으로 재설정
    if (currentSearchQuery.trim() !== '') {
      console.log("🧪 검색어 기준으로 재설정:", currentSearchQuery)
      handleSearch(currentSearchQuery)
    } else {
      // 검색어가 없는 경우 현재 위치 또는 서울 시청 기준으로 재설정
      console.log("🧪 위치 기준으로 재설정")
      setGyms([])
      findNearbyGyms()
    }
  }

  // 필터링 및 정렬된 헬스장 목록
  const processedGyms = useMemo(() => {
    console.log("🧪 헬스장 처리 중:", gyms.length, "개")
    const result = processGyms(gyms, {
      activeFilters,
      sortBy,
      sortDirection,
      maxDistance,
      currentPosition: position,
    })
    console.log("🧪 처리된 헬스장:", result.length, "개")
    return result
  }, [gyms, activeFilters, sortBy, sortDirection, maxDistance, position])

  return (
    <div className={styles.page}>
      <Navigation />

      <header className={styles.header}>
        <h1>내 주변 헬스장 찾기</h1>
      </header>

      <section className={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
        <div className={styles.filterGroup}>
          {filters.map(filter => (
            <FilterTag
              key={filter}
              label={filter}
              active={activeFilters.includes(filter)}
              onClick={() => toggleFilter(filter)}
            />
          ))}
        </div>
        <div className={styles.distanceFilter}>
          <label htmlFor="distance-range">검색 반경: {maxDistance}km</label>
          <input
            id="distance-range"
            type="range"
            min="1"
            max="20"
            value={maxDistance}
            onChange={e => setMaxDistance(Number(e.target.value))}
            className={styles.rangeSlider}
          />
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.mapListWrapper}>
          <section className={styles.mapSection}>
            <div className={styles.mapHeader}>
              <h2>내 주변 헬스장</h2>
              <button 
                className={styles.refreshButton}
                onClick={handleRefresh}
                title="새로고침"
              >
                🔄
              </button>
              <span className={styles.locationInfo}>
                📍 {position ? '현재 위치' : '서울 시청'} 기준 {maxDistance}km 내
                {currentSearchQuery && (
                  <span className={styles.searchInfo}>
                    (검색어: "{currentSearchQuery}")
                  </span>
                )}
              </span>
            </div>
            <div className={styles.nearbyGyms}>
              {isDetailView && selectedGym ? (
                // 상세보기 모드 - 단일 카드
                <div className={styles.detailView}>
                  <div className={styles.detailCard}>
                    <div className={styles.detailHeader}>
                      <h3>{selectedGym.name}</h3>
                      <button 
                        className={styles.backButton}
                        onClick={() => {
                          setIsDetailView(false)
                          setSelectedGym(null)
                        }}
                        title="뒤로가기"
                      >
                        ←
                      </button>
                    </div>
                    <div className={styles.detailContent}>
                      <div className={styles.detailInfo}>
                        <p><strong>주소:</strong> {selectedGym.address}</p>
                        <p><strong>전화번호:</strong> {selectedGym.phone}</p>
                        <p><strong>타입:</strong> {selectedGym.type}</p>
                        <p><strong>평점:</strong> ⭐ {selectedGym.rating?.toFixed(1) || 'N/A'} ({selectedGym.reviewCount || 0}개 리뷰)</p>
                        <p><strong>가격:</strong> {selectedGym.price}</p>
                        <p><strong>거리:</strong> {selectedGym.distance ? `${selectedGym.distance.toFixed(2)}km` : '계산 중...'}</p>
                      </div>
                      <div className={styles.detailFeatures}>
                        <h4>시설 정보</h4>
                        <div className={styles.featureList}>
                          {selectedGym.is24Hours && <span className={styles.featureTag}>24시간</span>}
                          {selectedGym.hasParking && <span className={styles.featureTag}>주차</span>}
                          {selectedGym.hasShower && <span className={styles.featureTag}>샤워</span>}
                          {selectedGym.hasPT && <span className={styles.featureTag}>PT</span>}
                          {selectedGym.hasGX && <span className={styles.featureTag}>GX</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : nearbyGyms.length > 0 ? (
                // 일반 모드 - 그리드
                <div className={styles.gymGrid}>
                  {nearbyGyms.map(gym => (
                    <GymCard 
                      key={gym.id} 
                      gym={gym} 
                      onClick={handleGymClick}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>📍 주변에 헬스장을 찾는 중...</p>
                  <p>잠시만 기다려주세요.</p>
                  {allGyms.length === 0 && (
                    <p className={styles.errorText}>
                      ⚠️ 헬스장 데이터를 불러오는 중입니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <h2>검색 결과</h2>
              <div className={styles.headerControls}>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setViewMode('list')}
                    title="리스트 보기"
                  >
                    📋
                  </button>
                  <button
                    className={`${styles.toggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="그리드 보기"
                  >
                    ⊞
                  </button>
                </div>
                {isLoading && <span>검색 중...</span>}
              </div>
            </div>
            <div className={styles.gymList}>
              <GymList
                gyms={processedGyms}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onGymClick={handleGymClick}
                layout={viewMode}
              />
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 내 주변 헬스장 찾기. All rights reserved.</p>
      </footer>
    </div>
  )
}
