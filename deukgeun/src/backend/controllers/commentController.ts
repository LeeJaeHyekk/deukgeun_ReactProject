import { Request, Response } from "express"
import { Comment } from '@backend/entities/Comment'
import { User } from '@backend/entities/User'
import { AppDataSource } from '@backend/config/databaseConfig'
import { toCommentDTO, toCommentDTOList } from "@backend/transformers"

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
      const userId = Number((req.user as any)?.userId)

      console.log("파싱된 데이터:", { postId, content, userId })

      if (!userId || isNaN(userId)) {
        console.log("인증 실패: userId 없음 또는 유효하지 않음", { userId: (req.user as any)?.userId })
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
      console.log("=== 댓글 수정 요청 시작 ===")
      console.log("요청 파라미터:", req.params)
      console.log("요청 바디:", req.body)
      console.log("요청 헤더 Authorization:", req.headers.authorization)
      console.log("사용자 정보:", req.user)
      console.log("사용자 정보 타입:", typeof req.user)
      console.log("사용자 정보 userId:", (req.user as any)?.userId)
      console.log("사용자 정보 userId 타입:", typeof (req.user as any)?.userId)

      const { id } = req.params
      const { content } = req.body
      
      // userId 타입 강제 변환 및 검증
      const userId = Number((req.user as any)?.userId)
      if (!userId || isNaN(userId)) {
        console.log("인증 실패: userId 없음 또는 유효하지 않음", { userId: (req.user as any)?.userId })
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      // content 검증 추가
      if (!content || !content.trim()) {
        console.log("검증 실패: content 없음")
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." })
      }

      const repo = AppDataSource.getRepository(Comment)

      // 먼저 댓글 ID로 댓글을 찾음
      const comment = await repo.findOne({
        where: { id: parseInt(id) },
      })

      if (!comment) {
        console.log("댓글을 찾을 수 없음:", id)
        return res.status(404).json({ 
          success: false,
          message: "댓글을 찾을 수 없습니다.",
          error: "COMMENT_NOT_FOUND"
        })
      }

      // 권한 검사: 댓글 작성자와 현재 사용자가 일치하는지 확인
      if (comment.userId !== userId) {
        console.log("권한 없음:", { 
          commentUserId: comment.userId, 
          currentUserId: userId,
          commentUserIdType: typeof comment.userId,
          currentUserIdType: typeof userId
        })
        return res.status(403).json({ 
          success: false,
          message: "본인이 작성한 댓글만 수정할 수 있습니다.",
          error: "INSUFFICIENT_PERMISSIONS"
        })
      }

      comment.content = content.trim()
      const updatedComment = await repo.save(comment)

      console.log("댓글 수정 성공:", updatedComment.id)

      // DTO 변환 적용
      const commentDTO = toCommentDTO(updatedComment)

      res.json({
        success: true,
        message: "댓글이 성공적으로 수정되었습니다.",
        data: commentDTO,
      })
    } catch (error) {
      console.error("댓글 수정 오류:", error)
      console.error(
        "오류 스택:",
        error instanceof Error ? error.stack : "No stack trace"
      )
      res.status(500).json({
        success: false,
        message: "댓글 수정 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // 댓글 삭제
  deleteComment = async (req: Request, res: Response) => {
    try {
      console.log("댓글 삭제 요청 시작")
      console.log("요청 파라미터:", req.params)
      console.log("사용자 정보:", req.user)

      const { id } = req.params
      
      // userId 타입 강제 변환 및 검증
      const userId = Number((req.user as any)?.userId)
      if (!userId || isNaN(userId)) {
        console.log("인증 실패: userId 없음 또는 유효하지 않음", { userId: (req.user as any)?.userId })
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const repo = AppDataSource.getRepository(Comment)

      // 먼저 댓글 ID로 댓글을 찾음
      const comment = await repo.findOne({
        where: { id: parseInt(id) },
      })

      if (!comment) {
        console.log("댓글을 찾을 수 없음:", id)
        return res.status(404).json({ 
          success: false,
          message: "댓글을 찾을 수 없습니다.",
          error: "COMMENT_NOT_FOUND"
        })
      }

      // 권한 검사: 댓글 작성자와 현재 사용자가 일치하는지 확인
      if (comment.userId !== userId) {
        console.log("권한 없음:", { commentUserId: comment.userId, currentUserId: userId })
        return res.status(403).json({ message: "본인이 작성한 댓글만 삭제할 수 있습니다." })
      }

      await repo.remove(comment)

      console.log("댓글 삭제 성공:", id)

      res.json({
        success: true,
        message: "댓글이 성공적으로 삭제되었습니다.",
      })
    } catch (error) {
      console.error("댓글 삭제 오류:", error)
      console.error(
        "오류 스택:",
        error instanceof Error ? error.stack : "No stack trace"
      )
      res.status(500).json({
        success: false,
        message: "댓글 삭제 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}
