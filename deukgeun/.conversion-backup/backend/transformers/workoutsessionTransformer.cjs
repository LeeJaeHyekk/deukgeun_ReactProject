"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSessionTransformer = void 0;
class WorkoutSessionTransformer {
    static toDTO(entity) {
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
            exerciseSets: [],
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
    static toEntity(dto) {
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
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => WorkoutSessionTransformer.toDTO(entity));
    }
}
exports.WorkoutSessionTransformer = WorkoutSessionTransformer;
