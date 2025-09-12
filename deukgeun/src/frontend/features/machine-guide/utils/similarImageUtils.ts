// ============================================================================
// Similar Image Utilities
// ============================================================================

import { IMAGE_MATCHING_CONFIG } from '@shared/config/imageMatchingConfig'

// 사용 가능한 이미지 파일 목록
const AVAILABLE_IMAGES = [
  'bicep-curl.png',
  'chest-press.png',
  'chin-up-and-dip-station.png',
  'chin-up.png',
  'kneeling-leg-curl.png',
  'leg-extension.png',
  'leg-press.png',
  'lat-pulldown.png',
  'plate-loaded-leg-press.png',
  'plate-loaded-squat.png',
  'shoulder-press.png',
  'squat-rack.png',
  'treadmill-running.gif',
  'plate-loaded-wide-pulldown.png',
  'Selectorized Lat Pulldown.png',
  'Selectorized leg curl.png',
  'Ground-Base-Combo-Incline.png',
]

// 키워드 매핑 (한국어 -> 영어)
const KEYWORD_MAPPING: Record<string, string[]> = {
  // 가슴 관련
  가슴: ['chest', 'press'],
  체스트: ['chest', 'press'],
  벤치: ['bench', 'press'],
  프레스: ['press'],
  플라이: ['fly'],
  인클라인: ['incline'],
  디클라인: ['decline'],

  // 등 관련
  등: ['lat', 'back', 'pulldown', 'row'],
  랫: ['lat', 'pulldown'],
  로우: ['row'],
  풀다운: ['pulldown'],
  풀업: ['pull', 'chin'],

  // 다리 관련
  다리: ['leg'],
  레그: ['leg'],
  스쿼트: ['squat'],
  런지: ['lunge'],
  데드리프트: ['deadlift'],
  컬: ['curl'],
  익스텐션: ['extension'],

  // 어깨 관련
  어깨: ['shoulder'],
  숄더: ['shoulder'],
  레터럴: ['lateral'],
  레이즈: ['raise'],

  // 팔 관련
  팔: ['arm', 'bicep', 'tricep'],
  바이셉: ['bicep'],
  트라이셉: ['tricep'],

  // 코어 관련
  코어: ['core', 'crunch'],
  복부: ['core', 'crunch'],
  크런치: ['crunch'],
  플랭크: ['plank'],

  // 유산소 관련
  유산소: ['cardio', 'treadmill'],
  러닝: ['running', 'treadmill'],
  달리기: ['running', 'treadmill'],
}

// 유사도 계산 함수 (간단한 문자열 매칭)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z가-힣]/g, '')
  const s2 = str2.toLowerCase().replace(/[^a-z가-힣]/g, '')

  if (s1 === s2) return 1.0

  // 부분 문자열 매칭
  if (s1.includes(s2) || s2.includes(s1)) return 0.8

  // 키워드 매칭
  const keywords1 = extractKeywords(s1)
  const keywords2 = extractKeywords(s2)

  const commonKeywords = keywords1.filter(k => keywords2.includes(k))
  if (commonKeywords.length > 0) {
    return 0.6 + commonKeywords.length * 0.1
  }

  return 0
}

// 키워드 추출 함수
function extractKeywords(text: string): string[] {
  const keywords: string[] = []

  // 한국어 키워드 매핑
  for (const [korean, english] of Object.entries(KEYWORD_MAPPING)) {
    if (text.includes(korean)) {
      keywords.push(...english)
    }
  }

  // 영어 키워드 직접 추출
  const englishKeywords = Object.values(KEYWORD_MAPPING).flat()
  for (const keyword of englishKeywords) {
    if (text.includes(keyword)) {
      keywords.push(keyword)
    }
  }

  return [...new Set(keywords)]
}

// 이미지 파일명에서 키워드 추출
function extractImageKeywords(imageName: string): string[] {
  const name = imageName.toLowerCase().replace(/\.(png|jpg|jpeg|gif)$/, '')
  const keywords: string[] = []

  // 하이픈으로 분리된 단어들
  const parts = name.split('-')
  keywords.push(...parts)

  // 공백으로 분리된 단어들
  const spaceParts = name.split(' ')
  keywords.push(...spaceParts)

  // 특수 문자 제거 후 단어 추출
  const cleanName = name.replace(/[^a-z가-힣]/g, '')
  if (cleanName.length > 2) {
    keywords.push(cleanName)
  }

  return [...new Set(keywords.filter(k => k.length > 1))]
}

// 유사한 이미지 찾기
export function findSimilarImages(
  machineName: string,
  limit: number = 3
): string[] {
  const machineKeywords = extractKeywords(machineName.toLowerCase())
  const similarities: Array<{ image: string; score: number }> = []

  for (const image of AVAILABLE_IMAGES) {
    const imageKeywords = extractImageKeywords(image)

    // 키워드 매칭 점수 계산
    let score = 0
    for (const machineKeyword of machineKeywords) {
      for (const imageKeyword of imageKeywords) {
        const similarity = calculateSimilarity(machineKeyword, imageKeyword)
        score = Math.max(score, similarity)
      }
    }

    // 전체 이름 유사도도 계산
    const nameSimilarity = calculateSimilarity(machineName, image)
    score = Math.max(score, nameSimilarity)

    if (score > 0.3) {
      // 임계값 이상인 경우만 포함
      similarities.push({ image, score })
    }
  }

  // 점수순으로 정렬하고 상위 N개 반환
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => `/img/machine/${item.image}`)
}

// 기본 이미지와 유사한 이미지들을 함께 반환
export function getImageWithSimilar(
  machineName: string,
  defaultImage?: string
): {
  main: string
  similar: string[]
} {
  const main = defaultImage || IMAGE_MATCHING_CONFIG.DEFAULT_IMAGE
  const similar = findSimilarImages(machineName, 3)

  // 메인 이미지가 유사 이미지 목록에 있으면 제거
  const filteredSimilar = similar.filter(img => img !== main)

  return {
    main,
    similar: filteredSimilar,
  }
}
