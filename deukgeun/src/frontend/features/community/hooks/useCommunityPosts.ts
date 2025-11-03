import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
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

  // Redux store에서 posts 데이터 구독 (렌더링 최적화)
  // 객체 참조 비교를 통해 불필요한 리렌더링 방지
  const reduxPosts = useSelector((state: RootState) => state.posts.entities, shallowEqual)
  const reduxPostIds = useSelector((state: RootState) => state.posts.ids, (prev, next) => {
    // 배열 길이와 내용이 동일한지 비교
    if (prev.length !== next.length) return false
    return prev.every((id, index) => id === next[index])
  })
  const reduxPagination = useSelector(selectPostsPagination, shallowEqual)
  
  // 이전 상태 추적을 위한 ref (렌더링 최적화)
  const prevReduxPostsRef = useRef<typeof reduxPosts>(reduxPosts)
  const prevReduxPostIdsRef = useRef<typeof reduxPostIds>(reduxPostIds)
  const prevReduxPaginationRef = useRef<typeof reduxPagination>(reduxPagination)

  // Redux store 변경사항을 로컬 state에 동기화 (타입 가드 적용 및 렌더링 최적화)
  useEffect(() => {
    // 실제 변경 여부 확인 (렌더링 최적화)
    const postsChanged = prevReduxPostsRef.current !== reduxPosts
    const idsChanged = prevReduxPostIdsRef.current !== reduxPostIds
    
    // 실제로 변경된 경우에만 처리
    if (postsChanged || idsChanged) {
      // 상태 업데이트
      prevReduxPostsRef.current = reduxPosts
      prevReduxPostIdsRef.current = reduxPostIds
      
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
    }
  }, [reduxPosts, reduxPostIds])

  // Redux pagination 변경사항을 로컬 state에 동기화 (렌더링 최적화)
  useEffect(() => {
    // 실제 변경 여부 확인 (엄격한 비교)
    const prevPagination = prevReduxPaginationRef.current
    const paginationChanged = prevPagination.page !== reduxPagination.page ||
                               prevPagination.totalPages !== reduxPagination.totalPages ||
                               prevPagination.total !== reduxPagination.total
    
    if (paginationChanged) {
      // 상태 업데이트
      prevReduxPaginationRef.current = reduxPagination
      
      const reduxPage = reduxPagination.page || 1
      const reduxTotalPages = reduxPagination.totalPages || 1
      
      // 실제로 변경된 경우에만 업데이트
      if (reduxPage !== currentPage || reduxTotalPages !== totalPages) {
        if (process.env.NODE_ENV === 'development') {
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
        }
        setCurrentPage(reduxPage)
        setTotalPages(reduxTotalPages)
      }
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

  // 게시글 목록 가져오기 (안정적인 함수 참조)
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
          // 실제로 변경된 경우에만 업데이트 (렌더링 최적화)
          const currentPagination = reduxPagination
          const paginationChanged = currentPagination.page !== page ||
                                     currentPagination.totalPages !== mappedPagination.totalPages ||
                                     currentPagination.total !== mappedPagination.total
          
          if (paginationChanged) {
            dispatch(setPagination({
              page: page,
              totalPages: mappedPagination.totalPages,
              total: mappedPagination.total
            }))
            
            if (process.env.NODE_ENV === 'development') {
              console.log('📄 [useCommunityPosts] Redux pagination 업데이트:', {
                page,
                totalPages: mappedPagination.totalPages,
                total: mappedPagination.total,
                timestamp: new Date().toISOString()
              })
            }
          }
        } else {
          // pagination이 없는 경우 기본값 사용
          const currentPagination = reduxPagination
          const paginationChanged = currentPagination.page !== page ||
                                     currentPagination.totalPages !== 1 ||
                                     currentPagination.total !== mappedPosts.length
          
          if (paginationChanged) {
            dispatch(setPagination({
              page: page,
              totalPages: 1,
              total: mappedPosts.length
            }))
            
            if (process.env.NODE_ENV === 'development') {
              console.log('📄 [useCommunityPosts] Redux pagination 기본값 사용:', {
                page,
                totalPages: 1,
                total: mappedPosts.length,
                timestamp: new Date().toISOString()
              })
            }
          }
        }
        
        // 로컬 state는 Redux pagination 동기화 useEffect에서 자동 업데이트됨
        // (중복 업데이트 방지 및 일관성 보장)
      } catch (error: unknown) {
        if (process.env.NODE_ENV === 'development') {
          console.error('게시글 로드 실패:', error)
        }
        showToast('게시글을 불러오는데 실패했습니다.', 'error')
        setPosts([])
      } finally {
        setLoading(false)
      }
    },
    [limit, dispatch, reduxPagination]
  )

  // 새 게시글 작성 (안정적인 함수 참조)
  const createPost = useCallback(
    async (postData: { title: string; content: string; category: string }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 [useCommunityPosts] createPost 호출:', {
          title: postData.title,
          contentLength: postData.content?.length || 0,
          category: postData.category,
          timestamp: new Date().toISOString()
        })
      }

      // 인증 사전 검증
      const authResult = ensureAuthenticated()
      
      if (!authResult) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [useCommunityPosts] ensureAuthenticated 실패 - 글쓰기 중단')
        }
        return false
      }

      // 토큰 검증
      const token = validateTokenForAction('createPost')
      
      if (!token) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [useCommunityPosts] 토큰 검증 실패 - 글쓰기 중단')
        }
        showToast('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error')
        return false
      }

      try {
        await dispatch(createPostThunk(postData))
        showToast('게시글이 성공적으로 작성되었습니다.', 'success')
        return true
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useCommunityPosts] 게시글 작성 실패:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          postData,
          timestamp: new Date().toISOString()
        })
      }
      if (handleAuthAwareError(error, (m,t='error')=>showToast(m,t))) {
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

  // setCurrentPage를 Redux pagination을 업데이트하는 함수로 변경 (안정적인 참조)
  const handleSetCurrentPage = useCallback((page: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 [useCommunityPosts] handleSetCurrentPage 호출:', {
        requestedPage: page,
        currentPage,
        totalPages,
        reduxPagination,
        timestamp: new Date().toISOString()
      })
    }
    
    if (typeof page === 'number' && page > 0 && page <= totalPages) {
      // Redux pagination 업데이트 (단일 진실의 원천)
      const newTotalPages = reduxPagination.totalPages || totalPages
      const newTotal = reduxPagination.total || 0
      
      // 실제로 변경된 경우에만 업데이트 (렌더링 최적화)
      if (page !== reduxPagination.page) {
        dispatch(setPagination({
          page,
          totalPages: newTotalPages,
          total: newTotal
        }))
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📄 [useCommunityPosts] Redux pagination 업데이트 완료:', {
            newPage: page,
            totalPages: newTotalPages,
            timestamp: new Date().toISOString()
          })
        }
      }
      // 로컬 상태는 useEffect에서 자동으로 동기화됨
    } else if (process.env.NODE_ENV === 'development') {
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
