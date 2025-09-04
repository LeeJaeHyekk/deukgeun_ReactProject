import api from "./client"

// 게시글 관련 API 함수들
export const postsApi = {
  // 게시글 목록 조회
  getPosts: async (params?: any) => {
    const response = await api.get("/posts", { params })
    return response.data
  },

  // 게시글 상세 조회
  getPost: async (id: string) => {
    const response = await api.get(`/posts/${id}`)
    return response.data
  },

  // 게시글 생성
  createPost: async (data: any) => {
    const response = await api.post("/posts", data)
    return response.data
  },

  // 게시글 수정
  updatePost: async (id: string, data: any) => {
    const response = await api.put(`/posts/${id}`, data)
    return response.data
  },

  // 게시글 삭제
  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  },

  // 카테고리 목록 조회
  categories: async () => {
    const response = await api.get("/posts/categories")
    return response.data
  },

  // 게시글 목록 조회 (페이지네이션)
  list: async (params?: any) => {
    const response = await api.get("/posts", { params })
    return response.data
  },

  // 게시글 생성 (별칭)
  create: async (data: any) => {
    const response = await api.post("/posts", data)
    return response.data
  },

  // 게시글 수정 (별칭)
  update: async (id: string, data: any) => {
    const response = await api.put(`/posts/${id}`, data)
    return response.data
  },

  // 게시글 삭제 (별칭)
  remove: async (id: string) => {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  },
}
