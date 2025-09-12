// ============================================================================
// 최적화된 머신 서비스
// 기존 MachineService를 최적화하여 성능과 확장성을 향상
// ============================================================================

import { AppDataSource } from '../config/database'
import { Machine } from '../entities/Machine'
import type {
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
  MachineCategory,
  DifficultyLevel,
} from '../types/machine'
import { logger } from '../utils/logger'

// 캐시 관리 클래스
class MachineCacheManager {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5분

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // 패턴으로 캐시 삭제
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// 쿼리 빌더 최적화 클래스
class OptimizedQueryBuilder {
  private query: any
  private cacheKey: string = ''

  constructor(repository: any) {
    this.query = repository.createQueryBuilder('machine')
  }

  where(condition: string, parameters?: any): this {
    this.query.andWhere(condition, parameters)
    return this
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.query.orderBy(`machine.${field}`, direction)
    return this
  }

  limit(count: number): this {
    this.query.limit(count)
    return this
  }

  offset(count: number): this {
    this.query.offset(count)
    return this
  }

  // 캐시 키 생성
  generateCacheKey(): string {
    if (!this.cacheKey) {
      const sql = this.query.getSql()
      const params = this.query.getParameters()
      this.cacheKey = `query:${Buffer.from(sql + JSON.stringify(params)).toString('base64')}`
    }
    return this.cacheKey
  }

  async getMany(): Promise<any[]> {
    return this.query.getMany()
  }

  async getOne(): Promise<any | null> {
    return this.query.getOne()
  }

  async getCount(): Promise<number> {
    return this.query.getCount()
  }
}

/**
 * 최적화된 Machine 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 캐싱, 쿼리 최적화, 성능 모니터링을 포함
 */
export class OptimizedMachineService {
  private machineRepository = AppDataSource.getRepository(Machine)
  private cacheManager = new MachineCacheManager()

  /**
   * 새로운 Machine을 생성합니다.
   */
  async createMachine(machineData: CreateMachineRequest): Promise<Machine> {
    const sanitizedData = this.sanitizeMachineData(machineData)

    const machine = this.machineRepository.create(sanitizedData as any)
    const savedMachine = await this.machineRepository.save(machine)
    const result = Array.isArray(savedMachine) ? savedMachine[0] : savedMachine

    // 캐시 무효화
    this.invalidateCache()

    logger.info(`Machine created - ID: ${result.id}, Name: ${result.name}`)
    return result
  }

  /**
   * 모든 Machine을 조회합니다. (캐시 적용)
   */
  async getAllMachines(useCache: boolean = true): Promise<Machine[]> {
    const cacheKey = 'all-machines'

    if (useCache) {
      const cached = this.cacheManager.get<Machine[]>(cacheKey)
      if (cached) {
        logger.debug('Cache hit for all machines')
        return cached
      }
    }

    try {
      const machines = await this.machineRepository.find({
        order: { name: 'ASC' },
      })

      // 캐시에 저장
      this.cacheManager.set(cacheKey, machines, 10 * 60 * 1000) // 10분

      logger.info(`Retrieved ${machines.length} machines from database`)
      return machines
    } catch (error) {
      logger.error('Error retrieving all machines:', error)
      return []
    }
  }

  /**
   * ID로 특정 Machine을 조회합니다. (캐시 적용)
   */
  async getMachineById(
    id: number,
    useCache: boolean = true
  ): Promise<Machine | null> {
    const cacheKey = `machine-${id}`

    if (useCache) {
      const cached = this.cacheManager.get<Machine>(cacheKey)
      if (cached) {
        logger.debug(`Cache hit for machine ID: ${id}`)
        return cached
      }
    }

    try {
      const machine = await this.machineRepository.findOne({ where: { id } })

      if (machine) {
        // 캐시에 저장
        this.cacheManager.set(cacheKey, machine, 15 * 60 * 1000) // 15분
      }

      return machine
    } catch (error) {
      logger.error(`Error retrieving machine ID ${id}:`, error)
      return null
    }
  }

  /**
   * machineKey로 특정 Machine을 조회합니다. (캐시 적용)
   */
  async getMachineByKey(
    machineKey: string,
    useCache: boolean = true
  ): Promise<Machine | null> {
    const cacheKey = `machine-key-${machineKey}`

    if (useCache) {
      const cached = this.cacheManager.get<Machine>(cacheKey)
      if (cached) {
        logger.debug(`Cache hit for machine key: ${machineKey}`)
        return cached
      }
    }

    try {
      const machine = await this.machineRepository.findOne({
        where: { machineKey },
      })

      if (machine) {
        // 캐시에 저장
        this.cacheManager.set(cacheKey, machine, 15 * 60 * 1000) // 15분
      }

      return machine
    } catch (error) {
      logger.error(`Error retrieving machine key ${machineKey}:`, error)
      return null
    }
  }

