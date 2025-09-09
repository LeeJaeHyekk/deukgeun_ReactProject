import { Request, Response } from "express"
import { LikeService } from "../services/likeService"
import { toLikeDTO } from "../transformers/index"

export class LikeController {
  constructor(private likeService: LikeService) {}

  async toggleLike(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId
      const { targetType, targetId } = req.body
      
      const like = await this.likeService.toggleLike(userId, targetType, targetId)
      
      if (like) {
        const likeDTO = toLikeDTO(like)
        res.json({
          success: true,
          data: likeDTO,
          message: "좋아요를 추가했습니다."
        })
      } else {
        res.json({
          success: true,
          data: null,
          message: "좋아요를 취소했습니다."
        })
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "좋아요 처리에 실패했습니다."
      })
    }
  }

  async getLikes(req: Request, res: Response) {
    try {
      const { targetType, targetId } = req.query
      
      const likes = await this.likeService.getLikes(targetType as string, Number(targetId))
      const likesDTO = likes.map(toLikeDTO)
      
      res.json({
        success: true,
        data: likesDTO
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "좋아요 조회에 실패했습니다."
      })
    }
  }
}