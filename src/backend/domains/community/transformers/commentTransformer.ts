import { Comment } from "../entities/Comment"
import { CommentDTO } from "../types/dto"

export function toCommentDTO(entity: Comment): CommentDTO {
  return {
    id: entity.id,
    postId: entity.postId,
    userId: entity.userId,
    content: entity.content,
    likesCount: 0, // TODO: 실제 좋아요 수 확인 로직 추가
    isLiked: false, // TODO: 실제 좋아요 상태 확인 로직 추가
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    user: entity.user ? {
      id: entity.user.id,
      nickname: entity.user.nickname,
      profileImage: entity.user.profileImage
    } : undefined
  }
}

export function toCommentDTOList(entities: Comment[]): CommentDTO[] {
  return entities.map(toCommentDTO)
}
