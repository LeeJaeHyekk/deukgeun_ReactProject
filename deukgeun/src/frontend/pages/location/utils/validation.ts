/**
 * 데이터 검증 유틸리티
 */

import { Gym } from '../types'

/**
 * 좌표 유효성 검사
 */
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  )
}

/**
 * 한국 좌표 범위 검사
 */
export const isValidKoreanCoordinate = (lat: number, lng: number): boolean => {
  return (
    isValidCoordinate(lat, lng) &&
    lat >= 33 && lat <= 39 && // 한국 위도 범위
    lng >= 124 && lng <= 132  // 한국 경도 범위
  )
}

/**
 * 헬스장 데이터 유효성 검사
 */
export const isValidGym = (gym: any): gym is Gym => {
  if (!gym || typeof gym !== 'object') return false
  
  return (
    typeof gym.id === 'string' &&
    typeof gym.name === 'string' &&
    typeof gym.address === 'string' &&
    isValidCoordinate(gym.latitude, gym.longitude)
  )
}

/**
 * 배열 인덱스 유효성 검사
 */
export const isValidArrayIndex = (index: number, arrayLength: number): boolean => {
  return (
    typeof index === 'number' &&
    !isNaN(index) &&
    index >= 0 &&
    index < arrayLength &&
    Number.isInteger(index)
  )
}

/**
 * 페이지 번호 유효성 검사
 */
export const isValidPageNumber = (page: number, totalPages: number): boolean => {
  return (
    typeof page === 'number' &&
    !isNaN(page) &&
    page >= 1 &&
    page <= totalPages &&
    Number.isInteger(page)
  )
}

/**
 * 거리 값 유효성 검사
 */
export const isValidDistance = (distance: number): boolean => {
  return (
    typeof distance === 'number' &&
    !isNaN(distance) &&
    distance >= 0 &&
    distance <= 1000 // 최대 1000km
  )
}
