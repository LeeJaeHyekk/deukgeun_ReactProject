import { Request, Response, NextFunction } from "express";
import { PostService } from "../services/post.service";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { LevelService } from "../services/levelService";

/**
 * 포스트 관련 HTTP 요청을 처리하는 컨트롤러 클래스
 * 클라이언트의 요청을 받아 서비스 레이어로 전달하고 응답을 반환합니다.
 */
export class PostController {
  private postService: PostService;
  private levelService: LevelService;

  constructor() {
    this.postService = new PostService();
    this.levelService = new LevelService();
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
      const { category, q, sort, page, limit } = req.query as any;
      const result = await this.postService.getAllPosts({
        category,
        q,
        sort,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 현재 로그인한 사용자의 포스트 목록을 조회하는 핸들러
   * GET /api/posts/my
   * @param {Request} req - Express 요청 객체 (user 정보는 JWT 토큰에서 추출)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT 토큰에서 추출한 사용자 정보 확인
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const posts = await this.postService.getPostsByUserId(req.user.userId);
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
   * @param {Request} req - Express 요청 객체 (body에 포스트 데이터 포함, user 정보는 JWT 토큰에서 추출)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT 토큰에서 추출한 사용자 정보 확인
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      // 최소 필드 검증
      const { title, content } = req.body || {};
      if (!title || !content) {
        return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
      }

      // 작성자 이름은 서버에서 보장 (클라이언트 입력 무시)
      const userRepo = getRepository(User);
      const authorUser = await userRepo.findOne({
        where: { id: req.user.userId },
      });
      const safeAuthor = authorUser?.nickname || authorUser?.email || "user";

      const postData = {
        ...req.body,
        author: safeAuthor,
        userId: req.user.userId, // JWT에서 추출한 사용자 ID
      };

      // category가 없으면 엔티티의 기본값(기타) 사용
      if (!postData.category) {
        delete (postData as any).category;
      }

      const newPost = await this.postService.createPost(postData);

      // 게시글 작성 경험치 부여
      try {
        await this.levelService.grantExp(
          req.user.userId,
          "post",
          "post_creation",
          { postId: newPost.id, title: newPost.title }
        );
      } catch (levelError) {
        // 경험치 부여 실패는 게시글 생성에 영향을 주지 않음
        console.error("경험치 부여 실패:", levelError);
      }

      res.status(201).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 기존 포스트를 업데이트하는 핸들러
   * PUT /api/posts/:id
   * @param {Request} req - Express 요청 객체 (params.id와 body에 업데이트 데이터 포함, user 정보는 JWT 토큰에서 추출)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT 토큰에서 추출한 사용자 정보 확인
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const { id } = req.params;
      const updateData = req.body;

      // 사용자 권한 확인 (자신의 포스트만 수정 가능)
      const post = await this.postService.getPostById(parseInt(id));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.userId !== req.user.userId) {
        return res.status(403).json({ message: "권한이 없습니다." });
      }

      const updatedPost = await this.postService.updatePost(
        parseInt(id),
        updateData
      );
      res.json(updatedPost);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 포스트를 삭제하는 핸들러
   * DELETE /api/posts/:id
   * @param {Request} req - Express 요청 객체 (params.id 포함, user 정보는 JWT 토큰에서 추출)
   * @param {Response} res - Express 응답 객체
   * @param {NextFunction} next - Express 다음 미들웨어 함수
   */
  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT 토큰에서 추출한 사용자 정보 확인
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const { id } = req.params;

      // 사용자 권한 확인 (자신의 포스트만 삭제 가능)
      const post = await this.postService.getPostById(parseInt(id));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.userId !== req.user.userId) {
        return res.status(403).json({ message: "권한이 없습니다." });
      }

      const deleted = await this.postService.deletePost(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * 허용 카테고리 목록 반환
   * GET /api/posts/categories
   */
  getCategories = async (_req: Request, res: Response) => {
    const categories = [
      "운동루틴",
      "팁",
      "다이어트",
      "기구가이드",
      "기타",
    ] as const;
    return res.status(200).json(categories);
  };

  /**
   * 실제 DB enum에서 카테고리 목록을 조회
   * GET /api/posts/categories/live
   */
  getCategoriesLive = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // TypeORM Repository를 통해 raw query 실행
      const { getRepository } = await import("typeorm");
      const { Post } = await import("../entities/Post");
      const repo = getRepository(Post);

      // MySQL에서 enum 값 추출
      const result = await repo.query(
        "SHOW COLUMNS FROM posts LIKE 'category'"
      );
      const type = result?.[0]?.Type as string | undefined; // e.g., "enum('A','B')"

      if (!type || !type.startsWith("enum")) {
        return res.status(200).json(["기타"]);
      }

      const inner = type.substring(
        type.indexOf("(") + 1,
        type.lastIndexOf(")")
      );
      const values = inner
        .split(",")
        .map((s: string) => s.trim())
        .map((s: string) => s.replace(/^'/, "").replace(/'$/, ""));

      return res.status(200).json(values);
    } catch (error) {
      next(error);
    }
  };
}
