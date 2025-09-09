import { AppDataSource } from "../../../shared/env"
import { Like } from "../entities/Like"

export class LikeService {
  private likeRepository = AppDataSource.getRepository(Like)

  async toggleLike(userId: number, targetType: string, targetId: number) {
    if (targetType !== "post") {
      throw new Error("지원하지 않는 타입입니다.")
    }

    const existingLike = await this.likeRepository.findOne({
      where: { userId, postId: targetId }
    })

    if (existingLike) {
      await this.likeRepository.remove(existingLike)
      return null
    } else {
      const like = this.likeRepository.create({
        userId,
        postId: targetId
      })
      return await this.likeRepository.save(like)
    }
  }

  async getLikes(targetType: string, targetId: number) {
    if (targetType !== "post") {
      throw new Error("지원하지 않는 타입입니다.")
    }

    return await this.likeRepository.find({
      where: { postId: targetId },
      relations: ["user"]
    })
  }
}
