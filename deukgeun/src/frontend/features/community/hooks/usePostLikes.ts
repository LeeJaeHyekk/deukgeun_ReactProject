import { useState, useCallback } from 'react'
import { likesApi } from '@frontend/shared/api'
import { showToast } from '@shared/lib'
import { Post as CommunityPost } from '../../../../shared/types'

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
        console.log('🔥 좋아요 요청 시작:', postId)
        console.log('📋 현재 게시글 목록:', posts.length, '개')

        // 현재 포스트의 좋아요 상태 확인
        const currentPost = posts.find(post => post.id === postId)
        if (!currentPost) {
          console.error('❌ 게시글을 찾을 수 없음:', postId)
          showToast('게시글을 찾을 수 없습니다.', { type: 'error' })
          return false
        }

        console.log('📝 현재 게시글 정보:', {
          id: currentPost.id,
          title: currentPost.title,
          like_count: (currentPost as any).like_count,
          isLiked: (currentPost as any).isLiked,
        })

        // 좋아요 토글 API 호출
        console.log('🚀 API 호출 시작...')
        const response = await likesApi.toggle(postId)
        console.log('✅ 좋아요 API 응답:', response)
        console.log('📊 응답 데이터:', response.data)

        // 응답에서 좋아요 상태와 개수 가져오기
        const responseData = response.data?.data as
          | { isLiked: boolean; likeCount: number }
          | undefined

        console.log('🔍 응답 데이터 파싱:', responseData)

        if (
          responseData &&
          typeof responseData.isLiked === 'boolean' &&
          typeof responseData.likeCount === 'number'
        ) {
          console.log('✅ 유효한 응답 데이터 확인:', {
            isLiked: responseData.isLiked,
            likeCount: responseData.likeCount,
          })

          // 로컬 상태 업데이트 (SPA 방식)
          console.log('🔄 게시글 목록 상태 업데이트 시작...')
          setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post =>
              post.id === postId
                ? {
                    ...post,
                    likeCount: responseData.likeCount, // likeCount 필드로 통일
                    like_count: responseData.likeCount, // 호환성을 위해 둘 다 설정
                    isLiked: responseData.isLiked,
                  }
                : post
            )
            console.log('📝 업데이트된 게시글 목록:', updatedPosts.length, '개')
            console.log(
              '📊 업데이트된 게시글 상세:',
              updatedPosts.find(p => p.id === postId)
            )
            return updatedPosts
          })

          // 좋아요 상태 업데이트
          console.log('🔄 좋아요 상태 업데이트 시작...')
          setLikedPosts(prevLikedPosts => {
            const newLikedPosts = new Set(prevLikedPosts)
            if (responseData.isLiked) {
              newLikedPosts.add(postId)
              console.log('❤️ 좋아요 추가:', postId)
            } else {
              newLikedPosts.delete(postId)
              console.log('🤍 좋아요 제거:', postId)
            }
            console.log('📊 새로운 좋아요 목록:', Array.from(newLikedPosts))
            return newLikedPosts
          })

          // 성공 메시지 표시
          const message = responseData.isLiked
            ? '좋아요를 눌렀습니다.'
            : '좋아요를 취소했습니다.'
          showToast(message, { type: 'success' })
          console.log('🎉 좋아요 처리 완료:', message)
          return true
        } else {
          // 응답 형식이 예상과 다르면 전체 목록 새로고침
          console.warn('❌ 좋아요 응답 형식이 예상과 다릅니다:', response)
          console.warn('📊 응답 구조:', {
            data: response.data,
            dataData: response.data?.data,
            isLiked: responseData?.isLiked,
            likeCount: responseData?.likeCount,
          })
          return false
        }
      } catch (error: unknown) {
        console.error('좋아요 실패:', error)

        // 에러 타입에 따른 메시지 처리
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any
          if (axiosError.response?.status === 401) {
            showToast('로그인이 필요합니다.', { type: 'error' })
          } else if (axiosError.response?.status === 400) {
            showToast('이미 좋아요를 누른 게시글입니다.', { type: 'error' })
          } else if (axiosError.response?.status === 404) {
            showToast('게시글을 찾을 수 없습니다.', { type: 'error' })
          } else {
            showToast('좋아요 처리에 실패했습니다.', { type: 'error' })
          }
        } else {
          showToast('좋아요 처리에 실패했습니다.', { type: 'error' })
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

  // 좋아요 상태 초기화 (게시글 목록 로드 시 호출)
  const initializeLikes = useCallback((posts: CommunityPost[]) => {
    console.log('🔄 좋아요 상태 초기화 시작:', posts.length, '개 게시글')
    const likedPostIds = new Set<number>()
    posts.forEach(post => {
      const isLiked = (post as any).isLiked
      console.log(`📝 게시글 ${post.id}: isLiked = ${isLiked}`)
      if (isLiked) {
        likedPostIds.add(post.id)
      }
    })
    console.log('❤️ 초기화된 좋아요 목록:', Array.from(likedPostIds))
    setLikedPosts(likedPostIds)
  }, [])

  return {
    likedPosts,
    toggleLike,
    isLiked,
    setLikedPosts,
    initializeLikes,
  }
}
