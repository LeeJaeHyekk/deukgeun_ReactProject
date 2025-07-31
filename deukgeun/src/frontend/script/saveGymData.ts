import { getGyms } from "../pages/location/API/getGyms";
import fs from "fs/promises";

(async () => {
  const gyms = await getGyms();
  await fs.writeFile("data/gymData.json", JSON.stringify(gyms, null, 2));
  console.log("✅ Saved gym data to data/gymData.json");
})();
