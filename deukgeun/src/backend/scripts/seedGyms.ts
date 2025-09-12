import fs from 'fs'
import path from 'path'
import { createConnection } from 'typeorm'
import { Gym } from '../entities/Gym'
import { filterGyms } from './gymUtils'
import { convertTMToWGS84 } from '../utils/coordinateUtils'
import { config } from '../config/env'

// API related constants
const API_KEY = config.apiKeys.gymApi
const SERVICE_NAME = 'LOCALDATA_104201'
const DATA_TYPE = 'json'
const MAX_ITEMS_PER_REQUEST = 1000 // API 최대 호출 개수

// 임시 데이터 제거 - 실제 데이터베이스 데이터만 사용

// Fetch gym data from Seoul Open Data API with pagination
const fetchGymsFromAPI = async (): Promise<Partial<Gym>[]> => {
  // Check if API key is properly set
  if (
    !API_KEY ||
    API_KEY === 'your_gym_api_key' ||
    API_KEY === 'your_seoul_openapi_key_here' ||
    API_KEY.length < 10
  ) {
    console.error('❌ 서울시 공공데이터 API 키가 설정되지 않았습니다.')
    console.error(
      '   .env 파일에서 VITE_GYM_API_KEY를 실제 API 키로 설정해주세요.'
    )
    console.error(
      '   서울시 공공데이터포털(https://data.seoul.go.kr)에서 API 키를 발급받으세요.'
    )
    throw new Error('API 키가 설정되지 않음')
  }

  let allGyms: any[] = []
  let startIndex = 1
  let totalCount = 0
  let pageCount = 0

  console.log('🔄 전체 헬스장 데이터를 가져오는 중...')

  while (true) {
    const endIndex = startIndex + MAX_ITEMS_PER_REQUEST - 1
    const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/${DATA_TYPE}/${SERVICE_NAME}/${startIndex}/${endIndex}`

    console.log(
      `📡 페이지 ${++pageCount}: ${startIndex}~${endIndex} 요청 중...`
    )

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to fetch gym list from Seoul OpenAPI`
        )
      }

      const jsonData = await response.json()
      const gymsRaw = (jsonData as any)?.LOCALDATA_104201?.row

      // 데이터가 없거나 빈 배열인 경우 정상적으로 처리
      if (!gymsRaw || !Array.isArray(gymsRaw)) {
        console.log(`📄 페이지 ${pageCount}: 데이터가 없습니다.`)
        break
      }

      // 첫 번째 요청에서 전체 개수 확인
      if (pageCount === 1) {
        totalCount =
          (jsonData as any)?.LOCALDATA_104201?.list_total_count ||
          gymsRaw.length
        console.log(`📊 전체 데이터 개수: ${totalCount}개`)
      }

      console.log(`✅ 페이지 ${pageCount}: ${gymsRaw.length}개 데이터 수신`)

      // 데이터가 없으면 종료
      if (gymsRaw.length === 0) {
        console.log('📄 더 이상 가져올 데이터가 없습니다.')
        break
      }

      // 좌표 변환 및 데이터 추가
      const processedGyms = gymsRaw.map((item: any) => {
        const { lat, lon } = convertTMToWGS84(Number(item.X), Number(item.Y))
        return {
          // 원본 API 데이터 필드들
          MGTNO: item.MGTNO,
          BPLCNM: item.BPLCNM,
          BPLCDIVNM: item.BPLCDIVNM,
          RDNWHLADDR: item.RDNWHLADDR,
          SITEWHLADDR: item.SITEWHLADDR,
          SITETEL: item.SITETEL,
          X: item.X,
          Y: item.Y,
          // 변환된 좌표
          latitude: lat,
          longitude: lon,
          // 추가 메타데이터
          fetchedAt: new Date().toISOString(),
        }
      })

      allGyms = allGyms.concat(processedGyms)

      // 다음 페이지로 이동
      startIndex = endIndex + 1

      // API 호출 간격 조절 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`❌ 페이지 ${pageCount} 요청 실패:`, error)
      throw error
    }
  }

  console.log(
    `🎉 전체 ${allGyms.length}개의 헬스장 데이터를 성공적으로 가져왔습니다!`
  )
  return allGyms
}

/**
 * 헬스장 데이터를 API로부터 가져와 필터링 후 DB에 저장
 */
async function seedGyms() {
  let connection
  try {
    connection = await createConnection({
      type: 'mysql',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      synchronize: config.environment === 'development',
      logging: config.environment === 'development',
      entities: [Gym],
      subscribers: [],
      migrations: [],
    })
    console.log('📦 DB 연결 성공')

    const rawGyms = await fetchGymsFromAPI()

    // 백업: raw 데이터 JSON 저장 (원본 API 데이터)
    const rawPath = path.join(__dirname, '../../data/gyms_raw.json')
    fs.writeFileSync(rawPath, JSON.stringify(rawGyms, null, 2))
    console.log(`📝 Raw 데이터 저장됨 → ${rawPath}`)

    // DB에 저장할 데이터 변환 (검색용 데이터)
    const dbGyms = rawGyms
      .filter((item: any) => {
        // 유효한 좌표가 있는 데이터만 필터링
        return (
          item.latitude &&
          item.longitude &&
          !isNaN(item.latitude) &&
          !isNaN(item.longitude) &&
          item.latitude !== 0 &&
          item.longitude !== 0
        )
      })
      .map((item: any) => ({
        // id는 자동 생성되므로 제외
        name: item.BPLCNM,
        type: '짐',
        address: item.RDNWHLADDR || item.SITEWHLADDR,
        phone: item.SITETEL,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        is24Hours: false, // 기본값
        hasParking: false, // 기본값
        hasShower: false, // 기본값
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

    // DB에 데이터 저장
    for (const gym of dbGyms) {
      await connection.getRepository(Gym).save(gym)
    }

    console.log(`✅ ${dbGyms.length}개의 헬스장 데이터가 DB에 저장되었습니다.`)
  } catch (err) {
    console.error('❌ 헬스장 시드 실패', err)
  } finally {
    if (connection) await connection.close()
  }
}

seedGyms()
