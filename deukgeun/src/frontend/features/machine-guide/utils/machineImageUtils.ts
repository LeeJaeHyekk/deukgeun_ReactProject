// ============================================================================
// Machine Image Utilities
// ============================================================================

import { IMAGE_MATCHING_CONFIG } from '@shared/config/imageMatchingConfig'
import type { Machine } from '@dto/index'
import type { EnhancedMachine } from '@shared/types/machineGuide.types'

// 이미지 매칭 캐시 (개발 환경에서는 비활성화)
const imageCache = new Map<string, string>()

// 이미지 로드 상태 캐시
const imageLoadStatus = new Map<string, 'loading' | 'loaded' | 'error'>()

// 캐시 TTL (Time To Live) - 5분
const CACHE_TTL = 5 * 60 * 1000
const cacheTimestamps = new Map<string, number>()

// 이미지 프리로딩 함수
export function preloadImage(src: string): Promise<boolean> {
  return new Promise(resolve => {
    // 이미 로드 상태가 확인된 경우
    if (imageLoadStatus.has(src)) {
      const status = imageLoadStatus.get(src)
      resolve(status === 'loaded')
      return
    }

    // 로딩 중으로 표시
    imageLoadStatus.set(src, 'loading')

    const img = new Image()
    img.onload = () => {
      imageLoadStatus.set(src, 'loaded')
      console.log('✅ 이미지 프리로드 성공:', src)
      resolve(true)
    }
    img.onerror = () => {
      imageLoadStatus.set(src, 'error')
      console.warn('❌ 이미지 프리로드 실패:', src)
      resolve(false)
    }
    img.src = src
  })
}

// 여러 이미지 프리로딩
export async function preloadImages(
  srcs: string[]
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>()

  const promises = srcs.map(async src => {
    const success = await preloadImage(src)
    results.set(src, success)
    return { src, success }
  })

  await Promise.all(promises)
  console.log('🖼️ 이미지 프리로딩 완료:', results)
  return results
}

// 머신 이름과 이미지 매핑
const machineImageMapping: Record<string, string> = {
  // 기존 매핑
  벤치프레스: '/img/machine/chest-press.png',
  'Bench Press': '/img/machine/chest-press.png',
  'bench-press': '/img/machine/chest-press.png',
  랫풀다운: '/img/machine/lat-pulldown.png',
  레그프레스: '/img/machine/leg-press.png',
  스쿼트랙: '/img/machine/squat-rack.png',
  덤벨: '/img/machine/dumbbell.png',
  바벨: '/img/machine/barbell.png',
  케이블머신: '/img/machine/cable-machine.png',
  레그컬: '/img/machine/kneeling-leg-curl.png',
  레그익스텐션: '/img/machine/leg-extension.png',
  레터럴풀다운: '/img/machine/lateral-pulldown.png',
  시티드로우: '/img/machine/seated-row.png',
  오버헤드프레스: '/img/machine/overhead-press.png',
  사이드레터럴레이즈: '/img/machine/side-lateral-raise.png',
  바이셉스컬: '/img/machine/bicep-curl.png',
  트라이셉스익스텐션: '/img/machine/tricep-extension.png',
  크런치: '/img/machine/crunch.png',
  플랭크: '/img/machine/plank.png',
  데드리프트: '/img/machine/deadlift.png',
  로우: '/img/machine/row.png',
  풀업: '/img/machine/pull-up.png',
  딥스: '/img/machine/dips.png',
  런지: '/img/machine/lunge.png',
  스텝업: '/img/machine/step-up.png',
  카프레이즈: '/img/machine/calf-raise.png',
  힙쓰러스트: '/img/machine/hip-thrust.png',
  글루트브릿지: '/img/machine/glute-bridge.png',
  러시안트위스트: '/img/machine/russian-twist.png',
  마운틴클라이머: '/img/machine/mountain-climber.png',
  버피: '/img/machine/burpee.png',
  점프스쿼트: '/img/machine/jump-squat.png',
  플라이오메트릭: '/img/machine/plyometric.png',

  // 누락된 이미지들에 대한 매핑 추가 (실제 파일명으로 수정)
  'Selectorized Leg Curl': '/img/machine/Selectorized leg curl.png',
  'selectorized-leg-curl': '/img/machine/Selectorized leg curl.png',
  'Selectorized leg curl': '/img/machine/Selectorized leg curl.png',
  'Chin-up': '/img/machine/chin-up.png',
  chinup: '/img/machine/chin-up.png',
  'Chin-up and Dip Station': '/img/machine/chin-up-and-dip-station.png',
  'chin-dip-station': '/img/machine/chin-up-and-dip-station.png',
  Treadmill: '/img/machine/treadmill-running.gif',
  treadmill: '/img/machine/treadmill-running.gif',
  'Hip Abduction': '/img/machine/hip-abduction.png',
  'hip-abduction': '/img/machine/hip-abduction.png',
  'Ground Base Combo Incline': '/img/machine/Ground-Base-Combo-Incline.png',
  'ground-base-combo-incline': '/img/machine/Ground-Base-Combo-Incline.png',
  'Ground-Base-Combo-Incline': '/img/machine/Ground-Base-Combo-Incline.png',
  'Leg Curl': '/img/machine/kneeling-leg-curl.png',
  'leg-curl': '/img/machine/kneeling-leg-curl.png',

  // 추가 매핑들
  'Selectorized Lat Pulldown': '/img/machine/Selectorized Lat Pulldown.png',
  'selectorized-lat-pulldown': '/img/machine/Selectorized Lat Pulldown.png',
  'Plate Loaded Leg Press': '/img/machine/plate-loaded-leg-press.png',
  'Plate Loaded Squat': '/img/machine/plate-loaded-squat.png',
  'Plate Loaded Wide Pulldown': '/img/machine/plate-loaded-wide-pulldown.png',
  'Shoulder Press': '/img/machine/shoulder-press.png',
}

