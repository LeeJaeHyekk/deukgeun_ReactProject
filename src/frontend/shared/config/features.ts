// ============================================================================
// 프론트엔드 기능별 설정
// ============================================================================

// 레벨 시스템 설정
export const levelConfig = {
  // 레벨별 필요 경험치 (기본 공식: level * 100)
  getRequiredExp: (level: number): number => level * 100,

  // 최대 레벨
  maxLevel: 100,

  // 경험치 획득 설정
  expGains: {
    login: 10,
    post: 50,
    comment: 20,
    like: 5,
    workout: 100,
    milestone: 200,
  },

  // 보상 설정
  rewards: {
    levelUp: {
      type: "badge",
      name: "Level Up",
      description: "레벨업 달성!",
    },
    milestone: {
      type: "achievement",
      name: "Milestone",
      description: "목표 달성!",
    },
  },
}

// 워크아웃 설정
export const workoutConfig = {
  // 기본 워크아웃 설정
  defaultSets: 3,
  defaultReps: 10,
  defaultWeight: 0,

  // 목표 설정
  goals: {
    strength: "strength",
    endurance: "endurance",
    muscle: "muscle",
    weightLoss: "weightLoss",
  },

  // 운동 강도 설정
  intensity: {
    low: 0.6,
    medium: 0.8,
    high: 1.0,
  },
}

// 커뮤니티 설정
export const communityConfig = {
  // 게시글 설정
  posts: {
    maxLength: 1000,
    maxImages: 5,
    maxTags: 10,
  },

  // 댓글 설정
  comments: {
    maxLength: 500,
    maxDepth: 3,
  },

  // 좋아요 설정
  likes: {
    maxPerUser: 100,
    cooldown: 1000, // 1초
  },
}

export default {
  level: levelConfig,
  workout: workoutConfig,
  community: communityConfig,
}
