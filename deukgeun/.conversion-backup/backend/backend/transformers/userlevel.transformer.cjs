// ============================================================================
// UserLevel Transformer
// ============================================================================
class UserLevelTransformer
module.exports.UserLevelTransformer = UserLevelTransformer {
    static toDTO(entity) {
        return {
            id: entity.id,
            userId: entity.userId,
            level: entity.level,
            currentExp: entity.currentExp,
            totalExp: entity.totalExp,
            seasonExp: entity.seasonExp,
            totalLevelUps: entity.totalLevelUps,
            lastLevelUpAt: entity.lastLevelUpAt,
            currentSeason: entity.currentSeason,
            seasonStartDate: entity.seasonStartDate,
            seasonEndDate: entity.seasonEndDate,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };
    }
    static toEntity(dto) {
        return {
            id: dto.id,
            userId: dto.userId,
            level: dto.level,
            currentExp: dto.currentExp,
            totalExp: dto.totalExp,
            seasonExp: dto.seasonExp,
            totalLevelUps: dto.totalLevelUps,
            lastLevelUpAt: dto.lastLevelUpAt,
            currentSeason: dto.currentSeason,
            seasonStartDate: dto.seasonStartDate,
            seasonEndDate: dto.seasonEndDate,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => UserLevelTransformer.toDTO(entity));
    }
}
