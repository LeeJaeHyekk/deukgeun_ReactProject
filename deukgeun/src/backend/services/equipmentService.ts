import { Repository } from 'typeorm'
import { Equipment } from '@backend/entities/Equipment'
import { Gym } from '@backend/entities/Gym'
import { 
  CreateEquipmentDTO, 
  UpdateEquipmentDTO, 
  EquipmentDTO,
  EquipmentListResponse,
  GymEquipmentSummary,
  EquipmentSearchFilter,
  EquipmentStatistics,
  EquipmentCategory,
  EquipmentType
} from '../../shared/types/equipment'
// import { EquipmentCrawlerService } from './equipmentCrawlerService' // deprecated

/**
 * 기구 정보 관리 서비스
 */
export class EquipmentService {
  private equipmentRepo: Repository<Equipment>
  private gymRepo: Repository<Gym>
  // private crawlerService: EquipmentCrawlerService // deprecated

  constructor(
    equipmentRepo: Repository<Equipment>,
    gymRepo: Repository<Gym>
  ) {
    this.equipmentRepo = equipmentRepo
    this.gymRepo = gymRepo
    // this.crawlerService = new EquipmentCrawlerService() // deprecated
  }

  /**
   * 기구 정보 생성
   */
  async createEquipment(createDto: CreateEquipmentDTO): Promise<EquipmentDTO> {
    try {
      const equipment = this.equipmentRepo.create({
        gymId: createDto.gymId,
        type: createDto.type,
        category: createDto.category,
        name: createDto.name,
        quantity: createDto.quantity,
        brand: createDto.brand,
        model: createDto.model,
        isLatestModel: createDto.isLatestModel || false,
        weightRange: createDto.weightRange,
        equipmentVariant: createDto.equipmentVariant,
        additionalInfo: createDto.additionalInfo,
        confidence: createDto.confidence || 0.8,
        source: createDto.source || 'manual'
      })

      const savedEquipment = await this.equipmentRepo.save(equipment)
      console.log(`✅ 기구 정보 생성: ${savedEquipment.name}`)

      return this.mapToDTO(savedEquipment)

    } catch (error) {
      console.error('❌ 기구 정보 생성 실패:', error)
      throw error
    }
  }

  /**
   * 기구 정보 업데이트
   */
  async updateEquipment(id: number, updateDto: UpdateEquipmentDTO): Promise<EquipmentDTO> {
    try {
      const equipment = await this.equipmentRepo.findOne({ where: { id } })
      if (!equipment) {
        throw new Error(`기구 정보를 찾을 수 없습니다: ${id}`)
      }

      Object.assign(equipment, updateDto)
      equipment.updatedAt = new Date()

      const savedEquipment = await this.equipmentRepo.save(equipment)
      console.log(`✅ 기구 정보 업데이트: ${savedEquipment.name}`)

      return this.mapToDTO(savedEquipment)

    } catch (error) {
      console.error('❌ 기구 정보 업데이트 실패:', error)
      throw error
    }
  }

  /**
   * 기구 정보 삭제
   */
  async deleteEquipment(id: number): Promise<boolean> {
    try {
      const result = await this.equipmentRepo.delete(id)
      console.log(`✅ 기구 정보 삭제: ${id}`)
      return result.affected! > 0

    } catch (error) {
      console.error('❌ 기구 정보 삭제 실패:', error)
      throw error
    }
  }

  /**
   * 기구 정보 조회
   */
  async getEquipment(id: number): Promise<EquipmentDTO | null> {
    try {
      const equipment = await this.equipmentRepo.findOne({ 
        where: { id },
        relations: ['gym']
      })

      return equipment ? this.mapToDTO(equipment) : null

    } catch (error) {
      console.error('❌ 기구 정보 조회 실패:', error)
      throw error
    }
  }

