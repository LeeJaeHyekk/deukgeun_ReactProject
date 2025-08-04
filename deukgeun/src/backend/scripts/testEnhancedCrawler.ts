import { connectDatabase } from "../config/database";
import { searchWithEnhancedSources } from "../services/enhancedCrawlerService";
import { Gym } from "../entities/Gym";

// Test gyms with various facility information
const testGyms = [
  "스포애니 헬스클럽",
  "올리브영 피트니스",
  "크로스핏 서울",
  "요가스튜디오 나무",
  "PT센터 강남",
  "24시간 헬스장",
  "주차가능 피트니스",
  "샤워시설 헬스클럽",
  "그룹PT 스튜디오",
  "에어로빅 센터",
];

async function testEnhancedCrawler() {
  try {
    console.log("🚀 향상된 크롤러 테스트 시작");
    console.log("📡 데이터베이스 연결 중...");

    const connection = await connectDatabase();
    console.log("✅ 데이터베이스 연결 성공");

    const gymRepo = connection.getRepository(Gym);
    let successCount = 0;
    let totalPT = 0;
    let totalGX = 0;
    let totalGroupPT = 0;
    let totalParking = 0;
    let totalShower = 0;
    let total24Hours = 0;

    console.log(`\n🔍 ${testGyms.length}개 테스트 헬스장 검색 시작`);

    for (let i = 0; i < testGyms.length; i++) {
      const gymName = testGyms[i];
      console.log(`\n📊 [${i + 1}/${testGyms.length}] ${gymName} 검색 중...`);

      try {
        const result = await searchWithEnhancedSources(gymName);

        if (result) {
          successCount++;
          console.log(`✅ ${gymName} - 검색 성공`);
          console.log(`📍 주소: ${result.address}`);
          console.log(`📞 전화: ${result.phone || "정보 없음"}`);
          console.log(`🏋️ 시설 정보:`);
          console.log(`  - PT: ${result.hasPT ? "✅" : "❌"}`);
          console.log(`  - GX: ${result.hasGX ? "✅" : "❌"}`);
          console.log(`  - GroupPT: ${result.hasGroupPT ? "✅" : "❌"}`);
          console.log(`  - 주차: ${result.hasParking ? "✅" : "❌"}`);
          console.log(`  - 샤워: ${result.hasShower ? "✅" : "❌"}`);
          console.log(`  - 24시간: ${result.is24Hours ? "✅" : "❌"}`);
          console.log(`  - 운영시간: ${result.openHour || "정보 없음"}`);
          console.log(
            `🎯 소스: ${result.source} (신뢰도: ${result.confidence})`
          );

          // Count facilities
          if (result.hasPT) totalPT++;
          if (result.hasGX) totalGX++;
          if (result.hasGroupPT) totalGroupPT++;
          if (result.hasParking) totalParking++;
          if (result.hasShower) totalShower++;
          if (result.is24Hours) total24Hours++;
        } else {
          console.log(`❌ ${gymName} - 검색 결과 없음`);
        }
      } catch (error) {
        console.error(`❌ ${gymName} - 검색 오류:`, error);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Facility statistics
    console.log(`\n📊 시설 정보 통계:`);
    console.log(
      `✅ 성공: ${successCount}/${testGyms.length} (${(
        (successCount / testGyms.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(`🏋️ 시설별 검출률:`);
    console.log(
      `  - PT: ${totalPT}/${successCount} (${
        successCount > 0 ? ((totalPT / successCount) * 100).toFixed(1) : 0
      }%)`
    );
    console.log(
      `  - GX: ${totalGX}/${successCount} (${
        successCount > 0 ? ((totalGX / successCount) * 100).toFixed(1) : 0
      }%)`
    );
    console.log(
      `  - GroupPT: ${totalGroupPT}/${successCount} (${
        successCount > 0 ? ((totalGroupPT / successCount) * 100).toFixed(1) : 0
      }%)`
    );
    console.log(
      `  - 주차: ${totalParking}/${successCount} (${
        successCount > 0 ? ((totalParking / successCount) * 100).toFixed(1) : 0
      }%)`
    );
    console.log(
      `  - 샤워: ${totalShower}/${successCount} (${
        successCount > 0 ? ((totalShower / successCount) * 100).toFixed(1) : 0
      }%)`
    );
    console.log(
      `  - 24시간: ${total24Hours}/${successCount} (${
        successCount > 0 ? ((total24Hours / successCount) * 100).toFixed(1) : 0
      }%)`
    );

    await connection.close();
    console.log("\n✅ 향상된 크롤러 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
  }
}

testEnhancedCrawler();
