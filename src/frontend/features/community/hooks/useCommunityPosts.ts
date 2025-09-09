import { useState, useCallback } from "react"
import { postsApi } from "../../../shared/api/communityApi"
import { showToast } from "../../../shared/lib/toast"
import type {
  Post,
  PostCategory,
} from "../../../types/community"

interface UseCommunityPostsProps {
  limit: number
}

interface FetchPostsParams {
  page?: number
  category?: string
  searchTerm?: string
  sortBy?: "latest" | "popular"
}

export function useCommunityPosts({ limit }: UseCommunityPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableCategories, setAvailableCategories] = useState<
    PostCategory[]
  >([])

  // 카테고리 목록 가져오기
  const fetchCategories = useCallback(async () => {
    try {
      const response = await postsApi.getCategories()
      console.log("Categories API Response:", response)
      const categories = response as PostCategory[]
      setAvailableCategories(categories || [])
    } catch (error: unknown) {
      console.error("카테고리 로드 실패:", error)
      showToast("카테고리를 불러오는데 실패했습니다.", "error")
    }
  }, [])

  // 게시글 목록 가져오기
  const fetchPosts = useCallback(
    async ({
      page = 1,
      category,
      searchTerm,
      sortBy = "latest",
    }: FetchPostsParams) => {
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
        if (category && category !== "all") {
          params.category = category
        }

        // 검색어 필터
        if (searchTerm?.trim()) {
          params.q = searchTerm.trim()
        }

        console.log("Fetching posts with params:", params)
        const res = await postsApi.getPosts(params)

        console.log("Posts API Response:", res)

        // API 응답 구조 확인 및 처리
        const apiResponse = res as any

        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(
            apiResponse.message || "게시글을 불러오는데 실패했습니다."
          )
        }

        const { posts: rawPosts, pagination } = apiResponse.data

        // API 응답 데이터를 안전하게 매핑
        const mappedPosts = (rawPosts || []).map(post => {
          console.log("Individual post:", post)
          return {
            id: post.id,
            userId: post.user?.id || post.userId || 0,
            title: post.title || "",
            content: post.content || "",
            author: post.user?.nickname || post.author || "익명",
            category: post.category || "",
            likeCount: post.like_count || post.likes || 0,
            commentCount: post.comment_count || post.comments || 0,
            createdAt:
              post.createdAt || post.created_at || new Date().toISOString(),
            updatedAt:
              post.updatedAt || post.updated_at || new Date().toISOString(),
          }
        })

        setPosts(mappedPosts)
        setTotalPages(
          pagination.totalPages || Math.ceil(pagination.total / limit)
        )
        setCurrentPage(page)
      } catch (error: unknown) {
        console.error("게시글 로드 실패:", error)
        showToast("게시글을 불러오는데 실패했습니다.", "error")
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
      try {
        await postsApi.create(postData)
        showToast("게시글이 성공적으로 작성되었습니다.", "success")
        return true
      } catch (error: unknown) {
        console.error("게시글 작성 실패:", error)
        showToast("게시글 작성에 실패했습니다.", "error")
        return false
      }
    },
    []
  )

  // 게시글 수정
  const updatePost = useCallback(
    async (
      postId: number,
      updateData: { title: string; content: string; category: string }
    ) => {
      try {
        await postsApi.update(postId.toString(), updateData)
        showToast("게시글이 성공적으로 수정되었습니다.", "success")
        return true
      } catch (error: unknown) {
        console.error("게시글 수정 실패:", error)
        showToast("게시글 수정에 실패했습니다.", "error")
        return false
      }
    },
    []
  )

  // 게시글 삭제
  const deletePost = useCallback(async (postId: number) => {
    try {
      await postsApi.remove(postId.toString())
      showToast("게시글이 성공적으로 삭제되었습니다.", "success")
      return true
    } catch (error: unknown) {
      console.error("게시글 삭제 실패:", error)
      showToast("게시글 삭제에 실패했습니다.", "error")
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
