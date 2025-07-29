// GymFinderPage.tsx
import { useState, useEffect } from "react";
import styles from "./GymFinderPage.module.css";
import { Navigation } from "@widgets/Navigation/Navigation";
import { SearchBar } from "./components/Map/SearchBar";
import { FilterTag } from "./components/FilterTag/FilterTag";
import { GymList } from "./components/Map/GymList";
import { fetchGymsByKeyword } from "./API/kakao";
import { Gym } from "./types";

// TypeScript용 전역 선언
declare global {
  interface Window {
    kakao: any;
  }
}

const filters = ["PT", "GX", "24시간", "주차", "샤워 시설"];

export default function GymFinderPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // 현재 위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const currentPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setPosition(currentPos);
    });
  }, []);

  // 카카오맵 스크립트 로딩 및 초기화
  useEffect(() => {
    if (!position) return;

    const initializeMap = () => {
      const container = document.getElementById("kakao-map");
      if (!container) {
        console.error("Kakao map container not found.");
        return;
      }

      const options = {
        center: new window.kakao.maps.LatLng(position.lat, position.lng),
        level: 3,
      };

      new window.kakao.maps.Map(container, options);
    };

    const existingScript = document.getElementById("kakao-map-sdk-script");
    if (existingScript) {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(initializeMap);
      } else {
        existingScript.addEventListener("load", () => {
          window.kakao.maps.load(initializeMap);
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY
    }&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(initializeMap);
      } else {
        console.error(
          "Kakao Maps SDK loaded, but kakao.maps is not available."
        );
      }
    };

    script.onerror = (error) => {
      console.error("Failed to load Kakao Maps SDK script:", error);
    };

    document.head.appendChild(script);

    return () => {
      const script = document.getElementById("kakao-map-sdk-script");
      if (script) {
        script.remove();
      }
    };
  }, [position]);

  // 검색 핸들러
  const handleSearch = async (query: string) => {
    if (!position) {
      console.warn("위치 정보가 없습니다.");
      return;
    }
    const result = await fetchGymsByKeyword(query, position);
    setGyms(result);
  };

  // 필터 토글
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

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
            </div>
            <div className={styles.gymList}>
              <GymList gyms={gyms} />
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
