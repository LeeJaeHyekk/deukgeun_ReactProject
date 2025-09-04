import api from "./client"

// 댓글 관련 API 함수들
export const commentsApi = {
  // 댓글 목록 조회
  getComments: async (postId: string, params?: any) => {
    const response = await api.get(`/posts/${postId}/comments`, { params })
    return response.data
  },

  // 댓글 생성
  createComment: async (postId: string, data: any) => {
    const response = await api.post(`/posts/${postId}/comments`, data)
    return response.data
  },

  // 댓글 수정
  updateComment: async (commentId: string, data: any) => {
    const response = await api.put(`/comments/${commentId}`, data)
    return response.data
  },

  // 댓글 삭제
  deleteComment: async (commentId: string) => {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data
  },
}
