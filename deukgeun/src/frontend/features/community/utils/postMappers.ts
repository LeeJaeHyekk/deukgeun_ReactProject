// ============================================================================
// 게시글 데이터 매핑 유틸리티
// ============================================================================

import { PostDTO } from '../../../shared/types'
import { isValidPost, isValidPagination, isValidArray, isValidString, isValidNumber } from './typeGuards'
import { logError } from './errorHandlers'

/**
 * API 응답의 게시글 데이터를 PostDTO 타입으로 매핑
 */
export function mapPostData(rawPost: any): PostDTO | null {
  try {
    // 필수 필드 검증
    if (!rawPost || typeof rawPost !== 'object') {
      console.warn('게시글 데이터가 유효하지 않습니다:', rawPost)
      return null
    }

    const likeCount = isValidNumber(rawPost.likeCount) 
      ? rawPost.likeCount 
      : (isValidNumber(rawPost.like_count) ? rawPost.like_count : 0)
    const commentCount = isValidNumber(rawPost.commentCount) 
      ? rawPost.commentCount 
      : (isValidNumber(rawPost.comment_count) ? rawPost.comment_count : 0)
    
    const post: PostDTO = {
      id: isValidNumber(rawPost.id) ? rawPost.id : 0,
      userId: isValidNumber(rawPost.userId) 
        ? rawPost.userId 
        : (isValidNumber(rawPost.user?.id) ? rawPost.user.id : 0),
      title: isValidString(rawPost.title) ? rawPost.title : '',
      content: isValidString(rawPost.content) ? rawPost.content : '',
      author: (rawPost.author && typeof rawPost.author === 'object' && 'id' in rawPost.author && 'nickname' in rawPost.author)
        ? rawPost.author
        : (isValidString(rawPost.user?.nickname) 
            ? { id: rawPost.user.id, nickname: rawPost.user.nickname }
            : { id: 0, nickname: '익명' }),
      category: isValidString(rawPost.category) ? rawPost.category : '',
      likesCount: likeCount,
      commentsCount: commentCount,
      viewsCount: isValidNumber(rawPost.viewsCount) 
        ? rawPost.viewsCount 
        : (isValidNumber(rawPost.views_count) ? rawPost.views_count : 0),
      createdAt: isValidString(rawPost.createdAt) 
        ? rawPost.createdAt
        : (isValidString(rawPost.created_at) ? rawPost.created_at : new Date().toISOString()),
      updatedAt: isValidString(rawPost.updatedAt) 
        ? rawPost.updatedAt
        : (isValidString(rawPost.updated_at) ? rawPost.updated_at : new Date().toISOString()),
      // 호환성을 위한 선택적 속성
      likeCount,
      commentCount,
    }

    // 최종 검증
    if (!isValidPost(post)) {
      console.warn('매핑된 게시글이 유효하지 않습니다:', post)
      return null
    }

    return post
  } catch (error) {
    console.error('게시글 데이터 매핑 중 오류 발생:', error, rawPost)
    logError('mapPostData', error, { rawPost })
    return null
  }
}

/**
 * API 응답의 게시글 배열을 PostDTO 배열로 매핑
 */
export function mapPostsArray(rawPosts: any[]): PostDTO[] {
  if (!isValidArray(rawPosts)) {
    console.warn('게시글 데이터가 배열이 아닙니다:', rawPosts)
    return []
  }

  return rawPosts
    .map(post => mapPostData(post))
    .filter((post): post is PostDTO => post !== null)
}

/**
 * 게시글 목록 API 응답을 안전하게 로드하고 매핑
 */
export function safeLoadPosts(apiResponse: any): {
  posts: PostDTO[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
} {
  try {
    if (!apiResponse || !apiResponse.success || !apiResponse.data) {
      console.warn('게시글 API 응답이 유효하지 않습니다:', apiResponse)
      return {
        posts: [],
        pagination: null
      }
    }

    const data = apiResponse.data
    const rawPosts = data.posts || []
    const rawPagination = data.pagination

    const posts = mapPostsArray(rawPosts)
    
    let pagination = null
    if (rawPagination && isValidPagination(rawPagination)) {
      pagination = {
        page: rawPagination.page,
        limit: rawPagination.limit,
        total: rawPagination.total,
        totalPages: isValidNumber(rawPagination.totalPages) 
          ? rawPagination.totalPages 
          : Math.ceil(rawPagination.total / rawPagination.limit)
      }
    }

    return {
      posts,
      pagination
    }
  } catch (error) {
    console.error('게시글 데이터 로드 중 오류 발생:', error)
    logError('safeLoadPosts', error, { apiResponse })
    return {
      posts: [],
      pagination: null
    }
  }
}

/**
 * 카테고리 목록 API 응답을 안전하게 로드하고 매핑
 */
export function safeLoadCategories(apiResponse: any): Array<{ id: number | string; name: string; count: number }> {
  try {
    if (!apiResponse || !apiResponse.success || !apiResponse.data) {
      console.warn('카테고리 API 응답이 유효하지 않습니다:', apiResponse)
      return []
    }

    const rawCategories = apiResponse.data
    if (!isValidArray(rawCategories)) {
      console.warn('카테고리 데이터가 배열이 아닙니다:', rawCategories)
      return []
    }

    return rawCategories
      .map((category: any) => {
        if (!category || typeof category !== 'object') {
          return null
        }

        return {
          id: isValidNumber(category.id) 
            ? category.id 
            : (isValidString(category.id) ? category.id : String(Date.now())),
          name: isValidString(category.name) ? category.name : '',
          count: isValidNumber(category.count) ? category.count : 0
        }
      })
      .filter((category): category is { id: number | string; name: string; count: number } => 
        category !== null && isValidString(category.name)
      )
  } catch (error) {
    console.error('카테고리 데이터 로드 중 오류 발생:', error)
    logError('safeLoadCategories', error, { apiResponse })
    return []
  }
}

