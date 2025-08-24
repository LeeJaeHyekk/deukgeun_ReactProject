// ============================================================================
// Comment Transformer
// ============================================================================

import { CommentDTO } from "../../shared/types/dto/comment.dto"
import { Comment } from "../entities/Comment"

export class CommentTransformer {
  static toDTO(entity: Comment): CommentDTO {
    return {
      id: entity.id,
      postId: entity.postId,
      userId: entity.userId,
      author: entity.author,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static toEntity(dto: CommentDTO): Partial<Comment> {
    return {
      id: dto.id,
      postId: dto.postId,
      userId: dto.userId,
      author: dto.author,
      content: dto.content,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: Comment[]): CommentDTO[] {
    return entities.map(entity => CommentTransformer.toDTO(entity))
  }
}
