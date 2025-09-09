import { AppDataSource } from "../../../shared/env"
import { Comment } from "../entities/Comment"
import { CreateCommentDTO } from "../types/dto"

export class CommentService {
  private commentRepository = AppDataSource.getRepository(Comment)

  async createComment(commentData: CreateCommentDTO & { postId: number; userId: number }) {
    const comment = this.commentRepository.create({
      ...commentData,
      author: "User" // 임시로 설정
    })
    
    return await this.commentRepository.save(comment)
  }

  async getComments(postId: number, options: { page: number; limit: number }) {
    return await this.commentRepository.find({
      where: { postId },
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip: (options.page - 1) * options.limit,
      take: options.limit
    })
  }

  async updateComment(id: number, userId: number, content: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, userId }
    })

    if (!comment) {
      throw new Error("댓글을 찾을 수 없거나 권한이 없습니다.")
    }

    comment.content = content
    return await this.commentRepository.save(comment)
  }

  async deleteComment(id: number, userId: number) {
    const result = await this.commentRepository.delete({ id, userId })
    
    if (result.affected === 0) {
      throw new Error("댓글을 찾을 수 없거나 권한이 없습니다.")
    }
  }
}
