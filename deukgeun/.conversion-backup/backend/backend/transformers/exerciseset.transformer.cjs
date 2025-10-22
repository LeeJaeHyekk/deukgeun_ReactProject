"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseSetTransformer = void 0;
class ExerciseSetTransformer {
    static toDTO(entity) {
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
        };
    }
    static toEntity(dto) {
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
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => ExerciseSetTransformer.toDTO(entity));
    }
}
exports.ExerciseSetTransformer = ExerciseSetTransformer;
