import { AppDataSource } from "../config/database"
import { Machine } from "../entities/Machine"
import {
  MachineRepository,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
} from "../types/machine"
import type { MachineCategory, DifficultyLevel } from "../../types/machine"

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
        order: { name_ko: "ASC" },
      })
    } catch (error) {
      console.error("기구 조회 오류:", error)
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
      console.error("기구 조회 오류:", error)
      return null
    }
  }

  /**
   * machine_key로 특정 Machine을 조회합니다.
   * @param {string} machineKey - 조회할 Machine의 machine_key
   * @returns {Promise<Machine | null>} 조회된 Machine 또는 null (존재하지 않는 경우)
   */
  async getMachineByKey(machineKey: string): Promise<Machine | null> {
    return await this.machineRepository.findOne({
      where: { machine_key: machineKey },
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
      console.error("기구 수정 오류:", error)
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
      console.error("기구 삭제 오류:", error)
      return false
    }
  }

  /**
   * 조건에 따라 Machine을 필터링하여 조회합니다.
   * @param {MachineFilterQuery} filters - 필터링 조건
   * @returns {Promise<Machine[]>} 필터링된 Machine 목록
   */
  async filterMachines(filters: MachineFilterQuery): Promise<Machine[]> {
    const query = this.machineRepository.createQueryBuilder("machine")

    if (filters.category) {
      query.andWhere("machine.category = :category", {
        category: filters.category,
      })
    }

    if (filters.difficulty) {
      query.andWhere("machine.difficulty_level = :difficulty", {
        difficulty: filters.difficulty,
      })
    }

    if (filters.target) {
      query.andWhere("JSON_CONTAINS(machine.target_muscle, :target)", {
        target: `"${filters.target}"`,
      })
    }

    return await query.getMany()
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
      machine_key: this.sanitizeString(data.machine_key),
      name_ko: this.sanitizeString(data.name_ko),
      name_en: data.name_en ? this.sanitizeString(data.name_en) : undefined,
      image_url: this.sanitizeString(data.image_url),
      short_desc: this.sanitizeString(data.short_desc),
      detail_desc: this.sanitizeString(data.detail_desc),
      positive_effect: data.positive_effect
        ? this.sanitizeString(data.positive_effect)
        : undefined,
      video_url: data.video_url
        ? this.sanitizeString(data.video_url)
        : undefined,
      target_muscle: data.target_muscle
        ? data.target_muscle.map(muscle => this.sanitizeString(muscle))
        : undefined,
    }
  }

  /**
   * 문자열 정제 (XSS 방지)
   * @param {string} str - 정제할 문자열
   * @returns {string} 정제된 문자열
   */
  private sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, "") // HTML 태그 제거
      .replace(/javascript:/gi, "") // JavaScript 프로토콜 제거
      .replace(/on\w+=/gi, "") // 이벤트 핸들러 제거
      .trim()
  }
}
