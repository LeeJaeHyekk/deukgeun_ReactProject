// ============================================================================
// UserLevel Transformer
// ============================================================================

import { UserLevelDTO } from "../../shared/types/dto/userlevel.dto"
import { UserLevel } from '@backend/entities/UserLevel'

export class UserLevelTransformer {
  static toDTO(entity: UserLevel): UserLevelDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      level: entity.level,
      currentExp: entity.currentExp,
      totalExp: entity.totalExp,
      seasonExp: entity.seasonExp,
      totalLevelUps: entity.totalLevelUps,
      lastLevelUpAt: entity.lastLevelUpAt,
      currentSeason: entity.currentSeason,
      seasonStartDate: entity.seasonStartDate,
      seasonEndDate: entity.seasonEndDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }

  static toEntity(dto: UserLevelDTO): Partial<UserLevel> {
    return {
      id: dto.id,
      userId: dto.userId,
      level: dto.level,
      currentExp: dto.currentExp,
      totalExp: dto.totalExp,
      seasonExp: dto.seasonExp,
      totalLevelUps: dto.totalLevelUps,
      lastLevelUpAt: dto.lastLevelUpAt,
      currentSeason: dto.currentSeason,
      seasonStartDate: dto.seasonStartDate,
      seasonEndDate: dto.seasonEndDate,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    }
  }

  static toDTOList(entities: UserLevel[]): UserLevelDTO[] {
    return entities.map(entity => UserLevelTransformer.toDTO(entity))
  }
}
