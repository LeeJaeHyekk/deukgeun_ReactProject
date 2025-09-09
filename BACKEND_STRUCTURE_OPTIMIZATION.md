# Backend 구조 최적화 계획

## 🎯 목표

- Domain-driven Architecture 도입
- Clean Architecture 원칙 적용
- 확장성 및 유지보수성 향상

## 📁 최적화된 구조

```
src/backend/
├── app/                          # 애플리케이션 진입점
│   ├── app.ts
│   ├── index.ts
│   └── server.ts
├── config/                       # 설정 관리
│   ├── database.ts
│   ├── env.ts
│   ├── levelConfig.ts
│   └── index.ts
├── shared/                       # 공통 모듈
│   ├── middleware/               # 미들웨어
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── security.ts
│   │   └── index.ts
│   ├── utils/                    # 유틸리티
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   ├── recaptcha.ts
│   │   └── index.ts
│   ├── types/                    # 공통 타입
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── index.ts
│   └── constants/                # 공통 상수
│       └── index.ts
├── domains/                      # 도메인별 모듈
│   ├── auth/                     # 인증 도메인
│   │   ├── controllers/
│   │   │   └── authController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── accountRecoveryService.ts
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── VerificationToken.ts
│   │   │   └── PasswordResetToken.ts
│   │   ├── repositories/
│   │   │   └── userRepository.ts
│   │   ├── transformers/
│   │   │   └── userTransformer.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── routes/
│   │   │   └── auth.ts
│   │   └── index.ts
│   ├── community/                # 커뮤니티 도메인
│   │   ├── controllers/
│   │   │   ├── postController.ts
│   │   │   ├── commentController.ts
│   │   │   └── likeController.ts
│   │   ├── services/
│   │   │   ├── postService.ts
│   │   │   ├── commentService.ts
│   │   │   └── likeService.ts
│   │   ├── entities/
│   │   │   ├── Post.ts
│   │   │   ├── Comment.ts
│   │   │   └── Like.ts
│   │   ├── repositories/
│   │   │   ├── postRepository.ts
│   │   │   ├── commentRepository.ts
│   │   │   └── likeRepository.ts
│   │   ├── transformers/
│   │   │   ├── postTransformer.ts
│   │   │   ├── commentTransformer.ts
│   │   │   └── likeTransformer.ts
│   │   ├── types/
│   │   │   └── community.types.ts
│   │   ├── routes/
│   │   │   ├── post.ts
│   │   │   ├── comment.ts
│   │   │   └── like.ts
│   │   └── index.ts
│   ├── workout/                  # 운동 도메인
│   │   ├── controllers/
│   │   │   └── workoutController.ts
│   │   ├── services/
│   │   │   └── workoutService.ts
│   │   ├── entities/
│   │   │   ├── WorkoutSession.ts
│   │   │   ├── ExerciseSet.ts
│   │   │   ├── WorkoutPlan.ts
│   │   │   └── WorkoutStats.ts
│   │   ├── repositories/
│   │   │   └── workoutRepository.ts
│   │   ├── transformers/
│   │   │   ├── workoutSessionTransformer.ts
│   │   │   └── exerciseSetTransformer.ts
│   │   ├── types/
│   │   │   └── workout.types.ts
│   │   ├── routes/
│   │   │   └── workout.ts
│   │   └── index.ts
│   ├── machine/                  # 머신 도메인
│   │   ├── controllers/
│   │   │   └── machineController.ts
│   │   ├── services/
│   │   │   └── machineService.ts
│   │   ├── entities/
│   │   │   └── Machine.ts
│   │   ├── repositories/
│   │   │   └── machineRepository.ts
│   │   ├── transformers/
│   │   │   └── machineTransformer.ts
│   │   ├── types/
│   │   │   └── machine.types.ts
│   │   ├── routes/
│   │   │   └── machine.ts
│   │   └── index.ts
│   ├── gym/                      # 헬스장 도메인
│   │   ├── controllers/
│   │   │   └── gymController.ts
│   │   ├── services/
│   │   │   ├── gymService.ts
│   │   │   └── gymCrawlerService.ts
│   │   ├── entities/
│   │   │   └── Gym.ts
│   │   ├── repositories/
│   │   │   └── gymRepository.ts
│   │   ├── transformers/
│   │   │   └── gymTransformer.ts
│   │   ├── types/
│   │   │   └── gym.types.ts
│   │   ├── routes/
│   │   │   └── gym.ts
│   │   └── index.ts
│   ├── level/                    # 레벨 시스템 도메인
│   │   ├── controllers/
│   │   │   └── levelController.ts
│   │   ├── services/
│   │   │   └── levelService.ts
│   │   ├── entities/
│   │   │   ├── UserLevel.ts
│   │   │   ├── ExpHistory.ts
│   │   │   └── UserReward.ts
│   │   ├── repositories/
│   │   │   └── levelRepository.ts
│   │   ├── transformers/
│   │   │   ├── userLevelTransformer.ts
│   │   │   └── expHistoryTransformer.ts
│   │   ├── types/
│   │   │   └── level.types.ts
│   │   ├── routes/
│   │   │   └── level.ts
│   │   └── index.ts
│   └── stats/                    # 통계 도메인
│       ├── controllers/
│       │   └── statsController.ts
│       ├── services/
│       │   └── statsService.ts
│       ├── entities/
│       │   └── WorkoutStats.ts
│       ├── repositories/
│       │   └── statsRepository.ts
│       ├── transformers/
│       │   └── statsTransformer.ts
│       ├── types/
│       │   └── stats.types.ts
│       ├── routes/
│       │   └── stats.ts
│       └── index.ts
├── infrastructure/               # 인프라스트럭처
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── index.ts
│   ├── external/                 # 외부 서비스
│   │   ├── email/
│   │   │   └── emailService.ts
│   │   └── crawler/
│   │       └── crawlerService.ts
│   └── monitoring/
│       ├── logger.ts
│       └── performance.ts
├── scripts/                      # 스크립트 및 유틸리티
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── development/
│   │   └── testData.ts
│   └── deployment/
│       └── setup.ts
└── tests/                        # 테스트
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🔄 마이그레이션 계획

### 1단계: shared 폴더 생성

- 공통 미들웨어, 유틸리티, 타입 이동

### 2단계: domains 폴더 생성

- 도메인별로 모듈 분리
- 각 도메인에 완전한 구조 생성

### 3단계: infrastructure 폴더 생성

- 데이터베이스, 외부 서비스, 모니터링 분리

### 4단계: 기존 파일들 정리

- 중복 파일 제거
- import 경로 수정

## 📋 장점

1. **도메인 중심 설계**: 비즈니스 로직이 명확히 분리
2. **확장성**: 새로운 도메인 추가가 용이
3. **테스트 용이성**: 각 도메인별 독립적 테스트
4. **팀 협업**: 도메인별 개발자 분담 가능
5. **유지보수성**: 변경 영향 범위 최소화
