// ============================================================================
// Level Calculation Utilities (백엔드와 동일한 공식 사용)
// ============================================================================

/**
 * 백엔드와 동일한 레벨 계산 공식
 * baseExp * multiplier^(level-1)
 * 
 * @param level - 현재 레벨
 * @returns 해당 레벨에 필요한 경험치
 */
export function calculateRequiredExp(level: number): number {
  const BASE_EXP = 100
  const MULTIPLIER = 1.5
  
  if (level <= 1) return 0
  
  return Math.floor(BASE_EXP * Math.pow(MULTIPLIER, level - 1))
}

/**
 * 총 경험치로부터 현재 레벨 계산 (백엔드와 동일한 로직)
 * 
 * 백엔드 로직:
 * - currentExp가 requiredExp 이상이면 레벨업
 * - 레벨업 시 currentExp에서 requiredExp를 빼고 level 증가
 * - totalExp는 누적 경험치의 합
 * 
 * @param totalExp - 총 경험치 (누적 경험치의 합)
 * @returns { level, currentExp, nextLevelExp, progressPercentage }
 */
export function calculateLevelFromTotalExp(totalExp: number): {
  level: number
  currentExp: number
  nextLevelExp: number
  progressPercentage: number
} {
  if (totalExp < 0) totalExp = 0
  
  let level = 1
  let remainingExp = totalExp
  
  // 레벨 1부터 시작하여 레벨업 체크 (백엔드 로직과 동일)
  // 최대 레벨 100까지
  while (level < 100) {
    const requiredExp = calculateRequiredExp(level + 1)
    
    // 다음 레벨에 필요한 경험치가 남아있으면 레벨업
    if (remainingExp >= requiredExp) {
      remainingExp -= requiredExp
      level++
    } else {
      break
    }
  }
  
  // 현재 레벨의 현재 경험치 (남은 경험치)
  const currentExp = Math.max(0, remainingExp)
  
  // 다음 레벨까지 필요한 경험치
  const nextLevelExp = calculateRequiredExp(level + 1)
  
  // 진행률 계산 (0% ~ 100%)
  const progressPercentage = nextLevelExp > 0 
    ? Math.min(Math.max((currentExp / nextLevelExp) * 100, 0), 100)
    : 100 // 최고 레벨 (레벨 100 이상)
  
  return {
    level: Math.max(1, Math.min(level, 100)), // 레벨 범위: 1-100
    currentExp,
    nextLevelExp,
    progressPercentage,
  }
}

/**
 * 레벨 정보 가져오기 (레벨 번호로)
 * 
 * @param level - 레벨 번호
 * @returns 레벨 정보
 */
export function getLevelInfo(level: number): {
  level: number
  requiredExp: number
  title: string
  color: string
} {
  const levelTitles: Record<number, string> = {
    1: "초보자",
    2: "입문자",
    3: "중급자",
    4: "고급자",
    5: "전문가",
  }
  
  const levelColors: Record<number, string> = {
    1: "#6B7280",
    2: "#10B981",
    3: "#3B82F6",
    4: "#8B5CF6",
    5: "#F59E0B",
  }
  
  // 레벨 5 이상은 전문가
  const displayLevel = level >= 5 ? 5 : level
  
  return {
    level,
    requiredExp: calculateRequiredExp(level),
    title: levelTitles[displayLevel] || "전문가",
    color: levelColors[displayLevel] || "#F59E0B",
  }
}

