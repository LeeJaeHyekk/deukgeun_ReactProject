import api from "./client"

// 좋아요 관련 API 함수들
export const likesApi = {
  // 좋아요 추가
  addLike: async (postId: string) => {
    const response = await api.post(`/posts/${postId}/likes`)
    return response.data
  },

  // 좋아요 제거
  removeLike: async (postId: string) => {
    const response = await api.delete(`/posts/${postId}/likes`)
    return response.data
  },

  // 좋아요 상태 확인
  checkLike: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/likes/check`)
    return response.data
  },

  // 게시글의 좋아요 수 조회
  getLikeCount: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/likes/count`)
    return response.data
  },

  // 좋아요 토글 (별칭)
  like: async (postId: string) => {
    const response = await api.post(`/posts/${postId}/likes`)
    return response.data
  },
}
