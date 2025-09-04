// 기계 이미지 유틸리티 함수

import type { Machine } from '../types/workout'

// 기계 카테고리별 기본 이미지 매핑
const CATEGORY_IMAGES: Record<string, string> = {
  chest: '/img/machine/chest-default.png',
  back: '/img/machine/back-default.png',
  shoulders: '/img/machine/shoulders-default.png',
  arms: '/img/machine/arms-default.png',
  legs: '/img/machine/legs-default.png',
  core: '/img/machine/core-default.png',
  cardio: '/img/machine/cardio-default.png',
  full_body: '/img/machine/full-body-default.png'
}

// 기계 이름별 이미지 매핑
const MACHINE_NAME_IMAGES: Record<string, string> = {
  '벤치프레스': '/img/machine/bench-press.png',
  '스쿼트랙': '/img/machine/squat-rack.png',
  '데드리프트': '/img/machine/deadlift.png',
  '풀업바': '/img/machine/pull-up-bar.png',
  '레그프레스': '/img/machine/leg-press.png',
  '레그컬': '/img/machine/leg-curl.png',
  '레그익스텐션': '/img/machine/leg-extension.png',
  '케이블크로스오버': '/img/machine/cable-crossover.png',
  '로우머신': '/img/machine/row-machine.png',
  '체스트플라이': '/img/machine/chest-fly.png',
  '덤벨': '/img/machine/dumbbell.png',
  '바벨': '/img/machine/barbell.png',
  '스미스머신': '/img/machine/smith-machine.png',
  '레터럴풀다운': '/img/machine/lat-pulldown.png',
  '시티드로우': '/img/machine/seated-row.png',
  '페이스풀': '/img/machine/face-pull.png',
  '레터럴레이즈': '/img/machine/lateral-raise.png',
  '프론트레이즈': '/img/machine/front-raise.png',
  '리어델트플라이': '/img/machine/rear-delt-fly.png',
  '바이셉스컬': '/img/machine/bicep-curl.png',
  '트라이셉스익스텐션': '/img/machine/tricep-extension.png',
  '해머컬': '/img/machine/hammer-curl.png',
  '크런치': '/img/machine/crunch.png',
  '플랭크': '/img/machine/plank.png',
  '러시안트위스트': '/img/machine/russian-twist.png',
  '사이드플랭크': '/img/machine/side-plank.png',
  '레그레이즈': '/img/machine/leg-raise.png',
  '싯업': '/img/machine/sit-up.png',
  '버피': '/img/machine/burpee.png',
  '마운틴클라이머': '/img/machine/mountain-climber.png',
  '점프링': '/img/machine/jump-rope.png',
  '런닝머신': '/img/machine/treadmill.png',
  '자전거': '/img/machine/bicycle.png',
  '로잉머신': '/img/machine/rowing-machine.png',
  '스테퍼': '/img/machine/stepper.png',
  '엘립티컬': '/img/machine/elliptical.png'
}

/**
 * 기계에 맞는 이미지를 찾는 함수
 * @param machine 기계 객체
 * @returns 이미지 URL
 */
export function findMatchingImage(machine: Machine): string {
  // 1. 기계에 이미지가 있으면 사용
  if (machine.imageUrl) {
    return machine.imageUrl
  }

  // 2. 기계 이름으로 매칭
  const nameMatch = MACHINE_NAME_IMAGES[machine.name]
  if (nameMatch) {
    return nameMatch
  }

  // 3. 카테고리별 기본 이미지 사용
  const categoryMatch = CATEGORY_IMAGES[machine.category]
  if (categoryMatch) {
    return categoryMatch
  }

  // 4. 기본 이미지 반환
  return '/img/machine/default.png'
}

/**
 * 기계 카테고리별 아이콘을 가져오는 함수
 * @param category 기계 카테고리
 * @returns 아이콘 문자열
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    chest: '💪',
    back: '🏋️',
    shoulders: '🤸',
    arms: '💪',
    legs: '🦵',
    core: '🔥',
    cardio: '🏃',
    full_body: '🏃‍♂️'
  }
  
  return icons[category] || '🏋️'
}

/**
 * 기계 난이도별 색상을 가져오는 함수
 * @param difficulty 난이도 레벨
 * @returns 색상 코드
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#F44336'
  }
  
  return colors[difficulty] || '#9E9E9E'
}

/**
 * 기계 이미지가 로드되지 않았을 때의 폴백 이미지를 가져오는 함수
 * @param machine 기계 객체
 * @returns 폴백 이미지 URL
 */
export function getFallbackImage(machine: Machine): string {
  return CATEGORY_IMAGES[machine.category] || '/img/machine/default.png'
}
