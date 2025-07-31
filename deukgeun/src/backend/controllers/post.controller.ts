import { Request, Response, NextFunction } from "express";
import { PostService } from "../services/post.service";

/**
 * 포스트 관련 HTTP 요청을 처리하는 컨트롤러 클래스
 * 클라이언트의 요청을 받아 서비스 레이어로 전달하고 응답을 반환합니다.
 */
export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  /**
   * 모든 포스트 목록을 조회하는 핸들러
   * GET /api/posts
   * @param {Request} req - Express 요청 객체
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await this.postService.getAllPosts();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 특정 포스트를 ID로 조회하는 핸들러
   * GET /api/posts/:id
   * @param {Request} req - Express 요청 객체 (params.id 포함)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postService.getPostById(parseInt(id));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 새로운 포스트를 생성하는 핸들러
   * POST /api/posts
   * @param {Request} req - Express 요청 객체 (body에 포스트 데이터 포함)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postData = req.body;
      const newPost = await this.postService.createPost(postData);
      res.status(201).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 기존 포스트를 업데이트하는 핸들러
   * PUT /api/posts/:id
   * @param {Request} req - Express 요청 객체 (params.id와 body에 업데이트 데이터 포함)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedPost = await this.postService.updatePost(
        parseInt(id),
        updateData
      );
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(updatedPost);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 포스트를 삭제하는 핸들러
   * DELETE /api/posts/:id
   * @param {Request} req - Express 요청 객체 (params.id 포함)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await this.postService.deletePost(parseInt(id));
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
