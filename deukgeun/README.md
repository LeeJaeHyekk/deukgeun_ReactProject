# 🏋️ Deukgeun - 헬스장 운동 가이드 플랫폼

> **Deukgeun**은 헬스장에서 운동하는 사람들을 위한 종합적인 운동 가이드 플랫폼입니다. 머신 사용법, 운동 목표 설정, 커뮤니티 기능을 제공하여 효과적인 운동을 도와줍니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [빠른 시작](#빠른-시작)
- [빌드 시스템](#빌드-시스템)
- [환경 설정](#환경-설정)
- [테스트](#테스트)
- [배포](#배포)
- [보안](#보안)
- [기여하기](#기여하기)

## 🎯 프로젝트 개요

Deukgeun은 다음과 같은 문제를 해결합니다:

- **헬스장 초보자의 어려움**: 머신 사용법을 모르는 사용자를 위한 상세한 가이드
- **운동 목표 관리**: 개인별 운동 목표 설정 및 진행 상황 추적
- **커뮤니티 형성**: 운동 애호가들이 정보를 공유하고 소통할 수 있는 공간
- **위치 기반 서비스**: 주변 헬스장 찾기 및 정보 제공
- **레벨 시스템**: 운동 활동에 따른 경험치 및 레벨업 시스템

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
- **스트릭 시스템**: 연속 활동 추적
- **시즌 시스템**: 정기적인 시즌 리셋으로 지속적인 동기부여

### 🔐 계정 복구 시스템
- **다단계 인증**: 이름, 전화번호, 이메일을 통한 단계별 인증
- **보안 토큰**: 시간 제한이 있는 일회용 토큰
- **이메일 알림**: 보안 코드 이메일 발송
- **속도 제한**: 무차별 대입 공격 방지

### 🔄 자동 업데이트 스케줄러
- **자동 실행**: 설정된 시간에 3일마다 헬스장 데이터 업데이트
- **API + 크롤링**: API 우선 시도, 실패 시 크롤링으로 대체
- **스마트 스케줄링**: 업데이트가 필요한 경우에만 실행
- **다양한 업데이트 방식**: enhanced, basic, multisource, advanced

## 🛠 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안정성 확보
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **React Router** - 클라이언트 사이드 라우팅
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트
- **Zustand** - 상태 관리
- **React Hook Form** - 폼 관리

### Backend
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안정성 확보
- **TypeORM** - 객체 관계 매핑
- **MySQL** - 관계형 데이터베이스
- **JWT** - 인증 토큰 관리
- **bcrypt** - 비밀번호 해싱
- **Nodemailer** - 이메일 발송

### DevOps & Tools
- **PM2** - 프로세스 관리
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Jest** - 테스트 프레임워크
- **Vitest** - 프론트엔드 테스트
- **Docker** - 컨테이너화 (준비 중)

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18.0.0 이상
- MySQL 8.0 이상
- Git

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/deukgeun_ReactProject.git
cd deukgeun_ReactProject/deukgeun

# 2. 의존성 설치
npm install
cd src/backend && npm install && cd ../..

# 3. 환경 변수 설정
npm run setup:env

# 4. 데이터베이스 설정
npm run db:sync
npm run db:seed

# 5. 개발 서버 실행
npm run dev:full
```

### 접속 정보
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:5000
- **테스트 계정**: 이메일: `user1@test.com` / 비밀번호: `user123!`

## 🏗️ 빌드 시스템

### 새로운 모듈화된 빌드 시스템

ES 모듈과 CommonJS 충돌 문제를 해결하고, 구조화된 빌드 결과물을 생성하는 시스템입니다.

#### 빌드 결과물 구조
```
dist/
├── frontend/     # 프론트엔드 빌드 결과물
├── backend/      # 백엔드 빌드 결과물
├── shared/       # 공유 모듈
└── data/         # 데이터 파일
```

#### 주요 빌드 명령어

```bash
# 통합 빌드 (권장)
npm run build:integrated

# 구조화된 빌드
npm run build:structured

# 모듈 분석
npm run analyze:modules

# 스마트 변환
npm run convert:smart
```

#### 빌드 단계별 설명

1. **모듈 분석**: 프로젝트의 ES 모듈과 CommonJS 모듈을 자동 감지
2. **모듈 변환**: ES 모듈을 CommonJS로 지능적 변환
3. **구조화된 빌드**: 올바른 dist 폴더 구조 생성
4. **빌드 검증**: 빌드 결과물 검증

## 🔧 환경 설정

### 환경 변수 설정

#### 프론트엔드 환경 변수 (.env)
```bash
# Frontend Environment Variables
VITE_FRONTEND_PORT=5173
VITE_BACKEND_URL=http://localhost:5000

# Kakao Map API Keys
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_api_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_api_key

# Gym API Key
VITE_GYM_API_KEY=your_gym_api_key

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

#### 백엔드 환경 변수 (src/backend/.env)
```bash
# 애플리케이션 기본 설정
NODE_ENV=development
PORT=5000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=deukgeun_db

# JWT 인증 설정
JWT_SECRET=your-jwt-secret-key-for-development
JWT_ACCESS_SECRET=your-jwt-access-secret-for-development
JWT_REFRESH_SECRET=your-jwt-refresh-secret-for-development

# 이메일 설정
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 데이터베이스 설정

```bash
# 데이터베이스 동기화
npm run db:sync

# 초기 데이터 시드
npm run db:seed

# 레벨 시스템 테이블 생성
npm run setup:level-tables

# 계정 복구 테이블 생성
npm run setup:account-recovery
```

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# 단위 테스트만 실행
npm run test:unit

# 통합 테스트만 실행
npm run test:integration

# E2E 테스트만 실행
npm run test:e2e

# 코드 커버리지와 함께 실행
npm run test:coverage

# 파일 변경 감시 모드
npm run test:watch
```

### 테스트 환경 설정

```bash
# 테스트 환경 자동 설정
npm run test:setup
```

## 🚀 배포

### AWS EC2 배포

```bash
# EC2 배포
npm run deploy:ec2

# 최적화된 배포
npm run deploy:optimized

# 안전한 배포
npm run deploy:safe
```

### PM2 관리

```bash
# 서비스 시작
npm run pm2:start

# 서비스 상태 확인
npm run pm2:status

# 서비스 재시작
npm run pm2:restart

# 서비스 중지
npm run pm2:stop

# 로그 확인
npm run pm2:logs
```

### 헬스체크

```bash
# 헬스체크 실행
npm run health:check

# 헬스 모니터링
npm run health:monitor
```

## 🔒 보안

### reCAPTCHA Enterprise 통합

- **사이트 키**: `6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG`
- **프로젝트 ID**: `secure-theme-468004-f1`
- **점수 기반 보안**: 액션별 최소 점수 설정

### 보안 기능

- JWT 기반 인증
- 비밀번호 해싱 (bcrypt)
- 입력 데이터 검증
- SQL 인젝션 방지 (TypeORM)
- CORS 설정
- Rate Limiting
- 다단계 계정 복구

## 📊 프로젝트 구조

```
deukgeun/
├── src/
│   ├── frontend/           # React 프론트엔드
│   │   ├── features/       # 기능별 모듈
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── shared/         # 공통 컴포넌트, 훅, 유틸
│   │   └── widgets/        # 위젯 컴포넌트
│   ├── backend/            # Express 백엔드
│   │   ├── domains/        # 도메인별 비즈니스 로직
│   │   ├── infrastructure/ # 외부 서비스 연동
│   │   ├── config/         # 설정 파일
│   │   └── shared/         # 공통 타입, 유틸
│   └── shared/             # 프론트엔드/백엔드 공통
│       ├── types/          # 공통 타입 정의
│       ├── constants/      # 상수 정의
│       ├── validation/     # 유효성 검사 스키마
│       └── api/            # API 클라이언트
├── scripts/                # 빌드/배포 스크립트
└── dist/                   # 빌드 결과물
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