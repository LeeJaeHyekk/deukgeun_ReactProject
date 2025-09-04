// 프론트엔드 전용 Community API

import api from "./client"
import { API_ENDPOINTS } from "../config/apiEndpoints"
import type {
  Post,
  PostListResponse,
  CreatePostRequest,
  UpdatePostRequest,
  ApiResponse,
  ApiListResponse,
} from "../types/community"

// Posts API
export const postsApi = {
  // 게시글 목록 조회
  async getPosts(params: {
    page?: number
    limit?: number
    category?: string
    searchTerm?: string
    sortBy?: string
  }): Promise<PostListResponse> {
    const response = await api.get<ApiListResponse<Post>>(
      `${API_ENDPOINTS.BASE_URL}/posts`,
      { params }
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response && "pagination" in response) {
      return {
        posts: response.data,
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
      }
    }
    // 직접 PostListResponse 형태로 응답하는 경우
    return response as PostListResponse
  },

  // 게시글 상세 조회
  async getPost(id: string): Promise<Post> {
    const response = await api.get<ApiResponse<Post>>(
      `${API_ENDPOINTS.BASE_URL}/posts/${id}`
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response) {
      return response.data
    }
    // 직접 Post 형태로 응답하는 경우
    return response as Post
  },

  // 게시글 생성
  async create(data: CreatePostRequest): Promise<Post> {
    const response = await api.post<ApiResponse<Post>>(
      `${API_ENDPOINTS.BASE_URL}/posts`,
      data
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response) {
      return response.data
    }
    // 직접 Post 형태로 응답하는 경우
    return response as Post
  },

  // 게시글 수정
  async update(id: string, data: UpdatePostRequest): Promise<Post> {
    const response = await api.put<ApiResponse<Post>>(
      `${API_ENDPOINTS.BASE_URL}/posts/${id}`,
      data
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response) {
      return response.data
    }
    // 직접 Post 형태로 응답하는 경우
    return response as Post
  },

  // 게시글 삭제
  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.BASE_URL}/posts/${id}`)
  },

  // 카테고리 목록 조회
  async getCategories(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(
      `${API_ENDPOINTS.BASE_URL}/posts/categories`
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response) {
      return response.data
    }
    // 직접 배열로 응답하는 경우
    return response as any[]
  },

  // 게시글 검색 (별칭)
  async search(params: any): Promise<PostListResponse> {
    return this.getPosts(params)
  },

  // 게시글 필터링 (별칭)
  async filter(params: any): Promise<PostListResponse> {
    return this.getPosts(params)
  },

  // 게시글 목록 (별칭)
  async list(params: any): Promise<PostListResponse> {
    return this.getPosts(params)
  },
}

// Likes API
export const likesApi = {
  // 좋아요 토글
  async like(postId: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.BASE_URL}/posts/${postId}/like`)
  },

  // 좋아요 취소
  async unlike(postId: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.BASE_URL}/posts/${postId}/like`)
  },
}

// Comments API
export const commentsApi = {
  // 댓글 목록 조회
  async getComments(postId: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(
      `${API_ENDPOINTS.BASE_URL}/posts/${postId}/comments`
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response) {
      return response.data
    }
    // 직접 배열로 응답하는 경우
    return response as any[]
  },

  // 댓글 생성
  async createComment(postId: string, content: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(
      `${API_ENDPOINTS.BASE_URL}/posts/${postId}/comments`,
      { content }
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response) {
      return response.data
    }
    // 직접 응답하는 경우
    return response
  },

  // 댓글 수정
  async updateComment(commentId: string, content: string): Promise<any> {
    const response = await api.put<ApiResponse<any>>(
      `${API_ENDPOINTS.BASE_URL}/comments/${commentId}`,
      { content }
    )
    // API 응답 구조에 맞게 처리
    if ("data" in response) {
      return response.data
    }
    // 직접 응답하는 경우
    return response
  },

  // 댓글 삭제
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.BASE_URL}/comments/${commentId}`)
  },
}
