import { AppDataSource } from '../config/database'
import { Post } from '../entities/Post'
import { User } from '../entities/User'
import { ApiResponse } from '../types'

interface PostQueryParams {
  category?: string
  q?: string
  sort?: string
  page?: number
  limit?: number
}

export class PostService {
  async getAllPosts(
    params: PostQueryParams,
    userId?: number
  ): Promise<ApiResponse> {
    try {
      const postRepository = AppDataSource.getRepository(Post)
      const userRepository = AppDataSource.getRepository(User)

      // 기본 쿼리 빌더 생성
      let queryBuilder = postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect(
          'post.likes',
          'likes',
          userId ? 'likes.userId = :userId' : '1=0',
          { userId }
        )

      // 카테고리 필터링
      if (params.category && params.category !== 'all') {
        queryBuilder = queryBuilder.where('post.category = :category', {
          category: params.category,
        })
      }

      // 검색어 필터링
      if (params.q) {
        queryBuilder = queryBuilder.andWhere(
          '(post.title LIKE :search OR post.content LIKE :search)',
          { search: `%${params.q}%` }
        )
      }

      // 정렬
      switch (params.sort) {
        case 'latest':
          queryBuilder = queryBuilder.orderBy('post.createdAt', 'DESC')
          break
        case 'popular':
          queryBuilder = queryBuilder.orderBy('post.like_count', 'DESC')
          break
        case 'oldest':
          queryBuilder = queryBuilder.orderBy('post.createdAt', 'ASC')
          break
        case 'likes':
          queryBuilder = queryBuilder.orderBy('post.like_count', 'DESC')
          break
        case 'comments':
          queryBuilder = queryBuilder.orderBy('post.comment_count', 'DESC')
          break
        default:
          queryBuilder = queryBuilder.orderBy('post.createdAt', 'DESC')
      }

      // 페이지네이션
      const page = params.page || 1
      const limit = params.limit || 10
      const skip = (page - 1) * limit

      queryBuilder = queryBuilder.skip(skip).take(limit)

      const [posts, total] = await queryBuilder.getManyAndCount()

      return {
        success: true,
        message: '포스트 조회 성공',
        data: {
          posts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    } catch (error) {
      console.error('포스트 조회 오류:', error)
      return {
        success: false,
        message: '포스트 조회 중 오류가 발생했습니다.',
      }
    }
  }

  async getPostById(id: number): Promise<Post | null> {
    try {
      const postRepository = AppDataSource.getRepository(Post)
      return await postRepository.findOne({
        where: { id },
        relations: ['user'],
      })
    } catch (error) {
      console.error('포스트 조회 오류:', error)
      return null
    }
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    try {
      const postRepository = AppDataSource.getRepository(Post)
      return await postRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      })
    } catch (error) {
      console.error('사용자 포스트 조회 오류:', error)
      return []
    }
  }

  async createPost(
    postData: Partial<Post>,
    userId: number
  ): Promise<Post | null> {
    try {
      const postRepository = AppDataSource.getRepository(Post)
      const userRepository = AppDataSource.getRepository(User)

      // 사용자 정보 조회
      const user = await userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.')
      }

      const post = postRepository.create({
        ...postData,
        userId,
        author: user.nickname,
      })

      return await postRepository.save(post)
    } catch (error) {
      console.error('포스트 생성 오류:', error)
      return null
    }
  }

  async updatePost(
    id: number,
    updateData: Partial<Post>,
    userId: number
  ): Promise<Post | null> {
    try {
      const postRepository = AppDataSource.getRepository(Post)

      const post = await postRepository.findOne({
        where: { id, userId },
      })

      if (!post) {
        return null
      }

      Object.assign(post, updateData)
      return await postRepository.save(post)
    } catch (error) {
      console.error('포스트 수정 오류:', error)
      return null
    }
  }

  async deletePost(id: number, userId: number): Promise<boolean> {
    try {
      const postRepository = AppDataSource.getRepository(Post)

      const post = await postRepository.findOne({
        where: { id, userId },
      })

      if (!post) {
        return false
      }

      await postRepository.remove(post)
      return true
    } catch (error) {
      console.error('포스트 삭제 오류:', error)
      return false
    }
  }

  async adjustLikeCount(postId: number, adjustment: number): Promise<void> {
    try {
      const postRepository = AppDataSource.getRepository(Post)
      await postRepository
        .createQueryBuilder()
        .update(Post)
        .set({ like_count: () => `like_count + ${adjustment}` })
        .where('id = :id', { id: postId })
        .execute()
    } catch (error) {
      console.error('좋아요 수 조정 오류:', error)
    }
  }

  async adjustCommentCount(postId: number, adjustment: number): Promise<void> {
    try {
      const postRepository = AppDataSource.getRepository(Post)
      await postRepository
        .createQueryBuilder()
        .update(Post)
        .set({ comment_count: () => `comment_count + ${adjustment}` })
        .where('id = :id', { id: postId })
        .execute()
    } catch (error) {
      console.error('댓글 수 조정 오류:', error)
    }
  }
}
