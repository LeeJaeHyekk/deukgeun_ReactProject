import app from "./app";
import { createConnection } from "typeorm";
import { autoInitializeScheduler } from "./services/autoUpdateScheduler";

const PORT = process.env.PORT || 5000;

createConnection()
  .then(() => {
    console.log("✅ Database connected");

    // 자동 업데이트 스케줄러 초기화
    autoInitializeScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err);
  });
