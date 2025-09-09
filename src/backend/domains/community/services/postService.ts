import { AppDataSource } from "../../../shared/env"
import { Post } from "../entities/Post"
import { CreatePostDTO, UpdatePostDTO } from "../types/dto"

export class PostService {
  private postRepository = AppDataSource.getRepository(Post)

  async createPost(userId: number, postData: CreatePostDTO) {
    const post = this.postRepository.create({
      ...postData,
      userId,
      author: "User" // 임시로 설정
    })
    
    return await this.postRepository.save(post)
  }

  async getPosts(options: { page: number; limit: number; category?: string }, userId?: number) {
    const queryBuilder = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .orderBy("post.createdAt", "DESC")
      .skip((options.page - 1) * options.limit)
      .take(options.limit)

    if (options.category) {
      queryBuilder.where("post.category = :category", { category: options.category })
    }

    return await queryBuilder.getMany()
  }

  async getPostById(id: number, userId?: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["user"]
    })

    if (!post) {
      throw new Error("포스트를 찾을 수 없습니다.")
    }

    return post
  }

  async updatePost(id: number, userId: number, updateData: UpdatePostDTO) {
    const post = await this.postRepository.findOne({
      where: { id, userId }
    })

    if (!post) {
      throw new Error("포스트를 찾을 수 없거나 권한이 없습니다.")
    }

    Object.assign(post, updateData)
    return await this.postRepository.save(post)
  }

  async deletePost(id: number, userId: number) {
    const result = await this.postRepository.delete({ id, userId })
    
    if (result.affected === 0) {
      throw new Error("포스트를 찾을 수 없거나 권한이 없습니다.")
    }
  }
}
