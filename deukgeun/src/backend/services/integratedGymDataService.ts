import { Repository } from 'typeorm'
import { Gym } from '../entities/Gym'
import { config } from '../config/env'
import axios from 'axios'
import { EquipmentService } from './equipmentService'
import { EquipmentDTO } from '../../shared/types/equipment'

// 통합 검색 결과 인터페이스
interface IntegratedSearchResult {
  id: string
  name: string
  type: string
  address: string
  phone: string
  latitude: number
  longitude: number
  is24Hours: boolean
  hasParking: boolean
  hasShower: boolean
  hasPT: boolean
  hasGX: boolean
  hasGroupPT: boolean
  openHour: string
  closeHour: string
  price: string
  rating: number
  reviewCount: number
  source: string
  confidence: number
  additionalInfo: Record<string, any>
  equipment?: EquipmentDTO[]
}

/**
 * 통합 헬스장 데이터 서비스
 * 다양한 소스에서 헬스장 데이터를 통합 검색하는 서비스
 */
export class IntegratedGymDataService {
  private gymRepo: Repository<Gym>
  private equipmentService: EquipmentService

  constructor(gymRepo: Repository<Gym>, equipmentService: EquipmentService) {
    this.gymRepo = gymRepo
    this.equipmentService = equipmentService
  }

  /**
   * 모든 소스에서 헬스장 검색 (기구 정보 포함)
   */
  async searchAllSources(gymName: string, includeEquipment: boolean = true): Promise<IntegratedSearchResult | null> {
    console.log(`🔍 통합 검색 시작: ${gymName}`)

    try {
      // 1. 데이터베이스에서 검색
      const dbResult = await this.searchFromDatabase(gymName)
      if (dbResult) {
        console.log(`✅ 데이터베이스에서 검색 성공: ${gymName}`)
        
        // 기구 정보 포함 요청 시 추가
        if (includeEquipment && dbResult.id) {
          const gymId = parseInt(dbResult.id)
          const equipmentSummary = await this.equipmentService.getGymEquipmentSummary(gymId)
          dbResult.equipment = equipmentSummary.equipmentDetails
        }
        
        return dbResult
      }

      // 2. 공공 API에서 검색
      const publicApiResult = await this.searchFromPublicApi(gymName)
      if (publicApiResult) {
        console.log(`✅ 공공 API에서 검색 성공: ${gymName}`)
        
        // 기구 정보 크롤링 및 저장
        if (includeEquipment) {
          await this.crawlAndSaveEquipment(publicApiResult)
        }
        
        return publicApiResult
      }

      // 3. 카카오 API에서 검색
      const kakaoResult = await this.searchFromKakaoApi(gymName)
      if (kakaoResult) {
        console.log(`✅ 카카오 API에서 검색 성공: ${gymName}`)
        
        // 기구 정보 크롤링 및 저장
        if (includeEquipment) {
          await this.crawlAndSaveEquipment(kakaoResult)
        }
        
        return kakaoResult
      }

      console.log(`❌ 모든 소스에서 검색 실패: ${gymName}`)
      return null

    } catch (error) {
      console.error(`❌ 통합 검색 실패: ${gymName}`, error)
      return null
    }
  }

  /**
   * 데이터베이스에서 헬스장 검색
   */
  private async searchFromDatabase(gymName: string): Promise<IntegratedSearchResult | null> {
    try {
      const gym = await this.gymRepo.findOne({
        where: { name: gymName }
      })

      if (!gym) {
        return null
      }

      return {
        id: gym.id.toString(),
        name: gym.name,
        type: gym.type || '짐',
        address: gym.address,
        phone: gym.phone || '',
        latitude: gym.latitude,
        longitude: gym.longitude,
        is24Hours: gym.is24Hours || false,
        hasParking: gym.hasParking || false,
        hasShower: gym.hasShower || false,
        hasPT: gym.hasPT || false,
        hasGX: gym.hasGX || false,
        hasGroupPT: gym.hasGroupPT || false,
        openHour: gym.openHour || '',
        closeHour: gym.closeHour || '',
        price: gym.price || '',
        rating: gym.rating || 0,
        reviewCount: gym.reviewCount || 0,
        source: 'database',
        confidence: 0.9,
        additionalInfo: {
          lastUpdated: gym.updatedAt?.toISOString(),
          createdAt: gym.createdAt?.toISOString()
        }
      }

    } catch (error) {
      console.error('❌ 데이터베이스 검색 실패:', error)
      return null
    }
  }

