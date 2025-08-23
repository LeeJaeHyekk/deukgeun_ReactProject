// ============================================================================
// Post Transformer
// ============================================================================

import { PostDTO } from "../../shared/types/dto/post.dto"
import { Post } from "../entities/Post"

export class PostTransformer {
  static toDTO(entity: Post): PostDTO {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      author: entity.author,
      userId: entity.userId,
      category: entity.category,
      tags: entity.tags,
      thumbnailUrl: entity.thumbnailUrl,
      images: entity.images,
      likeCount: entity.likeCount,
      commentCount: entity.commentCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }

  static toEntity(dto: PostDTO): Partial<Post> {
    return {
      id: dto.id,
      title: dto.title,
      content: dto.content,
      author: dto.author,
      userId: dto.userId,
      category: dto.category,
      tags: dto.tags,
      thumbnailUrl: dto.thumbnailUrl,
      images: dto.images,
      likeCount: dto.likeCount,
      commentCount: dto.commentCount,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    }
  }

  static toDTOList(entities: Post[]): PostDTO[] {
    return entities.map(entity => this.toDTO(entity))
  }
}
