// ============================================================================
// WorkoutSession Transformer
// ============================================================================

import { WorkoutSessionDTO } from "../../shared/types/dto/workoutsession.dto.js"
import { WorkoutSession } from "../entities/WorkoutSession.js"

export class WorkoutSessionTransformer {
  static toDTO(entity: WorkoutSession): WorkoutSessionDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      planId: entity.planId,
      gymId: entity.gymId,
      name: entity.name,
      startTime: entity.startTime,
      endTime: entity.endTime,
      totalDurationMinutes: entity.totalDurationMinutes,
      moodRating: entity.moodRating,
      energyLevel: entity.energyLevel,
      notes: entity.notes,
      status: entity.status,
      exerciseSets: [], // 기본값으로 빈 배열 설정
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as WorkoutSessionDTO
  }

  static toEntity(dto: WorkoutSessionDTO): Partial<WorkoutSession> {
    return {
      id: dto.id,
      userId: dto.userId,
      planId: dto.planId,
      gymId: dto.gymId,
      name: dto.name,
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalDurationMinutes: dto.totalDurationMinutes,
      moodRating: dto.moodRating,
      energyLevel: dto.energyLevel,
      notes: dto.notes,
      status: dto.status,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    } as Partial<WorkoutSession>
  }

  static toDTOList(entities: WorkoutSession[]): WorkoutSessionDTO[] {
    return entities.map(entity => WorkoutSessionTransformer.toDTO(entity))
  }
}
