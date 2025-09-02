// ============================================================================
// Post Transformer
// ============================================================================

import { PostDTO } from "../../shared/types/dto/post.dto.js"
import { Post } from "../entities/Post.js"

export class PostTransformer {
  static toDTO(entity: Post): PostDTO {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      author: {
        id: entity.userId,
        nickname: entity.author,
        email: undefined,
        avatarUrl: undefined,
      },
      userId: entity.userId,
      category: entity.category,
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
      author: typeof dto.author === "string" ? dto.author : dto.author.nickname,
      userId: dto.userId,
      category: typeof dto.category === "string" ? dto.category as any : dto.category.name as any,
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
