import { Request, Response } from "express"
import { Like } from '@backend/entities/Like'
import { Post } from '@backend/entities/Post'
import { AppDataSource } from '@backend/config/database'
import { toLikeDTO } from "../transformers"

export class LikeController {
  // 좋아요 토글 (추가/제거)
  toggleLike = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req.user as any)?.userId

      console.log("좋아요 토글 요청:", { id, userId })
      console.log("사용자 정보:", req.user)

      if (!userId) {
        console.log("사용자 ID가 없음")
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        })
      }

      if (!id || isNaN(parseInt(id))) {
        console.log("유효하지 않은 포스트 ID:", id)
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 포스트 ID입니다.",
        })
      }

      const postRepository = AppDataSource.getRepository(Post)
      const likeRepository = AppDataSource.getRepository(Like)

      // 포스트 존재 여부 확인
      const post = await postRepository.findOne({
        where: { id: parseInt(id) },
      })

      if (!post) {
        console.log("포스트를 찾을 수 없음:", id)
        return res.status(404).json({
          success: false,
          message: "포스트를 찾을 수 없습니다.",
        })
      }

      // 현재 좋아요 상태 확인
      const existingLike = await likeRepository.findOne({
        where: { postId: parseInt(id), userId },
      })

      let isLiked: boolean
      let newLikeCount: number
      let likeDTO: any

      if (existingLike) {
        // 좋아요 제거
        console.log("기존 좋아요 제거")
        await likeRepository.remove(existingLike)

        // 포스트의 좋아요 수 감소
        await postRepository
          .createQueryBuilder()
          .update(Post)
          .set({ like_count: () => "like_count - 1" })
          .where("id = :id", { id: parseInt(id) })
          .execute()

        isLiked = false
        newLikeCount = Math.max(0, post.like_count - 1)
        console.log("좋아요 제거 성공:", { id, userId })
      } else {
        // 좋아요 추가
        console.log("새 좋아요 추가")
        const like = likeRepository.create({
          postId: parseInt(id),
          userId,
        })

        const savedLike = await likeRepository.save(like)

        // DTO 변환 적용
        likeDTO = toLikeDTO(savedLike)

        // 포스트의 좋아요 수 증가
        await postRepository
          .createQueryBuilder()
          .update(Post)
          .set({ like_count: () => "like_count + 1" })
          .where("id = :id", { id: parseInt(id) })
          .execute()

        isLiked = true
        newLikeCount = post.like_count + 1
        console.log("좋아요 추가 성공:", { id, userId })
      }

      res.json({
        success: true,
        message: isLiked
          ? "좋아요가 성공적으로 추가되었습니다."
          : "좋아요가 성공적으로 제거되었습니다.",
        data: {
          isLiked,
          likeCount: newLikeCount,
          like: likeDTO,
        },
      })
    } catch (error) {
      console.error("좋아요 토글 오류:", error)
      res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // 좋아요 추가 (기존 메서드 - 호환성을 위해 유지)
  addLike = async (req: Request, res: Response) => {
    return this.toggleLike(req, res)
  }

  // 좋아요 제거 (기존 메서드 - 호환성을 위해 유지)
  removeLike = async (req: Request, res: Response) => {
    return this.toggleLike(req, res)
  }
}
