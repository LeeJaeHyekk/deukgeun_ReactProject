import { useState, useEffect, useCallback } from "react"
import { postsApi, likesApi } from "../../api/communityApi"
import { showToast } from "../../utils/toast"
import { PostGrid } from "../../features/community/components/PostGrid"
import { PostModal } from "../../features/community/components/PostModal"
import { PostDetailModal } from "../../features/community/components/PostDetailModal"
import styles from "./CommunityPage.module.css"
import { Navigation } from "../../widgets/Navigation/Navigation"
import type {
  Post,
  PostCategory,
  PostListResponse,
} from "../../types/community"

// 타입은 이미 import됨

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [availableCategories, setAvailableCategories] = useState<
    PostCategory[]
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const limit = 12

  // 카테고리 목록 가져오기
  useEffect(() => {
    postsApi
      .getCategories()
      .then(response => {
        const categories = response as PostCategory[]
        setAvailableCategories(categories)
      })
      .catch((error: unknown) => {
        console.error("카테고리 로드 실패:", error)
        showToast("카테고리를 불러오는데 실패했습니다.", "error")
      })
  }, [])

  // 게시글 목록 가져오기
  const fetchPosts = useCallback(
    async (page: number = 1, category?: string) => {
      setLoading(true)
      try {
        const selectedCategoryParam = category || selectedCategory

        const res = await postsApi.getPosts({
          category: selectedCategoryParam,
          page,
          limit,
        })

        const postListResponse = res as PostListResponse

        setPosts(postListResponse.posts)
        setTotalPages(Math.ceil(postListResponse.total / limit))
        setCurrentPage(page)
      } catch (error: unknown) {
        console.error("게시글 로드 실패:", error)
        showToast("게시글을 불러오는데 실패했습니다.", "error")
      } finally {
        setLoading(false)
      }
    },
    [selectedCategory, limit]
  )

  // 카테고리 변경 시 게시글 다시 로드
  useEffect(() => {
    fetchPosts(1, selectedCategory)
  }, [selectedCategory])

  // 페이지 변경 시 게시글 다시 로드
  useEffect(() => {
    fetchPosts(currentPage)
  }, [currentPage])

  // 새 게시글 작성
  const handleCreatePost = async (postData: {
    title: string
    content: string
    category: string
  }) => {
    try {
      await postsApi.create({ ...postData, isAnonymous: false })
      showToast("게시글이 성공적으로 작성되었습니다.", "success")
      setIsModalOpen(false)
      fetchPosts(1) // 첫 페이지로 돌아가서 새 게시글 확인
    } catch (error: unknown) {
      console.error("게시글 작성 실패:", error)
      showToast("게시글 작성에 실패했습니다.", "error")
      // 에러가 발생해도 모달은 닫지 않음 (사용자가 다시 시도할 수 있도록)
    }
  }

  // 게시글 좋아요
  const handleLikePost = async (postId: number) => {
    try {
      await likesApi.like(postId.toString())
      showToast("좋아요를 눌렀습니다.", "success")
      fetchPosts(currentPage) // 목록 새로고침
    } catch (error: unknown) {
      console.error("좋아요 실패:", error)
      showToast("좋아요 처리에 실패했습니다.", "error")
    }
  }

  // 게시글 상세 보기
  const handleOpenPost = (post: Post) => {
    setSelectedPost(post)
    setIsDetailModalOpen(true)
  }

  // 게시글 수정
  const handleUpdatePost = async (
    postId: number,
    updateData: { title: string; content: string; category: string }
  ) => {
    try {
      await postsApi.update(postId.toString(), updateData)
      showToast("게시글이 성공적으로 수정되었습니다.", "success")
      setIsDetailModalOpen(false)
      fetchPosts(currentPage)
    } catch (error: unknown) {
      console.error("게시글 수정 실패:", error)
      showToast("게시글 수정에 실패했습니다.", "error")
    }
  }

  // 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    try {
      await postsApi.remove(postId.toString())
      showToast("게시글이 성공적으로 삭제되었습니다.", "success")
      setIsDetailModalOpen(false)
      fetchPosts(currentPage)
    } catch (error: unknown) {
      console.error("게시글 삭제 실패:", error)
      showToast("게시글 삭제에 실패했습니다.", "error")
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
          onLikeClick={handleLikePost}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
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
              id: Number(category.id),
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
