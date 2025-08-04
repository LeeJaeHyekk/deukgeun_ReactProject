import { connectDatabase } from "../config/database";
import { updateGymDetails } from "../services/gymCrawlerService";
import { Gym } from "../entities/Gym";

async function testCrawler() {
  try {
    const connection = await connectDatabase();
    console.log("📡 DB 연결 성공");

    const gymRepo = connection.getRepository(Gym);

    // 테스트용으로 처음 5개 헬스장만 가져오기
    const testGyms = await gymRepo.find({ take: 5 });
    console.log(`🧪 테스트용 헬스장 ${testGyms.length}개 선택됨`);

    // 환경 변수 확인
    const { config } = await import("../config/env");
    console.log(
      "🔑 API 키 확인:",
      config.KAKAO_API_KEY.substring(0, 10) + "..."
    );
    console.log("🔑 API 키 길이:", config.KAKAO_API_KEY.length);

    // 임시로 테스트용 헬스장만 처리하는 함수
    const testUpdateGymDetails = async (gymRepo: any) => {
      const gyms = testGyms; // 전체 대신 테스트용만 사용
      console.log(`📊 총 ${gyms.length}개의 헬스장 데이터를 크롤링합니다.`);

      const axios = await import("axios");

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < gyms.length; i++) {
        const gym = gyms[i];

        try {
          // 검색어 개선: 헬스장 이름만 사용하고 주소는 제외
          const searchQuery = gym.name;
          console.log(`📡 [${i + 1}/${gyms.length}] 크롤링 시작: ${gym.name}`);
          console.log(`🔍 검색어: "${searchQuery}"`);

          // 카카오맵 API로 장소 검색
          const searchResponse = await axios.default.get(
            `https://dapi.kakao.com/v2/local/search/keyword.json`,
            {
              params: {
                query: searchQuery,
                size: 5, // 더 많은 결과 가져오기
                page: 1,
              },
              headers: {
                Authorization: `KakaoAK ${config.KAKAO_API_KEY}`,
              },
            }
          );

          if (
            !searchResponse.data.documents ||
            searchResponse.data.documents.length === 0
          ) {
            console.warn(`⚠️ 검색결과 없음: ${gym.name}`);
            errorCount++;
            continue;
          }

          console.log(
            `📋 검색 결과 ${searchResponse.data.documents.length}개 발견`
          );

          // 첫 번째 결과 사용
          const place = searchResponse.data.documents[0];
          console.log(
            `📍 선택된 장소: ${place.place_name} (${place.address_name})`
          );

          // 장소 상세 정보 가져오기
          const detailResponse = await axios.default.get(
            `https://dapi.kakao.com/v2/local/search/keyword.json`,
            {
              params: {
                query: place.place_name,
                size: 1,
                page: 1,
              },
              headers: {
                Authorization: `KakaoAK ${config.KAKAO_API_KEY}`,
              },
            }
          );

          if (
            !detailResponse.data.documents ||
            detailResponse.data.documents.length === 0
          ) {
            console.warn(`⚠️ 상세정보 없음: ${gym.name}`);
            errorCount++;
            continue;
          }

          const detail = detailResponse.data.documents[0];

          // 운영시간 및 시설 정보 추출 (API에서는 제한적 정보만 제공)
          const openHour = detail.place_url
            ? "API로는 운영시간 정보를 직접 제공하지 않습니다"
            : "";

          // 기본 시설 정보 설정 (API로는 제한적)
          const facilities = [];
          if (detail.category_group_name) {
            facilities.push(detail.category_group_name);
          }
          if (detail.category_name) {
            facilities.push(detail.category_name);
          }

          const facilitiesStr = facilities.join(", ");

          // 시설 정보 분석
          const lowerFacilities = facilities.map((f) => f.toLowerCase());
          const lowerOpenHour = openHour.toLowerCase();

          const is24Hours = false; // API로는 24시간 운영 여부를 직접 알 수 없음

          const hasGX = lowerFacilities.some(
            (f) =>
              f.includes("gx") ||
              f.includes("그룹운동") ||
              f.includes("에어로빅") ||
              f.includes("헬스")
          );

          const hasPT = lowerFacilities.some(
            (f) =>
              f.includes("pt") && !f.includes("그룹") && !f.includes("group")
          );

          const hasGroupPT = lowerFacilities.some(
            (f) =>
              f.includes("그룹pt") ||
              f.includes("group pt") ||
              f.includes("그룹 pt") ||
              f.includes("그룹pt")
          );

          // 주차장, 샤워장 유무 (API로는 알 수 없음)
          const hasParking = false;
          const hasShower = false;

          // DB 업데이트
          gym.openHour = openHour;
          gym.facilities = facilitiesStr;
          gym.is24Hours = is24Hours;
          gym.hasGX = hasGX;
          gym.hasPT = hasPT;
          gym.hasGroupPT = hasGroupPT;
          gym.hasParking = hasParking;
          gym.hasShower = hasShower;

          // 좌표 업데이트 (API에서 제공하는 좌표 사용)
          if (detail.x && detail.y) {
            gym.longitude = parseFloat(detail.x);
            gym.latitude = parseFloat(detail.y);
          }

          await gymRepo.save(gym);

          console.log(
            `✅ 완료: ${gym.name} | 카테고리: ${facilitiesStr} | 좌표: ${detail.x}, ${detail.y}`
          );
          successCount++;

          // API 요청 간격 조절 (초당 2회 제한)
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.warn(
            `⚠️ [오류] ${gym.name} 처리 중 문제 발생: ${
              (error as Error).message
            }`
          );
          errorCount++;
        }

        // 진행률 표시
        if ((i + 1) % 10 === 0) {
          console.log(
            `📈 진행률: ${i + 1}/${gyms.length} (${Math.round(
              ((i + 1) / gyms.length) * 100
            )}%)`
          );
        }
      }

      console.log("🔚 크롤링 전체 완료");
      console.log(`📊 결과: 성공 ${successCount}개, 실패 ${errorCount}개`);
    };

    await testUpdateGymDetails(gymRepo);

    await connection.close();
    console.log("✅ 테스트 완료");
    process.exit(0);
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
    process.exit(1);
  }
}

testCrawler();