  /**
   * 기구 목록 조회
   */
  async getEquipmentList(
    filter: EquipmentSearchFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<EquipmentListResponse> {
    try {
      const queryBuilder = this.equipmentRepo.createQueryBuilder('equipment')
        .leftJoinAndSelect('equipment.gym', 'gym')

      // 필터 적용
      if (filter.gymId) {
        queryBuilder.andWhere('equipment.gymId = :gymId', { gymId: filter.gymId })
      }

      if (filter.type) {
        queryBuilder.andWhere('equipment.type = :type', { type: filter.type })
      }

      if (filter.category) {
        queryBuilder.andWhere('equipment.category = :category', { category: filter.category })
      }

      if (filter.brand) {
        queryBuilder.andWhere('equipment.brand LIKE :brand', { brand: `%${filter.brand}%` })
      }

      if (filter.isLatestModel !== undefined) {
        queryBuilder.andWhere('equipment.isLatestModel = :isLatestModel', { isLatestModel: filter.isLatestModel })
      }

      if (filter.minQuantity) {
        queryBuilder.andWhere('equipment.quantity >= :minQuantity', { minQuantity: filter.minQuantity })
      }

      if (filter.maxQuantity) {
        queryBuilder.andWhere('equipment.quantity <= :maxQuantity', { maxQuantity: filter.maxQuantity })
      }

      // 페이징
      const offset = (page - 1) * limit
      queryBuilder.skip(offset).take(limit)

      // 정렬
      queryBuilder.orderBy('equipment.createdAt', 'DESC')

      const [equipments, total] = await queryBuilder.getManyAndCount()

      return {
        equipments: equipments.map(equipment => this.mapToDTO(equipment)),
        total,
        page,
        limit
      }

    } catch (error) {
      console.error('❌ 기구 목록 조회 실패:', error)
      throw error
    }
  }

  /**
   * 헬스장별 기구 요약 정보
   */
  async getGymEquipmentSummary(gymId: number): Promise<GymEquipmentSummary> {
    try {
      const equipments = await this.equipmentRepo.find({
        where: { gymId },
        order: { category: 'ASC' }
      })

      const summary: GymEquipmentSummary = {
        gymId,
        totalEquipment: equipments.length,
        cardioEquipment: {
          total: 0,
          byCategory: {} as Record<EquipmentCategory, number>
        },
        weightEquipment: {
          total: 0,
          byCategory: {} as Record<EquipmentCategory, number>
        },
        equipmentDetails: equipments.map(equipment => this.mapToDTO(equipment))
      }

      // 카테고리별 집계
      for (const equipment of equipments) {
        if (equipment.type === EquipmentType.CARDIO) {
          summary.cardioEquipment.total += equipment.quantity
          summary.cardioEquipment.byCategory[equipment.category] = 
            (summary.cardioEquipment.byCategory[equipment.category] || 0) + equipment.quantity
        } else if (equipment.type === EquipmentType.WEIGHT) {
          summary.weightEquipment.total += equipment.quantity
          summary.weightEquipment.byCategory[equipment.category] = 
            (summary.weightEquipment.byCategory[equipment.category] || 0) + equipment.quantity
        }
      }

      return summary

    } catch (error) {
      console.error('❌ 헬스장 기구 요약 조회 실패:', error)
      throw error
    }
  }

  /**
   * 헬스장 기구 정보 크롤링 및 저장
   */
  async crawlAndSaveEquipment(gymId: number, gymName: string, gymAddress?: string): Promise<EquipmentDTO[]> {
    try {
      console.log(`🔍 헬스장 기구 정보 크롤링 시작: ${gymName}`)

      // 기존 기구 정보 삭제 (크롤링된 데이터만)
      await this.equipmentRepo.delete({
        gymId,
        source: 'crawled'
      })

      // 기구 정보 크롤링 (deprecated - 임시로 빈 배열 반환)
      const crawledData: any[] = [] // await this.crawlerService.crawlGymEquipment(gymName, gymAddress)

      // 크롤링된 데이터 저장
      const savedEquipments: EquipmentDTO[] = []
      for (const equipmentData of crawledData) {
        try {
          const createDto: CreateEquipmentDTO = {
            gymId,
            type: this.getEquipmentType(equipmentData.category),
            category: equipmentData.category,
            name: equipmentData.name,
            quantity: equipmentData.quantity || 1,
            brand: equipmentData.brand,
            model: equipmentData.model,
            isLatestModel: equipmentData.isLatestModel,
            weightRange: equipmentData.weightRange,
            equipmentVariant: equipmentData.equipmentVariant,
            additionalInfo: equipmentData.additionalInfo,
            confidence: equipmentData.confidence,
            source: 'crawled'
          }

          const savedEquipment = await this.createEquipment(createDto)
          savedEquipments.push(savedEquipment)

        } catch (error) {
          console.error(`❌ 기구 정보 저장 실패: ${equipmentData.name}`, error)
        }
      }

      console.log(`✅ 헬스장 기구 정보 크롤링 완료: ${gymName} - ${savedEquipments.length}개 저장`)
      return savedEquipments

    } catch (error) {
      console.error('❌ 헬스장 기구 정보 크롤링 실패:', error)
      throw error
    }
  }

  /**
   * 기구 통계 정보
   */
  async getEquipmentStatistics(): Promise<EquipmentStatistics> {
    try {
      const totalGyms = await this.gymRepo.count()
      const totalEquipment = await this.equipmentRepo.count()

      // 카테고리별 기구 수
      const categoryStats = await this.equipmentRepo
        .createQueryBuilder('equipment')
        .select('equipment.category', 'category')
        .addSelect('SUM(equipment.quantity)', 'count')
        .groupBy('equipment.category')
        .getRawMany()

      // 브랜드별 기구 수
      const brandStats = await this.equipmentRepo
        .createQueryBuilder('equipment')
        .select('equipment.brand', 'brand')
        .addSelect('SUM(equipment.quantity)', 'count')
        .where('equipment.brand IS NOT NULL')
        .groupBy('equipment.brand')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany()

      // 타입별 기구 수
      const typeStats = await this.equipmentRepo
        .createQueryBuilder('equipment')
        .select('equipment.type', 'type')
        .addSelect('SUM(equipment.quantity)', 'count')
        .groupBy('equipment.type')
        .getRawMany()

      const statistics: EquipmentStatistics = {
        totalGyms,
        totalEquipment,
        averageEquipmentPerGym: totalGyms > 0 ? Math.round(totalEquipment / totalGyms) : 0,
        mostCommonEquipment: categoryStats
          .sort((a, b) => parseInt(b.count) - parseInt(a.count))
          .slice(0, 10)
          .map(stat => ({
            category: stat.category as EquipmentCategory,
            count: parseInt(stat.count)
          })),
        brandDistribution: brandStats.map(stat => ({
          brand: stat.brand,
          count: parseInt(stat.count)
        })),
        equipmentByType: typeStats.map(stat => ({
          type: stat.type as EquipmentType,
          count: parseInt(stat.count),
          percentage: totalEquipment > 0 ? Math.round((parseInt(stat.count) / totalEquipment) * 100) : 0
        }))
      }

      return statistics

    } catch (error) {
      console.error('❌ 기구 통계 조회 실패:', error)
      throw error
    }
  }

  /**
   * 기구 카테고리에서 타입 추출
   */
  private getEquipmentType(category: EquipmentCategory): EquipmentType {
    const cardioCategories = [
      EquipmentCategory.TREADMILL,
      EquipmentCategory.BIKE,
      EquipmentCategory.STEPPER,
      EquipmentCategory.ROWING_MACHINE,
      EquipmentCategory.CROSS_TRAINER,
      EquipmentCategory.STAIR_MASTER,
      EquipmentCategory.SKI_MACHINE
    ]

    return cardioCategories.includes(category) ? EquipmentType.CARDIO : EquipmentType.WEIGHT
  }

  /**
   * 엔티티를 DTO로 변환
   */
  private mapToDTO(equipment: Equipment): EquipmentDTO {
    return {
      id: equipment.id,
      gymId: equipment.gymId,
      type: equipment.type,
      category: equipment.category,
      name: equipment.name,
      quantity: equipment.quantity,
      brand: equipment.brand,
      model: equipment.model,
      isLatestModel: equipment.isLatestModel,
      weightRange: equipment.weightRange,
      equipmentVariant: equipment.equipmentVariant,
      additionalInfo: equipment.additionalInfo,
      confidence: equipment.confidence,
      source: equipment.source,
      createdAt: equipment.createdAt,
      updatedAt: equipment.updatedAt
    }
  }
}
