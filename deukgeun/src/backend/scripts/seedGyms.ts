import fs from "fs"
import path from "path"
import { getDirname } from "@backend/utils/pathUtils"
import { createConnection } from "typeorm"
import { Gym } from '@backend/entities/Gym'
import { filterGyms } from "@backend/scripts/gymUtils"
import { convertTMToWGS84 } from "@backend/utils/coordinateUtils"
import { config } from "@backend/config/env"

// __dirname 대체 (ESM/CJS 둘 다 호환)
const __dirname = getDirname()

// API related constants
const API_KEY = process.env.VITE_GYM_API_KEY
const SERVICE_NAME = "LOCALDATA_104201"
const DATA_TYPE = "json"
const START_INDEX = 1
const END_INDEX = 999

// Create dummy gym data for testing
const createDummyGyms = (): Partial<Gym>[] => {
  return [
    {
      name: "강남 피트니스",
      address: "서울특별시 강남구 테헤란로 123",
      phone: "02-1234-5678",
      latitude: 37.5665,
      longitude: 126.978,
      is24Hours: true,
      hasParking: true,
      hasShower: true,
    },
    {
      name: "홍대 헬스장",
      address: "서울특별시 마포구 홍대로 456",
      phone: "02-2345-6789",
      latitude: 37.5575,
      longitude: 126.925,
      is24Hours: false,
      hasParking: false,
      hasShower: true,
    },
    {
      name: "잠실 스포츠센터",
      address: "서울특별시 송파구 올림픽로 789",
      phone: "02-3456-7890",
      latitude: 37.5139,
      longitude: 127.1006,
      is24Hours: true,
      hasParking: true,
      hasShower: true,
    },
  ]
}

// Fetch gym data from Seoul Open Data API and parse
const fetchGymsFromAPI = async (): Promise<Partial<Gym>[]> => {
  // Use dummy data if API key is not set
  if (!API_KEY || API_KEY === "your_seoul_openapi_key_here") {
    console.log("⚠️ API 키가 설정되지 않아 더미 데이터를 사용합니다.")
    return createDummyGyms()
  }

  const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/${DATA_TYPE}/${SERVICE_NAME}/${START_INDEX}/${END_INDEX}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch gym list from Seoul OpenAPI")
  }

  const jsonData = await response.json()
  const gymsRaw = (jsonData as any)?.LOCALDATA_104201?.row

  if (!gymsRaw || !Array.isArray(gymsRaw)) {
    throw new Error("Invalid data format from Seoul OpenAPI")
  }

  // Extract only required fields
  return gymsRaw.map((item: any) => {
    const { lat, lon } = convertTMToWGS84(Number(item.X), Number(item.Y))
    return {
      id: item.MGTNO,
      name: item.BPLCNM,
      type: "짐",
      address: item.RDNWHLADDR || item.SITEWHLADDR,
      phone: item.SITETEL,
      openTime: undefined,
      closeTime: undefined,
      latitude: lat,
      longitude: lon,
      is24Hours: false,
      hasParking: false,
      hasShower: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })
}

/**
 * 헬스장 데이터를 API로부터 가져와 필터링 후 DB에 저장
 */
async function seedGyms() {
  let connection
  try {
    connection = await createConnection({
      type: "mysql",
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      synchronize: config.environment === "development",
      logging: config.environment === "development",
      entities: [Gym],
      subscribers: [],
      migrations: [],
    })
    console.log("📦 DB 연결 성공")

    const rawGyms = await fetchGymsFromAPI()

    // 백업: raw 데이터 JSON 저장
    const rawPath = path.join(__dirname, "../../data/gyms_raw.json")
    fs.writeFileSync(rawPath, JSON.stringify(rawGyms, null, 2))
    console.log(`📝 Raw 데이터 저장됨 → ${rawPath}`)

    // DB에 데이터 저장
    for (const gym of rawGyms) {
      await connection.getRepository(Gym).save(gym)
    }

    console.log("✅ 필터링된 헬스장 DB 저장 완료")
  } catch (err) {
    console.error("❌ 헬스장 시드 실패", err)
  } finally {
    if (connection) await connection.close()
  }
}

seedGyms()
