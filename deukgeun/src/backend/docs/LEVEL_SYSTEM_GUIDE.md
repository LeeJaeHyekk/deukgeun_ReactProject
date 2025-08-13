# 🎮 레벨링 시스템 가이드

## 📋 개요

레벨링 시스템은 사용자의 활동을 경험치로 변환하여 레벨업을 통해 성취감을 제공하고, 보상을 통해 지속적인 참여를 유도하는 시스템입니다.

## 🏗️ 시스템 구조

### 핵심 컴포넌트

1. **LevelService** - 레벨링 시스템의 핵심 비즈니스 로직
2. **UserLevel** - 사용자 레벨 정보 엔티티
3. **ExpHistory** - 경험치 획득 히스토리 엔티티
4. **UserReward** - 사용자 보상 엔티티
5. **levelConfig** - 시스템 설정 관리

### 데이터베이스 스키마

```sql
-- 사용자 레벨 정보
user_levels (
  id, userId, level, currentExp, totalExp, seasonExp, createdAt, updatedAt
)

-- 경험치 히스토리
exp_history (
  id, userId, actionType, expGained, source, metadata, createdAt
)

-- 사용자 보상
user_rewards (
  id, userId, rewardType, rewardId, metadata, claimedAt, expiresAt, createdAt
)
```

## ⚙️ 설정 관리

### 환경별 설정

시스템은 `NODE_ENV`에 따라 다른 설정을 적용합니다:

- **development**: 테스트용 짧은 쿨다운, 낮은 한도
- **production**: 실제 운영용 긴 쿨다운, 높은 한도

### 설정 파일 위치

```
src/backend/config/levelConfig.ts
```

## 🎯 경험치 시스템

### 경험치 획득 방법

| 액션        | 세부사항           | 경험치 | 쿨다운 |
| ----------- | ------------------ | ------ | ------ |
| 게시글 작성 | post_creation      | 20 EXP | 5분    |
| 댓글 작성   | comment_creation   | 5 EXP  | 1분    |
| 좋아요      | post_like          | 2 EXP  | 5초    |
| 운동 로그   | workout_log        | 15 EXP | 1시간  |
| 헬스장 방문 | gym_visit          | 25 EXP | 24시간 |
| 미션 완료   | mission_completion | 30 EXP | 24시간 |

### 레벨업 공식

```
필요 경험치 = 100 × (1.5 ^ (현재 레벨 - 1))
```

예시:

- 레벨 1 → 2: 100 EXP
- 레벨 2 → 3: 150 EXP
- 레벨 3 → 4: 225 EXP

## 🎁 보상 시스템

### 레벨별 보상

| 레벨 | 보상 타입 | 보상 내용            |
| ---- | --------- | -------------------- |
| 5    | 뱃지      | 🥉 초보자 뱃지       |
| 10   | 접근권한  | 프리미엄 게시판 접근 |
| 20   | 뱃지      | 🥈 중급자 뱃지       |
| 30   | 포인트    | 1000 포인트 보너스   |
| 50   | 뱃지      | 🥇 전문가 뱃지       |
| 100  | 뱃지      | 👑 마스터 뱃지       |

## 🛡️ 제한 시스템

### 쿨다운 시스템

각 액션별로 쿨다운 시간이 설정되어 중복 경험치 획득을 방지합니다.

### 일일 경험치 한도

- **개발환경**: 100 EXP/일
- **운영환경**: 500 EXP/일

## 🔧 API 사용법

### 경험치 부여

```typescript
// LevelService 사용
const levelService = new LevelService()
const result = await levelService.grantExp(userId, "post", "post_creation", {
  postId: 123,
  title: "게시글 제목",
})

// 결과 확인
if (result.success) {
  console.log(`경험치 획득: ${result.expGained} EXP`)
  if (result.leveledUp) {
    console.log(`레벨업! 레벨 ${result.level}`)
  }
  if (result.rewards) {
    console.log(`보상 획득: ${result.rewards.length}개`)
  }
} else {
  if (result.cooldownInfo?.isOnCooldown) {
    console.log(`쿨다운 중: ${result.cooldownInfo.remainingTime}ms`)
  }
  if (result.dailyLimitInfo && !result.dailyLimitInfo.withinLimit) {
    console.log(
      `일일 한도 초과: ${result.dailyLimitInfo.dailyExp}/${result.dailyLimitInfo.limit}`
    )
  }
}
```

### 레벨 정보 조회

```typescript
// 사용자 레벨 정보
const userLevel = await levelService.getUserLevel(userId)

// 레벨 진행률
const progress = await levelService.getLevelProgress(userId)
console.log(`레벨 ${progress.level}, 진행률 ${progress.progressPercentage}%`)

// 경험치 히스토리
const history = await levelService.getExpHistory(userId, 10)
```

## 🎨 프론트엔드 연동

### LevelDisplay 컴포넌트

```tsx
<LevelDisplay
  showProgress={true}
  showRewards={true}
  showCooldown={true}
  showDailyLimit={true}
/>
```

### useLevel 훅

```typescript
const {
  currentLevel,
  currentExp,
  progressPercentage,
  rewards,
  cooldownInfo,
  dailyLimitInfo,
  grantExp,
} = useLevel()

// 경험치 부여
const result = await grantExp("post", "post_creation", { postId: 123 })
```

## 🧪 테스트

### 테스트 스크립트 실행

```bash
# 레벨링 시스템 종합 테스트
npx ts-node scripts/testLevelSystemDirect.ts
```

### 테스트 항목

1. ✅ 기본 레벨 정보 조회
2. ✅ 경험치 부여 및 레벨업
3. ✅ 쿨다운 시스템 검증
4. ✅ 일일 한도 시스템 검증
5. ✅ 보상 시스템 검증
6. ✅ 데이터베이스 상태 검증

## 🔄 배포 시 고려사항

### 1. 환경 설정

운영 환경에서는 `NODE_ENV=production`으로 설정하여 적절한 쿨다운과 한도를 적용합니다.

### 2. 데이터베이스 마이그레이션

새로운 기능 추가 시 관련 테이블이 생성되었는지 확인:

```bash
npx ts-node scripts/syncDatabase.ts
```

### 3. 모니터링

- 경험치 부여 실패율 모니터링
- 레벨업 분포 분석
- 보상 수령률 추적

## 🚀 향후 개선 계획

1. **시즌 시스템** - 정기적인 리셋과 새로운 보상
2. **퀘스트 시스템** - 특별한 목표와 보상
3. **리더보드** - 사용자 간 경쟁 요소
4. **소셜 기능** - 친구와의 경험치 공유
5. **통계 대시보드** - 상세한 활동 분석

## 📞 지원

시스템 관련 문의사항이나 버그 리포트는 개발팀에 연락해주세요.

---

_마지막 업데이트: 2025-08-13_