/**
 * 머신 이름을 정규화합니다.
 * @param name - 머신 이름
 * @returns 정규화된 이름
 */
function normalizeMachineName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 머신에 대한 적절한 이미지 경로를 찾습니다.
 * @param machine - 머신 객체
 * @returns 이미지 경로
 */
export function findMatchingImage(machine: Machine | EnhancedMachine): string {
  console.log('🔍 findMatchingImage 호출:', machine)

  const cacheKey = `${machine.id}-${machine.name}`
  const now = Date.now()

  // 캐시된 결과가 있고 유효한지 확인 (TTL 체크)
  if (imageCache.has(cacheKey)) {
    const cacheTime = cacheTimestamps.get(cacheKey) || 0
    if (now - cacheTime < CACHE_TTL) {
      console.log('✅ 캐시된 결과 사용:', imageCache.get(cacheKey))
      return imageCache.get(cacheKey)!
    } else {
      // 캐시 만료된 경우 제거
      imageCache.delete(cacheKey)
      cacheTimestamps.delete(cacheKey)
      console.log('⏰ 캐시 만료로 제거됨:', cacheKey)
    }
  }

  // 1. DB에 저장된 이미지 URL이 있으면 사용 (최우선)
  if (machine.imageUrl && machine.imageUrl.trim() !== '') {
    console.log('📸 DB 이미지 URL 사용:', machine.imageUrl)
    imageCache.set(cacheKey, machine.imageUrl)
    cacheTimestamps.set(cacheKey, now)
    return machine.imageUrl
  }

  // 2. 머신 이름으로 매칭 시도 (정확한 매칭)
  console.log('🔍 로컬 이미지 매칭 시도:', { machineName: machine.name })

  let matchedImage = machineImageMapping[machine.name]
  if (matchedImage) {
    console.log('✅ 정확한 매칭 성공:', matchedImage)
    imageCache.set(cacheKey, matchedImage)
    cacheTimestamps.set(cacheKey, now)
    return matchedImage
  }

  // 3. 정규화된 이름으로 매칭 시도
  const normalizedName = normalizeMachineName(machine.name)
  matchedImage = machineImageMapping[normalizedName]
  if (matchedImage) {
    console.log('✅ 정규화된 매칭 성공:', matchedImage)
    imageCache.set(cacheKey, matchedImage)
    cacheTimestamps.set(cacheKey, now)
    return matchedImage
  }

  // 4. 부분 매칭 시도
  for (const [key, value] of Object.entries(machineImageMapping)) {
    if (
      machine.name.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(machine.name.toLowerCase())
    ) {
      console.log('✅ 부분 매칭 성공:', { key, value })
      imageCache.set(cacheKey, value)
      cacheTimestamps.set(cacheKey, now)
      return value
    }
  }

  // 5. 기본 이미지 사용
  const defaultImage = '/img/machine/default.png'
  console.log('🎯 최종 이미지 경로:', defaultImage)
  imageCache.set(cacheKey, defaultImage)
  cacheTimestamps.set(cacheKey, now)
  return defaultImage
}

/**
 * 이미지 캐시를 초기화합니다.
 */
export function clearImageCache(): void {
  imageCache.clear()
  cacheTimestamps.clear()
  console.log('🗑️ 이미지 캐시 초기화됨')
}

/**
 * 특정 머신의 캐시를 제거합니다.
 */
