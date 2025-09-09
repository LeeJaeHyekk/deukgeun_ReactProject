// ============================================================================
// Stats Transformer
// ============================================================================

import { WorkoutStatsDTO } from "../types/stats.types"
import { WorkoutStats } from "../entities/WorkoutStats"

export class StatsTransformer {
  static toDTO(entity: WorkoutStats): WorkoutStatsDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      machineId: entity.machineId,
      totalSessions: entity.totalSessions,
      totalSets: entity.totalSets,
      totalReps: entity.totalReps,
      totalWeight: entity.totalWeight,
      totalDuration: entity.totalDuration,
      averageWeight: entity.averageWeight,
      averageReps: entity.averageReps,
      personalBest: entity.personalBest,
      lastWorkoutDate: entity.lastWorkoutDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user
        ? {
            id: entity.user.id,
            nickname: entity.user.nickname,
            profileImage: entity.user.profileImage,
          }
        : undefined,
      machine: entity.machine
        ? {
            id: entity.machine.id,
            name: entity.machine.name,
            category: entity.machine.category,
            difficulty: entity.machine.difficulty,
          }
        : undefined,
    }
  }

  static toEntity(dto: WorkoutStatsDTO): Partial<WorkoutStats> {
    return {
      id: dto.id,
      userId: dto.userId,
      machineId: dto.machineId,
      totalSessions: dto.totalSessions,
      totalSets: dto.totalSets,
      totalReps: dto.totalReps,
      totalWeight: dto.totalWeight,
      totalDuration: dto.totalDuration,
      averageWeight: dto.averageWeight,
      averageReps: dto.averageReps,
      personalBest: dto.personalBest,
      lastWorkoutDate: dto.lastWorkoutDate,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: WorkoutStats[]): WorkoutStatsDTO[] {
    return entities.map(entity => StatsTransformer.toDTO(entity))
  }
}
