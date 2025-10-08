const { apiClient  } = require('./client')
const { PostDTO, Post  } = require('@shared/types/dto/post.dto')
const { CommentDTO, Comment  } = require('@shared/types/dto/comment.dto')
const { LikeDTO, Like  } = require('@shared/types/dto/like.dto')

export interface CreatePostRequest {
  title: string
  content: string
  category?: string
  images?: string[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  category?: string
  images?: string[]
}

export interface CreateCommentRequest {
  content: string
  postId: number
  parentId?: number
}

const communityApi = {
  // Posts
  async getPosts(
    page = 1,
    limit = 10,
    category?: string
  ): Promise<{ posts: PostDTO[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (category) params.append('category', category)

    const response = await apiClient.get<{ posts: PostDTO[]; total: number }>(
      `/community/posts?${params}`
    )
    return response.data!
  },

  async getPostById(id: number): Promise<PostDTO> {
    const response = await apiClient.get<PostDTO>(`/community/posts/${id}`)
    return response.data!
  },

  async createPost(postData: CreatePostRequest): Promise<PostDTO> {
    const response = await apiClient.post<PostDTO>('/community/posts', postData)
    return response.data!
  },

  async updatePost(id: number, postData: UpdatePostRequest): Promise<PostDTO> {
    const response = await apiClient.put<PostDTO>(
      `/community/posts/${id}`,
      postData
    )
    return response.data!
  },

  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`/community/posts/${id}`)
  },

  // Comments
  async getComments(postId: number): Promise<CommentDTO[]> {
    const response = await apiClient.get<CommentDTO[]>(
      `/community/posts/${postId}/comments`
    )
    return response.data!
  },

  async createComment(commentData: CreateCommentRequest): Promise<CommentDTO> {
    const response = await apiClient.post<CommentDTO>(
      '/community/comments',
      commentData
    )
    return response.data!
  },

  async updateComment(id: number, content: string): Promise<CommentDTO> {
    const response = await apiClient.put<CommentDTO>(
      `/community/comments/${id}`,
      {
        content,
      }
    )
    return response.data!
  },

  async deleteComment(id: number): Promise<void> {
    await apiClient.delete(`/community/comments/${id}`)
  },

  // Likes
  async likePost(postId: number): Promise<LikeDTO> {
    const response = await apiClient.post<LikeDTO>(
      `/community/posts/${postId}/like`
    )
    return response.data!
  },

  async unlikePost(postId: number): Promise<void> {
    await apiClient.delete(`/community/posts/${postId}/like`)
  },

  async likeComment(commentId: number): Promise<LikeDTO> {
    const response = await apiClient.post<LikeDTO>(
      `/community/comments/${commentId}/like`
    )
    return response.data!
  },

  async unlikeComment(commentId: number): Promise<void> {
    await apiClient.delete(`/community/comments/${commentId}/like`)
  },
}