  /**
   * 공공 API에서 헬스장 검색
   */
  private async searchFromPublicApi(gymName: string): Promise<IntegratedSearchResult | null> {
    try {
      if (!config.apiKeys.seoulOpenApi) {
        console.log('⚠️ 서울시 공공데이터 API 키가 없습니다')
        return null
      }

      const response = await axios.get(
        `http://openapi.seoul.go.kr:8088/${config.apiKeys.seoulOpenApi}/json/LOCALDATA_104201/1/1000/`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )

      if (!response.data.LOCALDATA_104201?.row) {
        return null
      }

      const gymData = response.data.LOCALDATA_104201.row.find((item: any) =>
        item.BPLCNM && item.BPLCNM.includes(gymName)
      )

      if (!gymData) {
        return null
      }

      return {
        id: gymData.MGTNO || `SEOUL_${Date.now()}`,
        name: gymData.BPLCNM || '',
        type: '짐',
        address: gymData.RDNWHLADDR || gymData.SITEWHLADDR || '',
        phone: gymData.SITETEL || '',
        latitude: parseFloat(gymData.Y) || 0,
        longitude: parseFloat(gymData.X) || 0,
        is24Hours: false,
        hasParking: false,
        hasShower: false,
        hasPT: false,
        hasGX: false,
        hasGroupPT: false,
        openHour: '',
        closeHour: '',
        price: '',
        rating: 0,
        reviewCount: 0,
        source: 'seoul_opendata',
        confidence: 0.8,
        additionalInfo: {
          businessStatus: gymData.BSN_STATE_NM,
          lastUpdated: gymData.LAST_UPDT_DTM
        }
      }

    } catch (error) {
      console.error('❌ 공공 API 검색 실패:', error)
      return null
    }
  }

  /**
   * 카카오 API에서 헬스장 검색
   */
  private async searchFromKakaoApi(gymName: string): Promise<IntegratedSearchResult | null> {
    try {
      if (!config.apiKeys.kakao) {
        console.log('⚠️ 카카오 API 키가 없습니다')
        return null
      }

      const response = await axios.get(
        'https://dapi.kakao.com/v2/local/search/keyword.json',
        {
          params: {
            query: `${gymName} 헬스장`,
            size: 15
          },
          headers: {
            'Authorization': `KakaoAK ${config.apiKeys.kakao}`
          },
          timeout: 10000
        }
      )

      if (!response.data.documents || response.data.documents.length === 0) {
        return null
      }

      const gymData = response.data.documents.find((item: any) =>
        item.category_name && item.category_name.includes('헬스')
      )

      if (!gymData) {
        return null
      }

      return {
        id: gymData.id || `KAKAO_${Date.now()}`,
        name: gymData.place_name || '',
        type: '짐',
        address: gymData.address_name || '',
        phone: gymData.phone || '',
        latitude: parseFloat(gymData.y) || 0,
        longitude: parseFloat(gymData.x) || 0,
        is24Hours: false,
        hasParking: false,
        hasShower: false,
        hasPT: false,
        hasGX: false,
        hasGroupPT: false,
        openHour: '',
        closeHour: '',
        price: '',
        rating: 0,
        reviewCount: 0,
        source: 'kakao_api',
        confidence: 0.7,
        additionalInfo: {
          categoryName: gymData.category_name,
          placeUrl: gymData.place_url
        }
      }

    } catch (error) {
      console.error('❌ 카카오 API 검색 실패:', error)
      return null
    }
  }