  /**
   * 기존 Machine을 업데이트합니다.
   */
  async updateMachine(
    id: number,
    updateData: UpdateMachineRequest
  ): Promise<Machine | null> {
    try {
      const machine = await this.machineRepository.findOne({ where: { id } })
      if (!machine) return null

      Object.assign(machine, updateData)
      const updatedMachine = await this.machineRepository.save(machine)

      // 관련 캐시 무효화
      this.invalidateMachineCache(id)
      this.invalidateCache()

      logger.info(`Machine updated - ID: ${id}`)
      return updatedMachine
    } catch (error) {
      logger.error(`Error updating machine ID ${id}:`, error)
      return null
    }
  }

  /**
   * Machine을 삭제합니다.
   */
  async deleteMachine(id: number): Promise<boolean> {
    try {
      const machine = await this.machineRepository.findOne({ where: { id } })
      if (!machine) return false

      await this.machineRepository.remove(machine)

      // 관련 캐시 무효화
      this.invalidateMachineCache(id)
      this.invalidateCache()

      logger.info(`Machine deleted - ID: ${id}`)
      return true
    } catch (error) {
      logger.error(`Error deleting machine ID ${id}:`, error)
      return false
    }
  }

  /**
   * 조건에 따라 Machine을 필터링하여 조회합니다. (최적화된 쿼리)
   */
  async filterMachines(filters: MachineFilterQuery): Promise<Machine[]> {
    const cacheKey = `filter-${JSON.stringify(filters)}`

    // 캐시 확인
    const cached = this.cacheManager.get<Machine[]>(cacheKey)
    if (cached) {
      logger.debug('Cache hit for filtered machines')
      return cached
    }

    try {
      const queryBuilder = new OptimizedQueryBuilder(this.machineRepository)

      if (filters.category) {
        queryBuilder.where('machine.category = :category', {
          category: filters.category,
        })
      }

      if (filters.difficulty) {
        queryBuilder.where('machine.difficulty = :difficulty', {
          difficulty: filters.difficulty,
        })
      }

      if (filters.target) {
        // 최적화된 JSON 검색 쿼리
        queryBuilder.where(
          '(JSON_SEARCH(machine.anatomy->"$.primaryMuscles", "one", :targetPattern) IS NOT NULL OR JSON_SEARCH(machine.anatomy->"$.secondaryMuscles", "one", :targetPattern) IS NOT NULL)',
          {
            targetPattern: `%${filters.target}%`,
          }
        )
      }

      if (filters.search) {
        queryBuilder.where(
          '(machine.name LIKE :search OR machine.nameEn LIKE :search OR machine.shortDesc LIKE :search)',
          {
            search: `%${filters.search}%`,
          }
        )
      }

      queryBuilder.orderBy('name', 'ASC')

      const machines = await queryBuilder.getMany()

      // 캐시에 저장
      this.cacheManager.set(cacheKey, machines, 5 * 60 * 1000) // 5분

      logger.info(`Filtered machines - Count: ${machines.length}`)
      return machines
    } catch (error) {
      logger.error('Error filtering machines:', error)
      return []
    }
  }

  /**
   * 카테고리별 Machine을 조회합니다. (캐시 적용)
   */
  async getMachinesByCategory(
    category: string,
    useCache: boolean = true
  ): Promise<Machine[]> {
    const cacheKey = `category-${category}`

    if (useCache) {
      const cached = this.cacheManager.get<Machine[]>(cacheKey)
      if (cached) {
        logger.debug(`Cache hit for category: ${category}`)
        return cached
      }
    }

    try {
      const machines = await this.machineRepository.find({
        where: { category: category as any },
        order: { name: 'ASC' },
      })

      // 캐시에 저장
      this.cacheManager.set(cacheKey, machines, 10 * 60 * 1000) // 10분

      logger.info(
        `Retrieved ${machines.length} machines by category: ${category}`
      )
      return machines
    } catch (error) {
      logger.error(`Error retrieving machines by category ${category}:`, error)
      return []
    }
  }

  /**
   * 난이도별 Machine을 조회합니다. (캐시 적용)
   */
  async getMachinesByDifficulty(
    difficulty: string,
    useCache: boolean = true
  ): Promise<Machine[]> {
    const cacheKey = `difficulty-${difficulty}`

    if (useCache) {
      const cached = this.cacheManager.get<Machine[]>(cacheKey)
      if (cached) {
        logger.debug(`Cache hit for difficulty: ${difficulty}`)
        return cached
      }
    }

    try {
      const machines = await this.machineRepository.find({
        where: { difficulty: difficulty as any },
        order: { name: 'ASC' },
      })

      // 캐시에 저장
      this.cacheManager.set(cacheKey, machines, 10 * 60 * 1000) // 10분

      logger.info(
        `Retrieved ${machines.length} machines by difficulty: ${difficulty}`
      )
      return machines
    } catch (error) {
      logger.error(
        `Error retrieving machines by difficulty ${difficulty}:`,
        error
      )
      return []
    }
  }

