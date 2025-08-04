import { connectDatabase } from "../config/database";
import { searchWithEnhancedSources } from "../services/enhancedCrawlerService";
import { Gym } from "../entities/Gym";

async function testEnhancedCrawler() {
  try {
    const connection = await connectDatabase();
    console.log("📡 DB 연결 성공");

    // 테스트용 헬스장들 (시설 정보가 다양한 것들)
    const testGyms = [
      "스포애니 강남점",
      "올리브영 피트니스",
      "크로스핏 강남",
      "요가스튜디오",
      "PT센터",
      "24시간 헬스장",
      "주차가능 헬스클럽",
      "샤워시설 헬스장",
      "그룹PT 스튜디오",
      "GX 클럽",
    ];

    console.log("🧪 향상된 크롤링 테스트 시작");
    console.log(`📊 테스트 대상: ${testGyms.length}개 헬스장`);

    let successCount = 0;
    let errorCount = 0;
    const results: {
      name: string;
      success: boolean;
      source?: string;
      confidence?: number;
      facilities?: {
        hasPT: boolean;
        hasGX: boolean;
        hasGroupPT: boolean;
        hasParking: boolean;
        hasShower: boolean;
        is24Hours: boolean;
      };
    }[] = [];

    for (let i = 0; i < testGyms.length; i++) {
      const gymName = testGyms[i];
      console.log(`\n🔍 [${i + 1}/${testGyms.length}] 테스트: ${gymName}`);

      try {
        const result = await searchWithEnhancedSources(gymName);

        if (result) {
          console.log(
            `✅ 성공: ${gymName} → ${result.name} [${result.source}] (신뢰도: ${result.confidence})`
          );
          console.log(
            `🏋️ 시설 정보: PT=${result.hasPT}, GX=${result.hasGX}, GroupPT=${result.hasGroupPT}, 주차=${result.hasParking}, 샤워=${result.hasShower}, 24시간=${result.is24Hours}`
          );

          successCount++;
          results.push({
            name: gymName,
            success: true,
            source: result.source,
            confidence: result.confidence,
            facilities: {
              hasPT: result.hasPT || false,
              hasGX: result.hasGX || false,
              hasGroupPT: result.hasGroupPT || false,
              hasParking: result.hasParking || false,
              hasShower: result.hasShower || false,
              is24Hours: result.is24Hours || false,
            },
          });
        } else {
          console.log(`❌ 실패: ${gymName}`);
          errorCount++;
          results.push({
            name: gymName,
            success: false,
          });
        }

        // API 요청 간격 조절
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`⚠️ 오류: ${gymName} - ${(error as Error).message}`);
        errorCount++;
        results.push({
          name: gymName,
          success: false,
        });
      }
    }

    console.log("\n📊 테스트 결과:");
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(
      `📈 성공률: ${Math.round((successCount / testGyms.length) * 100)}%`
    );

    console.log("\n📋 상세 결과:");
    results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      const source = result.source ? ` [${result.source}]` : "";
      const confidence = result.confidence
        ? ` (신뢰도: ${result.confidence})`
        : "";
      const facilities = result.facilities
        ? ` | PT:${result.facilities.hasPT} GX:${result.facilities.hasGX} GroupPT:${result.facilities.hasGroupPT} 주차:${result.facilities.hasParking} 샤워:${result.facilities.hasShower} 24시간:${result.facilities.is24Hours}`
        : "";

      console.log(
        `${index + 1}. ${status} ${
          result.name
        }${source}${confidence}${facilities}`
      );
    });

    // 시설 정보 통계
    const successfulResults = results.filter((r) => r.success && r.facilities);
    if (successfulResults.length > 0) {
      console.log("\n📈 시설 정보 통계:");
      const stats = {
        hasPT: successfulResults.filter((r) => r.facilities?.hasPT).length,
        hasGX: successfulResults.filter((r) => r.facilities?.hasGX).length,
        hasGroupPT: successfulResults.filter((r) => r.facilities?.hasGroupPT)
          .length,
        hasParking: successfulResults.filter((r) => r.facilities?.hasParking)
          .length,
        hasShower: successfulResults.filter((r) => r.facilities?.hasShower)
          .length,
        is24Hours: successfulResults.filter((r) => r.facilities?.is24Hours)
          .length,
      };

      console.log(
        `🏋️ PT 제공: ${stats.hasPT}/${successfulResults.length} (${Math.round(
          (stats.hasPT / successfulResults.length) * 100
        )}%)`
      );
      console.log(
        `🎵 GX 제공: ${stats.hasGX}/${successfulResults.length} (${Math.round(
          (stats.hasGX / successfulResults.length) * 100
        )}%)`
      );
      console.log(
        `👥 그룹PT 제공: ${stats.hasGroupPT}/${
          successfulResults.length
        } (${Math.round((stats.hasGroupPT / successfulResults.length) * 100)}%)`
      );
      console.log(
        `🚗 주차 가능: ${stats.hasParking}/${
          successfulResults.length
        } (${Math.round((stats.hasParking / successfulResults.length) * 100)}%)`
      );
      console.log(
        `🚿 샤워 시설: ${stats.hasShower}/${
          successfulResults.length
        } (${Math.round((stats.hasShower / successfulResults.length) * 100)}%)`
      );
      console.log(
        `⏰ 24시간 운영: ${stats.is24Hours}/${
          successfulResults.length
        } (${Math.round((stats.is24Hours / successfulResults.length) * 100)}%)`
      );
    }

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
    process.exit(1);
  }
}

testEnhancedCrawler();
