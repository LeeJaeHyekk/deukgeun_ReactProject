import { updateGymDatabase, checkDatabaseStatus } from "./updateGymDatabase";

/**
 * 데이터베이스 업데이트 기능 테스트
 */
async function testDatabaseUpdate() {
  console.log("🧪 데이터베이스 업데이트 테스트 시작...\n");

  try {
    // 1. 현재 데이터베이스 상태 확인
    console.log("1️⃣ 현재 데이터베이스 상태 확인 중...");
    const status = await checkDatabaseStatus();

    if (status?.success) {
      console.log("✅ 데이터베이스 상태:", status.data);
    } else {
      console.log("⚠️ 데이터베이스 상태 확인 실패");
    }

    // 2. 데이터베이스 업데이트 실행
    console.log("\n2️⃣ 데이터베이스 업데이트 실행 중...");
    const result = await updateGymDatabase();

    if (result.success) {
      console.log("✅ 업데이트 성공!");
      console.log("📊 결과:", {
        totalFetched: result.totalFetched,
        validCount: result.validCount,
        message: result.message,
      });
    } else {
      console.log("❌ 업데이트 실패:", result.error);
    }

    // 3. 업데이트 후 상태 재확인
    console.log("\n3️⃣ 업데이트 후 데이터베이스 상태 확인 중...");
    const updatedStatus = await checkDatabaseStatus();

    if (updatedStatus?.success) {
      console.log("✅ 업데이트 후 상태:", updatedStatus.data);
    } else {
      console.log("⚠️ 업데이트 후 상태 확인 실패");
    }

    console.log("\n🎉 테스트 완료!");
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
  }
}

// 스크립트 실행
if (typeof window === "undefined") {
  testDatabaseUpdate()
    .then(() => {
      console.log("테스트 스크립트 실행 완료");
      process.exit(0);
    })
    .catch((error) => {
      console.error("테스트 스크립트 실행 실패:", error);
      process.exit(1);
    });
}

export { testDatabaseUpdate };
