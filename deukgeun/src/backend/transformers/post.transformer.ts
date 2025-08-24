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
      category: entity.category as string,
      tags: entity.tags,
      thumbnailUrl: entity.thumbnail_url,
      images: entity.images,
      likeCount: entity.like_count,
      commentCount: entity.comment_count,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static toEntity(dto: PostDTO): Partial<Post> {
    return {
      id: dto.id,
      title: dto.title,
      content: dto.content,
      author: dto.author,
      userId: dto.userId,
      category: (typeof dto.category === "string"
        ? dto.category
        : dto.category.name) as any,
      tags: dto.tags,
      thumbnail_url: dto.thumbnailUrl,
      images: dto.images,
      like_count: dto.likeCount,
      comment_count: dto.commentCount,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: Post[]): PostDTO[] {
    return entities.map(entity => PostTransformer.toDTO(entity))
  }
}
