// ============================================================================
// 댓글 데이터 매핑 유틸리티
// ============================================================================

import { Comment, CommentAuthor } from '../types'
import { isValidComment, isValidCommentAuthor, isValidString, isValidNumber } from './typeGuards'

/**
 * API 응답의 댓글 작성자를 CommentAuthor 타입으로 매핑
 */
export function mapCommentAuthor(author: any, fallbackUserId: number = 0): CommentAuthor {
  // 문자열인 경우 (닉네임만 있는 경우)
  if (typeof author === 'string') {
    return {
      id: fallbackUserId,
      nickname: author,
      profileImage: undefined,
      avatarUrl: undefined
    }
  }

  // 객체인 경우
  if (author && typeof author === 'object') {
    return {
      id: isValidNumber(author.id) ? author.id : fallbackUserId,
      nickname: isValidString(author.nickname) ? author.nickname : (author.author_name || '익명'),
      profileImage: author.profileImage,
      avatarUrl: author.avatarUrl
    }
  }

  // 기본값
  return {
    id: fallbackUserId,
    nickname: '익명',
    profileImage: undefined,
    avatarUrl: undefined
  }
}

/**
 * API 응답의 댓글 데이터를 Comment 타입으로 매핑
 */
export function mapCommentData(rawComment: any, postId: number): Comment | null {
  try {
    // 필수 필드 검증
    if (!rawComment || typeof rawComment !== 'object') {
      console.warn('댓글 데이터가 유효하지 않습니다:', rawComment)
      return null
    }

    const userId = isValidNumber(rawComment.userId) ? rawComment.userId : 
                  (isValidNumber(rawComment.author_id) ? rawComment.author_id : 0)

    const author = mapCommentAuthor(rawComment.author, userId)
    
    const comment: Comment = {
      id: isValidNumber(rawComment.id) ? rawComment.id : 0,
      postId: isValidNumber(rawComment.postId) ? rawComment.postId : postId,
      userId,
      author,
      content: isValidString(rawComment.content) ? rawComment.content : '',
      likesCount: isValidNumber(rawComment.likesCount) ? rawComment.likesCount : 0,
      createdAt: new Date(
        rawComment.createdAt || rawComment.created_at || Date.now()
      ).toISOString(),
      updatedAt: new Date(
        rawComment.updatedAt || rawComment.updated_at || Date.now()
      ).toISOString(),
    }

    // 최종 검증
    if (!isValidComment(comment)) {
      console.warn('매핑된 댓글이 유효하지 않습니다:', comment)
      return null
    }

    return comment
  } catch (error) {
    console.error('댓글 데이터 매핑 중 오류 발생:', error, rawComment)
    return null
  }
}

/**
 * API 응답의 댓글 배열을 Comment 배열로 매핑
 */
export function mapCommentsArray(rawComments: any[], postId: number): Comment[] {
  if (!Array.isArray(rawComments)) {
    console.warn('댓글 데이터가 배열이 아닙니다:', rawComments)
    return []
  }

  return rawComments
    .map(comment => mapCommentData(comment, postId))
    .filter((comment): comment is Comment => comment !== null)
}

/**
 * 댓글 데이터를 안전하게 로드하고 매핑
 */
export function safeLoadComments(apiResponse: any, postId: number): Comment[] {
  try {
    if (!apiResponse || !apiResponse.success || !apiResponse.data) {
      console.warn('댓글 API 응답이 유효하지 않습니다:', apiResponse)
      return []
    }

    const rawComments = apiResponse.data
    return mapCommentsArray(rawComments, postId)
  } catch (error) {
    console.error('댓글 데이터 로드 중 오류 발생:', error)
    return []
  }
}
