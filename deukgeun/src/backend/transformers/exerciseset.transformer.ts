// ============================================================================
// ExerciseSet Transformer
// ============================================================================

import { ExerciseSetDTO } from "../../shared/types/dto/exerciseset.dto.js"
import { ExerciseSet } from "../entities/ExerciseSet.js"

export class ExerciseSetTransformer {
  static toDTO(entity: ExerciseSet): ExerciseSetDTO {
    return {
      id: entity.id,
      sessionId: entity.sessionId,
      machineId: entity.machineId,
      setNumber: entity.setNumber,
      repsCompleted: entity.repsCompleted,
      weightKg: entity.weightKg,
      durationSeconds: entity.durationSeconds,
      distanceMeters: entity.distanceMeters,
      rpeRating: entity.rpeRating,
      notes: entity.notes,
      createdAt: entity.createdAt,
    }
  }

  static toEntity(dto: ExerciseSetDTO): Partial<ExerciseSet> {
    return {
      id: dto.id,
      sessionId: dto.sessionId,
      machineId: dto.machineId,
      setNumber: dto.setNumber,
      repsCompleted: dto.repsCompleted,
      weightKg: dto.weightKg,
      durationSeconds: dto.durationSeconds,
      distanceMeters: dto.distanceMeters,
      rpeRating: dto.rpeRating,
      notes: dto.notes,
      createdAt: dto.createdAt,
    }
  }

  static toDTOList(entities: ExerciseSet[]): ExerciseSetDTO[] {
    return entities.map(entity => ExerciseSetTransformer.toDTO(entity))
  }
}
