import { useState, useEffect, useCallback } from "react"
import { postsApi, likesApi } from "@shared/api"
import { showToast } from "@shared/lib"
import { PostGrid } from "./components/PostGrid"
import { PostModal } from "./components/PostModal"
import { PostDetailModal } from "./components/PostDetailModal"
import { Navigation } from "@widgets/Navigation/Navigation"
import styles from "./CommunityPage.module.css"

// 타입 정의
interface PostCategory {
  id: number
  name: string
  count: number
}

interface Post {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
  }
  category: string
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
}

interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
}

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
      .categories()
      .then(response => {
        const categories = response.data.data as PostCategory[]
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

        const res = await postsApi.list({
          category: selectedCategoryParam,
          page,
          limit,
        })

        const postListResponse = res.data.data as PostListResponse

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
      await postsApi.create(postData)
      showToast("게시글이 성공적으로 작성되었습니다.", "success")
      setIsModalOpen(false)
      fetchPosts(1) // 첫 페이지로 돌아가서 새 게시글 확인
    } catch (error: unknown) {
      console.error("게시글 작성 실패:", error)
      showToast("게시글 작성에 실패했습니다.", "error")
    }
  }

  // 게시글 좋아요
  const handleLikePost = async (postId: number) => {
    try {
      await likesApi.like(postId)
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
      await postsApi.update(postId, updateData)
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
      await postsApi.remove(postId)
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
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>커뮤니티</h1>
          <p className={styles.subtitle}>함께 운동하고 경험을 나누어보세요</p>

          <div className={styles.controls}>
            {/* 카테고리 필터 */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={styles.categorySelect}
            >
              <option value="">전체 카테고리</option>
              {(availableCategories || []).map(category => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* 새 게시글 작성 버튼 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.createButton}
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
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreatePost}
            categories={availableCategories}
          />
        )}

        {/* 게시글 상세 모달 */}
        {isDetailModalOpen && selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setIsDetailModalOpen(false)}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
          />
        )}
      </div>
    </div>
  )
}
