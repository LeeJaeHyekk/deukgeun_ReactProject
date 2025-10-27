import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@frontend/shared/store'
import { showToast } from '@frontend/shared/lib'
import { postsApi } from '@frontend/shared/api'
import { PostGrid } from '../../features/community/components/postGrid'
import { PostModal } from '../../features/community/components/postModal'
import { PostDetailModal } from '../../features/community/components/PostDetailModal'
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
  const [currentPage, setCurrentPage] = useState(1)

  // Redux 상태
  const posts = useSelector(selectAllPostsWithLikes)
  const loading = useSelector(selectPostsLoading)
  const pagination = useSelector(selectPostsPagination)
  
  // Redux store 상태 디버깅
  const rawPosts = useSelector((state: RootState) => state.posts.entities)
  const likedIds = useSelector((state: RootState) => state.likes.likedIds)

  console.log('🔄 [CommunityPage] Redux 상태:', { 
    postsCount: posts.length, 
    loading,
    pagination,
    posts: posts.map((p: any) => ({ id: p.id, title: p.title, likeCount: p.likeCount, isLiked: p.isLiked })),
    firstPost: posts[0], // 첫 번째 포스트 전체 구조 확인
    rawPostsKeys: Object.keys(rawPosts),
    likedIds,
    rawPost10: rawPosts[10] // ID 10 포스트 확인
  })

  const limit = 12

  // 초기화
  useEffect(() => {
    // 좋아요 상태 복원
    dispatch(restoreLikedIds())
    
    // 카테고리 목록 가져오기
    postsApi
      .categories()
      .then((response: any) => {
        const categories = response.data.data as PostCategory[]
        setAvailableCategories(categories)
      })
      .catch((error: unknown) => {
        console.error('카테고리 로드 실패:', error)
        showToast('카테고리를 불러오는데 실패했습니다.', 'error')
      })
  }, [dispatch])

  // 게시글 목록 가져오기
  const fetchPostsData = useCallback(
    (page: number = 1, category?: string) => {
      console.log('📥 [CommunityPage] fetchPostsData 시작:', { page, category })
      dispatch(fetchPosts({
        category: category || selectedCategory,
        page,
        limit,
      }))
    },
    [dispatch, selectedCategory, limit]
  )

  // 카테고리 변경 시 게시글 다시 로드
  useEffect(() => {
    fetchPostsData(1, selectedCategory)
  }, [selectedCategory, fetchPostsData])

  // 페이지 변경 시 게시글 다시 로드
  useEffect(() => {
    fetchPostsData(currentPage)
  }, [currentPage, fetchPostsData])

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

  // 게시글 수정
  const handleUpdatePost = async (
    postId: number,
    updateData: { title: string; content: string; category: string }
  ) => {
    try {
      await dispatch(updatePostThunk(postId, updateData))
      showToast('게시글이 성공적으로 수정되었습니다.', 'success')
      setIsDetailModalOpen(false)
      fetchPostsData(currentPage)
    } catch (error: unknown) {
      console.error('게시글 수정 실패:', error)
      showToast('게시글 수정에 실패했습니다.', 'error')
    }
  }

  // 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    try {
      await dispatch(deletePost(postId))
      showToast('게시글이 성공적으로 삭제되었습니다.', 'success')
      setIsDetailModalOpen(false)
      fetchPostsData(currentPage)
    } catch (error: unknown) {
      console.error('게시글 삭제 실패:', error)
      showToast('게시글 삭제에 실패했습니다.', 'error')
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
            {/* 카테고리 필터 */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={styles.select}
            >
              <option value="">전체 카테고리</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
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
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
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
