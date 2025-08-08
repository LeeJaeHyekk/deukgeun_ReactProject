import { getRepository } from "typeorm"
import { Post } from "../entities/Post"

/**
 * 포스트 관련 비즈니스 로직을 처리하는 서비스 클래스
 * TypeORM을 사용하여 데이터베이스와 상호작용하며 CRUD 작업을 수행합니다.
 */
export class PostService {
  /**
   * 모든 포스트를 생성일 기준 내림차순으로 조회합니다.
   * @returns {Promise<Post[]>} 포스트 목록 배열
   */
  async getAllPosts(params?: {
    category?: string
    q?: string
    sort?: "latest" | "popular"
    page?: number
    limit?: number
  }): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    const postRepository = getRepository(Post)
    const page = Math.max(1, params?.page || 1)
    const limit = Math.max(1, Math.min(50, params?.limit || 12))
    const qb = postRepository.createQueryBuilder("post")

    if (params?.category) {
      qb.andWhere("post.category = :category", { category: params.category })
    }

    if (params?.q) {
      qb.andWhere("(post.title LIKE :q OR post.content LIKE :q)", {
        q: `%${params.q}%`,
      })
    }

    if (params?.sort === "popular") {
      qb.orderBy("post.like_count", "DESC").addOrderBy("post.createdAt", "DESC")
    } else {
      qb.orderBy("post.createdAt", "DESC")
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
    return { data, total, page, limit }
  }

  /**
   * ID로 특정 포스트를 조회합니다.
   * @param {number} id - 조회할 포스트의 ID
   * @returns {Promise<Post | null>} 조회된 포스트 또는 null (존재하지 않는 경우)
   */
  async getPostById(id: number): Promise<Post | null> {
    const postRepository = getRepository(Post)
    return await postRepository.findOne({ where: { id } })
  }

  /**
   * 특정 사용자의 포스트 목록을 조회합니다.
   * @param {number} userId - 조회할 사용자의 ID
   * @returns {Promise<Post[]>} 해당 사용자의 포스트 목록 배열
   */
  async getPostsByUserId(userId: number): Promise<Post[]> {
    const postRepository = getRepository(Post)
    return await postRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
  }

  /**
   * 새로운 포스트를 생성합니다.
   * @param {Partial<Post>} postData - 생성할 포스트 데이터 (제목, 내용, 작성자 등)
   * @returns {Promise<Post>} 생성된 포스트 객체
   */
  async createPost(postData: Partial<Post>): Promise<Post> {
    const postRepository = getRepository(Post)
    const post = postRepository.create(postData)
    return await postRepository.save(post)
  }

  async adjustLikeCount(postId: number, delta: 1 | -1): Promise<void> {
    const postRepository = getRepository(Post)
    await postRepository.increment({ id: postId }, "like_count", delta)
  }

  async adjustCommentCount(postId: number, delta: 1 | -1): Promise<void> {
    const postRepository = getRepository(Post)
    await postRepository.increment({ id: postId }, "comment_count", delta)
  }

  /**
   * 기존 포스트를 업데이트합니다.
   * @param {number} id - 업데이트할 포스트의 ID
   * @param {Partial<Post>} updateData - 업데이트할 데이터
   * @returns {Promise<Post | null>} 업데이트된 포스트 또는 null (존재하지 않는 경우)
   */
  async updatePost(
    id: number,
    updateData: Partial<Post>
  ): Promise<Post | null> {
    const postRepository = getRepository(Post)
    await postRepository.update(id, updateData)
    return await this.getPostById(id)
  }

  /**
   * 포스트를 삭제합니다.
   * @param {number} id - 삭제할 포스트의 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deletePost(id: number): Promise<boolean> {
    const postRepository = getRepository(Post)
    const result = await postRepository.delete(id)
    return result.affected ? result.affected > 0 : false
  }
}
