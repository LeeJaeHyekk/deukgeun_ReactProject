import { storage } from '../lib'
import { User } from '../../../shared/types'

/**
 * 클라이언트 토큰 업데이트
 * localStorage에 액세스 토큰 저장
 */
export function updateClientToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token)
  }
}

/**
 * 클라이언트 사용자 정보 업데이트
 * localStorage에 사용자 정보 저장
 */
export function updateClientUser(user: User): void {
  if (typeof window !== 'undefined') {
    storage.set('user', user)
  }
}

/**
 * 모든 인증 데이터 초기화
 * localStorage에서 토큰과 사용자 정보 삭제
 */
export function clearAllAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    storage.remove('user')
  }
}
