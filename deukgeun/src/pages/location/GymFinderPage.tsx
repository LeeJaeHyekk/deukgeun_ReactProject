import styles from "./GymFinderPage.module.css";
import { useState } from "react";
import { GymCard } from "./components/GymCard/GymCard";
import { FilterTag } from "./components/FilterTag/FilterTag";
import { SearchBar } from "./components/SearchBar/SearchBar";
import { Navigation } from "@widgets/Navigation/Navigation";

const filters = ["PT", "GX", "24시간", "주차", "샤워 시설"];

export default function GymFinderPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
        <SearchBar />
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
            <div className={styles.map}>카카오맵이 여기에 표시됩니다.</div>
          </section>

          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <h2>추천 헬스장</h2>
            </div>
            <div className={styles.gymList}>
              <GymCard
                name="피트니스 갤러리 강남점"
                distance="0.3 km"
                description="최신 기구 완비, GX 프로그램 다양"
              />
              <GymCard
                name="스포애니 역삼점"
                distance="0.7 km"
                description="24시간 운영, 넓은 시설"
              />
              <GymCard
                name="새마을휘트니스 삼성점"
                distance="1.1 km"
                description="친절한 트레이너, 합리적인 가격"
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
