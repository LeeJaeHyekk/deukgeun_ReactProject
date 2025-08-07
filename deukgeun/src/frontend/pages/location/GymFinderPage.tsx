import { useState, useEffect, useMemo, useRef } from "react";
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

  // 맵 관련 refs
  const mapRef = useRef<any>(null);
  const currentLocationMarkerRef = useRef<any>(null);
  const gymMarkersRef = useRef<any[]>([]);

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

      mapRef.current = new window.kakao.maps.Map(container, options);

      // 현재 위치 마커 추가
      addCurrentLocationMarker();

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

  // 현재 위치 마커 추가 함수
  const addCurrentLocationMarker = () => {
    if (!mapRef.current || !position) return;

    // 기존 현재 위치 마커 제거
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }

    // 현재 위치 마커 생성 (파란색 원형 마커)
    const currentLocationMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(position.lat, position.lng),
      map: mapRef.current,
    });

    // 현재 위치 마커 스타일 설정
    const currentLocationImage = new window.kakao.maps.MarkerImage(
      "data:image/svg+xml;base64," +
        btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="#d1d5db" stroke="white" stroke-width="3"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <circle cx="16" cy="16" r="4" fill="#374151"/>
        </svg>
      `),
      new window.kakao.maps.Size(32, 32)
    );

    currentLocationMarker.setImage(currentLocationImage);
    currentLocationMarkerRef.current = currentLocationMarker;

    // 현재 위치 인포윈도우 추가
    const infowindow = new window.kakao.maps.InfoWindow({
      content:
        '<div style="padding:8px 12px;font-size:14px;font-weight:600;background:#d1d5db;color:#374151;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">📍 현재 위치</div>',
    });

    window.kakao.maps.event.addListener(
      currentLocationMarker,
      "click",
      function () {
        infowindow.open(mapRef.current, currentLocationMarker);
      }
    );
  };

  // 헬스장 마커 추가 함수
  const addGymMarkers = () => {
    if (!mapRef.current || !gyms.length) return;

    // 기존 헬스장 마커들 제거
    gymMarkersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    gymMarkersRef.current = [];

    // 헬스장 마커들 추가
    gyms.forEach((gym, index) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(gym.latitude, gym.longitude),
        map: mapRef.current,
      });

      // 헬스장 마커 스타일 설정 (빨간색 핀)
      const gymImage = new window.kakao.maps.MarkerImage(
        "data:image/svg+xml;base64," +
          btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        new window.kakao.maps.Size(24, 24)
      );

      marker.setImage(gymImage);

      // 헬스장 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px;min-width:200px;">
            <h3 style="margin:0 0 5px 0;font-size:14px;font-weight:bold;">${
              gym.name
            }</h3>
            <p style="margin:0 0 3px 0;font-size:12px;color:#666;">${
              gym.address
            }</p>
            ${
              gym.phone
                ? `<p style="margin:0 0 3px 0;font-size:12px;color:#666;">${gym.phone}</p>`
                : ""
            }
            ${
              gym.rating
                ? `<p style="margin:0;font-size:12px;color:#666;">평점: ${gym.rating.toFixed(
                    1
                  )}</p>`
                : ""
            }
          </div>
        `,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, "click", function () {
        infowindow.open(mapRef.current, marker);
      });

      gymMarkersRef.current.push(marker);
    });
  };

  // 헬스장 목록이 변경될 때마다 마커 업데이트
  useEffect(() => {
    if (isMapLoaded && gyms.length > 0) {
      addGymMarkers();
    }
  }, [gyms, isMapLoaded]);

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

  // 헬스장 클릭 처리 - 맵에서 해당 위치로 이동
  const handleGymClick = (gym: Gym) => {
    console.log("헬스장 클릭:", gym);

    if (mapRef.current) {
      // 맵 중심을 해당 헬스장 위치로 이동
      const newPosition = new window.kakao.maps.LatLng(
        gym.latitude,
        gym.longitude
      );
      mapRef.current.panTo(newPosition);

      // 줌 레벨을 더 가깝게 설정 (더 확대)
      mapRef.current.setLevel(2);

      // 해당 헬스장 마커 찾기
      const gymMarker = gymMarkersRef.current.find((marker) => {
        const markerPos = marker.getPosition();
        return (
          markerPos.getLat() === gym.latitude &&
          markerPos.getLng() === gym.longitude
        );
      });

      // 마커 클릭 이벤트 트리거 (인포윈도우 표시)
      if (gymMarker) {
        window.kakao.maps.event.trigger(gymMarker, "click");
      }
    }
  };

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (mapRef.current && position) {
      const currentPosition = new window.kakao.maps.LatLng(
        position.lat,
        position.lng
      );
      mapRef.current.panTo(currentPosition);
      mapRef.current.setLevel(3);
    }
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
              <button
                onClick={moveToCurrentLocation}
                className={styles.currentLocationButton}
                title="현재 위치로 이동"
              >
                📍 현재 위치
              </button>
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
