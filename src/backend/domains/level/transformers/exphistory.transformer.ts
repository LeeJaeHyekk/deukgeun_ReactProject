// ============================================================================
// ExpHistory Transformer
// ============================================================================

import { ExpHistoryDTO } from "../types/dto"
import { ExpHistory } from "../entities/ExpHistory"
import type { ExpActionType } from "../types/index"

export class ExpHistoryTransformer {
  static toDTO(entity: ExpHistory): ExpHistoryDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      actionType: entity.actionType,
      points: entity.expGained,
      description: entity.source,
      expGained: entity.expGained,
      source: entity.source,
      levelBefore: entity.levelBefore,
      levelAfter: entity.levelAfter,
      isLevelUp: entity.isLevelUp,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      user: entity.user
        ? {
            id: entity.user.id,
            nickname: entity.user.nickname,
            profileImage: entity.user.profileImage,
          }
        : undefined,
    }
  }

  static toEntity(dto: ExpHistoryDTO): Partial<ExpHistory> {
    return {
      id: dto.id,
      userId: dto.userId,
      actionType: dto.actionType,
      expGained: dto.expGained,
      source: dto.source,
      metadata: dto.metadata,
      levelBefore: dto.levelBefore,
      levelAfter: dto.levelAfter,
      isLevelUp: dto.isLevelUp,
      createdAt: dto.createdAt,
    }
  }

  static toDTOList(entities: ExpHistory[]): ExpHistoryDTO[] {
    return entities.map(entity => ExpHistoryTransformer.toDTO(entity))
  }
}
