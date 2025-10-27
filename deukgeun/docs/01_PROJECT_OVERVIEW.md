# 🏋️ Deukgeun 프로젝트 개요 및 시작 가이드

## 📋 프로젝트 소개

Deukgeun은 헬스장 이용자들을 위한 종합 플랫폼으로, 운동 기구 가이드, 운동 목표 관리, 커뮤니티, 위치 기반 서비스, 레벨 시스템을 제공합니다.

### 🎯 주요 기능

- **운동 기구 가이드**: 상세한 사용법과 효과 안내
- **운동 목표 관리**: 개인별 맞춤 운동 계획
- **커뮤니티**: 운동 경험 공유 및 소통
- **위치 기반 서비스**: 근처 헬스장 찾기
- **레벨 시스템**: 운동 성취도 추적

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Zustand** (상태 관리)
- **Tailwind CSS** (스타일링)
- **React Router** (라우팅)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **TypeORM** (ORM)
- **MySQL** (데이터베이스)
- **JWT** (인증)

### DevOps
- **PM2** (프로세스 관리)
- **Docker** (컨테이너화)
- **Nginx** (웹 서버)
- **ESLint** + **Prettier** (코드 품질)

## 🚀 빠른 시작

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd deukgeun
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# 환경 변수 파일 복사
cp env.example .env
cp env.example src/backend/.env

# 환경 변수 설정 (필수 값들)
# .env 파일을 열어서 필요한 값들을 설정하세요
```

### 4. 데이터베이스 설정
```bash
# MySQL 서비스 시작
# Windows
net start MySQL80

# Linux/Mac
sudo service mysql start

# 데이터베이스 생성
mysql -u root -p
CREATE DATABASE deukgeun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 개발 서버 실행
```bash
# 백엔드 서버 실행
npm run dev:backend

# 프론트엔드 서버 실행 (새 터미널)
npm run dev:frontend
```

### 6. 접속 확인
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000
- **헬스 체크**: http://localhost:5000/health

## 📁 프로젝트 구조

```
deukgeun/
├── src/
│   ├── frontend/          # React 프론트엔드
│   │   ├── features/      # 기능별 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── shared/        # 공통 컴포넌트
│   │   └── widgets/       # 위젯 컴포넌트
│   ├── backend/           # Node.js 백엔드
│   │   ├── entities/      # 데이터베이스 엔티티
│   │   ├── services/      # 비즈니스 로직
│   │   ├── controllers/   # API 컨트롤러
│   │   └── scripts/       # 유틸리티 스크립트
│   └── shared/            # 공통 타입 및 유틸리티
├── docs/                  # 프로젝트 문서
├── dist/                  # 빌드 결과물
└── logs/                  # 로그 파일
```

## 🔧 주요 명령어

### 개발 명령어
```bash
# 백엔드 개발 서버
npm run dev:backend

# 프론트엔드 개발 서버
npm run dev:frontend

# 전체 개발 서버 (병렬 실행)
npm run dev

# TypeScript 컴파일
npm run build:backend
npm run build:frontend
```

### 빌드 명령어
```bash
# 전체 빌드
npm run build

# 백엔드만 빌드
npm run build:backend

# 프론트엔드만 빌드
npm run build:frontend
```

### 테스트 명령어
```bash
# 전체 테스트
npm run test

# 백엔드 테스트
npm run test:backend

# 프론트엔드 테스트
npm run test:frontend

# 타입 안전성 체크
npm run type-safety
```

### 디버깅 명령어
```bash
# 환경 변수 진단
npm run debug:env

# 데이터베이스 진단
npm run debug:db

# 서버 진단
npm run debug:server

# 전체 진단
npm run debug:all
```

## 🌟 주요 특징

### 1. 모듈화된 아키텍처
- 기능별로 분리된 컴포넌트 구조
- 재사용 가능한 공통 모듈
- 명확한 책임 분리

### 2. 타입 안전성
- TypeScript로 전면 구현
- 엄격한 타입 체크
- 런타임 검증 시스템

### 3. 성능 최적화
- React.memo, useCallback, useMemo 활용
- 코드 분할 및 지연 로딩
- 이미지 최적화

### 4. 에러 처리
- 계층적 에러 바운더리
- 포괄적인 에러 핸들링
- 사용자 친화적 에러 메시지

### 5. 개발자 경험
- 자동화된 빌드 시스템
- 포괄적인 디버깅 도구
- 상세한 문서화

## 📚 추가 문서

- [개발 환경 설정 가이드](./02_DEVELOPMENT_ENVIRONMENT.md)
- [크롤링 시스템 가이드](./03_CRAWLING_SYSTEM.md)
- [성능 최적화 가이드](./04_PERFORMANCE_OPTIMIZATION.md)
- [배포 및 운영 가이드](./05_DEPLOYMENT_OPERATIONS.md)
- [에러 처리 및 디버깅](./06_ERROR_HANDLING_DEBUGGING.md)
- [보안 및 품질 가이드](./07_SECURITY_QUALITY.md)
- [데이터 관리 가이드](./08_DATA_MANAGEMENT.md)

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**💡 팁**: 처음 시작하는 경우 [개발 환경 설정 가이드](./02_DEVELOPMENT_ENVIRONMENT.md)를 먼저 확인하세요!
