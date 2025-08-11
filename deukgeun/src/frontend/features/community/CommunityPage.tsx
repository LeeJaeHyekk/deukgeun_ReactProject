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
  posts: Array<{
    id: number
    title: string
    content: string
    author: {
      id: number
      nickname: string
    }
    category: string
    likes?: number
    comments?: number
    like_count?: number
    comment_count?: number
    createdAt?: string
    created_at?: string
    updatedAt?: string
    updated_at?: string
  }>
  total: number
  page: number
  limit: number
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest")
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
    async (page: number = 1) => {
      setLoading(true)
      try {
        const params: {
          category?: string
          q?: string
          sort?: "latest" | "popular"
          page?: number
          limit?: number
        } = {
          page,
          limit,
          sort: sortBy,
        }

        // 카테고리 필터
        if (selectedCategory && selectedCategory !== "all") {
          params.category = selectedCategory
        }

        // 검색어 필터
        if (searchTerm.trim()) {
          params.q = searchTerm.trim()
        }

        const res = await postsApi.list(params)

        console.log("API Response:", res.data) // 디버깅용 로그

        const postListResponse = res.data.data as PostListResponse

        // API 응답 데이터를 안전하게 매핑
        const mappedPosts = (postListResponse.posts || []).map(post => {
          console.log("Individual post:", post) // 디버깅용 로그
          return {
            id: post.id,
            title: post.title || "",
            content: post.content || "",
            author: {
              id: post.author?.id || 0,
              nickname: post.author?.nickname || "익명",
            },
            category: post.category || "",
            likes: post.likes || post.like_count || 0,
            comments: post.comments || post.comment_count || 0,
            createdAt:
              post.createdAt || post.created_at || new Date().toISOString(),
            updatedAt:
              post.updatedAt || post.updated_at || new Date().toISOString(),
          }
        })

        setPosts(mappedPosts)
        setTotalPages(Math.ceil(postListResponse.total / limit))
        setCurrentPage(page)
      } catch (error: unknown) {
        console.error("게시글 로드 실패:", error)
        showToast("게시글을 불러오는데 실패했습니다.", "error")
        setPosts([])
      } finally {
        setLoading(false)
      }
    },
    [selectedCategory, searchTerm, sortBy, limit]
  )

  // 필터 변경 시 게시글 다시 로드
  useEffect(() => {
    fetchPosts(1)
  }, [selectedCategory, searchTerm, sortBy])

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

  // 글쓰기 모달 열기
  const handleOpenCreateModal = () => {
    if (availableCategories.length === 0) {
      showToast(
        "카테고리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
        "error"
      )
      return
    }
    setIsModalOpen(true)
  }

  // 카테고리 데이터 준비
  const categories = [
    {
      id: "all",
      label: "전체",
      count: availableCategories.reduce((sum, cat) => sum + cat.count, 0),
    },
    ...availableCategories.map(cat => ({
      id: cat.name,
      label: cat.name,
      count: cat.count,
    })),
  ]

  return (
    <div className={styles.communityPage}>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>커뮤니티</h1>
          <p className={styles.subtitle}>함께 운동하고 경험을 나누어보세요</p>

          {/* 컨트롤 섹션 */}
          <section className={styles.controls}>
            {/* 검색 및 정렬 */}
            <div className={styles.searchSort}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="게시글 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.sortSelect}>
                <select
                  value={sortBy}
                  onChange={e =>
                    setSortBy(e.target.value as "latest" | "popular")
                  }
                  className={styles.select}
                >
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                </select>
              </div>
            </div>

            {/* 카테고리 + 글쓰기 동일 구역 배치 */}
            <div className={styles.categoriesRow}>
              <div className={styles.categories}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`${styles.categoryBtn} ${
                      selectedCategory === category.id ? styles.active : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentPage(1)
                    }}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>

              <button
                className={styles.createPostBtn}
                onClick={handleOpenCreateModal}
              >
                ✏️ 글쓰기
              </button>
            </div>
          </section>
        </div>

        {/* 게시글 그리드 */}
        <section className={styles.postsSection}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>게시글을 불러오는 중...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>게시글이 없습니다</h3>
              <p>첫 번째 게시글을 작성해보세요!</p>
              <button
                className={styles.createFirstPostBtn}
                onClick={handleOpenCreateModal}
              >
                ✏️ 첫 게시글 작성하기
              </button>
            </div>
          ) : (
            <PostGrid
              posts={posts}
              onPostClick={handleOpenPost}
              onLikeClick={handleLikePost}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>

        {/* 새 게시글 작성 모달 */}
        {isModalOpen && availableCategories.length > 0 && (
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
