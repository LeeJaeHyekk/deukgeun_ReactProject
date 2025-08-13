# 데이터베이스 설정 및 초기화 가이드

## 개요

이 프로젝트는 중앙화된 타입 시스템과 설정 관리 구조로 개선되었습니다. 레벨 시스템이 통합된 새로운 데이터베이스 구조를 사용합니다.

## 🏗️ 새로운 아키텍처

### 중앙 타입 시스템
- `src/types/` - 모든 타입 정의의 중앙 저장소
- `src/config/` - 중앙화된 설정 관리
- 백엔드와 프론트엔드 간 타입 공유

### 레벨 시스템 통합
- 사용자 레벨 및 경험치 관리
- 보상 및 마일스톤 시스템
- 스트릭 추적 시스템

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 환경 변수 파일 복사
cp env.example .env

# 환경 변수 편집
nano .env
```

필수 환경 변수:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=deukgeun_db
JWT_SECRET=your-secret-key
```

### 2. 데이터베이스 초기화

```bash
# 데이터베이스 시드 실행 (초기 데이터 생성)
npm run db:seed

# 또는 데이터베이스 리셋 (기존 데이터 삭제 후 재생성)
npm run db:reset
```

### 3. 개발 서버 실행

```bash
# 백엔드만 실행
npm run backend:dev

# 프론트엔드만 실행
npm run dev

# 전체 개발 환경 실행
npm run dev:full
```

## 📊 데이터베이스 구조

### 핵심 테이블

#### Users (사용자)
- 기본 사용자 정보
- 계정 상태 및 보안 설정
- 레벨 시스템과 1:1 관계

#### UserLevels (사용자 레벨)
- 레벨 및 경험치 정보
- 시즌별 경험치 관리
- 레벨업 히스토리

#### ExpHistory (경험치 히스토리)
- 모든 경험치 획득 기록
- 액션 타입별 분류
- 레벨업 이벤트 추적

#### UserRewards (사용자 보상)
- 배지, 업적, 아이템 관리
- 보상 클레임 상태
- 만료 시간 관리

#### Milestones (마일스톤)
- 목표 달성 추적
- 다양한 마일스톤 타입
- 진행 상황 모니터링

#### UserStreaks (사용자 스트릭)
- 연속 활동 추적
- 최대 스트릭 기록
- 스트릭 브레이크 관리

## 🎯 테스트 계정

초기 데이터 생성 시 다음 테스트 계정이 생성됩니다:

| 이메일 | 비밀번호 | 역할 | 설명 |
|--------|----------|------|------|
| admin@deukgeun.com | admin123! | 관리자 | 시스템 관리자 |
| user1@test.com | user123! | 사용자 | 일반 사용자 1 |
| user2@test.com | user123! | 사용자 | 일반 사용자 2 |
| premium@test.com | premium123! | 사용자 | 프리미엄 사용자 |

## 🔧 스크립트 명령어

### 데이터베이스 관리
```bash
# 초기 데이터 생성
npm run db:seed

# 데이터베이스 리셋 (개발 환경)
npm run db:reset

# 데이터베이스 동기화
npm run db:sync
```

### 개발 도구
```bash
# 타입 체크
npm run build:type-check

# 린팅
npm run lint
npm run lint:fix

# 코드 포맷팅
npm run format
```

### 프로덕션 배포
```bash
# 빌드
npm run build
npm run backend:build

# PM2 관리
npm run pm2:start
npm run pm2:stop
npm run pm2:restart
npm run pm2:logs
```

## 🏆 레벨 시스템

### 경험치 획득 방법
- **운동 완료**: 50 EXP
- **운동 스트릭**: 25 EXP
- **목표 달성**: 100 EXP
- **게시글 작성**: 10 EXP
- **댓글 작성**: 5 EXP
- **좋아요 받음**: 2 EXP
- **일일 로그인**: 5 EXP
- **주간 챌린지**: 200 EXP
- **월간 마일스톤**: 500 EXP

### 레벨업 공식
```
필요 경험치 = 레벨 × 100
```

### 스트릭 보너스
- **운동 스트릭**: 최대 365일, 보너스 10 EXP
- **로그인 스트릭**: 최대 30일, 보너스 5 EXP
- **게시글 스트릭**: 최대 7일, 보너스 15 EXP
- **목표 스트릭**: 최대 12개, 보너스 50 EXP

## 🔒 보안 설정

### 비밀번호 정책
- 최소 8자
- 대문자, 소문자, 숫자, 특수문자 포함

### 인증 설정
- 최대 로그인 시도: 5회
- 계정 잠금 시간: 15분
- 세션 타임아웃: 24시간

### API 제한
- 요청 제한: 15분당 100회
- CORS 설정: 개발/프로덕션 환경별 관리

## 📁 프로젝트 구조

```
src/
├── types/                 # 중앙 타입 시스템
│   ├── index.ts          # 메인 타입 내보내기
│   ├── common.ts         # 공통 유틸리티 타입
│   ├── auth.ts           # 인증 관련 타입
│   ├── level.ts          # 레벨 시스템 타입
│   ├── workout.ts        # 워크아웃 관련 타입
│   └── ...
├── config/               # 중앙 설정 관리
│   └── index.ts          # 모든 설정 통합
├── backend/
│   ├── entities/         # 데이터베이스 엔티티
│   ├── controllers/      # API 컨트롤러
│   ├── services/         # 비즈니스 로직
│   └── scripts/          # 데이터베이스 스크립트
└── frontend/
    ├── shared/
    │   └── types/        # 프론트엔드 타입 (백엔드 타입 재사용)
    └── features/         # 기능별 컴포넌트
```

## 🐛 문제 해결

### 데이터베이스 연결 오류
```bash
# 데이터베이스 상태 확인
npm run db:sync

# 환경 변수 확인
echo $DB_HOST $DB_PORT $DB_USERNAME
```

### 타입 오류
```bash
# 타입 체크 실행
npm run build:type-check

# 린팅 실행
npm run lint
```

### 초기 데이터 문제
```bash
# 데이터베이스 완전 리셋
npm run db:reset
```

## 📈 모니터링

### 로그 확인
```bash
# PM2 로그
npm run pm2:logs

# 백엔드 로그
cd src/backend && npm run dev
```

### 성능 모니터링
- 데이터베이스 쿼리 로깅 (개발 환경)
- API 응답 시간 모니터링
- 메모리 사용량 추적

## 🔄 마이그레이션

기존 데이터베이스에서 새로운 구조로 마이그레이션:

1. **백업 생성**
```bash
mysqldump -u root -p deukgeun_db > backup.sql
```

2. **새로운 구조 적용**
```bash
npm run db:reset
```

3. **데이터 복원** (필요시)
```bash
mysql -u root -p deukgeun_db < backup.sql
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수 설정
2. 데이터베이스 연결 상태
3. 로그 파일
4. 타입 정의 일치성

---

**참고**: 이 가이드는 개발 환경을 기준으로 작성되었습니다. 프로덕션 환경에서는 적절한 보안 설정을 추가하세요.