  /**
   * 헬스장 데이터 저장
   */
  async saveGymData(gymData: IntegratedSearchResult): Promise<boolean> {
    try {
      const existingGym = await this.gymRepo.findOne({
        where: { name: gymData.name }
      })

      if (existingGym) {
        // 기존 데이터 업데이트
        Object.assign(existingGym, {
          type: gymData.type,
          address: gymData.address,
          phone: gymData.phone,
          latitude: gymData.latitude,
          longitude: gymData.longitude,
          is24Hours: gymData.is24Hours,
          hasParking: gymData.hasParking,
          hasShower: gymData.hasShower,
          hasPT: gymData.hasPT,
          hasGX: gymData.hasGX,
          hasGroupPT: gymData.hasGroupPT,
          openHour: gymData.openHour,
          closeHour: gymData.closeHour,
          price: gymData.price,
          rating: gymData.rating,
          reviewCount: gymData.reviewCount,
          source: gymData.source,
          updatedAt: new Date()
        })

        await this.gymRepo.save(existingGym)
        console.log(`✅ 헬스장 데이터 업데이트: ${gymData.name}`)
      } else {
        // 새 데이터 생성
        const newGym = this.gymRepo.create({
          name: gymData.name,
          type: gymData.type,
          address: gymData.address,
          phone: gymData.phone,
          latitude: gymData.latitude,
          longitude: gymData.longitude,
          is24Hours: gymData.is24Hours,
          hasParking: gymData.hasParking,
          hasShower: gymData.hasShower,
          hasPT: gymData.hasPT,
          hasGX: gymData.hasGX,
          hasGroupPT: gymData.hasGroupPT,
          openHour: gymData.openHour,
          closeHour: gymData.closeHour,
          price: gymData.price,
          rating: gymData.rating,
          reviewCount: gymData.reviewCount,
          source: gymData.source,
          createdAt: new Date(),
          updatedAt: new Date()
        })

        await this.gymRepo.save(newGym)
        console.log(`✅ 새 헬스장 데이터 저장: ${gymData.name}`)
      }

      return true

    } catch (error) {
      console.error('❌ 헬스장 데이터 저장 실패:', error)
      return false
    }
  }

  /**
   * 헬스장 데이터 일괄 저장
   */
  async saveMultipleGymData(gymDataList: IntegratedSearchResult[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const gymData of gymDataList) {
      try {
        const result = await this.saveGymData(gymData)
        if (result) {
          success++
        } else {
          failed++
          errors.push(`저장 실패: ${gymData.name}`)
        }
      } catch (error) {
        failed++
        errors.push(`저장 오류: ${gymData.name} - ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      }
    }

    console.log(`📊 헬스장 데이터 일괄 저장 완료: 성공 ${success}개, 실패 ${failed}개`)

    return { success, failed, errors }
  }

  /**
   * 기구 정보 크롤링 및 저장
   */
  private async crawlAndSaveEquipment(gymResult: IntegratedSearchResult): Promise<void> {
    try {
      if (!gymResult.id || !gymResult.name) {
        return
      }

      const gymId = parseInt(gymResult.id)
      const equipmentData = await this.equipmentService.crawlAndSaveEquipment(
        gymId,
        gymResult.name,
        gymResult.address
      )

      // 크롤링된 기구 정보를 결과에 추가
      gymResult.equipment = equipmentData

    } catch (error) {
      console.error('❌ 기구 정보 크롤링 실패:', error)
    }
  }

  /**
   * 헬스장 기구 정보만 크롤링
   */
  async crawlGymEquipment(gymId: number, gymName: string, gymAddress?: string): Promise<EquipmentDTO[]> {
    try {
      return await this.equipmentService.crawlAndSaveEquipment(gymId, gymName, gymAddress)
    } catch (error) {
      console.error('❌ 헬스장 기구 정보 크롤링 실패:', error)
      throw error
    }
  }

  /**
   * 헬스장 기구 요약 정보 조회
   */
  async getGymEquipmentSummary(gymId: number) {
    try {
      return await this.equipmentService.getGymEquipmentSummary(gymId)
    } catch (error) {
      console.error('❌ 헬스장 기구 요약 조회 실패:', error)
      throw error
    }
  }
}