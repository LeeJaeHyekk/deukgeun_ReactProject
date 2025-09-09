// ============================================================================
// 머신 서비스
// ============================================================================

import { Repository } from "typeorm"
import { AppDataSource } from "../shared/config/database.js"

export class MachineService {
  private machineRepository: Repository<any>

  constructor() {
    // 실제 구현에서는 Machine 엔티티를 사용
    this.machineRepository = AppDataSource.getRepository("Machine")
  }

  async getAllMachines() {
    try {
      return await this.machineRepository.find()
    } catch (error) {
      console.error("Error fetching machines:", error)
      throw new Error("Failed to fetch machines")
    }
  }

  async getMachineById(id: string) {
    try {
      return await this.machineRepository.findOne({ where: { id } })
    } catch (error) {
      console.error("Error fetching machine:", error)
      throw new Error("Failed to fetch machine")
    }
  }

  async createMachine(machineData: any) {
    try {
      const machine = this.machineRepository.create(machineData)
      return await this.machineRepository.save(machine)
    } catch (error) {
      console.error("Error creating machine:", error)
      throw new Error("Failed to create machine")
    }
  }

  async updateMachine(id: string, machineData: any) {
    try {
      await this.machineRepository.update(id, machineData)
      return await this.getMachineById(id)
    } catch (error) {
      console.error("Error updating machine:", error)
      throw new Error("Failed to update machine")
    }
  }

  async deleteMachine(id: string) {
    try {
      const result = await this.machineRepository.delete(id)
      return result.affected > 0
    } catch (error) {
      console.error("Error deleting machine:", error)
      throw new Error("Failed to delete machine")
    }
  }

  async filterMachines(filters: any) {
    try {
      const queryBuilder = this.machineRepository.createQueryBuilder("machine")

      if (filters.category) {
        queryBuilder.andWhere("machine.category = :category", {
          category: filters.category,
        })
      }

      if (filters.muscleGroup) {
        queryBuilder.andWhere("machine.muscleGroups LIKE :muscleGroup", {
          muscleGroup: `%${filters.muscleGroup}%`,
        })
      }

      if (filters.equipment) {
        queryBuilder.andWhere("machine.equipment = :equipment", {
          equipment: filters.equipment,
        })
      }

      return await queryBuilder.getMany()
    } catch (error) {
      console.error("Error filtering machines:", error)
      throw new Error("Failed to filter machines")
    }
  }
}

export const machineService = new MachineService()
