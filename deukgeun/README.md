# 득근득근 프로젝트

## 프로젝트 개요

득근득근은 헬스장 찾기, 머신 가이드, 커뮤니티, 운동 기록일지 기능을 제공하는 종합 헬스 관리 플랫폼입니다.

## 기술 스택

### Frontend

- **React 19** - 최신 React 버전
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **CSS Modules** - 스타일링
- **React Router DOM** - 라우팅
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태 관리

### Backend

- **Node.js** - 런타임 환경
- **Express** - 웹 프레임워크
- **TypeORM** - ORM
- **MySQL** - 데이터베이스
- **JWT** - 인증
- **bcrypt** - 비밀번호 해싱

## 프로젝트 구조

```
deukgeun/
├── src/
│   ├── frontend/          # React 프론트엔드
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── features/      # 기능별 모듈
│   │   ├── widgets/       # 재사용 가능한 위젯
│   │   ├── shared/        # 공유 컴포넌트 및 유틸리티
│   │   └── script/        # Node.js 스크립트
│   └── backend/           # Express 백엔드
│       ├── controllers/   # 컨트롤러
│       ├── services/      # 비즈니스 로직
│       ├── entities/      # TypeORM 엔티티
│       ├── routes/        # 라우터
│       └── middlewares/   # 미들웨어
├── public/                # 정적 파일
└── data/                  # 데이터 파일
```

## 설치 및 실행

### 1. 의존성 설치

```bash
# 루트 의존성 설치
npm install

# 백엔드 의존성 설치
cd src/backend && npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Backend
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=deukgeun_db
JWT_SECRET=your_jwt_secret

# Frontend
VITE_BACKEND_URL=http://localhost:5000
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_key
VITE_GYM_API_KEY=your_seoul_openapi_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

### 3. 데이터베이스 설정

MySQL 데이터베이스를 생성하고 연결 정보를 환경 변수에 설정하세요.

### 4. 개발 서버 실행

```bash
# 프론트엔드만 실행
npm run dev:frontend

# 백엔드만 실행
npm run dev:backend

# 프론트엔드와 백엔드 동시 실행
npm run dev:all
```

## TypeScript 설정

### 프론트엔드 TypeScript 설정

프론트엔드는 Vite와 통합된 TypeScript 설정을 사용합니다:

- **JSX**: `react-jsx` 모드 사용
- **모듈 해석**: Vite의 alias 설정과 일치하는 paths 설정
- **타입 체크**: `npm run build:type-check`로 실행

### 스크립트 TypeScript 설정

Node.js 환경에서 실행되는 스크립트들은 별도의 TypeScript 설정을 사용합니다:

- **모듈**: CommonJS 사용
- **환경변수**: `process.env` 사용 (Vite 환경변수 대신)
- **빌드**: `npm run build:scripts`로 실행

## 스크립트 실행

### 헬스장 데이터 관련 스크립트

```bash
# 헬스장 데이터 저장
npm run script:save-gym-data

# 헬스장 데이터베이스 업데이트
npm run script:update-gym-db
```

### 레벨 시스템 관련 스크립트

```bash
# 레벨 시스템 테이블 생성
cd src/backend && npm run create-level-tables
```

## 주요 기능

### 1. 헬스장 찾기

- 카카오맵 API를 활용한 위치 기반 헬스장 검색
- 필터링 및 정렬 기능
- 상세 정보 제공

### 2. 머신 가이드

- 운동 기구별 상세 가이드
- 운동 효과 및 주의사항
- 동영상 가이드

### 3. 커뮤니티

- 게시글 작성 및 조회
- 댓글 기능
- 좋아요 기능
- 레벨 시스템 연동

### 4. 레벨 시스템

- 경험치 기반 레벨링
- 다양한 액션에 대한 EXP 보상
- 리워드 시스템
- 마일스톤 및 업적

### 5. 운동 기록일지

- 개인 운동 기록 관리
- 운동 통계 및 분석
- 목표 설정 및 달성 추적

## API 문서

### 인증 API

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 헬스장 API

- `GET /api/gyms` - 헬스장 목록 조회
- `GET /api/gyms/:id` - 헬스장 상세 정보
- `POST /api/gyms/bulk-update` - 헬스장 데이터 일괄 업데이트

### 커뮤니티 API

- `GET /api/posts` - 게시글 목록
- `POST /api/posts` - 게시글 작성
- `GET /api/posts/:id` - 게시글 상세
- `POST /api/posts/:id/comments` - 댓글 작성
- `POST /api/posts/:id/likes` - 좋아요

### 레벨 시스템 API

- `GET /api/level/progress` - 사용자 레벨 정보
- `POST /api/level/actions` - 액션 수행 및 EXP 획득
- `GET /api/level/rewards` - 사용자 리워드 목록
- `GET /api/level/leaderboard` - 리더보드

## 개발 가이드

### 코드 스타일

- TypeScript strict 모드 사용
- ESLint + Prettier 설정
- 함수형 프로그래밍 지향
- 컴포넌트 기반 아키텍처

### 폴더 구조 규칙

- 기능별로 폴더 분리
- 공통 컴포넌트는 shared 폴더에 배치
- 페이지별 컴포넌트는 pages 폴더에 배치

### 환경 분리

- 프론트엔드: Vite 환경변수 사용 (`import.meta.env`)
- 백엔드: Node.js 환경변수 사용 (`process.env`)
- 스크립트: 별도 환경변수 설정 파일 사용

## 배포

### 프론트엔드 배포

```bash
npm run build
```

### 백엔드 배포

```bash
cd src/backend && npm run build
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
