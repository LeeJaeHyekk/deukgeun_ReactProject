// ============================================================================
// useUserInfo Hook - 사용자 정보 처리 훅
// ============================================================================

import { useMemo } from "react"
import { formatDateToKorean } from "../utils/dateUtils"
import type { User } from "@frontend/shared/types"

export interface UserInfo {
  nickname: string
  email: string
  phone?: string
  gender?: string
  birthday?: string
  createdAt?: string
}

const DEFAULT_USER_INFO: UserInfo = {
  nickname: "사용자",
  email: "이메일 없음",
  phone: "미등록",
  gender: "미등록",
  birthday: "미등록",
  createdAt: "미등록",
}

/**
 * 사용자 정보를 처리하고 포맷팅하는 훅
 */
export function useUserInfo(user: User | null | undefined): UserInfo {
  return useMemo((): UserInfo => {
    // 사용자 정보가 없으면 기본값 반환
    if (!user || typeof user !== 'object') {
      return DEFAULT_USER_INFO
    }
    
    try {
      // 전화번호: phone 또는 phoneNumber (둘 다 동일한 값)
      const phone: string = (user?.phone || user?.phoneNumber || '') as string
      
      // 생년월일 포맷팅
      const birthday = (formatDateToKorean(user?.birthDate) || DEFAULT_USER_INFO.birthday) as string
      
      // 가입일 포맷팅
      const createdAt = (formatDateToKorean(user?.createdAt) || DEFAULT_USER_INFO.createdAt) as string
      
      // 성별 변환
      const getGenderLabel = (gender?: string) => {
        switch (gender) {
          case "male": return "남성"
          case "female": return "여성"
          case "other": return "기타"
          default: return DEFAULT_USER_INFO.gender
        }
      }
      
      return {
        nickname: (user?.nickname && typeof user.nickname === 'string' && user.nickname.trim() !== '') 
          ? user.nickname.trim() 
          : DEFAULT_USER_INFO.nickname,
        email: (user?.email && typeof user.email === 'string' && user.email.trim() !== '') 
          ? user.email.trim() 
          : DEFAULT_USER_INFO.email,
        phone: ((phone && typeof phone === 'string' && phone.trim() !== '') 
          ? phone.trim() 
          : DEFAULT_USER_INFO.phone) as string,
        gender: getGenderLabel(user?.gender),
        birthday: birthday,
        createdAt: createdAt,
      }
    } catch (error) {
      console.error('❌ [useUserInfo] 사용자 정보 처리 오류:', error)
      return DEFAULT_USER_INFO
    }
  }, [user])
}

