import { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { postsApi } from '@frontend/shared/api'
import { showToast } from '@frontend/shared/lib'
import { useAuthGuard } from '@frontend/shared/hooks/useAuthGuard'
import { handleAuthAwareError } from '@frontend/shared/utils/errorHandler'
import { validateTokenForAction } from '@frontend/shared/utils/tokenUtils'
import {
  PostDTO as CommunityPost,
  PostCategoryInfo,
} from '../../../shared/types'
import { RootState, AppDispatch } from '@frontend/shared/store'
import { setPosts as setPostsAction, setPagination, createPost as createPostThunk, fetchPosts as fetchPostsThunk } from '../posts/postsSlice'

interface UseCommunityPostsProps {
  limit: number
}

interface FetchPostsParams {
  page?: number
  category?: string
  searchTerm?: string
  sortBy?: 'latest' | 'popular'
}

export function useCommunityPosts({ limit }: UseCommunityPostsProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { ensureAuthenticated } = useAuthGuard()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableCategories, setAvailableCategories] = useState<
    PostCategoryInfo[]
  >([])

  // Redux store에서 posts 데이터 구독
  const reduxPosts = useSelector((state: RootState) => state.posts.entities)
  const reduxPostIds = useSelector((state: RootState) => state.posts.ids)

  // Redux store 변경사항을 로컬 state에 동기화
  useEffect(() => {
    if (reduxPostIds.length > 0) {
      const updatedPosts = reduxPostIds.map(id => reduxPosts[id]).filter(Boolean)
      console.log('🔄 [useCommunityPosts] Redux store 동기화:', {
        reduxPostIds: reduxPostIds.length,
        updatedPosts: updatedPosts.length,
        firstPost: updatedPosts[0]
      })
      setPosts(updatedPosts)
    }
  }, [reduxPosts, reduxPostIds])

  // 카테고리 목록 가져오기
  const fetchCategories = useCallback(async () => {
    try {
      const response = await postsApi.categories()
      console.log('Categories API Response:', response.data)
      const categories = response.data.data as PostCategoryInfo[]
      setAvailableCategories(categories || [])
    } catch (error: unknown) {
      console.error('카테고리 로드 실패:', error)
      showToast('카테고리를 불러오는데 실패했습니다.', 'error')
    }
  }, [])

  // 게시글 목록 가져오기
  const fetchPosts = useCallback(
    async ({
      page = 1,
      category,
      searchTerm,
      sortBy = 'latest',
    }: FetchPostsParams) => {
      setLoading(true)
      try {
        const params: {
          category?: string
          q?: string
          sort?: 'latest' | 'popular'
          page?: number
          limit?: number
        } = {
          page,
          limit,
          sort: sortBy,
        }

        // 카테고리 필터
        if (category && category !== 'all') {
          params.category = category
        }

        // 검색어 필터
        if (searchTerm?.trim()) {
          params.q = searchTerm.trim()
        }

        console.log('Fetching posts with params:', params)
        const res = await postsApi.list(params)

        console.log('Posts API Response:', res.data)

        // API 응답 구조 확인 및 처리
        const apiResponse = res.data as {
          success: boolean
          message: string
          data?: {
            posts: any[]
            pagination: {
              page: number
              limit: number
              total: number
              totalPages: number
            }
          }
          error?: string
        }

        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(
            apiResponse.message || '게시글을 불러오는데 실패했습니다.'
          )
        }

        const { posts: rawPosts, pagination } = apiResponse.data

        // API 응답 데이터를 안전하게 매핑
        const mappedPosts = (rawPosts || []).map(post => {
          console.log('Individual post:', post)
          return {
            id: post.id,
            userId: post.user?.id || post.userId || 0,
            title: post.title || '',
            content: post.content || '',
            author: post.user?.nickname || post.author || '익명',
            category: post.category || '',
            likeCount: post.like_count || post.likes || 0,
            commentCount: post.comment_count || post.comments || 0,
            viewsCount: post.views_count || post.views || 0,
            createdAt:
              post.createdAt || post.created_at || new Date().toISOString(),
            updatedAt:
              post.updatedAt || post.updated_at || new Date().toISOString(),
          } as CommunityPost
        })

        // 로컬 state 업데이트
        setPosts(mappedPosts)
        setTotalPages(
          pagination.totalPages || Math.ceil(pagination.total / limit)
        )
        setCurrentPage(page)

        // Redux store에도 저장 (좋아요 상태 동기화를 위해)
        dispatch(setPostsAction(mappedPosts))
        dispatch(setPagination({
          page: page,
          totalPages: pagination.totalPages || Math.ceil(pagination.total / limit),
          total: pagination.total
        }))
      } catch (error: unknown) {
        console.error('게시글 로드 실패:', error)
        showToast('게시글을 불러오는데 실패했습니다.', 'error')
        setPosts([])
      } finally {
        setLoading(false)
      }
    },
    [limit]
  )

  // 새 게시글 작성
  const createPost = useCallback(
    async (postData: { title: string; content: string; category: string }) => {
      // 인증 사전 검증
      if (!ensureAuthenticated()) return false

      // 토큰 검증
      const token = validateTokenForAction('createPost')
      if (!token) {
        showToast('로그인이 만료되었습니다. 다시 로그인해주세요.', 'error')
        window.location.href = '/login'
        return false
      }

      try {
        await dispatch(createPostThunk(postData))
        showToast('게시글이 성공적으로 작성되었습니다.', 'success')
        return true
    } catch (error: unknown) {
      console.error('게시글 작성 실패:', error)
      if (handleAuthAwareError(error, (m,t='error')=>showToast(m,t))) return false
      showToast('게시글 작성에 실패했습니다.', 'error')
      return false
    }
    },
    [dispatch, ensureAuthenticated]
  )

  // 게시글 수정
  const updatePost = useCallback(
    async (
      postId: number,
      updateData: { title: string; content: string; category: string }
    ) => {
      try {
        await postsApi.update(postId, updateData)
        showToast('게시글이 성공적으로 수정되었습니다.', 'success')
        return true
      } catch (error: unknown) {
        console.error('게시글 수정 실패:', error)
        showToast('게시글 수정에 실패했습니다.', 'error')
        return false
      }
    },
    []
  )

  // 게시글 삭제
  const deletePost = useCallback(async (postId: number) => {
    try {
      await postsApi.remove(postId)
      showToast('게시글이 성공적으로 삭제되었습니다.', 'success')
      return true
    } catch (error: unknown) {
      console.error('게시글 삭제 실패:', error)
      showToast('게시글 삭제에 실패했습니다.', 'error')
      return false
    }
  }, [])

  return {
    // 상태
    posts,
    loading,
    currentPage,
    totalPages,
    availableCategories,

    // 액션
    fetchCategories,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    setPosts,
    setCurrentPage,
  }
}
