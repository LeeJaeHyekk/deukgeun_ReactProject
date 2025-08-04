// import { connectDatabase } from "../config/database";
// import { updateGymDetails } from "../services/gymCrawlerService";
// import { getRepository } from "typeorm";
// import { Gym } from "../entities/Gym";

// (async () => {
//   try {
//     const connection = await connectDatabase(); // 이 함수 내부에서 `createConnection()` 또는 `createConnection().then(...)`을 해야 함
//     console.log("📡 DB 연결 성공");

//     const gymRepo = getRepository(Gym); // TypeORM v0.2에서는 이렇게 가져옴

//     await updateGymDetails(); // 이 함수가 gymRepo를 내부에서 사용할 수 있어야 함
//     console.log("✅ 크롤링 완료 후 종료");

//     await connection.close(); // 연결 닫기
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ DB 연결 실패:", error);
//     process.exit(1);
//   }
// })();

// import { connectDatabase } from "../config/database";
// import { updateGymDetails } from "../services/gymCrawlerService";

// (async () => {
//   try {
//     const connection = await connectDatabase();
//     console.log("📡 DB 연결 성공");

//     await updateGymDetails(); // 내부에서 필요한 repo를 직접 호출하도록 구성했다면 OK
//     console.log("✅ 크롤링 완료 후 종료");

//     await connection.close();
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ DB 연결 실패:", error);
//     process.exit(1);
//   }
// })();

// import { connectDatabase } from "../config/database";
// import { updateGymDetails } from "../services/gymCrawlerService";
// import { Gym } from "../entities/Gym";

// async function main() {
//   try {
//     const connection = await connectDatabase();
//     console.log("📡 DB 연결 성공");

//     const gymRepo = connection.getRepository(Gym);
//     // 필요하면 gymRepo를 updateGymDetails에 넘기기
//     await updateGymDetails(gymRepo);

//     console.log("✅ 크롤링 완료 후 종료");
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ 실행 중 오류 발생:", error);
//     process.exit(1);
//   }
// }

// main();

import { connectDatabase } from "../config/database";
import { updateGymDetails } from "../services/gymCrawlerService";
import { Gym } from "../entities/Gym";

async function main() {
  try {
    const connection = await connectDatabase();
    console.log("📡 DB 연결 성공");

    const gymRepo = connection.getRepository(Gym);
    await updateGymDetails(gymRepo); // gymRepo를 넘겨줌

    console.log("✅ 크롤링 완료 후 종료");

    await connection.close(); // TypeORM v0.2에서는 close()가 아니라 destroy()
    process.exit(0);
  } catch (error) {
    console.error("❌ 실행 중 오류 발생:", error);
    process.exit(1);
  }
}

main();
