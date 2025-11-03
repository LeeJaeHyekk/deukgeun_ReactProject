import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { RootState, AppDispatch } from '@frontend/shared/store'
import { showToast } from '@frontend/shared/lib'
import { postsApi } from '@frontend/shared/api'
import { PostGrid } from '../../features/community/components/postGrid'
import { PostModal } from '../../features/community/components/postModal'
import { PostDetailModal } from '../../features/community/components/postDetail/PostDetailModal'
import { fetchPosts, createPost, updatePostThunk, deletePost } from '../../features/community/posts/postsSlice'
import { restoreLikedIds } from '../../features/community/likes/likesSlice'
import { selectAllPostsWithLikes, selectPostsLoading, selectPostsPagination } from '../../features/community/selectors/postsSelectors'
import styles from './CommunityPage.module.css'
import { Navigation } from '../../widgets/Navigation/Navigation'
import type { PostDTO } from '../../../shared/types'

// 타입 정의
interface PostCategory {
  id: number
  name: string
  count: number
}

interface PostListResponse {
  posts: PostDTO[]
  total: number
  page: number
  limit: number
}

export default function CommunityPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedPost, setSelectedPost] = useState<PostDTO | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [availableCategories, setAvailableCategories] = useState<PostCategory[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Redux 상태 (렌더링 최적화)
  const posts = useSelector(selectAllPostsWithLikes, shallowEqual)
  const loading = useSelector(selectPostsLoading)
  const pagination = useSelector(selectPostsPagination, shallowEqual)
  
  // Redux pagination을 currentPage로 사용 (메모이제이션 - 렌더링 최적화)
  const currentPage = useMemo(() => pagination.page || 1, [pagination.page])
  
  // 이전 상태 추적을 위한 ref (렌더링 최적화)
  const prevPaginationRef = useRef(pagination)
  const prevPostsRef = useRef(posts)
  
  // Pagination 변경 감지 (렌더링 최적화)
  useEffect(() => {
    const prevPagination = prevPaginationRef.current
    const paginationChanged = prevPagination.page !== pagination.page ||
                               prevPagination.totalPages !== pagination.totalPages ||
                               prevPagination.total !== pagination.total
    
    if (paginationChanged) {
      prevPaginationRef.current = pagination
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 [CommunityPage] Pagination 변경 감지:', {
          previous: {
            page: prevPagination.page,
            totalPages: prevPagination.totalPages,
            total: prevPagination.total
          },
          current: {
            page: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total
          },
          currentPage,
          timestamp: new Date().toISOString()
        })
      }
    }
  }, [pagination, currentPage])
  
  // Posts 변경 감지 (렌더링 최적화)
  useEffect(() => {
    const prevPosts = prevPostsRef.current
    const postsChanged = prevPosts.length !== posts.length ||
                         prevPosts.some((post, index) => {
                           const currentPost = posts[index]
                           return !currentPost || post.id !== currentPost.id
                         })
    
    if (postsChanged) {
      prevPostsRef.current = posts
    }
  }, [posts])

  const limit = 12

  // 초기화
  useEffect(() => {
    // 좋아요 상태 복원
    dispatch(restoreLikedIds())
    
    // 카테고리 목록 가져오기 (타입 가드 및 예외 처리 강화)
    postsApi
      .categories()
      .then((response: any) => {
        // 타입 가드 적용을 위해 postMappers 사용
        const { safeLoadCategories } = require('../../features/community/utils/postMappers')
        const { isValidCategoriesApiResponse } = require('../../features/community/utils/typeGuards')
        
        if (!isValidCategoriesApiResponse(response.data)) {
          throw new Error('카테고리 API 응답이 유효하지 않습니다.')
        }
        
        const categories = safeLoadCategories(response.data)
        const mappedCategories: PostCategory[] = categories.map((category: { id: number | string; name: string; count: number }) => ({
          id: typeof category.id === 'number' ? category.id : parseInt(String(category.id)) || 0,
          name: category.name,
          count: category.count
        }))
        setAvailableCategories(mappedCategories)
      })
      .catch((error: unknown) => {
        console.error('카테고리 로드 실패:', error)
        showToast('카테고리를 불러오는데 실패했습니다.', 'error')
        setAvailableCategories([])
      })
  }, [dispatch])

  // 게시글 목록 가져오기 (안정적인 함수 참조)
  const fetchPostsData = useCallback(
    (page: number = 1, category?: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [CommunityPage] fetchPostsData 호출:', {
          page,
          category: category || selectedCategory,
          limit,
          timestamp: new Date().toISOString()
        })
      }
      
      dispatch(fetchPosts({
        category: category || selectedCategory,
        page,
        limit,
      }))
    },
    [dispatch, selectedCategory, limit]
  )
  
  // 페이지 변경 핸들러 (안정적인 함수 참조)
  const handlePageChange = useCallback((page: number) => {
    // Redux를 통해 페이지 변경 (fetchPosts가 pagination을 업데이트함)
    // 실제로 변경된 경우에만 처리 (렌더링 최적화)
    if (typeof page === 'number' && page > 0 && page !== currentPage) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 [CommunityPage] onPageChange 호출:', {
          requestedPage: page,
          currentPage,
          selectedCategory,
          willChange: page !== currentPage,
          timestamp: new Date().toISOString()
        })
      }
      fetchPostsData(page, selectedCategory)
    } else if (process.env.NODE_ENV === 'development' && (typeof page !== 'number' || page <= 0)) {
      console.warn('📄 [CommunityPage] 잘못된 페이지 번호:', {
        page,
        pageType: typeof page,
        timestamp: new Date().toISOString()
      })
    }
  }, [currentPage, selectedCategory, fetchPostsData])

  // 이전 카테고리 추적 (렌더링 최적화)
  const prevCategoryRef = useRef<string>(selectedCategory)
  
  // 초기 로드: 카테고리나 페이지 변경이 아닌 최초 1회만 (렌더링 최적화)
  useEffect(() => {
    if (isInitialLoad) {
      fetchPostsData(1, selectedCategory)
      setIsInitialLoad(false)
      prevCategoryRef.current = selectedCategory
    }
  }, [isInitialLoad, fetchPostsData, selectedCategory])

  // 카테고리 변경 시 게시글 다시 로드 (초기 로드 제외, 페이지 1로 리셋) - 렌더링 최적화
  useEffect(() => {
    const prevCategory = prevCategoryRef.current
    const categoryChanged = prevCategory !== selectedCategory
    
    if (!isInitialLoad && categoryChanged) {
      prevCategoryRef.current = selectedCategory
      fetchPostsData(1, selectedCategory)
    }
  }, [selectedCategory, fetchPostsData, isInitialLoad])

  // 새 게시글 작성
  const handleCreatePost = async (postData: {
    title: string
    content: string
    category: string
  }) => {
    try {
      await dispatch(createPost(postData))
      showToast('게시글이 성공적으로 작성되었습니다.', 'success')
      setIsModalOpen(false)
      fetchPostsData(1) // 첫 페이지로 돌아가서 새 게시글 확인
    } catch (error: unknown) {
      console.error('게시글 작성 실패:', error)
      showToast('게시글 작성에 실패했습니다.', 'error')
    }
  }

  // 게시글 상세 보기
  const handleOpenPost = (post: PostDTO) => {
    setSelectedPost(post)
    setIsDetailModalOpen(true)
  }

  // 게시글 수정 (타입 가드 및 예외 처리 강화)
  const handleUpdatePost = async (
    postId: number,
    updateData: { title: string; content: string; category: string }
  ) => {
    try {
      // 입력 데이터 검증
      const { isValidPostId, isValidString } = await import('../../features/community/utils/typeGuards')
      
      if (!isValidPostId(postId)) {
        showToast('유효하지 않은 게시글 ID입니다.', 'error')
        return
      }
      
      if (!isValidString(updateData.title) || !isValidString(updateData.content) || !isValidString(updateData.category)) {
        showToast('게시글 제목, 내용, 카테고리를 모두 입력해주세요.', 'error')
        return
      }
      
      await dispatch(updatePostThunk(postId, updateData))
      showToast('게시글이 성공적으로 수정되었습니다.', 'success')
      setIsDetailModalOpen(false)
      fetchPostsData(currentPage)
    } catch (error: unknown) {
      const { getUserFriendlyMessage } = await import('../../features/community/utils/errorHandlers')
      console.error('게시글 수정 실패:', error)
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }

  // 게시글 삭제 (타입 가드 및 예외 처리 강화)
  const handleDeletePost = async (postId: number) => {
    try {
      // 입력 데이터 검증
      const { isValidPostId } = await import('../../features/community/utils/typeGuards')
      
      if (!isValidPostId(postId)) {
        showToast('유효하지 않은 게시글 ID입니다.', 'error')
        return
      }
      
      await dispatch(deletePost(postId))
      showToast('게시글이 성공적으로 삭제되었습니다.', 'success')
      setIsDetailModalOpen(false)
      fetchPostsData(currentPage)
    } catch (error: unknown) {
      const { getUserFriendlyMessage } = await import('../../features/community/utils/errorHandlers')
      console.error('게시글 삭제 실패:', error)
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }

  return (
    <div className={styles.communityPage}>
      <Navigation />
      <div className={styles.communityContainer}>
        <div className={styles.communityHeader}>
          <h1 className={styles.headerTitle}>커뮤니티</h1>
          <p className={styles.headerSubtitle}>
            함께 운동하고 경험을 나누어보세요
          </p>

          <div className={styles.communityControls}>
            {/* 카테고리 필터 (타입 가드 적용) */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={styles.select}
            >
              <option value="">전체 카테고리</option>
              {Array.isArray(availableCategories) && availableCategories.length > 0
                ? availableCategories
                    .filter(category => category && category.name && typeof category.name === 'string')
                    .map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name} ({typeof category.count === 'number' ? category.count : 0})
                      </option>
                    ))
                : null}
            </select>

            {/* 새 게시글 작성 버튼 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.createPostBtn}
            >
              새 게시글 작성
            </button>
          </div>
        </div>

        {/* 게시글 그리드 */}
        <PostGrid
          posts={posts}
          onPostClick={handleOpenPost}
          loading={loading}
          currentPage={currentPage}
          totalPages={pagination.totalPages || 1}
          onPageChange={handlePageChange}
        />

        {/* 새 게시글 작성 모달 */}
        {isModalOpen && (
          <PostModal
            onClose={() => {
              setIsModalOpen(false)
              setSelectedPost(null)
            }}
            onSubmit={handleCreatePost}
            categories={availableCategories.map(category => ({
              id: String(category.id),
              name: category.name,
              count: category.count || 0,
            }))}
          />
        )}

        {/* 게시글 상세 모달 */}
        {isDetailModalOpen && selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => {
              setIsDetailModalOpen(false)
              setSelectedPost(null)
            }}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
          />
        )}
      </div>
    </div>
  )
}
