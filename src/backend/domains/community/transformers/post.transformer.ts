// ============================================================================
// Post Transformer
// ============================================================================

import { PostDTO } from "../types/dto"
import { Post } from "../entities/Post"

export class PostTransformer {
  static toDTO(entity: Post): PostDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      content: entity.content,
      imageUrl: entity.thumbnail_url,
      likesCount: entity.like_count,
      commentsCount: entity.comment_count,
      isLiked: false, // TODO: 실제 좋아요 상태 확인 로직 추가
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user ? {
        id: entity.user.id,
        nickname: entity.user.nickname,
        profileImage: entity.user.profileImage
      } : undefined
    }
  }

  static toEntity(dto: PostDTO): Partial<Post> {
    return {
      id: dto.id,
      title: dto.title,
      content: dto.content,
      userId: dto.userId,
      thumbnail_url: dto.imageUrl,
      like_count: dto.likesCount,
      comment_count: dto.commentsCount,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: Post[]): PostDTO[] {
    return entities.map(entity => PostTransformer.toDTO(entity))
  }
}
