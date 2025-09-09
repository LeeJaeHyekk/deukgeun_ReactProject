// ============================================================================
// Like Transformer
// ============================================================================

import { LikeDTO } from "../types/dto"
import { Like } from "../entities/Like"

export class LikeTransformer {
  static toDTO(entity: Like): LikeDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      targetType: "post", // 기본값으로 설정
      targetId: entity.postId,
      createdAt: entity.createdAt,
    }
  }

  static toEntity(dto: LikeDTO): Partial<Like> {
    return {
      id: dto.id,
      postId: dto.targetId,
      userId: dto.userId,
      createdAt: dto.createdAt,
    }
  }

  static toDTOList(entities: Like[]): LikeDTO[] {
    return entities.map(entity => LikeTransformer.toDTO(entity))
  }
}
