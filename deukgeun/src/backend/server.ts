import app from "./app";
import { createConnection } from "typeorm";

const PORT = process.env.PORT || 5000;

createConnection()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err);
  });
