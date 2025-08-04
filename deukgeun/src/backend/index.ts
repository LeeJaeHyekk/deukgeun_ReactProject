// import app from "./app";
// import { config } from "./config/env";
// import { logger } from "./utils/logger";

// /**
//  * 서버가 리스닝할 포트 번호
//  * 환경 변수에서 설정값을 가져오고, 기본값으로 3001을 사용합니다.
//  */
// const PORT = config.PORT || 3001;

// /**
//  * Express 서버 시작
//  * 지정된 포트에서 HTTP 요청을 리스닝하기 시작합니다.
//  * 서버 시작 시 로그를 출력하여 정상 동작을 확인할 수 있습니다.
//  */
// app.listen(PORT, () => {
//   logger.info(`Server is running on port ${PORT}`);
// });

import app from "./app";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import { connectDatabase } from "./config/database";

const PORT = config.PORT || 3001;

async function startServer() {
  try {
    const connection = await connectDatabase();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
