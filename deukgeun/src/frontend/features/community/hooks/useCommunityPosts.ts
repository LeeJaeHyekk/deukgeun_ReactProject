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
import { selectPostsPagination } from '../selectors/postsSelectors'
import { isValidPostsApiResponse, isValidCategoriesApiResponse, isValidPost } from '../utils/typeGuards'
import { safeLoadPosts, safeLoadCategories } from '../utils/postMappers'
import { logError, getUserFriendlyMessage } from '../utils/errorHandlers'

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
  const reduxPagination = useSelector(selectPostsPagination)

  // Redux store 변경사항을 로컬 state에 동기화 (타입 가드 적용)
  useEffect(() => {
    if (reduxPostIds.length > 0) {
      const updatedPosts = reduxPostIds
        .map((id: number) => reduxPosts[id])
        .filter((post: CommunityPost | undefined): post is CommunityPost => post !== null && post !== undefined && isValidPost(post))
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [useCommunityPosts] Redux store 동기화:', {
          reduxPostIds: reduxPostIds.length,
          updatedPosts: updatedPosts.length,
          firstPost: updatedPosts[0]
        })
      }
      setPosts(updatedPosts)
    }
  }, [reduxPosts, reduxPostIds])

  // Redux pagination 변경사항을 로컬 state에 동기화
  useEffect(() => {
    const reduxPage = reduxPagination.page || 1
    const reduxTotalPages = reduxPagination.totalPages || 1
    
    if (reduxPage !== currentPage || reduxTotalPages !== totalPages) {
      console.log('📄 [useCommunityPosts] Redux pagination 동기화:', {
        previous: {
          currentPage,
          totalPages
        },
        redux: {
          page: reduxPage,
          totalPages: reduxTotalPages,
          total: reduxPagination.total
        },
        willUpdate: reduxPage !== currentPage || reduxTotalPages !== totalPages,
        timestamp: new Date().toISOString()
      })
      setCurrentPage(reduxPage)
      setTotalPages(reduxTotalPages)
    }
  }, [reduxPagination, currentPage, totalPages])

  // 카테고리 목록 가져오기 (타입 가드 및 예외 처리 강화)
  const fetchCategories = useCallback(async () => {
    try {
      const response = await postsApi.categories()
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Categories API Response:', response.data)
      }
      
      // API 응답 타입 가드 적용
      if (!isValidCategoriesApiResponse(response.data)) {
        logError('fetchCategories', new Error('카테고리 API 응답이 유효하지 않습니다'), { response: response.data })
        showToast('카테고리를 불러오는데 실패했습니다.', 'error')
        setAvailableCategories([])
        return
      }
      
      // 안전한 매핑 함수 사용
      const categories = safeLoadCategories(response.data)
      
      // 매핑된 카테고리를 PostCategoryInfo 형식으로 변환
      const mappedCategories: PostCategoryInfo[] = categories.map(category => ({
        id: typeof category.id === 'string' ? category.id : String(category.id),
        name: category.name,
        count: category.count
      }))
      
      setAvailableCategories(mappedCategories)
    } catch (error: unknown) {
      logError('fetchCategories', error)
      showToast(getUserFriendlyMessage(error), 'error')
      setAvailableCategories([])
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

        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching posts with params:', params)
        }
        
        const res = await postsApi.list(params)

        if (process.env.NODE_ENV === 'development') {
          console.log('Posts API Response:', res.data)
        }

        // API 응답 타입 가드 적용
        if (!isValidPostsApiResponse(res.data)) {
          throw new Error('게시글 API 응답이 유효하지 않습니다.')
        }

        // 안전한 매핑 함수 사용
        const { posts: mappedPosts, pagination: mappedPagination } = safeLoadPosts(res.data)

        // Redux store에 먼저 저장 (단일 진실의 원천 - Single Source of Truth)
        dispatch(setPostsAction(mappedPosts))
        
        if (mappedPagination) {
          dispatch(setPagination({
            page: page,
            totalPages: mappedPagination.totalPages,
            total: mappedPagination.total
          }))
          console.log('📄 [useCommunityPosts] Redux pagination 업데이트:', {
            page,
            totalPages: mappedPagination.totalPages,
            total: mappedPagination.total,
            timestamp: new Date().toISOString()
          })
        } else {
          // pagination이 없는 경우 기본값 사용
          dispatch(setPagination({
            page: page,
            totalPages: 1,
            total: mappedPosts.length
          }))
          console.log('📄 [useCommunityPosts] Redux pagination 기본값 사용:', {
            page,
            totalPages: 1,
            total: mappedPosts.length,
            timestamp: new Date().toISOString()
          })
        }
        
        // 로컬 state는 Redux pagination 동기화 useEffect에서 자동 업데이트됨
        // (중복 업데이트 방지 및 일관성 보장)
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
      console.log('📝 [useCommunityPosts] createPost 호출:', {
        title: postData.title,
        contentLength: postData.content?.length || 0,
        category: postData.category,
        timestamp: new Date().toISOString()
      })

      // 인증 사전 검증
      console.log('🔐 [useCommunityPosts] ensureAuthenticated 호출 전')
      const authResult = ensureAuthenticated()
      console.log('🔐 [useCommunityPosts] ensureAuthenticated 결과:', authResult)
      
      if (!authResult) {
        console.error('❌ [useCommunityPosts] ensureAuthenticated 실패 - 글쓰기 중단')
        return false
      }

      // 토큰 검증
      console.log('🔐 [useCommunityPosts] validateTokenForAction 호출 전')
      const token = validateTokenForAction('createPost')
      console.log('🔐 [useCommunityPosts] validateTokenForAction 결과:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : '없음'
      })
      
      if (!token) {
        console.error('❌ [useCommunityPosts] 토큰 검증 실패 - 글쓰기 중단')
        showToast('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error')
        // 토스트만 표시, 자동 리다이렉트 없음 (사용자가 직접 로그인 페이지로 이동하도록)
        return false
      }

      try {
        console.log('📝 [useCommunityPosts] createPostThunk dispatch 시작')
        await dispatch(createPostThunk(postData))
        console.log('✅ [useCommunityPosts] createPostThunk 성공')
        showToast('게시글이 성공적으로 작성되었습니다.', 'success')
        return true
    } catch (error: unknown) {
      console.error('❌ [useCommunityPosts] 게시글 작성 실패:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        postData,
        timestamp: new Date().toISOString()
      })
      if (handleAuthAwareError(error, (m,t='error')=>showToast(m,t))) {
        console.error('❌ [useCommunityPosts] 인증 관련 에러 처리됨')
        return false
      }
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

  // setCurrentPage를 Redux pagination을 업데이트하는 함수로 변경
  const handleSetCurrentPage = useCallback((page: number) => {
    console.log('📄 [useCommunityPosts] handleSetCurrentPage 호출:', {
      requestedPage: page,
      currentPage,
      totalPages,
      reduxPagination,
      timestamp: new Date().toISOString()
    })
    
    if (typeof page === 'number' && page > 0 && page <= totalPages) {
      // Redux pagination 업데이트 (단일 진실의 원천)
      dispatch(setPagination({
        page,
        totalPages: reduxPagination.totalPages || totalPages,
        total: reduxPagination.total || 0
      }))
      console.log('📄 [useCommunityPosts] Redux pagination 업데이트 완료:', {
        newPage: page,
        totalPages: reduxPagination.totalPages || totalPages,
        timestamp: new Date().toISOString()
      })
      // 로컬 상태는 useEffect에서 자동으로 동기화됨
    } else {
      console.warn('📄 [useCommunityPosts] 잘못된 페이지 번호:', {
        page,
        currentPage,
        totalPages,
        valid: typeof page === 'number' && page > 0 && page <= totalPages
      })
    }
  }, [dispatch, currentPage, totalPages, reduxPagination])

  return {
    // 상태
    posts,
    loading,
    currentPage, // Redux pagination과 동기화된 상태
    totalPages,   // Redux pagination과 동기화된 상태
    availableCategories,

    // 액션
    fetchCategories,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    setPosts,
    setCurrentPage: handleSetCurrentPage, // Redux pagination을 업데이트하는 함수
  }
}
