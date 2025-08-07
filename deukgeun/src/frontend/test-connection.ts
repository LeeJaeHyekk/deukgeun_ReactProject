import { machineApi } from "./shared/api/machineApi";

async function testFrontendBackendConnection() {
  console.log("🔗 프론트엔드-백엔드 연결 테스트 시작\n");

  try {
    // 1. 기구 목록 조회 테스트
    console.log("1️⃣ 기구 목록 조회 테스트");
    const machinesResponse = await machineApi.getAllMachines();
    console.log("✅ 기구 목록 조회 성공");
    console.log("총 기구 수:", machinesResponse.count);
    console.log(
      "첫 번째 기구:",
      machinesResponse.data[0]?.name_ko || "기구 없음"
    );

    // 2. 필터링 테스트
    console.log("\n2️⃣ 기구 필터링 테스트");
    const filterResponse = await machineApi.filterMachines({
      category: "상체",
    });
    console.log("✅ 상체 기구 필터링 성공");
    console.log("상체 기구 수:", filterResponse.count);

    // 3. 카테고리별 조회 테스트
    console.log("\n3️⃣ 카테고리별 조회 테스트");
    const categoryResponse = await machineApi.getMachinesByCategory("하체");
    console.log("✅ 하체 기구 조회 성공");
    console.log("하체 기구 수:", categoryResponse.count);

    // 4. 난이도별 조회 테스트
    console.log("\n4️⃣ 난이도별 조회 테스트");
    const difficultyResponse = await machineApi.getMachinesByDifficulty("초급");
    console.log("✅ 초급 기구 조회 성공");
    console.log("초급 기구 수:", difficultyResponse.count);

    console.log("\n🎯 모든 연결 테스트 성공!");
    console.log("✅ 프론트엔드와 백엔드가 정상적으로 연결되었습니다.");
  } catch (error: any) {
    console.log("❌ 연결 테스트 실패:", error.message);

    if (error.response) {
      console.log("응답 상태:", error.response.status);
      console.log("응답 데이터:", error.response.data);
    }

    console.log("\n🔧 문제 해결 방법:");
    console.log("1. 백엔드 서버가 실행 중인지 확인 (http://localhost:5000)");
    console.log("2. CORS 설정이 올바른지 확인");
    console.log("3. API 엔드포인트 경로가 올바른지 확인");
  }
}

// 브라우저 환경에서 실행
if (typeof window !== "undefined") {
  // 브라우저 콘솔에서 실행할 수 있도록 전역 함수로 등록
  (window as any).testConnection = testFrontendBackendConnection;
  console.log("🔗 연결 테스트 함수가 등록되었습니다.");
  console.log("브라우저 콘솔에서 'testConnection()'을 실행하세요.");
}

export { testFrontendBackendConnection };
