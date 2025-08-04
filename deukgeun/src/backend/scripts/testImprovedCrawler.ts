import { connectDatabase } from "../config/database";
import { updateGymDetails } from "../services/gymCrawlerService";
import { Gym } from "../entities/Gym";

async function testImprovedCrawler() {
  try {
    const connection = await connectDatabase();
    console.log("📡 DB 연결 성공");

    const gymRepo = connection.getRepository(Gym);

    // 테스트용 헬스장들 (이전에 실패했던 것들)
    const testGyms = [
      "(주)스포티즌 엑시온점",
      "율 메디컬 트레이닝 센터",
      "주식회사 바디채널등촌점헬스앤피티",
      "RUN 광화문",
      "Wellness K(웰니스 케이)",
      "마인PT & 필라테스 신당청구점",
      "스포애니 동묘앞역점 (주)케이디헬스케어",
      "셀렉트짐 PT & 헬스 광화문점",
      "피트니스비엠 ㈜피트비엠",
      "리콥 웰니스 프리미엄",
    ];

    console.log("🧪 개선된 검색 전략 테스트 시작");
    console.log(`📊 테스트 대상: ${testGyms.length}개 헬스장`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < testGyms.length; i++) {
      const gymName = testGyms[i];
      console.log(`\n🔍 [${i + 1}/${testGyms.length}] 테스트: ${gymName}`);

      try {
        // 기존 DB에서 해당 헬스장 찾기
        const gym = await gymRepo.findOne({ where: { name: gymName } });

        if (!gym) {
          console.log(`⚠️ DB에서 찾을 수 없음: ${gymName}`);
          errorCount++;
          continue;
        }

        // 개선된 검색 전략으로 다시 시도
        const { searchWithMultipleStrategies } = await import(
          "../services/gymCrawlerService"
        );
        const place = await searchWithMultipleStrategies(gymName);

        if (place) {
          console.log(`✅ 성공: ${gymName} → ${place.place_name}`);
          successCount++;
        } else {
          console.log(`❌ 실패: ${gymName}`);
          errorCount++;
        }

        // API 요청 간격 조절
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`⚠️ 오류: ${gymName} - ${(error as Error).message}`);
        errorCount++;
      }
    }

    console.log("\n📊 테스트 결과:");
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(
      `📈 성공률: ${Math.round((successCount / testGyms.length) * 100)}%`
    );

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
    process.exit(1);
  }
}

testImprovedCrawler();
