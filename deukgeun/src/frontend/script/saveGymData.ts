import { getGymsForScript } from "./getGymsForScript"
import { promises as fs } from "fs"

;(async () => {
  const gyms = await getGymsForScript()
  await fs.writeFile("data/gymData.json", JSON.stringify(gyms, null, 2))
  console.log("✅ Saved gym data to data/gymData.json")
})()
