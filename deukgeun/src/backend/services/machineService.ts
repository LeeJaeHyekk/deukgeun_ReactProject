import { AppDataSource } from '../config/database'
import { Machine } from '../entities/Machine'
import type {
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
  MachineCategory,
  DifficultyLevel,
} from '../types/machine'

/**
 * Machine 관련 비즈니스 로직을 처리하는 서비스 클래스
 * TypeORM을 사용하여 데이터베이스와 상호작용하며 CRUD 작업을 수행합니다.
 */
export class MachineService {
  private machineRepository = AppDataSource.getRepository(Machine)

  /**
   * 새로운 Machine을 생성합니다.
   * @param {CreateMachineRequest} machineData - 생성할 Machine 데이터
   * @returns {Promise<Machine>} 생성된 Machine 객체
   */
  async createMachine(machineData: CreateMachineRequest): Promise<Machine> {
    // 데이터 정제 (XSS 방지)
    const sanitizedData = this.sanitizeMachineData(machineData)

    const machine = this.machineRepository.create(sanitizedData as any)
    const savedMachine = await this.machineRepository.save(machine)
    return Array.isArray(savedMachine) ? savedMachine[0] : savedMachine
  }

  /**
   * 모든 Machine을 생성일 기준 내림차순으로 조회합니다.
   * @returns {Promise<Machine[]>} Machine 목록 배열
   */
  async getAllMachines(): Promise<Machine[]> {
    try {
      return await this.machineRepository.find({
        order: { name: 'ASC' },
      })
    } catch (error) {
      console.error('기구 조회 오류:', error)
      return []
    }
  }

  /**
   * ID로 특정 Machine을 조회합니다.
   * @param {number} id - 조회할 Machine의 ID
   * @returns {Promise<Machine | null>} 조회된 Machine 또는 null (존재하지 않는 경우)
   */
  async getMachineById(id: number): Promise<Machine | null> {
    try {
      return await this.machineRepository.findOne({ where: { id } })
    } catch (error) {
      console.error('기구 조회 오류:', error)
      return null
    }
  }

  /**
   * machineKey로 특정 Machine을 조회합니다.
   * @param {string} machineKey - 조회할 Machine의 machineKey
   * @returns {Promise<Machine | null>} 조회된 Machine 또는 null (존재하지 않는 경우)
   */
  async getMachineByKey(machineKey: string): Promise<Machine | null> {
    return await this.machineRepository.findOne({
      where: { machineKey: machineKey },
    })
  }

  /**
   * 기존 Machine을 업데이트합니다.
   * @param {number} id - 업데이트할 Machine의 ID
   * @param {UpdateMachineRequest} updateData - 업데이트할 데이터
   * @returns {Promise<Machine | null>} 업데이트된 Machine 또는 null (존재하지 않는 경우)
   */
  async updateMachine(
    id: number,
    updateData: UpdateMachineRequest
  ): Promise<Machine | null> {
    try {
      const machine = await this.machineRepository.findOne({ where: { id } })
      if (!machine) return null

      Object.assign(machine, updateData)
      return await this.machineRepository.save(machine)
    } catch (error) {
      console.error('기구 수정 오류:', error)
      return null
    }
  }

  /**
   * Machine을 삭제합니다.
   * @param {number} id - 삭제할 Machine의 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteMachine(id: number): Promise<boolean> {
    try {
      const machine = await this.machineRepository.findOne({ where: { id } })
      if (!machine) return false

      await this.machineRepository.remove(machine)
      return true
    } catch (error) {
      console.error('기구 삭제 오류:', error)
      return false
    }
  }

  /**
   * 조건에 따라 Machine을 필터링하여 조회합니다.
   * @param {MachineFilterQuery} filters - 필터링 조건
   * @returns {Promise<Machine[]>} 필터링된 Machine 목록
   */
  async filterMachines(filters: MachineFilterQuery): Promise<Machine[]> {
    const query = this.machineRepository.createQueryBuilder('machine')

    if (filters.category) {
      query.andWhere('machine.category = :category', {
        category: filters.category,
      })
    }

    if (filters.difficulty) {
      query.andWhere('machine.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      })
    }

    if (filters.target) {
      // 부분 문자열 매칭을 위해 JSON_SEARCH 사용
      query.andWhere(
        '(JSON_SEARCH(machine.anatomy->"$.primaryMuscles", "one", :targetPattern) IS NOT NULL OR JSON_SEARCH(machine.anatomy->"$.secondaryMuscles", "one", :targetPattern) IS NOT NULL)',
        {
          targetPattern: `%${filters.target}%`,
        }
      )
    }

    return await query.getMany()
  }

  /**
   * 카테고리별 Machine을 조회합니다.
   * @param {string} category - 조회할 카테고리
   * @returns {Promise<Machine[]>} 카테고리별 Machine 목록
   */
  async getMachinesByCategory(category: string): Promise<Machine[]> {
    try {
      return await this.machineRepository.find({
        where: { category: category as any },
        order: { name: 'ASC' },
      })
    } catch (error) {
      console.error('카테고리별 기구 조회 오류:', error)
      return []
    }
  }

  /**
   * 난이도별 Machine을 조회합니다.
   * @param {string} difficulty - 조회할 난이도
   * @returns {Promise<Machine[]>} 난이도별 Machine 목록
   */
  async getMachinesByDifficulty(difficulty: string): Promise<Machine[]> {
    try {
      return await this.machineRepository.find({
        where: { difficulty: difficulty as any },
        order: { name: 'ASC' },
      })
    } catch (error) {
      console.error('난이도별 기구 조회 오류:', error)
      return []
    }
  }

  /**
   * 타겟별 Machine을 조회합니다.
   * @param {string} target - 조회할 타겟 근육
   * @returns {Promise<Machine[]>} 타겟별 Machine 목록
   */
  async getMachinesByTarget(target: string): Promise<Machine[]> {
    try {
      return await this.machineRepository
        .createQueryBuilder('machine')
        .where(
          '(JSON_SEARCH(machine.anatomy->"$.primaryMuscles", "one", :targetPattern) IS NOT NULL OR JSON_SEARCH(machine.anatomy->"$.secondaryMuscles", "one", :targetPattern) IS NOT NULL)',
          {
            targetPattern: `%${target}%`,
          }
        )
        .orderBy('machine.name', 'ASC')
        .getMany()
    } catch (error) {
      console.error('타겟별 기구 조회 오류:', error)
      return []
    }
  }

  /**
   * 데이터 정제 (XSS 방지)
   * @param {CreateMachineRequest} data - 정제할 데이터
   * @returns {CreateMachineRequest} 정제된 데이터
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
      // JSON 필드들은 별도 처리
      anatomy: data.anatomy,
      guide: data.guide,
      training: data.training,
      extraInfo: data.extraInfo,
    }
  }

  /**
   * 문자열 정제 (XSS 방지)
   * @param {string} str - 정제할 문자열
   * @returns {string} 정제된 문자열
   */
  private sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') {
      return ''
    }
    return str
      .replace(/[<>]/g, '') // HTML 태그 제거
      .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
      .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
      .trim()
  }
}
