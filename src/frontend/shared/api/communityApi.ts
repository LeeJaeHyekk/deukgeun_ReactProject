// ============================================================================
// 커뮤니티 API
// ============================================================================

import { frontendAppConfig } from "../config/app.js"

const API_BASE_URL = frontendAppConfig.apiBaseUrl

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  images: string[]
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  parentId?: string
  likes: number
  createdAt: string
  updatedAt: string
}

class CommunityApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("accessToken")

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "API 요청 실패")
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      }
    }
  }

  // 게시글 관련
  async getPosts(
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ posts: Post[]; total: number }>> {
    return this.request(`/community/posts?page=${page}&limit=${limit}`)
  }

  async getPost(id: string): Promise<ApiResponse<Post>> {
    return this.request(`/community/posts/${id}`)
  }

  async createPost(postData: {
    title: string
    content: string
    tags?: string[]
    images?: string[]
  }): Promise<ApiResponse<Post>> {
    return this.request("/community/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    })
  }

  async updatePost(
    id: string,
    postData: Partial<Post>
  ): Promise<ApiResponse<Post>> {
    return this.request(`/community/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    })
  }

  async deletePost(id: string): Promise<ApiResponse<void>> {
    return this.request(`/community/posts/${id}`, {
      method: "DELETE",
    })
  }

  // 댓글 관련
  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return this.request(`/community/posts/${postId}/comments`)
  }

  async createComment(
    postId: string,
    commentData: {
      content: string
      parentId?: string
    }
  ): Promise<ApiResponse<Comment>> {
    return this.request(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    })
  }

  async updateComment(
    commentId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    return this.request(`/community/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    })
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return this.request(`/community/comments/${commentId}`, {
      method: "DELETE",
    })
  }

  // 좋아요 관련
  async likePost(postId: string): Promise<ApiResponse<void>> {
    return this.request(`/community/posts/${postId}/like`, {
      method: "POST",
    })
  }

  async unlikePost(postId: string): Promise<ApiResponse<void>> {
    return this.request(`/community/posts/${postId}/like`, {
      method: "DELETE",
    })
  }

  async likeComment(commentId: string): Promise<ApiResponse<void>> {
    return this.request(`/community/comments/${commentId}/like`, {
      method: "POST",
    })
  }

  async unlikeComment(commentId: string): Promise<ApiResponse<void>> {
    return this.request(`/community/comments/${commentId}/like`, {
      method: "DELETE",
    })
  }

  // 검색 관련
  async searchPosts(
    query: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ posts: Post[]; total: number }>> {
    return this.request(
      `/community/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    )
  }

  async getPostsByTag(
    tag: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ posts: Post[]; total: number }>> {
    return this.request(
      `/community/posts/tag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`
    )
  }
}

export const communityApi = new CommunityApi()
export const postsApi = communityApi
export const commentsApi = communityApi
export const likesApi = communityApi
export default communityApi
