// ============================================================================
// Like Transformer
// ============================================================================

import { LikeDTO } from '@shared/types/dto/like.dto'
import { Like } from '@backend/entities/Like'

export class LikeTransformer {
  static toDTO(entity: Like): LikeDTO {
    return {
      id: entity.id,
      postId: entity.postId,
      userId: entity.userId,
      createdAt: entity.createdAt
    }
  }

  static toEntity(dto: LikeDTO): Partial<Like> {
    return {
      id: dto.id,
      postId: dto.postId,
      userId: dto.userId,
      createdAt: dto.createdAt
    }
  }

  static toDTOList(entities: Like[]): LikeDTO[] {
    return entities.map(entity => LikeTransformer.toDTO(entity))
  }
}
