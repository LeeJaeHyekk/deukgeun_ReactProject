import { Request, Response } from "express"
import { Comment } from "../entities/Comment.js"
import { User } from "../entities/User.js"
import { AppDataSource } from "../config/database.js"
import { toCommentDTO, toCommentDTOList } from "../transformers/index.js"

export class CommentController {
  // 댓글 생성
  createComment = async (req: Request, res: Response) => {
    try {
      console.log("댓글 생성 요청 시작")
      console.log("요청 파라미터:", req.params)
      console.log("요청 바디:", req.body)
      console.log("사용자 정보:", req.user)

      const { id: postId } = req.params
      const { content } = req.body
      const userId = (req.user as any)?.userId

      console.log("파싱된 데이터:", { postId, content, userId })

      if (!userId) {
        console.log("인증 실패: userId 없음")
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      if (!content || !content.trim()) {
        console.log("검증 실패: content 없음")
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." })
      }

      const repo = AppDataSource.getRepository(Comment)
      const userRepo = AppDataSource.getRepository(User)

      // 사용자 정보 조회
      console.log("사용자 정보 조회 시작:", userId)
      const user = await userRepo.findOne({ where: { id: userId } })
      if (!user) {
        console.log("사용자 찾을 수 없음:", userId)
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." })
      }
      console.log("사용자 정보 조회 성공:", user.nickname)

      const comment = repo.create({
        postId: parseInt(postId),
        userId,
        content: content.trim(),
        author: user.nickname || "Unknown",
      })

      console.log("댓글 엔티티 생성:", comment)

      const savedComment = await repo.save(comment)
      console.log("댓글 저장 성공:", savedComment)

      // DTO 변환 적용
      const commentDTO = toCommentDTO(savedComment)

      res.status(201).json({
        success: true,
        message: "댓글이 성공적으로 작성되었습니다.",
        data: commentDTO,
      })
    } catch (error) {
      console.error("댓글 생성 오류:", error)
      console.error(
        "오류 스택:",
        error instanceof Error ? error.stack : "No stack trace"
      )
      res.status(500).json({
        success: false,
        message: "댓글 작성 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // 특정 포스트의 댓글 조회
  getCommentsByPostId = async (req: Request, res: Response) => {
    try {
      const { id: postId } = req.params
      const repo = AppDataSource.getRepository(Comment)

      const comments = await repo.find({
        where: { postId: parseInt(postId) },
        order: { createdAt: "ASC" },
      })

      // DTO 변환 적용
      const commentDTOs = toCommentDTOList(comments)

      res.json({
        success: true,
        data: commentDTOs,
        message: "댓글을 성공적으로 조회했습니다.",
      })
    } catch (error) {
      console.error("댓글 조회 오류:", error)
      res.status(500).json({
        success: false,
        message: "댓글 조회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      })
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
