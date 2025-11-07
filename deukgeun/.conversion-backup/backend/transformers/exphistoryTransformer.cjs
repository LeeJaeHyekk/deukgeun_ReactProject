"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpHistoryTransformer = void 0;
class ExpHistoryTransformer {
    static toDTO(entity) {
        return {
            id: entity.id,
            userId: entity.userId,
            actionType: entity.actionType,
            expGained: entity.expGained,
            source: entity.source,
            metadata: entity.metadata,
            levelBefore: entity.levelBefore,
            levelAfter: entity.levelAfter,
            isLevelUp: entity.isLevelUp,
            createdAt: entity.createdAt,
        };
    }
    static toEntity(dto) {
        return {
            id: dto.id,
            userId: dto.userId,
            actionType: dto.actionType,
            expGained: dto.expGained,
            source: dto.source,
            metadata: dto.metadata,
            levelBefore: dto.levelBefore,
            levelAfter: dto.levelAfter,
            isLevelUp: dto.isLevelUp,
            createdAt: dto.createdAt,
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => ExpHistoryTransformer.toDTO(entity));
    }
}
exports.ExpHistoryTransformer = ExpHistoryTransformer;
