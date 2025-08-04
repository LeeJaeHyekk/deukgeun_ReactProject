import { connectDatabase } from "../config/database";
import { searchWithMultipleSources } from "../services/multiSourceCrawlerService";
import { Gym } from "../entities/Gym";

// Test gyms that previously failed
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

async function testMultiSourceCrawler() {
  try {
    console.log("🚀 멀티소스 크롤러 테스트 시작");
    console.log("📡 데이터베이스 연결 중...");

    const connection = await connectDatabase();
    console.log("✅ 데이터베이스 연결 성공");

    const gymRepo = connection.getRepository(Gym);
    let successCount = 0;
    let failureCount = 0;
    const results: {
      name: string;
      success: boolean;
      source?: string;
      confidence?: number;
    }[] = [];

    console.log(`\n🔍 ${testGyms.length}개 테스트 헬스장 검색 시작`);

    for (let i = 0; i < testGyms.length; i++) {
      const gymName = testGyms[i];
      console.log(`\n📊 [${i + 1}/${testGyms.length}] ${gymName} 검색 중...`);

      try {
        const result = await searchWithMultipleSources(gymName);

        if (result) {
          successCount++;
          console.log(`✅ ${gymName} - 검색 성공`);
          console.log(`📍 주소: ${result.address}`);
          console.log(`📞 전화: ${result.phone || "정보 없음"}`);
          console.log(
            `🎯 소스: ${result.source} (신뢰도: ${result.confidence})`
          );

          results.push({
            name: gymName,
            success: true,
            source: result.source,
            confidence: result.confidence,
          });
        } else {
          failureCount++;
          console.log(`❌ ${gymName} - 검색 결과 없음`);
          results.push({
            name: gymName,
            success: false,
          });
        }
      } catch (error) {
        failureCount++;
        console.error(`❌ ${gymName} - 검색 오류:`, error);
        results.push({
          name: gymName,
          success: false,
        });
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`\n📊 테스트 결과:`);
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failureCount}개`);
    console.log(
      `📈 성공률: ${((successCount / testGyms.length) * 100).toFixed(1)}%`
    );

    console.log(`\n📋 상세 결과:`);
    results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      const source = result.source ? ` [${result.source}]` : "";
      const confidence = result.confidence
        ? ` (신뢰도: ${result.confidence})`
        : "";
      console.log(
        `${index + 1}. ${status} ${result.name}${source}${confidence}`
      );
    });

    await connection.close();
    console.log("\n✅ 멀티소스 크롤러 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
  }
}

testMultiSourceCrawler();
