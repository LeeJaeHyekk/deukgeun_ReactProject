import { Request, Response } from "express"
import { CommentService } from "../services/commentService"
import { toCommentDTO, toCommentDTOList } from "../transformers/index"

export class CommentController {
  constructor(private commentService: CommentService) {}

  async createComment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId
      const { postId } = req.params
      const { content, parentId } = req.body
      
      const comment = await this.commentService.createComment({
        postId: Number(postId),
        userId,
        content,
        parentId
      })
      
      const commentDTO = toCommentDTO(comment)
      
      res.status(201).json({
        success: true,
        data: commentDTO
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "댓글 생성에 실패했습니다."
      })
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const { postId } = req.params
      const { page = 1, limit = 10 } = req.query
      
      const comments = await this.commentService.getComments(Number(postId), {
        page: Number(page),
        limit: Number(limit)
      })
      
      const commentsDTO = toCommentDTOList(comments)
      
      res.json({
        success: true,
        data: commentsDTO
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "댓글 조회에 실패했습니다."
      })
    }
  }

  async updateComment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.userId
      const { content } = req.body
      
      const comment = await this.commentService.updateComment(Number(id), userId, content)
      const commentDTO = toCommentDTO(comment)
      
      res.json({
        success: true,
        data: commentDTO
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "댓글 수정에 실패했습니다."
      })
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.userId
      
      await this.commentService.deleteComment(Number(id), userId)
      
      res.json({
        success: true,
        message: "댓글이 삭제되었습니다."
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "댓글 삭제에 실패했습니다."
      })
    }
  }
}