import { Like } from "../entities/Like"
import { LikeDTO } from "../types/dto"

export function toLikeDTO(entity: Like): LikeDTO {
  return {
    id: entity.id,
    userId: entity.userId,
    targetType: "post", // 기본값으로 설정
    targetId: entity.postId,
    createdAt: entity.createdAt
  }
}

export function toLikeDTOList(entities: Like[]): LikeDTO[] {
  return entities.map(toLikeDTO)
}
