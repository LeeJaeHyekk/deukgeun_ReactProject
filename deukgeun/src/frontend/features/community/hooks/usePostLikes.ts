import { useState, useCallback } from "react"
import { likesApi } from "@shared/api"
import { showToast } from "@shared/lib"
import { CommunityPost } from "../../../../types/post"

export function usePostLikes() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // 좋아요 토글
  const toggleLike = useCallback(
    async (
      postId: number,
      posts: CommunityPost[],
      setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>
    ) => {
      try {
        console.log("좋아요 요청 시작:", postId)

        // 현재 포스트의 좋아요 상태 확인
        const currentPost = posts.find(post => post.id === postId)
        if (!currentPost) {
          showToast("게시글을 찾을 수 없습니다.", "error")
          return false
        }

        // 좋아요 토글 API 호출
        const response = await likesApi.toggle(postId)
        console.log("좋아요 응답:", response)

        // 응답에서 좋아요 상태와 개수 가져오기
        const responseData = response.data?.data as
          | { isLiked: boolean; likeCount: number }
          | undefined

        if (
          responseData &&
          typeof responseData.isLiked === "boolean" &&
          typeof responseData.likeCount === "number"
        ) {
          // 로컬 상태 업데이트 (SPA 방식)
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === postId
                ? { ...post, like_count: responseData.likeCount }
                : post
            )
          )

          // 좋아요 상태 업데이트
          setLikedPosts(prevLikedPosts => {
            const newLikedPosts = new Set(prevLikedPosts)
            if (responseData.isLiked) {
              newLikedPosts.add(postId)
            } else {
              newLikedPosts.delete(postId)
            }
            return newLikedPosts
          })

          // 성공 메시지 표시
          const message = responseData.isLiked
            ? "좋아요를 눌렀습니다."
            : "좋아요를 취소했습니다."
          showToast(message, "success")
          return true
        } else {
          // 응답 형식이 예상과 다르면 전체 목록 새로고침
          console.warn("좋아요 응답 형식이 예상과 다릅니다:", response)
          return false
        }
      } catch (error: unknown) {
        console.error("좋아요 실패:", error)

        // 에러 타입에 따른 메시지 처리
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as any
          if (axiosError.response?.status === 401) {
            showToast("로그인이 필요합니다.", "error")
          } else if (axiosError.response?.status === 400) {
            showToast("이미 좋아요를 누른 게시글입니다.", "error")
          } else if (axiosError.response?.status === 404) {
            showToast("게시글을 찾을 수 없습니다.", "error")
          } else {
            showToast("좋아요 처리에 실패했습니다.", "error")
          }
        } else {
          showToast("좋아요 처리에 실패했습니다.", "error")
        }
        return false
      }
    },
    []
  )

  // 좋아요 상태 확인
  const isLiked = useCallback(
    (postId: number) => {
      return likedPosts.has(postId)
    },
    [likedPosts]
  )

  return {
    likedPosts,
    toggleLike,
    isLiked,
    setLikedPosts,
  }
}
