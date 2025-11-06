import { useEffect, useCallback, useMemo, useRef } from "react"
import { showToast } from "@frontend/shared/lib"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import { Navigation } from "@widgets/Navigation/Navigation"
import { PostModal } from "./components/PostModal"
import { PostDetailModal } from "./components/postDetail/PostDetailModal"
import { CommunityFilters } from "./components/CommunityFilters"
import { CommunityPosts } from "./components/CommunityPosts"
import {
  useCommunityPosts,
  usePostLikes,
  useCommunityFilters,
  useCommunityModals,
} from "./hooks"
import { useCommentCountSync } from "./hooks/useCommentCountSync"
import { logError, getUserFriendlyMessage } from "./utils/errorHandlers"
import { isValidString } from "./utils/typeGuards"
import styles from "./CommunityPage.module.css"

const POSTS_PER_PAGE = 12

export default function CommunityPage() {
  // 인증 상태 확인
  const { isLoading: authLoading, isLoggedIn } = useAuthRedux()
  
  // 댓글 수 동기화
  useCommentCountSync()
  
  // 커스텀 훅들
  const {
    posts,
    loading,
    currentPage,
    totalPages,
    availableCategories,
    fetchCategories,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    setPosts,
    setCurrentPage,
  } = useCommunityPosts({ limit: POSTS_PER_PAGE })

  // usePostLikes는 개별 게시글에서 사용하는 훅이므로 여기서는 제거

  const {
    selectedCategory,
    searchTerm,
    sortBy,
    handleCategoryChange,
    handleSearchChange,
    handleSortChange,
  } = useCommunityFilters()

  const {
    isCreateModalOpen,
    isDetailModalOpen,
    selectedPost,
    openCreateModal,
    closeCreateModal,
    openDetailModal,
    closeDetailModal,
  } = useCommunityModals()

  // 초기 데이터 로드 - 인증 초기화 완료 후에만 실행
  useEffect(() => {
    if (!authLoading) {
      fetchCategories()
    }
  }, [authLoading, fetchCategories])

  // 게시글 로드 - 카테고리/검색어/정렬 변경 시
  useEffect(() => {
    if (!authLoading) {
      console.log('📥 [CommunityPage] fetchPosts 호출 (카테고리/검색어/정렬 변경):', {
        page: 1,
        category: selectedCategory,
        searchTerm,
        sortBy,
      })
      fetchPosts({
        page: 1,
        category: selectedCategory,
        searchTerm,
        sortBy,
      })
    }
  }, [authLoading, selectedCategory, searchTerm, sortBy, fetchPosts])

  // 게시글 로드 - 페이지 변경 시 (카테고리 변경과 분리)
  // 이전 currentPage 추적하여 실제 변경 시에만 fetchPosts 호출
  const prevPageRef = useRef(currentPage)
  useEffect(() => {
    const pageChanged = prevPageRef.current !== currentPage
    
    if (!authLoading && pageChanged && currentPage > 0) {
      console.log('📥 [CommunityPage] fetchPosts 호출 (페이지 변경):', {
        previousPage: prevPageRef.current,
        currentPage,
        category: selectedCategory,
        searchTerm,
        sortBy,
        timestamp: new Date().toISOString()
      })
      prevPageRef.current = currentPage
      fetchPosts({
        page: currentPage,
        category: selectedCategory,
        searchTerm,
        sortBy,
      })
    }
  }, [authLoading, currentPage, selectedCategory, searchTerm, sortBy, fetchPosts])

  // 메모이제이션된 fetch 파라미터
  const fetchParams = useMemo(() => ({
    page: currentPage,
    category: selectedCategory,
    searchTerm,
    sortBy,
  }), [currentPage, selectedCategory, searchTerm, sortBy])

  // 이벤트 핸들러들 (useCallback으로 메모이제이션)
  const handleCreatePost = useCallback(async (postData: {
    title: string
    content: string
    category: string
  }) => {
    console.log('📝 [CommunityPage] handleCreatePost 호출:', {
      title: postData.title,
      contentLength: postData.content?.length || 0,
      category: postData.category,
      timestamp: new Date().toISOString()
    })

    // 입력 데이터 유효성 검사
    const titleValid = isValidString(postData.title)
    const contentValid = isValidString(postData.content)
    
    console.log('📝 [CommunityPage] 입력 데이터 유효성 검사:', {
      titleValid,
      contentValid,
      titleLength: postData.title?.length || 0,
      contentLength: postData.content?.length || 0
    })
    
    if (!titleValid || !contentValid) {
      console.error('❌ [CommunityPage] 입력 데이터 유효성 검사 실패')
      showToast('제목과 내용을 모두 입력해주세요.', 'error')
      return
    }

    try {
      console.log('📝 [CommunityPage] createPost 호출 시작')
      const success = await createPost(postData)
      console.log('📝 [CommunityPage] createPost 결과:', { success })
      
      if (success) {
        console.log('✅ [CommunityPage] 글쓰기 성공 - 모달 닫기 및 게시글 목록 새로고침')
        closeCreateModal()
        // 첫 페이지로 돌아가서 새 게시글 확인
        setCurrentPage(1)
        fetchPosts({
          page: 1,
          category: selectedCategory,
          searchTerm,
          sortBy,
        })
      } else {
        console.warn('⚠️ [CommunityPage] 글쓰기 실패 (success가 false)')
      }
    } catch (error) {
      console.error('❌ [CommunityPage] handleCreatePost 예외 발생:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        postData,
        timestamp: new Date().toISOString()
      })
      logError('CommunityPage.handleCreatePost', error, { postData })
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }, [createPost, closeCreateModal, setCurrentPage, fetchPosts, selectedCategory, searchTerm, sortBy])

  const handleUpdatePost = useCallback(async (
    postId: number,
    updateData: { title: string; content: string; category: string }
  ) => {
    const success = await updatePost(postId, updateData)
    if (success) {
      closeDetailModal()
      fetchPosts(fetchParams)
    }
  }, [updatePost, closeDetailModal, fetchPosts, fetchParams])

  const handleDeletePost = useCallback(async (postId: number) => {
    const success = await deletePost(postId)
    if (success) {
      closeDetailModal()
      fetchPosts(fetchParams)
    }
  }, [deletePost, closeDetailModal, fetchPosts, fetchParams])

  const handleLikePost = useCallback(async (postId: number) => {
    // 좋아요 기능은 개별 PostCard에서 처리되므로 여기서는 제거
    if (process.env.NODE_ENV === 'development') {
      console.log('좋아요 처리:', postId)
    }
  }, [])

  const handleOpenCreateModal = useCallback(() => {
    // 로그인 상태 확인 (훅은 컴포넌트 최상위에서 호출됨)
    if (!isLoggedIn) {
      showToast("로그인이 필요합니다. 로그인 페이지로 이동합니다.", "error")
      window.location.href = '/login'
      return
    }

    if (availableCategories.length === 0) {
      showToast(
        "카테고리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
        "error"
      )
      return
    }
    openCreateModal()
  }, [isLoggedIn, availableCategories.length, openCreateModal])

  const handlePageChange = useCallback((page: number) => {
    console.log('📄 [CommunityPage] handlePageChange 호출:', {
      requestedPage: page,
      currentPage,
      totalPages,
      timestamp: new Date().toISOString()
    })
    
    if (typeof page === 'number' && page > 0 && page <= totalPages) {
      setCurrentPage(page)
      // fetchPosts는 useEffect에서 currentPage 변경을 감지하여 자동으로 호출됨
      console.log('📄 [CommunityPage] setCurrentPage 호출 완료:', {
        newPage: page,
        currentPage,
        totalPages
      })
    } else {
      console.warn('📄 [CommunityPage] 잘못된 페이지 번호:', {
        page,
        currentPage,
        totalPages,
        valid: typeof page === 'number' && page > 0 && page <= totalPages
      })
    }
  }, [setCurrentPage, currentPage, totalPages])

  // 모달 렌더링 조건 메모이제이션
  const shouldShowCreateModal = useMemo(() => 
    isCreateModalOpen && availableCategories.length > 0, 
    [isCreateModalOpen, availableCategories.length]
  )

  const shouldShowDetailModal = useMemo(() => 
    isDetailModalOpen && selectedPost, 
    [isDetailModalOpen, selectedPost]
  )

  return (
    <div className={styles.communityPage}>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>커뮤니티</h1>
          <p className={styles.subtitle}>함께 운동하고 경험을 나누어보세요</p>
        </div>

        {/* 필터 및 검색 */}
        <CommunityFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          availableCategories={availableCategories}
          onCreatePost={handleOpenCreateModal}
        />

        {/* 게시글 목록 */}
        <CommunityPosts
          posts={posts}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPostClick={openDetailModal}
          onLikeClick={handleLikePost}
          onPageChange={handlePageChange}
          likedPosts={new Set()}
          onCreatePost={handleOpenCreateModal}
        />

        {/* 새 게시글 작성 모달 */}
        {shouldShowCreateModal && (
          <PostModal
            onClose={closeCreateModal}
            onSubmit={handleCreatePost}
            categories={availableCategories}
          />
        )}

        {/* 게시글 상세 모달 */}
        {shouldShowDetailModal && selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={closeDetailModal}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
          />
        )}
      </div>
    </div>
  )
}
