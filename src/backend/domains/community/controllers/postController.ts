import { Request, Response } from "express"
import { PostService } from "../services/postService"
import { toPostDTO, toPostDTOList } from "../transformers/index"
import { CreatePostDTO, UpdatePostDTO } from "../types/dto"

export class PostController {
  constructor(private postService: PostService) {}

  async createPost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId
      const postData: CreatePostDTO = req.body
      
      const post = await this.postService.createPost(userId, postData)
      const postDTO = toPostDTO(post)
      
      res.status(201).json({
        success: true,
        data: postDTO
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "포스트 생성에 실패했습니다."
      })
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category } = req.query
      const userId = (req as any).user?.userId
      
      const posts = await this.postService.getPosts({
        page: Number(page),
        limit: Number(limit),
        category: category as string
      }, userId)
      
      const postsDTO = toPostDTOList(posts)
      
      res.json({
        success: true,
        data: postsDTO
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "포스트 조회에 실패했습니다."
      })
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.userId
      
      const post = await this.postService.getPostById(Number(id), userId)
      const postDTO = toPostDTO(post)
      
      res.json({
        success: true,
        data: postDTO
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "포스트를 찾을 수 없습니다."
      })
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.userId
      const updateData: UpdatePostDTO = req.body
      
      const post = await this.postService.updatePost(Number(id), userId, updateData)
      const postDTO = toPostDTO(post)
      
      res.json({
        success: true,
        data: postDTO
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "포스트 수정에 실패했습니다."
      })
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.userId
      
      await this.postService.deletePost(Number(id), userId)
      
      res.json({
        success: true,
        message: "포스트가 삭제되었습니다."
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "포스트 삭제에 실패했습니다."
      })
    }
  }
}
