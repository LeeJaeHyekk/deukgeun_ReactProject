import { Request, Response } from "express"
import { Comment } from "../entities/Comment"
import { User } from "../entities/User"
import { AppDataSource } from "../config/database"

export class CommentController {
  // 댓글 생성
  createComment = async (req: Request, res: Response) => {
    try {
      const { postId, content } = req.body
      const userId = (req.user as any)?.userId

      if (!userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const repo = AppDataSource.getRepository(Comment)
      const userRepo = AppDataSource.getRepository(User)

      // 사용자 정보 조회
      const user = await userRepo.findOne({ where: { id: userId } })
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." })
      }

      const comment = repo.create({
        postId,
        userId,
        content,
        author: user.nickname,
      })

      const savedComment = await repo.save(comment)

      res.status(201).json({
        message: "댓글이 성공적으로 작성되었습니다.",
        comment: savedComment,
      })
    } catch (error) {
      console.error("댓글 생성 오류:", error)
      res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." })
    }
  }

  // 특정 포스트의 댓글 조회
  getCommentsByPostId = async (req: Request, res: Response) => {
    try {
      const { postId } = req.params
      const repo = AppDataSource.getRepository(Comment)

      const comments = await repo.find({
        where: { postId: parseInt(postId) },
        order: { createdAt: "ASC" },
      })

      res.json(comments)
    } catch (error) {
      console.error("댓글 조회 오류:", error)
      res.status(500).json({ message: "댓글 조회 중 오류가 발생했습니다." })
    }
  }

  // 댓글 수정
  updateComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { content } = req.body
      const userId = (req.user as any)?.userId

      if (!userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const repo = AppDataSource.getRepository(Comment)

      const comment = await repo.findOne({
        where: { id: parseInt(id), userId },
      })

      if (!comment) {
        return res.status(404).json({ message: "댓글을 찾을 수 없습니다." })
      }

      comment.content = content
      const updatedComment = await repo.save(comment)

      res.json({
        message: "댓글이 성공적으로 수정되었습니다.",
        comment: updatedComment,
      })
    } catch (error) {
      console.error("댓글 수정 오류:", error)
      res.status(500).json({ message: "댓글 수정 중 오류가 발생했습니다." })
    }
  }

  // 댓글 삭제
  deleteComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req.user as any)?.userId

      if (!userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const repo = AppDataSource.getRepository(Comment)

      const comment = await repo.findOne({
        where: { id: parseInt(id), userId },
      })

      if (!comment) {
        return res.status(404).json({ message: "댓글을 찾을 수 없습니다." })
      }

      await repo.remove(comment)

      res.json({ message: "댓글이 성공적으로 삭제되었습니다." })
    } catch (error) {
      console.error("댓글 삭제 오류:", error)
      res.status(500).json({ message: "댓글 삭제 중 오류가 발생했습니다." })
    }
  }
}
