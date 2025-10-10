// ============================================================================
// ExpHistory Transformer
// ============================================================================

import { ExpHistoryDTO } from "../../shared/types/dto/exphistory.dto"
import { ExpHistory } from "../entities/ExpHistory"
import type { ExpActionType } from "../types"

export class ExpHistoryTransformer {
  static toDTO(entity: ExpHistory): ExpHistoryDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      actionType: entity.actionType,
      expGained: entity.expGained,
      source: entity.source,
      metadata: entity.metadata,
      levelBefore: entity.levelBefore,
      levelAfter: entity.levelAfter,
      isLevelUp: entity.isLevelUp,
      createdAt: entity.createdAt,
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
