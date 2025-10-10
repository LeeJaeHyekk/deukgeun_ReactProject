// ============================================================================
// Comment Transformer
// ============================================================================
class CommentTransformer
module.exports.CommentTransformer = CommentTransformer {
    static toDTO(entity) {
        return {
            id: entity.id,
            postId: entity.postId,
            userId: entity.userId,
            author: entity.author,
            content: entity.content,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
    static toEntity(dto) {
        return {
            id: dto.id,
            postId: dto.postId,
            userId: dto.userId,
            author: dto.author,
            content: dto.content,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => CommentTransformer.toDTO(entity));
    }
}
