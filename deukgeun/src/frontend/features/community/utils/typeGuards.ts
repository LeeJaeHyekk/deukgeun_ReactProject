// ============================================================================
// 커뮤니티 기능 타입 가드 유틸리티
// ============================================================================

import { Comment, CommentAuthor, ApiResponse, CommentsApiResponse } from '../types'

/**
 * 값이 null이나 undefined가 아닌지 확인
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * 값이 유효한 문자열인지 확인
 */
export function isValidString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * 값이 유효한 숫자인지 확인
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * 값이 유효한 배열인지 확인
 */
export function isValidArray<T>(value: any): value is T[] {
  return Array.isArray(value)
}

/**
 * 댓글 작성자 객체가 유효한지 확인
 */
export function isValidCommentAuthor(author: any): author is CommentAuthor {
  return (
    author &&
    typeof author === 'object' &&
    isValidNumber(author.id) &&
    isValidString(author.nickname)
  )
}

/**
 * 댓글 객체가 유효한지 확인
 */
export function isValidComment(comment: any): comment is Comment {
  return (
    comment &&
    typeof comment === 'object' &&
    isValidNumber(comment.id) &&
    isValidNumber(comment.postId) &&
    isValidNumber(comment.userId) &&
    isValidCommentAuthor(comment.author) &&
    isValidString(comment.content) &&
    isValidNumber(comment.likesCount) &&
    isValidString(comment.createdAt) &&
    isValidString(comment.updatedAt)
  )
}

/**
 * API 응답이 유효한지 확인
 */
export function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    isValidString(response.message)
  )
}

/**
 * 댓글 API 응답이 유효한지 확인
 */
export function isValidCommentsApiResponse(response: any): response is CommentsApiResponse {
  return (
    isValidApiResponse(response) &&
    (response.data === undefined || isValidArray(response.data))
  )
}

/**
 * 포스트 ID가 유효한지 확인
 */
export function isValidPostId(postId: any): postId is number {
  return isValidNumber(postId) && postId > 0
}

/**
 * 객체가 빈 객체인지 확인
 */
export function isEmptyObject(obj: any): boolean {
  return obj && typeof obj === 'object' && Object.keys(obj).length === 0
}

/**
 * 에러 객체가 유효한지 확인
 */
export function isValidError(error: any): error is Error {
  return error instanceof Error || (error && typeof error.message === 'string')
}

/**
 * 게시글(Post) 객체가 유효한지 확인
 */
export function isValidPost(post: any): boolean {
  return (
    post &&
    typeof post === 'object' &&
    isValidNumber(post.id) &&
    isValidNumber(post.userId) &&
    isValidString(post.title) &&
    isValidString(post.content) &&
    (post.category === undefined || isValidString(post.category)) &&
    (post.likeCount === undefined || isValidNumber(post.likeCount)) &&
    (post.commentCount === undefined || isValidNumber(post.commentCount))
  )
}

/**
 * Pagination 객체가 유효한지 확인
 */
export function isValidPagination(pagination: any): boolean {
  return (
    pagination &&
    typeof pagination === 'object' &&
    isValidNumber(pagination.page) &&
    isValidNumber(pagination.limit) &&
    isValidNumber(pagination.total) &&
    pagination.page > 0 &&
    pagination.limit > 0 &&
    pagination.total >= 0
  )
}

/**
 * 카테고리(Category) 객체가 유효한지 확인
 */
export function isValidCategory(category: any): boolean {
  return (
    category &&
    typeof category === 'object' &&
    isValidString(category.name) &&
    (category.id === undefined || isValidNumber(category.id) || isValidString(category.id)) &&
    (category.count === undefined || isValidNumber(category.count))
  )
}

/**
 * 게시글 목록 API 응답이 유효한지 확인
 */
export function isValidPostsApiResponse(response: any): boolean {
  if (!isValidApiResponse(response)) {
    return false
  }
  
  if (!response.data || typeof response.data !== 'object') {
    return false
  }
  
  const data = response.data as { posts?: any[]; pagination?: any }
  
  // posts 배열 검증
  if (data.posts !== undefined && !isValidArray(data.posts)) {
    return false
  }
  
  // pagination 검증
  if (data.pagination !== undefined && !isValidPagination(data.pagination)) {
    return false
  }
  
  return true
}

/**
 * 카테고리 목록 API 응답이 유효한지 확인
 */
export function isValidCategoriesApiResponse(response: any): boolean {
  if (!isValidApiResponse(response)) {
    return false
  }
  
  if (!response.data || !isValidArray(response.data)) {
    return false
  }
  
  // 모든 카테고리가 유효한지 확인
  return response.data.every((category: any) => isValidCategory(category))
}