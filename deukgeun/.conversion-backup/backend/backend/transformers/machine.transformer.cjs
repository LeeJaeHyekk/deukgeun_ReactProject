"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineTransformer = void 0;
class MachineTransformer {
    static toDTO(entity) {
        return {
            id: entity.id,
            machineKey: entity.machineKey,
            name: entity.name,
            nameKo: entity.nameKo,
            nameEn: entity.nameEn,
            imageUrl: entity.imageUrl,
            shortDesc: entity.shortDesc,
            detailDesc: entity.detailDesc,
            positiveEffect: entity.positiveEffect,
            category: entity.category,
            targetMuscles: entity.targetMuscles,
            difficulty: entity.difficulty,
            videoUrl: entity.videoUrl,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
    static toEntity(dto) {
        return {
            id: dto.id,
            machineKey: dto.machineKey,
            name: dto.name,
            nameKo: dto.nameKo || undefined,
            nameEn: dto.nameEn || undefined,
            imageUrl: dto.imageUrl,
            shortDesc: dto.shortDesc,
            detailDesc: dto.detailDesc,
            positiveEffect: dto.positiveEffect || undefined,
            category: (typeof dto.category === "string"
                ? dto.category
                : dto.category.name),
            targetMuscles: dto.targetMuscles || undefined,
            difficulty: (typeof dto.difficulty === "string"
                ? dto.difficulty
                : dto.difficulty.name),
            videoUrl: dto.videoUrl || undefined,
            isActive: dto.isActive,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => MachineTransformer.toDTO(entity));
    }
}
exports.MachineTransformer = MachineTransformer;
