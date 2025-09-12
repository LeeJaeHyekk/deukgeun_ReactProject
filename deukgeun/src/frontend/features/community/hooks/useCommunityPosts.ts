import { useState, useCallback } from 'react'
import { postsApi } from '@frontend/shared/api'
import { showToast } from '@shared/lib'
import {
  Post as CommunityPost,
  PostCategoryInfo,
} from '../../../../shared/types'

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
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableCategories, setAvailableCategories] = useState<
    PostCategoryInfo[]
  >([])

  // 카테고리 목록 가져오기
  const fetchCategories = useCallback(async () => {
    try {
      const response = await postsApi.categories()
      console.log('Categories API Response:', response.data)
      const categories = response.data.data as PostCategoryInfo[]
      setAvailableCategories(categories || [])
    } catch (error: unknown) {
      console.error('카테고리 로드 실패:', error)
      showToast('카테고리를 불러오는데 실패했습니다.', 'error')
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

        console.log('Fetching posts with params:', params)
        const res = await postsApi.list(params)

        console.log('Posts API Response:', res.data)

        // API 응답 구조 확인 및 처리
        const apiResponse = res.data as {
          success: boolean
          message: string
          data?: {
            posts: any[]
            pagination: {
              page: number
              limit: number
              total: number
              totalPages: number
            }
          }
          error?: string
        }

        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(
            apiResponse.message || '게시글을 불러오는데 실패했습니다.'
          )
        }

        const { posts: rawPosts, pagination } = apiResponse.data

        // API 응답 데이터를 안전하게 매핑
        const mappedPosts = (rawPosts || []).map(post => {
          console.log('📝 개별 게시글 데이터:', {
            id: post.id,
            title: post.title,
            isLiked: post.isLiked,
            likeCount: post.likeCount || post.like_count,
            author: post.author,
          })
          return {
            id: post.id,
            userId: post.user?.id || post.userId || 0,
            title: post.title || '',
            content: post.content || '',
            author: {
              id: post.user?.id || post.userId || 0,
              nickname: post.user?.nickname || post.author || '익명',
            },
            category: post.category || '',
            likeCount: post.likeCount || post.like_count || 0,
            commentCount: post.commentCount || post.comment_count || 0,
            isLiked: post.isLiked || false, // 좋아요 상태 포함
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
      try {
        await postsApi.create(postData)
        showToast('게시글이 성공적으로 작성되었습니다.', 'success')
        return true
      } catch (error: unknown) {
        console.error('게시글 작성 실패:', error)
        showToast('게시글 작성에 실패했습니다.', 'error')
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
