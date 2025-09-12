import { Repository } from 'typeorm'
import { Gym } from '../entities/Gym'
import { AppDataSource } from '../config/database'

export interface SearchFilters {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  radius?: number
  is24Hours?: boolean
  hasPT?: boolean
  hasGX?: boolean
  hasParking?: boolean
  hasShower?: boolean
  limit?: number
  offset?: number
}

export interface SearchResult {
  gyms: Gym[]
  totalCount: number
  hasMore: boolean
}

export class OptimizedGymSearchService {
  private gymRepository: Repository<Gym>

  constructor() {
    this.gymRepository = AppDataSource.getRepository(Gym)
  }

  /**
   * 최적화된 헬스장 검색
   * 1. 위치 기반 검색 시 bounding box를 사용하여 먼저 필터링
   * 2. 인덱스를 활용한 효율적인 쿼리
   * 3. 페이지네이션 적용
   */
  async searchGyms(filters: SearchFilters): Promise<SearchResult> {
    const {
      name,
      address,
      latitude,
      longitude,
      radius = 10,
      is24Hours,
      hasPT,
      hasGX,
      hasParking,
      hasShower,
      limit = 50,
      offset = 0,
    } = filters

    const queryBuilder = this.gymRepository.createQueryBuilder('gym')

    // 1. 위치 기반 검색 최적화 (bounding box 사용)
    if (latitude && longitude) {
      // 위도/경도 기준으로 대략적인 bounding box 계산
      const latDelta = radius / 111.0 // 1도 ≈ 111km
      const lngDelta = radius / (111.0 * Math.cos((latitude * Math.PI) / 180))

      queryBuilder
        .where('gym.latitude BETWEEN :minLat AND :maxLat', {
          minLat: latitude - latDelta,
          maxLat: latitude + latDelta,
        })
        .andWhere('gym.longitude BETWEEN :minLng AND :maxLng', {
          minLng: longitude - lngDelta,
          maxLng: longitude + lngDelta,
        })
        .andWhere(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude)))) <= :radius`,
          { lat: latitude, lng: longitude, radius }
        )
    }

    // 2. 헬스장명 검색 (인덱스 활용)
    if (name) {
      // 정확한 매칭 우선, 그 다음 부분 매칭
      queryBuilder.andWhere(
        '(gym.name = :exactName OR gym.name LIKE :partialName)',
        {
          exactName: name,
          partialName: `%${name}%`,
        }
      )
    }

    // 3. 주소 검색 (인덱스 활용)
    if (address) {
      queryBuilder.andWhere('gym.address LIKE :address', {
        address: `%${address}%`,
      })
    }

    // 4. 시설 필터 (인덱스 활용)
    if (is24Hours !== undefined) {
      queryBuilder.andWhere('gym.is24Hours = :is24Hours', { is24Hours })
    }

    if (hasPT !== undefined) {
      queryBuilder.andWhere('gym.hasPT = :hasPT', { hasPT })
    }

    if (hasGX !== undefined) {
      queryBuilder.andWhere('gym.hasGX = :hasGX', { hasGX })
    }

    if (hasParking !== undefined) {
      queryBuilder.andWhere('gym.hasParking = :hasParking', { hasParking })
    }

    if (hasShower !== undefined) {
      queryBuilder.andWhere('gym.hasShower = :hasShower', { hasShower })
    }

    // 5. 정렬 및 페이지네이션
    if (latitude && longitude) {
      // 거리순 정렬
      queryBuilder
        .addSelect(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude))))`,
          'distance'
        )
        .setParameter('lat', latitude)
        .setParameter('lng', longitude)
        .orderBy('distance', 'ASC')
    } else {
      // 이름순 정렬
      queryBuilder.orderBy('gym.name', 'ASC')
    }

    // 6. 페이지네이션
    queryBuilder.limit(limit).offset(offset)

    // 7. 총 개수 조회 (페이지네이션을 위해)
    const totalCountQuery = queryBuilder.clone()
    const totalCount = await totalCountQuery.getCount()

    // 8. 실제 데이터 조회
    const gyms = await queryBuilder.getMany()

    return {
      gyms,
      totalCount,
      hasMore: offset + limit < totalCount,
    }
  }

  /**
   * 빠른 위치 기반 검색 (캐싱 가능)
   */
  async getNearbyGyms(
    latitude: number,
    longitude: number,
    radius: number = 5,
    limit: number = 20
  ): Promise<Gym[]> {
    const result = await this.searchGyms({
      latitude,
      longitude,
      radius,
      limit,
    })

    return result.gyms
  }

  /**
   * 헬스장명 자동완성 검색
   */
  async searchGymNames(query: string, limit: number = 10): Promise<string[]> {
    const gyms = await this.gymRepository
      .createQueryBuilder('gym')
      .select('gym.name')
      .where('gym.name LIKE :query', { query: `%${query}%` })
      .orderBy('gym.name', 'ASC')
      .limit(limit)
      .getMany()

    return gyms.map(gym => gym.name)
  }

  /**
   * 지역별 헬스장 통계
   */
  async getGymStatsByRegion(): Promise<
    Array<{
      region: string
      count: number
      avgLatitude: number
      avgLongitude: number
    }>
  > {
    const stats = await this.gymRepository
      .createQueryBuilder('gym')
      .select([
        'SUBSTRING(gym.address, 1, LOCATE("구", gym.address) + 1) as region',
        'COUNT(*) as count',
        'AVG(gym.latitude) as avgLatitude',
        'AVG(gym.longitude) as avgLongitude',
      ])
      .where('gym.address LIKE "%구%"')
      .groupBy('region')
      .orderBy('count', 'DESC')
      .getRawMany()

    return stats.map(stat => ({
      region: stat.region,
      count: parseInt(stat.count),
      avgLatitude: parseFloat(stat.avgLatitude),
      avgLongitude: parseFloat(stat.avgLongitude),
    }))
  }

  /**
   * 시설별 헬스장 통계
   */
  async getGymStatsByFacilities(): Promise<{
    totalGyms: number
    facilities: {
      is24Hours: number
      hasPT: number
      hasGX: number
      hasParking: number
      hasShower: number
    }
  }> {
    const stats = await this.gymRepository
      .createQueryBuilder('gym')
      .select([
        'COUNT(*) as totalGyms',
        'SUM(gym.is24Hours) as is24Hours',
        'SUM(gym.hasPT) as hasPT',
        'SUM(gym.hasGX) as hasGX',
        'SUM(gym.hasParking) as hasParking',
        'SUM(gym.hasShower) as hasShower',
      ])
      .getRawOne()

    return {
      totalGyms: parseInt(stats.totalGyms),
      facilities: {
        is24Hours: parseInt(stats.is24Hours),
        hasPT: parseInt(stats.hasPT),
        hasGX: parseInt(stats.hasGX),
        hasParking: parseInt(stats.hasParking),
        hasShower: parseInt(stats.hasShower),
      },
    }
  }
}

// 싱글톤 인스턴스
export const optimizedGymSearchService = new OptimizedGymSearchService()
