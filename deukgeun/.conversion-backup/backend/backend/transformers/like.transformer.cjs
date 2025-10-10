// ============================================================================
// Like Transformer
// ============================================================================
class LikeTransformer
module.exports.LikeTransformer = LikeTransformer {
    static toDTO(entity) {
        return {
            id: entity.id,
            postId: entity.postId,
            userId: entity.userId,
            createdAt: entity.createdAt
        };
    }
    static toEntity(dto) {
        return {
            id: dto.id,
            postId: dto.postId,
            userId: dto.userId,
            createdAt: dto.createdAt
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => LikeTransformer.toDTO(entity));
    }
}
