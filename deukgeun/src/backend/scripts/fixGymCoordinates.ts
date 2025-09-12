import { createConnection } from 'typeorm'
import { Gym } from '../entities/Gym'
import { convertTMToWGS84 } from '../utils/coordinateUtils'
import { config } from '../config/env'

/**
 * 헬스장 좌표를 수정하는 스크립트
 * 1. 잘못된 좌표를 가진 헬스장들을 식별
 * 2. 원본 TM 좌표를 사용해 올바른 WGS84 좌표로 변환
 * 3. 중복된 헬스장 데이터 제거
 */
async function fixGymCoordinates() {
  let connection
  try {
    connection = await createConnection({
      type: 'mysql',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      synchronize: false,
      logging: false,
      entities: [Gym],
      subscribers: [],
      migrations: [],
    })
    console.log('📦 DB 연결 성공')

    const gymRepository = connection.getRepository(Gym)

    // 1. 잘못된 좌표를 가진 헬스장들 찾기 (중국 상하이 좌표)
    const wrongCoordinateGyms = await gymRepository.find({
      where: {
        latitude: 31.775724,
        longitude: 123.7095141,
      },
    })

    console.log(`🔍 잘못된 좌표를 가진 헬스장: ${wrongCoordinateGyms.length}개`)

    // 2. 원본 데이터에서 올바른 좌표 찾기
    const fs = require('fs')
    const path = require('path')
    const rawDataPath = path.join(__dirname, '../../data/gyms_raw.json')

    if (!fs.existsSync(rawDataPath)) {
      console.error('❌ 원본 데이터 파일이 없습니다:', rawDataPath)
      return
    }

    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'))
    console.log(`📄 원본 데이터 로드: ${rawData.length}개`)

    // 3. 헬스장명으로 매칭하여 올바른 좌표로 업데이트
    let updatedCount = 0
    let notFoundCount = 0

    for (const gym of wrongCoordinateGyms) {
      // 원본 데이터에서 같은 이름의 헬스장 찾기
      const matchingRawData = rawData.find(
        (raw: any) =>
          raw.BPLCNM === gym.name ||
          raw.BPLCNM?.includes(gym.name) ||
          gym.name?.includes(raw.BPLCNM)
      )

      if (matchingRawData && matchingRawData.X && matchingRawData.Y) {
        try {
          // TM 좌표를 WGS84로 변환
          const { lat, lon } = convertTMToWGS84(
            Number(matchingRawData.X),
            Number(matchingRawData.Y)
          )

          // 좌표 업데이트
          await gymRepository.update(gym.id, {
            latitude: lat,
            longitude: lon,
            updatedAt: new Date(),
          })

          console.log(
            `✅ ${gym.name}: 좌표 업데이트 (${lat.toFixed(7)}, ${lon.toFixed(7)})`
          )
          updatedCount++
        } catch (error) {
          console.error(`❌ ${gym.name}: 좌표 변환 실패`, error)
        }
      } else {
        console.log(
          `⚠️ ${gym.name}: 원본 데이터에서 매칭되는 헬스장을 찾을 수 없음`
        )
        notFoundCount++
      }
    }

    console.log(`\n📊 좌표 수정 완료:`)
    console.log(`  - 업데이트된 헬스장: ${updatedCount}개`)
    console.log(`  - 매칭되지 않은 헬스장: ${notFoundCount}개`)

    // 4. 중복된 헬스장 데이터 제거
    console.log('\n🔍 중복된 헬스장 데이터 제거 중...')

    const allGyms = await gymRepository.find()
    const duplicateGroups = new Map<string, Gym[]>()

    // 이름과 주소로 그룹화
    allGyms.forEach(gym => {
      const key = `${gym.name}_${gym.address}`
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, [])
      }
      duplicateGroups.get(key)!.push(gym)
    })

    let removedCount = 0
    for (const [key, gyms] of duplicateGroups) {
      if (gyms.length > 1) {
        // 가장 최근에 생성된 것만 남기고 나머지 삭제
        gyms.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        const toRemove = gyms.slice(1)

        for (const gym of toRemove) {
          await gymRepository.remove(gym)
          removedCount++
        }

        console.log(`🗑️ 중복 제거: ${gyms[0].name} (${toRemove.length}개 삭제)`)
      }
    }

    console.log(`\n📊 중복 제거 완료: ${removedCount}개 헬스장 삭제`)
  } catch (err) {
    console.error('❌ 좌표 수정 실패', err)
  } finally {
    if (connection) await connection.close()
  }
}

fixGymCoordinates()
