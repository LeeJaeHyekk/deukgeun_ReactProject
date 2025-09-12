import { useEffect } from 'react'
import { showToast } from '@shared/lib'
import { Navigation } from '@widgets/Navigation/Navigation'
import { PostModal } from './components/PostModal'
import { PostDetailModal } from './components/PostDetailModal'
import { CommunityFilters } from './components/CommunityFilters'
import { CommunityPosts } from './components/CommunityPosts'
import {
  useCommunityPosts,
  usePostLikes,
  useCommunityFilters,
  useCommunityModals,
} from './hooks'
import styles from './CommunityPage.module.css'

const POSTS_PER_PAGE = 12

export default function CommunityPage() {
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

  const { likedPosts, toggleLike, isLiked, initializeLikes } = usePostLikes()

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

  // 초기 데이터 로드
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchPosts({
      page: 1,
      category: selectedCategory,
      searchTerm,
      sortBy,
    })
  }, [selectedCategory, searchTerm, sortBy, fetchPosts])

  useEffect(() => {
    fetchPosts({
      page: currentPage,
      category: selectedCategory,
      searchTerm,
      sortBy,
    })
  }, [currentPage, fetchPosts])

  // 게시글 목록이 변경될 때마다 좋아요 상태 초기화
  useEffect(() => {
    if (posts.length > 0) {
      console.log(
        '🔄 CommunityPage: 게시글 목록 변경 감지, 좋아요 상태 초기화 시작'
      )
      console.log(
        '📋 게시글 목록:',
        posts.map(p => ({
          id: p.id,
          title: p.title,
          isLiked: (p as any).isLiked,
        }))
      )
      initializeLikes(posts)
    }
  }, [posts, initializeLikes])

  // 이벤트 핸들러들
  const handleCreatePost = async (postData: {
    title: string
    content: string
    category: string
  }) => {
    const success = await createPost(postData)
    if (success) {
      closeCreateModal()
      // 첫 페이지로 돌아가서 새 게시글 확인
      setCurrentPage(1)
      fetchPosts({
        page: 1,
        category: selectedCategory,
        searchTerm,
        sortBy,
      })
    }
  }

  const handleUpdatePost = async (
    postId: number,
    updateData: { title: string; content: string; category: string }
  ) => {
    const success = await updatePost(postId, updateData)
    if (success) {
      closeDetailModal()
      fetchPosts({
        page: currentPage,
        category: selectedCategory,
        searchTerm,
        sortBy,
      })
    }
  }

  const handleDeletePost = async (postId: number) => {
    const success = await deletePost(postId)
    if (success) {
      closeDetailModal()
      fetchPosts({
        page: currentPage,
        category: selectedCategory,
        searchTerm,
        sortBy,
      })
    }
  }

  const handleLikePost = async (postId: number) => {
    console.log('🎯 CommunityPage: 좋아요 클릭됨', postId)
    console.log('📊 현재 좋아요 상태:', isLiked(postId))
    console.log('📋 현재 게시글 목록:', posts.length, '개')

    const success = await toggleLike(postId, posts, setPosts)
    console.log('✅ 좋아요 처리 결과:', success)

    if (!success) {
      console.log('🔄 좋아요 실패, 전체 목록 새로고침')
      // 좋아요 실패 시 전체 목록 새로고침
      fetchPosts({
        page: currentPage,
        category: selectedCategory,
        searchTerm,
        sortBy,
      })
    }
  }

  const handleCommentCountUpdate = (postId: number, commentCount: number) => {
    console.log('💬 CommunityPage: 댓글 개수 업데이트', {
      postId,
      commentCount,
    })
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              commentCount: commentCount,
              comment_count: commentCount, // 호환성을 위해 둘 다 설정
            }
          : post
      )
    )
  }

  const handleOpenCreateModal = () => {
    if (availableCategories.length === 0) {
      showToast(
        '카테고리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
        'error'
      )
      return
    }
    openCreateModal()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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
          likedPosts={likedPosts}
          onCreatePost={handleOpenCreateModal}
        />

        {/* 새 게시글 작성 모달 */}
        {isCreateModalOpen && availableCategories.length > 0 && (
          <PostModal
            onClose={closeCreateModal}
            onSubmit={handleCreatePost}
            categories={availableCategories}
          />
        )}

        {/* 게시글 상세 모달 */}
        {isDetailModalOpen && selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={closeDetailModal}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
            onLikeClick={handleLikePost}
            isLiked={isLiked(selectedPost.id)}
            onCommentCountUpdate={handleCommentCountUpdate}
          />
        )}
      </div>
    </div>
  )
}
