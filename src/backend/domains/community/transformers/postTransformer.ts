import { Post } from "../entities/Post"
import { PostDTO } from "../types/dto"

export function toPostDTO(entity: Post): PostDTO {
  return {
    id: entity.id,
    userId: entity.userId,
    title: entity.title,
    content: entity.content,
    imageUrl: entity.thumbnail_url,
    likesCount: entity.like_count,
    commentsCount: entity.comment_count,
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

export function toPostDTOList(entities: Post[]): PostDTO[] {
  return entities.map(toPostDTO)
}
