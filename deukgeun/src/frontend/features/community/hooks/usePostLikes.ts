import { useState, useCallback, useEffect } from 'react'
import { likesApi } from '@frontend/shared/api'
import { showToast } from '@frontend/shared/lib'
import { Post as CommunityPost } from '../../../../shared/types'

export function usePostLikes() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // 로컬 스토리지에서 좋아요 상태 복원
  useEffect(() => {
    console.log('💾 [usePostLikes] 로컬 스토리지에서 좋아요 상태 복원')
    try {
      const stored = localStorage.getItem('likedPosts')
      if (stored) {
        const likedArray = JSON.parse(stored) as number[]
        const likedSet = new Set(likedArray)
        setLikedPosts(likedSet)
        console.log('💾 [usePostLikes] 복원된 좋아요 상태:', Array.from(likedSet))
      }
    } catch (error) {
      console.error('💾 [usePostLikes] 로컬 스토리지 복원 실패:', error)
    }
  }, [])

  // 좋아요 상태를 로컬 스토리지에 저장
  const saveLikedPosts = useCallback((newLikedPosts: Set<number>) => {
    try {
      const likedArray = Array.from(newLikedPosts)
      localStorage.setItem('likedPosts', JSON.stringify(likedArray))
      console.log('💾 [usePostLikes] 좋아요 상태 저장됨:', likedArray)
    } catch (error) {
      console.error('💾 [usePostLikes] 로컬 스토리지 저장 실패:', error)
    }
  }, [])

  // 좋아요 토글
  const toggleLike = useCallback(
    async (
      postId: number,
      posts: CommunityPost[],
      setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>
    ) => {
      try {
        console.log('🔥 [usePostLikes] 좋아요 요청 시작:', postId)
        console.log('🔥 [usePostLikes] 현재 posts 상태:', posts.length, '개')

        // 현재 포스트의 좋아요 상태 확인
        const currentPost = posts.find(post => post.id === postId)
        console.log('🔥 [usePostLikes] 현재 포스트 찾기:', currentPost ? '찾음' : '없음')
        if (!currentPost) {
          console.log('❌ [usePostLikes] 포스트를 찾을 수 없음')
          showToast('게시글을 찾을 수 없습니다.', 'error')
          return false
        }

        console.log('🔥 [usePostLikes] 현재 포스트 정보:', {
          id: currentPost.id,
          title: currentPost.title,
          likeCount: currentPost.likeCount
        })

        // 좋아요 토글 API 호출
        console.log('🔥 [usePostLikes] API 호출 시작')
        const response = await likesApi.toggle(postId)
        console.log('🔥 [usePostLikes] API 응답 받음:', response)

        // 응답에서 좋아요 상태와 개수 가져오기
        const responseData = response.data?.data as
          | { isLiked: boolean; likeCount: number }
          | undefined

        console.log('🔥 [usePostLikes] 응답 데이터 파싱:', responseData)

        if (
          responseData &&
          typeof responseData.isLiked === 'boolean' &&
          typeof responseData.likeCount === 'number'
        ) {
          console.log('✅ [usePostLikes] 응답 데이터 유효성 검사 통과')
          console.log('🔥 [usePostLikes] 업데이트할 데이터:', {
            isLiked: responseData.isLiked,
            likeCount: responseData.likeCount
          })

          // 로컬 상태 업데이트 (SPA 방식)
          console.log('🔥 [usePostLikes] posts 상태 업데이트 시작')
          setPosts(prevPosts => {
            console.log('🔥 [usePostLikes] 이전 posts 상태:', prevPosts.length, '개')
            const updatedPosts = prevPosts.map(post => {
              if (post.id === postId) {
                console.log('🔥 [usePostLikes] 포스트 업데이트:', {
                  id: post.id,
                  이전_likeCount: post.likeCount,
                  새로운_likeCount: responseData.likeCount
                })
                return { ...post, likeCount: responseData.likeCount }
              }
              return post
            })
            console.log('🔥 [usePostLikes] 업데이트된 posts:', updatedPosts.length, '개')
            return updatedPosts
          })

          // 좋아요 상태 업데이트
          console.log('🔥 [usePostLikes] likedPosts 상태 업데이트 시작')
          setLikedPosts(prevLikedPosts => {
            console.log('🔥 [usePostLikes] 이전 likedPosts:', Array.from(prevLikedPosts))
            const newLikedPosts = new Set(prevLikedPosts)
            if (responseData.isLiked) {
              newLikedPosts.add(postId)
              console.log('🔥 [usePostLikes] 좋아요 추가:', postId)
            } else {
              newLikedPosts.delete(postId)
              console.log('🔥 [usePostLikes] 좋아요 제거:', postId)
            }
            console.log('🔥 [usePostLikes] 새로운 likedPosts:', Array.from(newLikedPosts))
            
            // 로컬 스토리지에 저장
            saveLikedPosts(newLikedPosts)
            
            return newLikedPosts
          })

          // 성공 메시지 표시
          const message = responseData.isLiked
            ? '좋아요를 눌렀습니다.'
            : '좋아요를 취소했습니다.'
          console.log('🔥 [usePostLikes] 토스트 메시지:', message)
          showToast(message, 'success')
          console.log('✅ [usePostLikes] 좋아요 처리 완료')
          return true
        } else {
          // 응답 형식이 예상과 다르면 전체 목록 새로고침
          console.warn('❌ [usePostLikes] 좋아요 응답 형식이 예상과 다릅니다:', response)
          return false
        }
      } catch (error: unknown) {
        console.error('❌ [usePostLikes] 좋아요 실패:', error)

        // 에러 타입에 따른 메시지 처리
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any
          if (axiosError.response?.status === 401) {
            showToast('로그인이 필요합니다.', 'error')
          } else if (axiosError.response?.status === 400) {
            showToast('이미 좋아요를 누른 게시글입니다.', 'error')
          } else if (axiosError.response?.status === 404) {
            showToast('게시글을 찾을 수 없습니다.', 'error')
          } else {
            showToast('좋아요 처리에 실패했습니다.', 'error')
          }
        } else {
          showToast('좋아요 처리에 실패했습니다.', 'error')
        }
        return false
      }
    },
    []
  )

  // 좋아요 상태 확인
  const isLiked = useCallback(
    (postId: number) => {
      const result = likedPosts.has(postId)
      console.log('🔍 [usePostLikes] isLiked 체크:', { postId, result, likedPosts: Array.from(likedPosts) })
      return result
    },
    [likedPosts]
  )

  // 초기 데이터 로딩 시 좋아요 상태 복원
  const initializeLikedPosts = useCallback((posts: CommunityPost[]) => {
    console.log('🔄 [usePostLikes] 초기 좋아요 상태 복원 시작')
    try {
      const stored = localStorage.getItem('likedPosts')
      if (stored) {
        const likedArray = JSON.parse(stored) as number[]
        const likedSet = new Set(likedArray)
        setLikedPosts(likedSet)
        console.log('🔄 [usePostLikes] 복원된 좋아요 상태:', Array.from(likedSet))
      }
    } catch (error) {
      console.error('🔄 [usePostLikes] 초기 좋아요 상태 복원 실패:', error)
    }
  }, [])

  return {
    likedPosts,
    toggleLike,
    isLiked,
    setLikedPosts,
    initializeLikedPosts,
  }
}
