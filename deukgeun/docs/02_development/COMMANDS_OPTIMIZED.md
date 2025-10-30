# 🚀 최적화된 명령어 가이드

## 📋 개요
package.json의 명령어들을 최적화하여 존재하지 않는 파일 참조를 제거하고, 중복 명령어를 정리했습니다.

## ✅ 최적화된 명령어 목록

### 🚀 개발 및 빌드
```bash
# 개발 서버 실행
npm run dev                    # 프론트엔드 + 백엔드 동시 실행
npm run dev:frontend          # 프론트엔드만 실행
npm run dev:backend           # 백엔드만 실행
npm run dev:simple            # 간단한 백엔드 실행

# 빌드
npm run build                  # 전체 빌드
npm run build:backend         # 백엔드만 빌드
npm run build:production      # 프로덕션 빌드
npm run build:enhanced        # 향상된 빌드
```

### 🗄️ 데이터베이스 관리
```bash
# 데이터베이스 시드 (권장)
npm run db:seed               # 통합 시드 스크립트 실행
npm run db:seed:final         # 최종 시드 스크립트 실행
npm run db:seed:ec2           # EC2 Windows 환경용
npm run db:seed:ec2:unix      # EC2 Linux 환경용

# 데이터베이스 관리
npm run db:sync               # 데이터베이스 동기화
npm run db:check              # 데이터베이스 연결 확인
npm run db:reset              # 데이터베이스 리셋 (시드 포함)
```

### 🚀 배포 및 PM2 관리
```bash
# EC2 배포
npm run deploy:ec2            # EC2 배포 (bash)
npm run deploy:ec2:ts         # EC2 배포 (TypeScript)

# PM2 관리
npm run pm2:start             # PM2 시작
npm run pm2:stop              # PM2 중지
npm run pm2:restart           # PM2 재시작
npm run pm2:status            # PM2 상태 확인
npm run pm2:logs              # PM2 로그 확인
npm run pm2:monitor           # PM2 모니터링
```

### 🛠️ 개발 도구
```bash
# 코드 품질
npm run lint                  # ESLint 검사
npm run lint:fix              # ESLint 자동 수정
npm run format                # Prettier 포맷팅
npm run type-check            # TypeScript 타입 검사

# 디버깅
npm run debug:env            # 환경 변수 디버깅
npm run debug:db              # 데이터베이스 디버깅
npm run debug:server          # 서버 디버깅
npm run debug:all             # 전체 디버깅
```

### 🔄 변환 및 컴파일
```bash
# JS to CJS 변환
npm run convert:js-to-cjs     # 기본 변환
npm run convert:enhanced      # 향상된 변환
npm run convert:enhanced:verbose # 상세 로그와 함께 변환

# 컴파일
npm run quick:compile         # 빠른 컴파일
npm run simple:compile        # 간단한 컴파일
```

### 🌐 Nginx 관리
```bash
# Nginx 설정
npm run nginx:config          # 기본 설정
npm run nginx:config:dev      # 개발 환경 설정
npm run nginx:config:prod     # 프로덕션 환경 설정

# Nginx 제어
npm run nginx:start           # Nginx 시작
npm run nginx:stop            # Nginx 중지
npm run nginx:restart         # Nginx 재시작
npm run nginx:status          # Nginx 상태 확인
```

### 🏥 헬스 체크
```bash
npm run health:check         # 헬스 체크
npm run health:monitor        # 헬스 모니터링
```

### 🔒 보안 및 검증
```bash
npm run validate-env          # 환경 변수 검증
npm run security:check        # 보안 검사
npm run security:generate     # 보안 키 생성
npm run type-safety           # 타입 안전성 검사
```

### 🚀 통합 실행
```bash
npm run unified               # 통합 실행
npm run unified:prod          # 프로덕션 통합 실행
npm run unified:dev           # 개발 통합 실행
npm run unified:build         # 빌드 통합 실행
npm run unified:deploy        # 배포 통합 실행
```

### 🔧 설정 및 초기화
```bash
npm run setup:local           # 로컬 개발 환경 설정
npm run setup:level-tables    # 레벨 테이블 생성
npm run setup:account-recovery # 계정 복구 테이블 생성
```

## ❌ 제거된 명령어들

### 존재하지 않는 파일을 참조하는 명령어들:
- `script:runner` - 파일 없음
- `script:build:legacy` - 파일 없음
- `script:deploy` - 파일 없음
- `script:health` - 파일 없음
- `script:pm2` - 파일 없음
- `script:env` - 파일 없음
- `script:data` - 파일 없음
- `script:safety` - 파일 없음
- `script:nginx` - 파일 없음
- `script:nginx:deploy` - 파일 없음
- `script:nginx:domain` - 파일 없음

### 중복되거나 사용하지 않는 명령어들:
- `build:safe` - 복잡하고 사용 빈도 낮음
- `convert:guard` - 사용 빈도 낮음
- `script:auto:*` - 자동화 스크립트들 (복잡함)
- `quick:js-to-cjs` - 중복 기능
- `build:local:*` - 로컬 빌드 (사용 빈도 낮음)

## 🎯 권장 사용 패턴

### 개발 시작
```bash
npm run dev                   # 개발 서버 시작
```

### 데이터베이스 초기화
```bash
npm run db:seed               # 데이터베이스 시드
```

### 프로덕션 배포
```bash
npm run build:production     # 프로덕션 빌드
npm run deploy:ec2           # EC2 배포
npm run pm2:start            # PM2 시작
```

### 디버깅
```bash
npm run debug:all            # 전체 디버깅
npm run db:check             # 데이터베이스 확인
```

## 📊 최적화 결과

- **제거된 명령어**: 50+ 개
- **유지된 명령어**: 40+ 개
- **중복 제거**: 15+ 개
- **존재하지 않는 파일 참조**: 20+ 개 제거

이제 모든 명령어가 실제로 존재하는 파일을 참조하며, 중복 없이 체계적으로 정리되었습니다! 🎉
