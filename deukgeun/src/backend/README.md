# Backend API 서버

## 개요

헬스장 찾기 및 운동 관리 서비스를 위한 Node.js + TypeScript + Express + TypeORM 백엔드 API 서버입니다.

## 주요 기능

- **인증 시스템**: JWT 기반 사용자 인증
- **헬스장 관리**: 헬스장 정보 CRUD 및 위치 기반 검색
- **운동 기구 관리**: 운동 기구 정보 및 사용법 가이드
- **커뮤니티**: 게시글, 댓글, 좋아요 기능
- **레벨 시스템**: 사용자 경험치 및 레벨 관리
- **운동 일지**: 운동 세션, 목표, 통계, 알림 관리
- **통계**: 사용자 활동 통계 및 분석

## 운동 일지 기능

### 주요 기능

- **운동 세션 관리**: 운동 시작/종료, 세트 기록
- **운동 목표 설정**: 목표 설정 및 진행 상황 추적
- **운동 통계**: 기간별 운동 통계 및 분석
- **운동 진행 상황**: 운동별 진행 상황 및 개인 기록
- **운동 알림**: 운동 시간 알림 설정

### 데이터베이스 테이블

- `workout_sessions`: 운동 세션 정보
- `exercise_sets`: 운동 세트 정보
- `workout_goals`: 운동 목표 정보
- `workout_plans`: 운동 계획 정보
- `workout_plan_exercises`: 운동 계획별 운동 정보
- `workout_stats`: 운동 통계 정보
- `workout_progress`: 운동 진행 상황 정보
- `workout_reminders`: 운동 알림 정보

### API 엔드포인트

- `POST /api/workout-journal/sessions`: 운동 세션 생성
- `GET /api/workout-journal/sessions`: 운동 세션 목록 조회
- `GET /api/workout-journal/sessions/:id`: 운동 세션 상세 조회
- `PUT /api/workout-journal/sessions/:id/complete`: 운동 세션 완료
- `POST /api/workout-journal/sets`: 운동 세트 추가
- `POST /api/workout-journal/goals`: 운동 목표 생성
- `GET /api/workout-journal/goals`: 운동 목표 목록 조회
- `PUT /api/workout-journal/goals/:id`: 운동 목표 업데이트
- `GET /api/workout-journal/stats`: 운동 통계 조회
- `GET /api/workout-journal/progress`: 운동 진행 상황 조회
- `POST /api/workout-journal/reminders`: 운동 알림 생성
- `GET /api/workout-journal/reminders`: 운동 알림 목록 조회
- `PUT /api/workout-journal/reminders/:id`: 운동 알림 업데이트
- `DELETE /api/workout-journal/reminders/:id`: 운동 알림 삭제
- `GET /api/workout-journal/summary`: 사용자 운동 요약 통계

자세한 API 문서는 [WORKOUT_JOURNAL_API.md](docs/WORKOUT_JOURNAL_API.md)를 참조하세요.

## 기술 스택

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: MySQL
- **Authentication**: JWT
- **Validation**: Joi
- **Testing**: Jest

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=3001
NODE_ENV=development

# Kakao API
KAKAO_API_KEY=your_kakao_api_key

# Google reCAPTCHA
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### 3. 데이터베이스 설정

```bash
# 데이터베이스 연결 테스트
npm run test-connection

# 운동 일지 테이블 생성
npm run ts-node scripts/createWorkoutJournalTables.ts
```

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## API 엔드포인트

### 인증

- `POST /api/auth/register`: 회원가입
- `POST /api/auth/login`: 로그인
- `POST /api/auth/logout`: 로그아웃
- `GET /api/auth/me`: 현재 사용자 정보

### 헬스장

- `GET /api/gyms`: 헬스장 목록 조회
- `GET /api/gyms/:id`: 헬스장 상세 조회
- `POST /api/gyms`: 헬스장 등록
- `PUT /api/gyms/:id`: 헬스장 수정
- `DELETE /api/gyms/:id`: 헬스장 삭제

### 운동 기구

- `GET /api/machines`: 운동 기구 목록 조회
- `GET /api/machines/:id`: 운동 기구 상세 조회
- `POST /api/machines`: 운동 기구 등록
- `PUT /api/machines/:id`: 운동 기구 수정
- `DELETE /api/machines/:id`: 운동 기구 삭제

### 커뮤니티

- `GET /api/posts`: 게시글 목록 조회
- `GET /api/posts/:id`: 게시글 상세 조회
- `POST /api/posts`: 게시글 작성
- `PUT /api/posts/:id`: 게시글 수정
- `DELETE /api/posts/:id`: 게시글 삭제

### 댓글

- `GET /api/comments`: 댓글 목록 조회
- `POST /api/comments`: 댓글 작성
- `PUT /api/comments/:id`: 댓글 수정
- `DELETE /api/comments/:id`: 댓글 삭제

### 좋아요

- `POST /api/likes`: 좋아요 추가
- `DELETE /api/likes/:id`: 좋아요 삭제

### 레벨 시스템

- `GET /api/level/user/:id`: 사용자 레벨 정보
- `POST /api/level/exp`: 경험치 추가

### 통계

- `GET /api/stats/user/:id`: 사용자 통계
- `GET /api/stats/gym/:id`: 헬스장 통계

## 스크립트

### 데이터베이스 관련

```bash
# 데이터베이스 연결 테스트
npm run test-connection

# 헬스장 데이터 크롤링
npm run ts-node scripts/gymCrawler.ts

# 운동 기구 이미지 업데이트
npm run ts-node scripts/updateMachineImages.ts

# 운동 일지 테이블 생성
npm run ts-node scripts/createWorkoutJournalTables.ts
```

### 테스트 관련

```bash
# 보안 테스트
npm run ts-node scripts/testSecurity.ts

# 통계 테스트
npm run ts-node scripts/testStats.ts

# 타입 안전성 테스트
npm run ts-node scripts/testTypeSafety.ts
```

## 프로젝트 구조

```
src/backend/
├── config/           # 설정 파일
├── controllers/      # 컨트롤러
├── entities/         # 데이터베이스 엔티티
├── middlewares/      # 미들웨어
├── routes/           # 라우터
├── services/         # 비즈니스 로직
├── scripts/          # 유틸리티 스크립트
├── types/            # 타입 정의
├── utils/            # 유틸리티 함수
└── docs/             # 문서
```

## 보안

- JWT 기반 인증
- 비밀번호 해싱 (bcrypt)
- 입력 데이터 검증
- SQL 인젝션 방지 (TypeORM)
- CORS 설정
- Rate Limiting

## 에러 처리

- 전역 에러 핸들러
- 사용자 친화적 에러 메시지
- 로깅 시스템

## 로깅

- 개발 환경: 콘솔 로그
- 프로덕션 환경: 파일 로그

## 테스트

```bash
# 단위 테스트
npm test

# 통합 테스트
npm run test:integration
```

## 배포

### Docker

```bash
# 이미지 빌드
docker build -t backend .

# 컨테이너 실행
docker run -p 3001:3001 backend
```

### PM2

```bash
# PM2 설치
npm install -g pm2

# 애플리케이션 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs
```

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
