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
