import { connectDatabase } from "../config/database";
import { updateGymDetails } from "../services/gymCrawlerService";
import { Gym } from "../entities/Gym";

async function main() {
  try {
    const connection = await connectDatabase();
    console.log("📡 DB 연결 성공");

    const gymRepo = connection.getRepository(Gym);
    await updateGymDetails(gymRepo); // Pass gymRepo to the function

    console.log("✅ 크롤링 완료 후 종료");
    await connection.close(); // Close database connection
    process.exit(0);
  } catch (error) {
    console.error("❌ 실행 중 오류 발생:", error);
    process.exit(1);
  }
}

main();
