// 레벨 시스템 설정
export const levelConfig = {
  // 레벨별 필요 경험치
  expRequirements: [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000,
    9300, 10700, 12200, 13800, 15500, 17300, 19200, 21200, 23300, 25500, 27800,
    30200, 32700, 35300, 38000, 40800, 43700, 46700, 49800, 53000, 56300, 59700,
    63200, 66800, 70500, 74300, 78200, 82200, 86300, 90500, 94800, 99200,
    103700, 108300, 113000, 117800, 122700, 127700, 132800, 138000, 143300,
    148700, 154200, 159800, 165500, 171300, 177200, 183200, 189300, 195500,
    201800, 208200, 214700, 221300, 228000, 234800, 241700, 248700, 255800,
    263000, 270300, 277700, 285200, 292800, 300500, 308300, 316200, 324200,
    332300, 340500, 348800, 357200, 365700, 374300, 383000, 391800, 400700,
    409700, 418800, 428000, 437300, 446700, 456200, 465800, 475500, 485300,
    495200, 505200, 515300, 525500, 535800, 546200, 556700, 567300, 578000,
    588800,
  ],

  // 레벨별 보상
  levelRewards: {
    expBonus: 1.1, // 경험치 보너스
    badgeRewards: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50], // 배지 보상 레벨
  },

  // 스트릭 보너스
  streakBonuses: {
    daily: 10,
    weekly: 50,
    monthly: 200,
  },
}

// 레벨 설정 가져오기 함수
export const getLevelConfig = () => levelConfig

// 특정 레벨의 필요 경험치 가져오기
export const getExpRequired = (level: number) => {
  if (level < 1 || level > levelConfig.expRequirements.length) {
    return 0
  }
  return levelConfig.expRequirements[level - 1]
}

// 현재 레벨에서 다음 레벨까지 필요한 경험치
export const getExpToNextLevel = (currentLevel: number, currentExp: number) => {
  const nextLevelExp = getExpRequired(currentLevel + 1)
  return Math.max(0, nextLevelExp - currentExp)
}

// 경험치로 레벨 계산
export const calculateLevel = (exp: number) => {
  for (let level = levelConfig.expRequirements.length; level > 0; level--) {
    if (exp >= levelConfig.expRequirements[level - 1]) {
      return level
    }
  }
  return 1
}
