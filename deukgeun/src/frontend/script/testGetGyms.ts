// src/scripts/testGetGyms.ts

import { getGyms } from "../pages/location/API/getGyms.js";

(async () => {
  try {
    const gyms = await getGyms();
    console.log("✅ 가져온 헬스장 수:", gyms.length);
    console.log(gyms.slice(0, 3)); // 처음 3개만 출력
  } catch (err) {
    console.error("❌ 에러 발생:", err);
  }
})();
