# EC2 통합 배포 가이드

## 📋 개요

이 가이드는 deukgeun 프로젝트를 AWS EC2 환경에서 통합 배포하는 방법을 설명합니다. 모든 모듈화된 기능을 한번에 실행할 수 있는 두 가지 방법을 제공합니다.

## 🚀 배포 방법

### 방법 1: Bash 스크립트 (권장)
```bash
# EC2 인스턴스에서 실행
npm run deploy:ec2:bash
```

### 방법 2: TypeScript 스크립트
```bash
# EC2 인스턴스에서 실행
npm run deploy:ec2:ts
```

## 🛠️ 사전 요구사항

### 시스템 요구사항
- **OS**: Ubuntu 20.04 LTS 이상
- **Node.js**: 16.x 이상
- **npm**: 8.x 이상
- **메모리**: 최소 2GB RAM
- **디스크**: 최소 10GB 여유 공간

### 필수 패키지
- PM2 (프로세스 관리)
- serve (정적 파일 서빙)
- PostgreSQL (데이터베이스)
- Git (버전 관리)

## 📁 스크립트 구조

### 1. `ec2-integrated-deploy.sh` (Bash 스크립트)
- **목적**: EC2 환경 전용 배포 스크립트
- **특징**: 
  - 시스템 환경 자동 설정
  - 의존성 자동 설치
  - 방화벽 자동 구성
  - PM2 서비스 자동 시작
  - 로그 모니터링 설정

### 2. `ec2-integrated-runner.ts` (TypeScript 스크립트)
- **목적**: 모든 모듈화된 기능을 통합 실행
- **특징**:
  - 함수형 프로그래밍 패턴
  - 성능 모니터링
  - 에러 복구 메커니즘
  - 병렬 처리 지원

## 🔧 실행 옵션

### Bash 스크립트 옵션
```bash
# 기본 실행
./scripts/ec2-integrated-deploy.sh

# 환경 변수 설정
export NODE_ENV=production
export PROJECT_ROOT=/path/to/project
./scripts/ec2-integrated-deploy.sh
```

### TypeScript 스크립트 옵션
```bash
# 기본 실행
npm run deploy:ec2:ts

# 옵션과 함께 실행
npx ts-node scripts/ec2-integrated-runner.ts --environment production --verbose

# 도움말
npx ts-node scripts/ec2-integrated-runner.ts --help
```

#### TypeScript 스크립트 옵션 목록
- `--environment <env>`: 환경 설정 (production, staging, development)
- `--skip-tests`: 테스트 건너뛰기
- `--skip-backup`: 백업 건너뛰기
- `--skip-database`: 데이터베이스 설정 건너뛰기
- `--skip-firewall`: 방화벽 설정 건너뛰기
- `--no-parallel`: 병렬 처리 비활성화
- `--max-workers <num>`: 최대 워커 수
- `--timeout <ms>`: 타임아웃 (밀리초)
- `--verbose`: 상세 로그
- `--dry-run`: 실제 실행 없이 시뮬레이션

## 📊 실행 단계

### 1. 시스템 환경 확인
- OS 및 버전 확인
- Node.js 및 npm 버전 확인
- 메모리 및 디스크 공간 확인
- 필수 파일 존재 확인

### 2. 의존성 설치
- npm install 실행
- @types/node 설치
- PM2 및 serve 글로벌 설치

### 3. 환경 설정
- .env 파일 생성/확인
- 환경 변수 로드
- 환경 스크립트 실행

### 4. 백업 생성
- 중요 파일들 백업
- 백업 정보 저장
- 롤백 정보 기록

### 5. 코드 변환
- TypeScript 컴파일
- ES 모듈을 CommonJS로 변환
- 브라우저 API polyfill 추가

### 6. 빌드 실행
- 백엔드 빌드
- 프론트엔드 빌드
- 빌드 결과 검증

### 7. 데이터베이스 설정
- PostgreSQL 설치/확인
- 데이터베이스 연결 테스트
- 스키마 설정

### 8. 방화벽 설정
- UFW 방화벽 설정
- 포트 열기 (22, 80, 443, 5000)
- 보안 규칙 적용

### 9. PM2 서비스 시작
- 기존 서비스 중지
- ecosystem.config.cjs로 서비스 시작
- 자동 시작 설정
- 상태 확인

### 10. 헬스체크
- 서비스 상태 확인
- 포트 사용 상태 확인
- API 엔드포인트 테스트

### 11. 로그 모니터링 설정
- PM2 로그 로테이션 설정
- 로그 디렉토리 권한 설정
- 모니터링 도구 설정

## 🔍 모니터링 및 관리

### PM2 명령어
```bash
# 서비스 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 서비스 재시작
pm2 restart all

# 서비스 중지
pm2 stop all

# 서비스 삭제
pm2 delete all
```

### 로그 파일 위치
- **배포 로그**: `logs/ec2-deploy-{timestamp}.log`
- **PM2 로그**: `~/.pm2/logs/`
- **애플리케이션 로그**: `logs/`

### 서비스 URL
- **프론트엔드**: `http://{public-ip}:80`
- **백엔드 API**: `http://{public-ip}:5000`
- **헬스체크**: `http://{public-ip}:5000/health`

## 🚨 문제 해결

### 일반적인 문제들

#### 1. Node.js 버전 문제
```bash
# Node.js 16+ 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. PM2 설치 문제
```bash
# PM2 글로벌 설치
sudo npm install -g pm2
```

#### 3. 포트 충돌 문제
```bash
# 포트 사용 확인
netstat -tlnp | grep -E ':(80|5000)'

# 프로세스 종료
sudo kill -9 {PID}
```

#### 4. 권한 문제
```bash
# 로그 디렉토리 권한 설정
chmod -R 755 logs/
chown -R $USER:$USER logs/
```

### 롤백 방법
```bash
# PM2 서비스 중지
pm2 delete all

# 백업에서 복원 (필요한 경우)
cp -r backups/backup-{timestamp}/* ./

# 서비스 재시작
pm2 start ecosystem.config.cjs --env production
```

## 📈 성능 최적화

### 시스템 최적화
- 메모리 사용량 모니터링
- CPU 사용률 확인
- 디스크 I/O 최적화
- 네트워크 대역폭 관리

### 애플리케이션 최적화
- PM2 클러스터 모드 사용
- 로그 로테이션 설정
- 캐시 최적화
- 데이터베이스 연결 풀링

## 🔒 보안 고려사항

### 방화벽 설정
- 필요한 포트만 열기
- SSH 키 기반 인증
- 정기적인 보안 업데이트

### 환경 변수 보안
- 민감한 정보는 환경 변수로 관리
- .env 파일 권한 설정
- 프로덕션 환경에서의 보안 강화

## 📝 로그 및 모니터링

### 로그 레벨
- **INFO**: 일반적인 정보
- **WARNING**: 경고 메시지
- **ERROR**: 오류 메시지
- **DEBUG**: 디버깅 정보

### 모니터링 도구
- PM2 모니터링
- 시스템 리소스 모니터링
- 애플리케이션 성능 모니터링

## 🎯 결론

이 가이드를 따라하면 EC2 환경에서 deukgeun 프로젝트를 안전하고 효율적으로 배포할 수 있습니다. 문제가 발생하면 로그 파일을 확인하고 적절한 해결 방법을 적용하세요.

---
*생성일: 2024년 12월 19일*
*마지막 업데이트: 2024년 12월 19일*
