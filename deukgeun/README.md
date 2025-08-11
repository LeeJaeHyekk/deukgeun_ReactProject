# 득근득근 (DeukGeun) - 종합 헬스 관리 플랫폼

<div align="center">

![득근득근 로고](public/img/logo.png)

**헬스장 찾기 • 운동 가이드 • 커뮤니티 • 운동 기록일지**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [환경 변수 설정](#환경-변수-설정)
- [API 문서](#api-문서)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [개발 가이드](#개발-가이드)
- [배포 가이드](#배포-가이드)
- [기여하기](#기여하기)

## 🎯 프로젝트 개요

득근득근은 헬스장 찾기, 운동 기구 가이드, 커뮤니티, 운동 기록일지를 통합한 종합 헬스 관리 플랫폼입니다. 사용자들이 효율적으로 운동을 계획하고 관리할 수 있도록 도와주는 웹 애플리케이션입니다.

### 핵심 가치

- **편의성**: 위치 기반 헬스장 검색 및 상세 정보 제공
- **교육**: 운동 기구별 상세 가이드 및 사용법 안내
- **소통**: 헬스 애호가들을 위한 커뮤니티 플랫폼
- **기록**: 개인 운동 기록 및 통계 분석
- **동기부여**: 레벨 시스템과 보상 체계를 통한 지속적인 동기부여

## ✨ 주요 기능

### 🏋️ 헬스장 찾기

- **카카오맵 API** 기반 위치 서비스
- **실시간 위치 기반** 헬스장 검색
- **필터링 및 정렬** 기능 (거리, 평점, 시설 등)
- **상세 정보** 제공 (운영시간, 시설, 가격 등)
- **즐겨찾기** 및 방문 기록 관리

### 📚 운동 기구 가이드

- **100+ 운동 기구** 상세 가이드
- **동영상 및 이미지** 기반 사용법 안내
- **운동 효과** 및 **주의사항** 설명
- **난이도별** 운동 가이드
- **개인 맞춤** 운동 추천

### 💬 커뮤니티

- **게시글 작성/조회** 기능
- **댓글 및 좋아요** 시스템
- **레벨 시스템** 연동
- **사용자 프로필** 관리
- **실시간 알림** 기능

### 📊 운동 기록일지

- **운동 세션** 관리 (시작/종료/세트 기록)
- **운동 목표** 설정 및 진행 상황 추적
- **개인 통계** 및 분석 (주간/월간/연간)
- **운동 알림** 설정
- **진행 상황** 시각화

### 🏆 레벨 시스템

- **경험치 기반** 레벨링 (1-100 레벨)
- **다양한 액션**에 대한 EXP 보상
- **보상 시스템** (뱃지, 포인트, 특별 권한)
- **마일스톤** 및 업적 시스템
- **리더보드** 및 경쟁 요소

## 🛠 기술 스택

### Frontend

| 기술                 | 버전     | 용도                     |
| -------------------- | -------- | ------------------------ |
| **React**            | 18.2.0   | UI 라이브러리            |
| **TypeScript**       | 5.2.2    | 타입 안전성              |
| **Vite**             | 5.0.0    | 빌드 도구 및 개발 서버   |
| **React Router DOM** | 6.20.1   | 클라이언트 사이드 라우팅 |
| **Zustand**          | 4.4.7    | 상태 관리                |
| **TanStack Query**   | 5.17.9   | 서버 상태 관리           |
| **Axios**            | 1.6.2    | HTTP 클라이언트          |
| **Framer Motion**    | 10.16.16 | 애니메이션               |
| **GSAP**             | 3.12.2   | 고급 애니메이션          |
| **Lucide React**     | 0.294.0  | 아이콘 라이브러리        |
| **React Icons**      | 4.12.0   | 아이콘 라이브러리        |

### Backend

| 기술           | 버전   | 용도            |
| -------------- | ------ | --------------- | --- |
| **Node.js**    | 18+    | 런타임 환경     |
| **Express**    | 4.18.2 | 웹 프레임워크   |
| **TypeScript** | 4.9.5  | 타입 안전성     |
| **TypeORM**    | 0.2.45 | ORM             |
| **MySQL**      | 8.0+   | 데이터베이스    |
| **JWT**        | 9.0.2  | 인증            |
| **bcrypt**     | 6.0.0  | 비밀번호 해싱   |
| **Winston**    | 3.11.0 | 로깅            |
| **Helmet**     | 8.1.0  | 보안 미들웨어   |
| **Morgan**     | 1.10.1 | HTTP 요청 로깅  |
| **CORS**       | 2.8.5  | CORS 설정       |
| **Cheerio**    | 1.1.2  | 웹 스크래핑     | cd  |
| **Playwright** | 1.54.2 | 브라우저 자동화 |

### 개발 도구

| 도구             | 용도                 |
| ---------------- | -------------------- |
| **ESLint**       | 코드 린팅            |
| **Prettier**     | 코드 포맷팅          |
| **Concurrently** | 병렬 스크립트 실행   |
| **ts-node-dev**  | TypeScript 개발 서버 |

## 📁 프로젝트 구조

```
deukgeun/
├── 📁 src/
│   ├── 🎨 frontend/                 # React 프론트엔드
│   │   ├── 📁 pages/               # 페이지 컴포넌트
│   │   │   ├── 📁 auth/           # 인증 관련 페이지
│   │   │   ├── 📁 location/       # 헬스장 찾기 페이지
│   │   │   ├── 📁 MachineGuide/   # 운동 기구 가이드
│   │   │   ├── 📁 Community/      # 커뮤니티 페이지
│   │   │   ├── 📁 Mypage/         # 마이페이지
│   │   │   └── 📁 workoutjournal/ # 운동 기록일지
│   │   ├── 📁 features/            # 기능별 모듈
│   │   │   ├── 📁 auth/           # 인증 기능
│   │   │   ├── 📁 community/      # 커뮤니티 기능
│   │   │   └── 📁 workout/        # 운동 관련 기능
│   │   ├── 📁 shared/              # 공유 컴포넌트
│   │   │   ├── 📁 api/            # API 클라이언트
│   │   │   ├── 📁 components/     # 공통 컴포넌트
│   │   │   ├── 📁 contexts/       # React Context
│   │   │   ├── 📁 hooks/          # 커스텀 훅
│   │   │   ├── 📁 types/          # 타입 정의
│   │   │   └── 📁 ui/             # UI 컴포넌트
│   │   ├── 📁 widgets/             # 재사용 가능한 위젯
│   │   └── 📁 script/              # Node.js 스크립트
│   └── 🔧 backend/                  # Express 백엔드
│       ├── 📁 config/              # 설정 파일
│       ├── 📁 controllers/         # 컨트롤러
│       ├── 📁 services/            # 비즈니스 로직
│       ├── 📁 entities/            # TypeORM 엔티티
│       ├── 📁 routes/              # 라우터
│       ├── 📁 middlewares/         # 미들웨어
│       ├── 📁 scripts/             # 유틸리티 스크립트
│       ├── 📁 docs/                # API 문서
│       ├── 📁 types/               # 타입 정의
│       └── 📁 utils/               # 유틸리티 함수
├── 📁 public/                       # 정적 파일
│   ├── 📁 img/                     # 이미지 파일
│   ├── 📁 video/                   # 비디오 파일
│   └── 📁 fonts/                   # 폰트 파일
├── 📁 data/                         # 데이터 파일
└── 📄 package.json                  # 프로젝트 설정
```

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/deukgeun_ReactProject.git
cd deukgeun_ReactProject/deukgeun
```

### 2. 의존성 설치

```bash
# 루트 의존성 설치
npm install

# 백엔드 의존성 설치
cd src/backend && npm install

# 프론트엔드로 돌아가기
cd ../..
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# ===== Backend 환경 변수 =====
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=deukgeun_db

# JWT 설정
JWT_SECRET=your_super_secret_jwt_key_here

# 서버 설정
PORT=5000
NODE_ENV=development

# ===== Frontend 환경 변수 =====
# 백엔드 API URL
VITE_BACKEND_URL=http://localhost:5000

# 카카오맵 API 키
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_key

# 서울시 공공데이터 API 키
VITE_GYM_API_KEY=your_seoul_openapi_key

# Google reCAPTCHA 키
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 4. 데이터베이스 설정

#### MySQL 설치 및 설정

```bash
# MySQL 설치 (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server

# MySQL 설치 (macOS)
brew install mysql

# MySQL 설치 (Windows)
# https://dev.mysql.com/downloads/installer/ 에서 다운로드
```

#### 데이터베이스 생성

```sql
CREATE DATABASE deukgeun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'deukgeun_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON deukgeun_db.* TO 'deukgeun_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. 데이터베이스 테이블 생성

```bash
# 백엔드 디렉토리로 이동
cd src/backend

# 레벨 시스템 테이블 생성
npm run ts-node scripts/createLevelTables.ts

# 운동 일지 테이블 생성
npm run ts-node scripts/createWorkoutJournalTables.ts

# 테스트 사용자 생성
npm run ts-node scripts/setupTestUser.ts
```

### 6. 개발 서버 실행

```bash
# 프로젝트 루트로 이동
cd ../../

# 프론트엔드만 실행 (포트 5173)
npm run dev

# 백엔드만 실행 (포트 5000)
npm run backend:dev

# 프론트엔드와 백엔드 동시 실행
npm run dev:full
```

### 7. 브라우저에서 확인

- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:5000

## 🔧 스크립트 명령어

### 개발 관련

```bash
# 개발 서버 실행
npm run dev                    # 프론트엔드만
npm run backend:dev           # 백엔드만
npm run dev:full              # 전체

# 빌드
npm run build                 # 프론트엔드 빌드
npm run backend:build         # 백엔드 빌드

# 타입 체크
npm run build:type-check      # TypeScript 타입 체크

# 코드 품질
npm run lint                  # ESLint 검사
npm run lint:fix              # ESLint 자동 수정
npm run format                # Prettier 포맷팅
```

### 데이터베이스 관련

```bash
# 헬스장 데이터 크롤링
npm run ts-node scripts/gymCrawler.ts

# 헬스장 데이터 저장
npm run script:save-gym-data

# 헬스장 데이터베이스 업데이트
npm run script:update-gym-db

# 운동 기구 이미지 업데이트
npm run ts-node scripts/updateMachineImages.ts
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

## 📚 API 문서

### 인증 API

| 메서드 | 엔드포인트           | 설명             |
| ------ | -------------------- | ---------------- |
| `POST` | `/api/auth/register` | 회원가입         |
| `POST` | `/api/auth/login`    | 로그인           |
| `POST` | `/api/auth/logout`   | 로그아웃         |
| `GET`  | `/api/auth/me`       | 현재 사용자 정보 |

### 헬스장 API

| 메서드   | 엔드포인트      | 설명             |
| -------- | --------------- | ---------------- |
| `GET`    | `/api/gyms`     | 헬스장 목록 조회 |
| `GET`    | `/api/gyms/:id` | 헬스장 상세 정보 |
| `POST`   | `/api/gyms`     | 헬스장 등록      |
| `PUT`    | `/api/gyms/:id` | 헬스장 수정      |
| `DELETE` | `/api/gyms/:id` | 헬스장 삭제      |

### 운동 기구 API

| 메서드   | 엔드포인트          | 설명                |
| -------- | ------------------- | ------------------- |
| `GET`    | `/api/machines`     | 운동 기구 목록 조회 |
| `GET`    | `/api/machines/:id` | 운동 기구 상세 정보 |
| `POST`   | `/api/machines`     | 운동 기구 등록      |
| `PUT`    | `/api/machines/:id` | 운동 기구 수정      |
| `DELETE` | `/api/machines/:id` | 운동 기구 삭제      |

### 커뮤니티 API

| 메서드   | 엔드포인트       | 설명             |
| -------- | ---------------- | ---------------- |
| `GET`    | `/api/posts`     | 게시글 목록 조회 |
| `GET`    | `/api/posts/:id` | 게시글 상세 조회 |
| `POST`   | `/api/posts`     | 게시글 작성      |
| `PUT`    | `/api/posts/:id` | 게시글 수정      |
| `DELETE` | `/api/posts/:id` | 게시글 삭제      |

### 댓글 API

| 메서드   | 엔드포인트          | 설명           |
| -------- | ------------------- | -------------- |
| `GET`    | `/api/comments`     | 댓글 목록 조회 |
| `POST`   | `/api/comments`     | 댓글 작성      |
| `PUT`    | `/api/comments/:id` | 댓글 수정      |
| `DELETE` | `/api/comments/:id` | 댓글 삭제      |

### 레벨 시스템 API

| 메서드 | 엔드포인트                    | 설명             |
| ------ | ----------------------------- | ---------------- |
| `GET`  | `/api/level/user/:id`         | 사용자 레벨 정보 |
| `POST` | `/api/level/exp/grant`        | 경험치 부여      |
| `GET`  | `/api/level/leaderboard`      | 리더보드 조회    |
| `GET`  | `/api/level/user/:id/rewards` | 사용자 보상 목록 |

### 운동 일지 API

| 메서드 | 엔드포인트                                   | 설명           |
| ------ | -------------------------------------------- | -------------- |
| `POST` | `/api/workout-journal/sessions`              | 운동 세션 생성 |
| `GET`  | `/api/workout-journal/sessions`              | 운동 세션 목록 |
| `PUT`  | `/api/workout-journal/sessions/:id/complete` | 운동 세션 완료 |
| `POST` | `/api/workout-journal/sets`                  | 운동 세트 추가 |
| `POST` | `/api/workout-journal/goals`                 | 운동 목표 생성 |
| `GET`  | `/api/workout-journal/stats`                 | 운동 통계 조회 |

### 통계 API

| 메서드 | 엔드포인트            | 설명                 |
| ------ | --------------------- | -------------------- |
| `GET`  | `/api/stats/platform` | 플랫폼 기본 통계     |
| `GET`  | `/api/stats/detailed` | 상세 통계 (관리자용) |
| `GET`  | `/api/stats/user`     | 사용자 개인 통계     |

## 🗄 데이터베이스 스키마

### 주요 테이블

#### 사용자 관련

- `users` - 사용자 기본 정보
- `user_levels` - 사용자 레벨 정보
- `exp_history` - 경험치 획득 이력
- `user_rewards` - 사용자 보상
- `milestones` - 마일스톤 달성 기록
- `user_streaks` - 연속 활동 기록

#### 헬스장 관련

- `gyms` - 헬스장 정보
- `machines` - 운동 기구 정보

#### 커뮤니티 관련

- `posts` - 게시글
- `comments` - 댓글
- `likes` - 좋아요

#### 운동 일지 관련

- `workout_sessions` - 운동 세션
- `exercise_sets` - 운동 세트
- `workout_goals` - 운동 목표
- `workout_plans` - 운동 계획
- `workout_stats` - 운동 통계
- `workout_reminders` - 운동 알림

### 데이터베이스 다이어그램

```
users
├── user_levels
├── exp_history
├── user_rewards
├── milestones
├── user_streaks
├── posts
├── comments
├── likes
├── workout_sessions
│   └── exercise_sets
├── workout_goals
├── workout_plans
├── workout_stats
└── workout_reminders

gyms
└── machines
```

## 👨‍💻 개발 가이드

### 코드 스타일

- **TypeScript strict 모드** 사용
- **ESLint + Prettier** 설정 적용
- **함수형 프로그래밍** 지향
- **컴포넌트 기반** 아키텍처
- **명명 규칙**:
  - 컴포넌트: PascalCase
  - 함수/변수: camelCase
  - 파일명: kebab-case
  - 상수: UPPER_SNAKE_CASE

### 폴더 구조 규칙

- **기능별 폴더 분리**: 각 기능은 독립적인 폴더로 구성
- **공통 컴포넌트**: `shared/` 폴더에 배치
- **페이지 컴포넌트**: `pages/` 폴더에 배치
- **비즈니스 로직**: `services/` 폴더에 배치

### 환경 분리

- **프론트엔드**: Vite 환경변수 사용 (`import.meta.env`)
- **백엔드**: Node.js 환경변수 사용 (`process.env`)
- **스크립트**: 별도 환경변수 설정 파일 사용

### 보안 가이드라인

- **JWT 토큰** 기반 인증
- **bcrypt**를 사용한 비밀번호 해싱
- **입력 데이터 검증** 필수
- **SQL 인젝션 방지** (TypeORM 사용)
- **CORS 설정** 적용
- **Rate Limiting** 구현

### 성능 최적화

- **React.memo** 및 **useMemo** 적절히 사용
- **코드 스플리팅** 및 **지연 로딩** 적용
- **이미지 최적화** 및 **압축**
- **데이터베이스 인덱싱** 최적화
- **캐싱 전략** 구현

## 🚀 배포 가이드

### 프론트엔드 배포

#### Vercel 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

#### Netlify 배포

```bash
# 빌드
npm run build

# dist 폴더를 Netlify에 업로드
```

### 백엔드 배포

#### Docker 배포

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
# 이미지 빌드
docker build -t deukgeun-backend .

# 컨테이너 실행
docker run -p 5000:5000 deukgeun-backend
```

#### PM2 배포

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

### 환경 변수 설정

배포 환경에서는 다음 환경 변수들을 설정해야 합니다:

```env
# 프로덕션 환경 변수
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
```

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면 다음 단계를 따라주세요:

### 1. 프로젝트 포크

```bash
# 저장소 포크 후 클론
git clone https://github.com/your-username/deukgeun_ReactProject.git
cd deukgeun_ReactProject
```

### 2. 개발 브랜치 생성

```bash
# 새로운 기능 브랜치 생성
git checkout -b feature/amazing-feature

# 또는 버그 수정 브랜치
git checkout -b fix/bug-description
```

### 3. 개발 및 테스트

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev:full

# 테스트 실행
npm run lint
npm run build:type-check
```

### 4. 커밋 및 푸시

```bash
# 변경사항 커밋
git add .
git commit -m "feat: add amazing feature"

# 브랜치 푸시
git push origin feature/amazing-feature
```

### 5. Pull Request 생성

GitHub에서 Pull Request를 생성하고 다음 사항을 포함해주세요:

- **변경사항 설명**
- **테스트 결과**
- **스크린샷** (UI 변경 시)
- **관련 이슈 번호**

### 기여 가이드라인

- **코드 스타일** 준수
- **TypeScript 타입** 정의
- **테스트 코드** 작성
- **문서 업데이트**
- **커밋 메시지** 규칙 준수

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

## 📞 문의 및 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/deukgeun_ReactProject/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/your-username/deukgeun_ReactProject/discussions)
- **문의사항**: [이메일](mailto:your-email@example.com)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받아 개발되었습니다:

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [TypeORM](https://typeorm.io/)
- [Vite](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query)

---

<div align="center">

**득근득근과 함께 건강한 운동 라이프를 시작하세요! 💪**

</div>
