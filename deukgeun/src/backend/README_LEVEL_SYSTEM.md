# 레벨 시스템 구현 가이드

## 개요

이 문서는 헬스장 커뮤니티 앱에 구현된 레벨 시스템에 대한 설명입니다.

## 기능

### 1. 레벨 시스템

- **레벨 범위**: 1-100
- **경험치 곡선**: 하이브리드 모델 (선형 → 지수 → 로그)
- **최대 레벨**: 100

### 2. 경험치 획득 액션

- **게시글 작성**: 20 EXP (5분 쿨다운, 최소 50자)
- **댓글 작성**: 5 EXP (1분 쿨다운, 최소 10자)
- **좋아요**: 2 EXP (5초 쿨다운)
- **미션 완료**: 30 EXP (24시간 쿨다운)
- **운동 로그**: 15 EXP (1시간 쿨다운)
- **헬스장 방문**: 25 EXP (24시간 쿨다운)

### 3. 보상 시스템

- **레벨 5**: 초보자 뱃지 🥉
- **레벨 10**: 프리미엄 게시판 접근
- **레벨 20**: 중급자 뱃지 🥈
- **레벨 30**: 1000 포인트 보너스
- **레벨 50**: 전문가 뱃지 🥇
- **레벨 100**: 마스터 뱃지 👑

### 4. 마일스톤 시스템

- **연속 로그인**: 7, 30, 100, 365일
- **연속 운동**: 7, 30, 100일
- **누적 경험치**: 1K, 5K, 10K, 50K, 100K
- **업적**: 첫 게시글, 도움되는 사용자, 헬스장 탐험가

## 데이터베이스 스키마

### 1. user_levels

```sql
CREATE TABLE user_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  level INT DEFAULT 1,
  currentExp INT DEFAULT 0,
  totalExp INT DEFAULT 0,
  seasonExp INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. exp_history

```sql
CREATE TABLE exp_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  actionType VARCHAR(50) NOT NULL,
  expGained INT NOT NULL,
  source VARCHAR(100) NOT NULL,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. user_rewards

```sql
CREATE TABLE user_rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  rewardType VARCHAR(50) NOT NULL,
  rewardId VARCHAR(100) NOT NULL,
  claimedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NULL,
  metadata JSON,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. milestones

```sql
CREATE TABLE milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  milestoneType VARCHAR(50) NOT NULL,
  milestoneId VARCHAR(100) NOT NULL,
  achievedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. user_streaks

```sql
CREATE TABLE user_streaks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  streakType VARCHAR(50) NOT NULL,
  currentCount INT DEFAULT 0,
  lastActivity TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## API 엔드포인트

### 사용자 진행률

- `GET /api/level/user/:userId` - 사용자 레벨 정보 조회
- `GET /api/level/user/:userId/progress` - 사용자 진행률 조회
- `GET /api/level/user/:userId/rewards` - 사용자 보상 목록 조회

### 경험치 관리

- `POST /api/level/exp/grant` - 경험치 부여
- `GET /api/level/cooldown/:actionType/:userId` - 쿨다운 상태 확인

### 리더보드

- `GET /api/level/leaderboard/global` - 전체 리더보드
- `GET /api/level/leaderboard/season/:seasonId` - 시즌 리더보드

### 관리자 기능

- `PUT /api/level/admin/config` - 레벨 설정 업데이트
- `POST /api/level/admin/reset/:userId` - 사용자 진행률 리셋
- `GET /api/level/admin/stats` - 시스템 통계 조회

## 설치 및 설정

### 1. 데이터베이스 테이블 생성

```bash
cd deukgeun/src/backend
npm run ts-node scripts/createLevelTables.ts
```

### 2. 서버 시작

```bash
npm run dev
```

### 3. 프론트엔드 실행

```bash
cd deukgeun/src/frontend
npm run dev
```

## 사용법

### 백엔드에서 경험치 부여

```typescript
import { LevelService } from "../services/levelService";

const levelService = new LevelService();

// 게시글 작성 시 경험치 부여
await levelService.grantExp(userId, "post", "post_creation", {
  postId: 123,
  title: "게시글 제목",
});
```

### 프론트엔드에서 레벨 정보 표시

```typescript
import { useLevel } from "@shared/hooks/useLevel";
import { LevelDisplay } from "@shared/components/LevelDisplay";

function MyComponent() {
  const { currentLevel, currentExp, progressPercentage } = useLevel();

  return <LevelDisplay showProgress={true} showRewards={false} />;
}
```

## 보안 기능

### 1. 인증 및 권한

- 모든 API 엔드포인트는 JWT 토큰 인증 필요
- 사용자는 자신의 정보만 조회 가능
- 관리자만 설정 변경 및 통계 조회 가능

### 2. Rate Limiting

- 일반 API: 60초당 30회
- 경험치 부여: 60초당 10회
- 관리자 API: 60초당 5회

### 3. 데이터 검증

- 서버 사이드 경험치 계산
- 쿨다운 검증
- 일일 경험치 한도 (500 EXP)
- 입력 데이터 검증

### 4. 감사 로그

- 모든 경험치 부여 기록
- 보상 지급 이력
- 보안 이벤트 로깅

## 성능 최적화

### 1. 캐싱

- 사용자 레벨 정보 캐싱
- 리더보드 캐싱
- 쿼리 결과 캐싱

### 2. 데이터베이스 최적화

- 적절한 인덱스 설정
- 파티셔닝 (월별)
- 아카이빙 (12개월 후)

### 3. 비동기 처리

- 경험치 부여 비동기 처리
- 보상 지급 비동기 처리
- 마일스톤 체크 비동기 처리

## 모니터링

### 1. 로깅

- 경험치 부여 로그
- 레벨업 로그
- 보상 지급 로그
- 오류 로그

### 2. 메트릭

- 일일 활성 사용자
- 평균 레벨
- 총 경험치 부여량
- 보상 지급 통계

## 확장 계획

### Phase 1 (완료)

- [x] 기본 레벨 시스템
- [x] 경험치 부여 시스템
- [x] 기본 보상 시스템
- [x] API 엔드포인트

### Phase 2 (예정)

- [ ] 마일스톤 시스템 완성
- [ ] 스트릭 추적 시스템
- [ ] 시즌 시스템
- [ ] 리더보드 구현

### Phase 3 (예정)

- [ ] 성능 최적화
- [ ] 고급 보안 기능
- [ ] 모니터링 시스템
- [ ] A/B 테스트

## 문제 해결

### 일반적인 문제들

1. **경험치가 부여되지 않음**

   - 쿨다운 확인
   - 일일 한도 확인
   - 로그 확인

2. **레벨업이 되지 않음**

   - 경험치 계산 확인
   - 데이터베이스 연결 확인

3. **보상이 지급되지 않음**
   - 보상 조건 확인
   - 중복 지급 방지 확인

### 로그 확인

```bash
# 서버 로그 확인
tail -f logs/app.log

# 데이터베이스 로그 확인
tail -f logs/database.log
```

## 문의 및 지원

레벨 시스템 관련 문의사항이 있으시면 개발팀에 연락해주세요.