export function clearMachineCache(
  machineId: number,
  machineName: string
): void {
  const cacheKey = `${machineId}-${machineName}`
  imageCache.delete(cacheKey)
  cacheTimestamps.delete(cacheKey)
  console.log('🗑️ 머신 캐시 제거됨:', cacheKey)
}

// 개발 환경에서 캐시 자동 초기화 (새로운 매핑 적용을 위해)
if (import.meta.env.DEV) {
  clearImageCache()
}

/**
 * 머신 카테고리별 기본 이미지를 반환합니다.
 * @param category - 머신 카테고리
 * @returns 카테고리별 기본 이미지 경로
 */
export function getCategoryDefaultImage(category: string): string {
  const categoryImages: Record<string, string> = {
    상체: '/img/machine/upper-body.png',
    하체: '/img/machine/lower-body.png',
    전신: '/img/machine/full-body.png',
    기타: '/img/machine/other.png',
    strength: '/img/machine/strength.png',
    cardio: '/img/machine/cardio.png',
    flexibility: '/img/machine/flexibility.png',
    balance: '/img/machine/balance.png',
    functional: '/img/machine/functional.png',
    rehabilitation: '/img/machine/rehabilitation.png',
  }

  return categoryImages[category] || '/img/machine/default.png'
}

/**
 * 머신 난이도별 색상을 반환합니다.
 * @param difficulty - 머신 난이도
 * @returns 난이도별 색상
 */
export function getDifficultyColor(difficulty: string): string {
  const difficultyColors: Record<string, string> = {
    초급: '#22c55e',
    중급: '#f59e0b',
    고급: '#ef4444',
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
    expert: '#8b5cf6',
  }

  return difficultyColors[difficulty] || '#6b7280'
}

/**
 * 전체 이미지 URL을 생성합니다.
 * @param imagePath - 이미지 경로
 * @returns 전체 이미지 URL
 */
export function getFullImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 상대 경로인 경우 기본 도메인 추가
  return `${window.location.origin}${imagePath}`
}

/**
 * 이미지 로딩 실패 시 대체 이미지를 반환합니다.
 * @param originalPath - 원본 이미지 경로
 * @returns 대체 이미지 경로
 */
export function getFallbackImage(originalPath: string): string {
  // 기본 이미지가 이미 대체 이미지인 경우 그대로 반환
  if (originalPath.includes('default.png')) {
    return originalPath
  }

  return '/img/machine/default.png'
}

/**
 * 이미지 로드 실패를 처리하는 React 이벤트 핸들러
 * @param event - 이미지 로드 실패 이벤트
 * @param fallbackPath - 대체 이미지 경로 (선택사항)
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackPath?: string
): void {
  const img = event.currentTarget
  const originalSrc = img.src

  console.warn('🖼️ 이미지 로드 실패:', originalSrc)

  // 로드 상태 업데이트
  imageLoadStatus.set(originalSrc, 'error')

  // 대체 이미지 경로가 제공된 경우 사용, 그렇지 않으면 기본 이미지 사용
  const fallback = fallbackPath || getFallbackImage(originalSrc)

  // 무한 루프 방지: 대체 이미지도 실패하는 경우
  if (img.src !== fallback) {
    img.src = fallback
    console.log('🔄 대체 이미지로 변경:', fallback)

    // 대체 이미지도 프리로드 시도
    preloadImage(fallback).then(success => {
      if (!success) {
        console.error('❌ 대체 이미지도 로드 실패:', fallback)
        // 최종적으로 기본 이미지로 설정
        if (fallback !== '/img/machine/default.png') {
          img.src = '/img/machine/default.png'
        }
      }
    })
  } else {
    console.error('❌ 대체 이미지도 로드 실패:', fallback)
  }
}

/**
 * 이미지 로드 성공을 처리하는 React 이벤트 핸들러
 * @param event - 이미지 로드 성공 이벤트
 */
export function handleImageLoad(
  event: React.SyntheticEvent<HTMLImageElement, Event>
): void {
  const img = event.currentTarget
  console.log('✅ 이미지 로드 성공:', img.src)

  // 로드 상태 업데이트
  imageLoadStatus.set(img.src, 'loaded')
}

/**
 * 이미지 경로가 유효한지 확인합니다.
 * @param imagePath - 확인할 이미지 경로
 * @returns 유효성 여부
 */
export function isValidImagePath(imagePath: string): boolean {
  if (!imagePath || imagePath.trim() === '') {
    return false
  }

  // 기본 이미지는 항상 유효하다고 가정
  if (imagePath.includes('default.png')) {
    return true
  }

  // 외부 URL인 경우 유효하다고 가정
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return true
  }

  return true // 로컬 이미지는 존재한다고 가정하고 실제 로딩 시 처리
}