  /**
   * 타겟별 Machine을 조회합니다. (최적화된 쿼리)
   */
  async getMachinesByTarget(
    target: string,
    useCache: boolean = true
  ): Promise<Machine[]> {
    const cacheKey = `target-${target}`

    if (useCache) {
      const cached = this.cacheManager.get<Machine[]>(cacheKey)
      if (cached) {
        logger.debug(`Cache hit for target: ${target}`)
        return cached
      }
    }

    try {
      const machines = await this.machineRepository
        .createQueryBuilder('machine')
        .where(
          '(JSON_SEARCH(machine.anatomy->"$.primaryMuscles", "one", :targetPattern) IS NOT NULL OR JSON_SEARCH(machine.anatomy->"$.secondaryMuscles", "one", :targetPattern) IS NOT NULL)',
          {
            targetPattern: `%${target}%`,
          }
        )
        .orderBy('machine.name', 'ASC')
        .getMany()

      // 캐시에 저장
      this.cacheManager.set(cacheKey, machines, 10 * 60 * 1000) // 10분

      logger.info(`Retrieved ${machines.length} machines by target: ${target}`)
      return machines
    } catch (error) {
      logger.error(`Error retrieving machines by target ${target}:`, error)
      return []
    }
  }

  /**
   * 통계 정보 조회
   */
  async getMachineStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    byDifficulty: Record<string, number>
  }> {
    const cacheKey = 'machine-stats'

    const cached = this.cacheManager.get<any>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const [total, categoryStats, difficultyStats] = await Promise.all([
        this.machineRepository.count(),
        this.machineRepository
          .createQueryBuilder('machine')
          .select('machine.category', 'category')
          .addSelect('COUNT(*)', 'count')
          .groupBy('machine.category')
          .getRawMany(),
        this.machineRepository
          .createQueryBuilder('machine')
          .select('machine.difficulty', 'difficulty')
          .addSelect('COUNT(*)', 'count')
          .groupBy('machine.difficulty')
          .getRawMany(),
      ])

      const stats = {
        total,
        byCategory: categoryStats.reduce(
          (acc, item) => {
            acc[item.category] = parseInt(item.count)
            return acc
          },
          {} as Record<string, number>
        ),
        byDifficulty: difficultyStats.reduce(
          (acc, item) => {
            acc[item.difficulty] = parseInt(item.count)
            return acc
          },
          {} as Record<string, number>
        ),
      }

      // 캐시에 저장 (30분)
      this.cacheManager.set(cacheKey, stats, 30 * 60 * 1000)

      return stats
    } catch (error) {
      logger.error('Error retrieving machine stats:', error)
      return { total: 0, byCategory: {}, byDifficulty: {} }
    }
  }

  /**
   * 캐시 무효화
   */
  private invalidateCache(): void {
    this.cacheManager.clear()
    logger.debug('Machine cache cleared')
  }

  /**
   * 특정 머신 관련 캐시 무효화
   */
  private invalidateMachineCache(id: number): void {
    this.cacheManager.delete(`machine-${id}`)
    this.cacheManager.deletePattern(`machine-key-.*`)
    logger.debug(`Machine cache invalidated for ID: ${id}`)
  }

  /**
   * 캐시 통계 조회
   */
  getCacheStats() {
    return this.cacheManager.getStats()
  }

  /**
   * 데이터 정제 (XSS 방지)
   */
  private sanitizeMachineData(
    data: CreateMachineRequest
  ): CreateMachineRequest {
    return {
      ...data,
      machineKey: this.sanitizeString(data.machineKey),
      name: this.sanitizeString(data.name),
      nameEn: data.nameEn ? this.sanitizeString(data.nameEn) : undefined,
      imageUrl: this.sanitizeString(data.imageUrl),
      shortDesc: this.sanitizeString(data.shortDesc),
      detailDesc: data.detailDesc ? this.sanitizeString(data.detailDesc) : '',
      positiveEffect: data.positiveEffect
        ? this.sanitizeString(data.positiveEffect)
        : undefined,
      videoUrl: data.videoUrl ? this.sanitizeString(data.videoUrl) : undefined,
      targetMuscles: data.targetMuscles
        ? data.targetMuscles.map(muscle => this.sanitizeString(muscle))
        : undefined,
      anatomy: data.anatomy,
      guide: data.guide,
      training: data.training,
      extraInfo: data.extraInfo,
    }
  }

  /**
   * 문자열 정제 (XSS 방지)
   */
  private sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') {
      return ''
    }
    return str
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }
}
