# 🏋️ Deukgeun - 헬스장 운동 가이드 플랫폼

> **Deukgeun**은 헬스장에서 운동하는 사람들을 위한 종합적인 운동 가이드 플랫폼입니다. 머신 사용법, 운동 목표 설정, 커뮤니티 기능을 제공하여 효과적인 운동을 도와줍니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [개발 환경 설정](#개발-환경-설정)
- [데이터베이스 설정](#데이터베이스-설정)
- [API 문서](#api-문서)
- [테스트](#테스트)
- [배포](#배포)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 🎯 프로젝트 개요

Deukgeun은 다음과 같은 문제를 해결합니다:

- **헬스장 초보자의 어려움**: 머신 사용법을 모르는 사용자를 위한 상세한 가이드
- **운동 목표 관리**: 개인별 운동 목표 설정 및 진행 상황 추적
- **커뮤니티 형성**: 운동 애호가들이 정보를 공유하고 소통할 수 있는 공간
- **위치 기반 서비스**: 주변 헬스장 찾기 및 정보 제공

## ✨ 주요 기능

### 🏋️ 머신 가이드
- **상세한 머신 설명**: 각 운동 머신의 사용법과 효과 설명
- **이미지 및 동영상**: 시각적 학습 자료 제공
- **난이도별 분류**: 초급, 중급, 고급 난이도 구분
- **카테고리별 분류**: 유산소, 근력, 유연성 등 카테고리별 정리

### 🎯 운동 목표 관리
- **목표 설정**: 체중, 횟수, 시간 등 다양한 목표 유형 지원
- **진행 상황 추적**: 실시간 목표 달성률 확인
- **데드라인 설정**: 목표 완료 기한 설정 및 알림
- **성취 기록**: 목표 달성 시 성취감을 위한 기록 시스템

### 🌍 커뮤니티
- **운동 팁 공유**: 사용자들의 운동 경험과 팁 공유
- **질문과 답변**: 운동 관련 질문과 답변 게시판
- **카테고리별 게시판**: 운동루틴, 팁, 다이어트 등 주제별 분류
- **좋아요 및 댓글**: 상호작용 기능

### 📍 위치 기반 서비스
- **헬스장 찾기**: 주변 헬스장 검색 및 정보 제공
- **카카오맵 연동**: 정확한 위치 정보와 길찾기 기능
- **헬스장 정보**: 운영시간, 시설 정보 등 상세 정보

### 🏆 레벨 시스템
- **경험치 시스템**: 운동 활동에 따른 경험치 획득
- **레벨업**: 경험치에 따른 레벨 상승
- **업적 시스템**: 다양한 업적 달성 및 보상
- **시즌 시스템**: 정기적인 시즌 리셋으로 지속적인 동기부여

## 🛠 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안정성 확보
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **React Router** - 클라이언트 사이드 라우팅
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트

### Backend
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안정성 확보
- **TypeORM** - 객체 관계 매핑
- **MySQL** - 관계형 데이터베이스
- **JWT** - 인증 토큰 관리
- **bcrypt** - 비밀번호 해싱

### DevOps & Tools
- **PM2** - 프로세스 관리
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Vitest** - 테스트 프레임워크
- **Docker** - 컨테이너화 (준비 중)

## 📁 프로젝트 구조

```
deukgeun/
├── src/
│   ├── frontend/                 # 프론트엔드 소스 코드
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── features/            # 기능별 모듈
│   │   ├── shared/              # 공통 컴포넌트 및 유틸리티
│   │   ├── widgets/             # 재사용 가능한 위젯
│   │   └── entities/            # 도메인 엔티티
│   ├── backend/                 # 백엔드 소스 코드
│   │   ├── controllers/         # API 컨트롤러
│   │   ├── services/            # 비즈니스 로직
│   │   ├── entities/            # 데이터베이스 엔티티
│   │   ├── routes/              # API 라우트
│   │   ├── middlewares/         # 미들웨어
│   │   └── utils/               # 유틸리티 함수
│   ├── types/                   # 공통 타입 정의
│   └── shared/                  # 프론트엔드/백엔드 공통 코드
├── public/                      # 정적 파일
├── scripts/                     # 유틸리티 스크립트
└── docs/                        # 문서
```

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- MySQL 8.0 이상
- Git

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
cd src/backend
npm install
cd ../..
```

### 3. 환경 변수 설정
```bash
# 루트 .env 파일 생성
cp env.example .env

# 백엔드 .env 파일 생성
cp src/backend/env.example src/backend/.env
```

### 4. 데이터베이스 설정
```bash
# 데이터베이스 동기화
npm run db:sync

# 초기 데이터 시드
npm run db:seed
```

### 5. 개발 서버 실행
```bash
# 백엔드 서버 실행 (포트 5000)
npm run backend:dev

# 프론트엔드 서버 실행 (포트 5173)
npm run dev

# 또는 동시 실행
npm run dev:full
```

## ⚙️ 개발 환경 설정

### 환경 변수 설정

#### 루트 .env
```env
# 프론트엔드 포트
FRONTEND_PORT=5173

# 백엔드 URL
VITE_BACKEND_URL=http://localhost:5000

# 카카오맵 API 키
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_map_js_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_map_rest_key

# 헬스장 API 키
VITE_GYM_API_KEY=your_gym_api_key

# reCAPTCHA 사이트 키
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

#### 백엔드 .env
```env
# 서버 설정
PORT=5000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=deukgeun_db

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# CORS 설정
CORS_ORIGIN=http://localhost:5173

# 이메일 설정 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

### 개발 도구 설정

#### VS Code 확장 프로그램
- TypeScript Importer
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag

#### Git Hooks
```bash
# Husky 설정 (선택사항)
npm install -g husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## 🗄️ 데이터베이스 설정

### MySQL 설치 및 설정
```sql
-- 데이터베이스 생성
CREATE DATABASE deukgeun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 및 권한 부여
CREATE USER 'deukgeun_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON deukgeun_db.* TO 'deukgeun_user'@'localhost';
FLUSH PRIVILEGES;
```

### 데이터베이스 마이그레이션
```bash
# 스키마 동기화
npm run db:sync

# 초기 데이터 삽입
npm run db:seed

# 테스트 데이터 생성
npm run setup:test-user
```

## 📚 API 문서

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### 머신 API
- `GET /api/machines` - 머신 목록 조회
- `GET /api/machines/:id` - 머신 상세 정보
- `GET /api/machines/category/:category` - 카테고리별 머신 조회

### 운동 목표 API
- `GET /api/workout-goals` - 목표 목록 조회
- `POST /api/workout-goals` - 목표 생성
- `PUT /api/workout-goals/:id` - 목표 수정
- `DELETE /api/workout-goals/:id` - 목표 삭제

### 커뮤니티 API
- `GET /api/posts` - 게시글 목록 조회
- `POST /api/posts` - 게시글 작성
- `GET /api/posts/:id` - 게시글 상세 조회
- `PUT /api/posts/:id` - 게시글 수정
- `DELETE /api/posts/:id` - 게시글 삭제

### 레벨 시스템 API
- `GET /api/levels/user/:userId` - 사용자 레벨 정보
- `POST /api/levels/exp` - 경험치 획득
- `GET /api/levels/leaderboard` - 리더보드

## 🧪 테스트

### 테스트 실행
```bash
# 전체 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# UI 테스트 실행
npm run test:ui

# 특정 기능 테스트
npm run test:machine
npm run test:workout-goal
npm run test:existing-data-simple
```

### 테스트 구조
```
src/
├── frontend/
│   └── shared/
│       └── components/
│           └── __tests__/        # 컴포넌트 테스트
│       └── hooks/
│           └── __tests__/        # 훅 테스트
└── backend/
    └── scripts/                  # 백엔드 테스트 스크립트
```

## 🚀 배포

### 프로덕션 빌드
```bash
# 프론트엔드 빌드
npm run build

# 백엔드 빌드
npm run backend:build
```

### PM2를 사용한 배포
```bash
# 애플리케이션 시작
npm run pm2:start

# 상태 확인
npm run pm2:status

# 로그 확인
npm run pm2:logs

# 재시작
npm run pm2:restart

# 중지
npm run pm2:stop
```

### Docker 배포 (준비 중)
```bash
# Docker 이미지 빌드
docker build -t deukgeun .

# 컨테이너 실행
docker run -p 3000:3000 deukgeun
```

## 🤝 기여하기

### 기여 방법
1. 이 저장소를 Fork합니다
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- TypeScript를 사용하여 타입 안정성을 확보합니다
- ESLint와 Prettier를 사용하여 코드 스타일을 일관되게 유지합니다
- 새로운 기능 추가 시 테스트 코드를 작성합니다
- 커밋 메시지는 명확하고 설명적으로 작성합니다

### 이슈 리포트
버그를 발견하거나 새로운 기능을 제안하고 싶다면 [Issues](https://github.com/your-username/deukgeun_ReactProject/issues) 페이지에서 이슈를 생성해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 다음 방법으로 연락해주세요:

- **이메일**: your-email@example.com
- **GitHub Issues**: [Issues](https://github.com/your-username/deukgeun_ReactProject/issues)
- **Discord**: [Deukgeun Community](https://discord.gg/deukgeun)

---

**Deukgeun** - 함께 만들어가는 건강한 운동 문화 🏋️‍♂️
