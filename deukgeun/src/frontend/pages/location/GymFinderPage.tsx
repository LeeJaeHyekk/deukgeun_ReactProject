import { useState, useEffect, useMemo } from "react";
import styles from "./GymFinderPage.module.css";
import { Navigation } from "@widgets/Navigation/Navigation";
import { SearchBar } from "./components/Map/SearchBar";
import { FilterTag } from "./components/FilterTag/FilterTag";
import { GymList } from "./components/Map/GymList";
import { fetchGymsByKeyword } from "./API/kakao";
import { Gym, FilterOption, SortOption, SortDirection } from "./types";
import { useAuth } from "@shared/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { processGyms } from "./utils/gymFilters";

// 전역 선언
declare global {
  interface Window {
    kakao: any;
  }
}

const filters: FilterOption[] = ["PT", "GX", "24시간", "주차", "샤워"];

export default function GymFinderPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(5); // 기본 5km
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const kakaoApiKey = import.meta.env.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY;

  console.log("🧪 GymFinderPage 렌더링");
  console.log("🧪 현재 gyms 상태:", gyms.length, "개");
  console.log("🧪 현재 position:", position);

  // 로그인 상태 확인 및 현재 위치 가져오기
  useEffect(() => {
    console.log("🧪 위치 정보 가져오기 시작");
    if (!isLoggedIn) {
      console.log("🧪 로그인되지 않음, 로그인 페이지로 이동");
      navigate("/login");
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation을 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("🧪 위치 정보 획득:", currentPos);
        setPosition(currentPos);
      },
      (error) => {
        console.error("위치 정보를 가져오지 못했습니다.", error);
      }
    );
  }, [isLoggedIn, navigate]);

  // 위치가 설정되면 기본 헬스장 검색 실행
  useEffect(() => {
    if (position && gyms.length === 0) {
      console.log("🧪 위치 설정됨, 기본 헬스장 검색 시작");
      handleSearch("헬스장");
    }
  }, [position]);

  // Kakao Maps SDK 로드 및 맵 초기화
  useEffect(() => {
    if (!position || isMapLoaded) return;
    if (!kakaoApiKey) {
      console.error("⚠️ Kakao API Key가 .env에 설정되지 않았습니다.");
      return;
    }

    const loadKakaoMap = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
        } else {
          const existingScript = document.getElementById(
            "kakao-map-sdk-script"
          );
          if (existingScript) {
            existingScript.addEventListener("load", () => resolve());
            existingScript.addEventListener("error", () => reject());
            return;
          }

          const script = document.createElement("script");
          script.id = "kakao-map-sdk-script";
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false`;
          script.async = true;

          script.onload = () => resolve();
          script.onerror = (error) => reject(error);

          document.head.appendChild(script);
        }
      });
    };

    const initializeMap = () => {
      const container = document.getElementById("kakao-map");
      if (!container) {
        console.error("카카오맵 컨테이너가 존재하지 않습니다.");
        return;
      }

      const options = {
        center: new window.kakao.maps.LatLng(position.lat, position.lng),
        level: 3,
      };

      new window.kakao.maps.Map(container, options);
      setIsMapLoaded(true);
    };

    loadKakaoMap()
      .then(() => {
        window.kakao.maps.load(initializeMap);
      })
      .catch((err) => {
        console.error("❌ Kakao Maps SDK 로딩 실패:", err);
      });

    return () => {
      const script = document.getElementById("kakao-map-sdk-script");
      if (script) script.remove();
    };
  }, [position, isMapLoaded, kakaoApiKey]);

  // 검색 처리
  const handleSearch = async (query: string) => {
    console.log("🧪 검색 시작:", query);
    if (!position) {
      console.warn("⚠️ 위치 정보가 없습니다.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchGymsByKeyword(query, position);
      console.log("🧪 API 결과:", result.length, "개");

      // 결과가 이미 Gym 타입인지 확인하고 변환
      const transformedGyms: Gym[] = result.map((item: any) => {
        // 이미 Gym 타입인 경우 (더미 데이터)
        if (item.name && item.type) {
          return item;
        }

        // 카카오 API 결과인 경우 변환
        return {
          id: item.id,
          name: item.place_name,
          type: "피트니스",
          address: item.address_name,
          phone: item.phone,
          latitude: parseFloat(item.y),
          longitude: parseFloat(item.x),
          // 추가 필드들은 기본값으로 설정 (실제로는 별도 API 호출 필요)
          rating: Math.random() * 2 + 3, // 임시 평점 (3-5)
          reviewCount: Math.floor(Math.random() * 100) + 10, // 임시 리뷰 수
          hasPT: Math.random() > 0.5,
          hasGX: Math.random() > 0.5,
          is24Hours: Math.random() > 0.7,
          hasParking: Math.random() > 0.3,
          hasShower: Math.random() > 0.6,
          price: `${Math.floor(Math.random() * 20 + 10)}만원`,
        };
      });

      console.log("🧪 변환된 헬스장 데이터:", transformedGyms.length, "개");
      setGyms(transformedGyms);
    } catch (error) {
      console.error("🧪 검색 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터 토글
  const toggleFilter = (filter: FilterOption) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  // 정렬 변경
  const handleSortChange = (
    newSortBy: SortOption,
    newDirection: SortDirection
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  // 헬스장 클릭 처리
  const handleGymClick = (gym: Gym) => {
    console.log("헬스장 클릭:", gym);
    // 여기에 헬스장 상세 정보 모달이나 페이지 이동 로직 추가
  };

  // 필터링 및 정렬된 헬스장 목록
  const processedGyms = useMemo(() => {
    console.log("🧪 헬스장 처리 중:", gyms.length, "개");
    const result = processGyms(gyms, {
      activeFilters,
      sortBy,
      sortDirection,
      maxDistance,
      currentPosition: position,
    });
    console.log("🧪 처리된 헬스장:", result.length, "개");
    return result;
  }, [gyms, activeFilters, sortBy, sortDirection, maxDistance, position]);

  return (
    <div className={styles.page}>
      <Navigation />

      <header className={styles.header}>
        <h1>내 주변 헬스장 찾기</h1>
      </header>

      <section className={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
        <div className={styles.filterGroup}>
          {filters.map((filter) => (
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
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className={styles.rangeSlider}
          />
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.mapListWrapper}>
          <section className={styles.mapSection}>
            <div className={styles.mapHeader}>
              <h2>헬스장 위치</h2>
            </div>
            <div id="kakao-map" className={styles.map}></div>
          </section>

          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <h2>추천 헬스장</h2>
              {isLoading && <span>검색 중...</span>}
            </div>
            <div className={styles.gymList}>
              <GymList
                gyms={processedGyms}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onGymClick={handleGymClick}
              />
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 내 주변 헬스장 찾기. All rights reserved.</p>
      </footer>
    </div>
  );
}
