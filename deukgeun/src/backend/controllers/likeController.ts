import { Request, Response } from "express"
import { PostLike } from "../entities/Like"
import { AppDataSource } from "../config/database"

export class LikeController {
  // 좋아요 추가
  addLike = async (req: Request, res: Response) => {
    try {
      const { postId } = req.params
      const userId = (req.user as any)?.userId

      if (!userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const repo = AppDataSource.getRepository(PostLike)

      // 이미 좋아요를 눌렀는지 확인
      const existingLike = await repo.findOne({
        where: { postId: parseInt(postId), userId },
      })

      if (existingLike) {
        return res.status(400).json({ message: "이미 좋아요를 눌렀습니다." })
      }

      const like = repo.create({
        postId: parseInt(postId),
        userId,
      })

      await repo.save(like)

      res.status(201).json({ message: "좋아요가 성공적으로 추가되었습니다." })
    } catch (error) {
      console.error("좋아요 추가 오류:", error)
      res.status(500).json({ message: "좋아요 추가 중 오류가 발생했습니다." })
    }
  }

  // 좋아요 제거
  removeLike = async (req: Request, res: Response) => {
    try {
      const { postId } = req.params
      const userId = (req.user as any)?.userId

      if (!userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const repo = AppDataSource.getRepository(PostLike)

      const like = await repo.findOne({
        where: { postId: parseInt(postId), userId },
      })

      if (!like) {
        return res.status(404).json({ message: "좋아요를 찾을 수 없습니다." })
      }

      await repo.remove(like)

      res.json({ message: "좋아요가 성공적으로 제거되었습니다." })
    } catch (error) {
      console.error("좋아요 제거 오류:", error)
      res.status(500).json({ message: "좋아요 제거 중 오류가 발생했습니다." })
    }
  }
}
