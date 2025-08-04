import { connectDatabase } from "../config/database";
import { Gym } from "../entities/Gym";
import axios from "axios";
import { config } from "../config/env";

// Test with first 5 gyms only
const testGyms = [
  "스포애니 강남점",
  "올리브영 피트니스",
  "크로스핏 강남",
  "요가스튜디오",
  "PT센터",
];

// Check environment variables
console.log("🔧 환경 변수 확인:");
console.log(
  `KAKAO_API_KEY: ${config.KAKAO_API_KEY ? "설정됨" : "설정되지 않음"}`
);

async function testCrawler() {
  try {
    console.log("🚀 크롤러 테스트 시작");
    console.log("📡 데이터베이스 연결 중...");

    const connection = await connectDatabase();
    console.log("✅ 데이터베이스 연결 성공");

    console.log(`\n🔍 ${testGyms.length}개 테스트 헬스장 검색 시작`);

    for (let i = 0; i < testGyms.length; i++) {
      const gymName = testGyms[i];
      console.log(`\n📊 [${i + 1}/${testGyms.length}] ${gymName} 검색 중...`);

      try {
        // Improved search: use gym name only, exclude address
        const cleanName = gymName
          .replace(/[()（）]/g, "")
          .replace(/[㈜㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙]/g, "")
          .replace(
            /(주식회사|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|\(주\)|\(유\))/g,
            ""
          )
          .replace(/\s+/g, " ")
          .trim();

        // Search Kakao Map API
        const response = await axios.get(
          `https://dapi.kakao.com/v2/local/search/keyword.json`,
          {
            params: {
              query: cleanName,
              size: 5, // Get more results
              page: 1,
            },
            headers: {
              Authorization: `KakaoAK ${config.KAKAO_API_KEY}`,
            },
          }
        );

        if (!response.data.documents || response.data.documents.length === 0) {
          console.log(`❌ ${gymName} - 검색 결과 없음`);
          continue;
        }

        // Filter fitness-related results
        const fitnessResults = response.data.documents.filter((doc: any) => {
          const category = (
            doc.category_group_name +
            " " +
            doc.category_name
          ).toLowerCase();
          return (
            category.includes("헬스") ||
            category.includes("피트니스") ||
            category.includes("체육") ||
            category.includes("운동") ||
            category.includes("스포츠") ||
            doc.place_name.toLowerCase().includes("헬스") ||
            doc.place_name.toLowerCase().includes("피트니스") ||
            doc.place_name.toLowerCase().includes("짐") ||
            doc.place_name.toLowerCase().includes("gym")
          );
        });

        if (fitnessResults.length === 0) {
          console.log(`❌ ${gymName} - 헬스장 관련 결과 없음`);
          continue;
        }

        // Use first result
        const place = fitnessResults[0];
        console.log(`✅ ${gymName} - 검색 성공: ${place.place_name}`);
        console.log(`📍 주소: ${place.address_name}`);
        console.log(`📞 전화: ${place.phone || "정보 없음"}`);
        console.log(`🎯 좌표: ${place.x}, ${place.y}`);
        console.log(`🏷️ 카테고리: ${place.category_name}`);

        // Rate limiting (2 requests per second)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ ${gymName} - 오류:`, error);
      }
    }

    // Progress display
    console.log(`\n✅ 크롤러 테스트 완료`);

    await connection.close();
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
  }
}

testCrawler();
