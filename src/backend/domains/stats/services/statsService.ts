// ============================================================================
// Stats Service
// ============================================================================

import { Repository } from "typeorm"
import { AppDataSource } from "../../../shared/database"
import { WorkoutStats } from "../../workout/entities/WorkoutStats"
import {
  WorkoutStatsDTO,
  UserStatsDTO,
  MachineStatsDTO,
  GymStatsDTO,
} from "../types/stats.types"

export class StatsService {
  private workoutStatsRepository: Repository<WorkoutStats>

  constructor() {
    this.workoutStatsRepository = AppDataSource.getRepository(WorkoutStats)
  }

  async getUserStats(userId: number): Promise<UserStatsDTO> {
    // 사용자 통계 조회 로직
    const stats = await this.workoutStatsRepository
      .createQueryBuilder("ws")
      .where("ws.userId = :userId", { userId })
      .getMany()

    const totalWorkouts = stats.length
    const totalDuration = stats.reduce(
      (sum, stat) => sum + (stat.totalDurationMinutes || 0),
      0
    )
    const totalCalories = totalDuration * 10 // 예시 계산
    const averageWorkoutDuration =
      totalWorkouts > 0 ? totalDuration / totalWorkouts : 0

    return {
      userId,
      totalWorkouts,
      totalDuration,
      totalCalories,
      averageWorkoutDuration,
      favoriteMachine: "Unknown", // TODO: 실제 로직 구현
      currentStreak: 0, // TODO: 실제 로직 구현
      longestStreak: 0, // TODO: 실제 로직 구현
      level: 1, // TODO: 실제 로직 구현
      experience: 0, // TODO: 실제 로직 구현
      achievements: 0, // TODO: 실제 로직 구현
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async getMachineStats(machineId: number): Promise<MachineStatsDTO> {
    // 머신 통계 조회 로직
    const stats = await this.workoutStatsRepository
      .createQueryBuilder("ws")
      .where("ws.machineId = :machineId", { machineId })
      .getMany()

    const totalUsers = new Set(stats.map(stat => stat.userId)).size
    const totalSessions = stats.reduce(
      (sum, stat) => sum + (stat.totalSessions || 0),
      0
    )
    const totalSets = stats.reduce(
      (sum, stat) => sum + (stat.totalSets || 0),
      0
    )
    const averageWeight =
      stats.length > 0
        ? stats.reduce((sum, stat) => sum + (stat.totalWeightKg || 0), 0) /
          stats.length
        : 0
    const averageReps =
      stats.length > 0
        ? stats.reduce((sum, stat) => sum + (stat.totalReps || 0), 0) /
          stats.length
        : 0

    return {
      machineId,
      totalUsers,
      totalSessions,
      totalSets,
      averageWeight,
      averageReps,
      popularity: totalSessions, // 간단한 인기도 계산
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async getGymStats(gymId: number): Promise<GymStatsDTO> {
    // 헬스장 통계 조회 로직
    // TODO: 실제 로직 구현
    return {
      gymId,
      totalUsers: 0,
      totalSessions: 0,
      averageSessionsPerUser: 0,
      peakHours: [],
      popularMachines: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async getWorkoutStats(
    userId?: number,
    machineId?: number
  ): Promise<WorkoutStatsDTO[]> {
    let query = this.workoutStatsRepository.createQueryBuilder("ws")

    if (userId) {
      query = query.where("ws.userId = :userId", { userId })
    }

    if (machineId) {
      query = query.andWhere("ws.machineId = :machineId", { machineId })
    }

    const stats = await query.getMany()
    return stats.map(stat => ({
      id: stat.id,
      userId: stat.userId,
      machineId: stat.machineId,
      totalSessions: stat.totalSessions,
      totalSets: stat.totalSets,
      totalReps: stat.totalReps,
      totalWeight: stat.totalWeightKg,
      totalDuration: stat.totalDurationMinutes,
      averageWeight: stat.totalWeightKg,
      averageReps: stat.totalReps,
      personalBest: stat.totalWeightKg, // Using totalWeightKg as personalBest
      lastWorkoutDate: stat.workoutDate,
      createdAt: stat.createdAt,
      updatedAt: stat.updatedAt,
    }))
  }
}
