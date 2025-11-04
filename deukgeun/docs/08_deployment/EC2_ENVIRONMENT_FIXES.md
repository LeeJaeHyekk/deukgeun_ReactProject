# EC2 환경 문제 해결 및 안전장치 추가

## 📋 개요

EC2 환경에서 실행 시 발생할 수 있는 문제를 분석하고 안전장치를 추가했습니다.

## 🔍 발견된 문제 및 해결

### 1. Windows 전용 빌드 명령어 문제

**문제**: `package.json`의 빌드 스크립트에서 Windows 전용 `set` 명령어 사용

**해결**:
- `cross-env` 패키지 사용으로 크로스 플랫폼 지원
- Windows와 Linux 모두에서 동일한 환경 변수 설정 가능

**변경 사항**:
```json
// 이전 (Windows 전용)
"build": "set NODE_ENV=production && set MODE=production && npx tsx scripts/build-optimized.ts"

// 변경 후 (크로스 플랫폼)
"build": "cross-env NODE_ENV=production MODE=production npx tsx scripts/build-optimized.ts"
```

**추가된 스크립트**:
- `build:ec2`: EC2 Linux 환경 전용 빌드 스크립트
- `build:ec2:production`: EC2 프로덕션 빌드 스크립트

### 2. 경로 구분자 문제

**문제**: Windows 경로(`\`)와 Linux 경로(`/`) 차이로 인한 빌드 실패

**해결**:
- 빌드 스크립트에서 경로 구분자 정규화 (`replace(/\\/g, '/')`)
- `execSync`에서 `cwd` 옵션에 정규화된 경로 사용

**변경된 파일**:
- `scripts/build-optimized.ts`
  - `buildFrontend()`: 경로 정규화 추가
  - `buildBackend()`: 경로 정규화 추가
  - Shell 옵션 추가 (Linux 환경: `/bin/bash`)

### 3. 환경 변수 설정 문제

**문제**: EC2 환경에서 환경 변수가 제대로 설정되지 않음

**해결**:
- 빌드 스크립트 내부에서 환경 변수 자동 설정
- EC2 배포 스크립트에서 환경 변수 명시적 설정

**변경된 파일**:
- `scripts/ec2-integrated-deploy.sh`
  - `run_build()`: EC2 환경 변수 명시적 설정
  - `start_services()`: EC2 환경 변수 명시적 설정

### 4. 로그 디렉토리 권한 문제

**문제**: EC2 환경에서 로그 디렉토리가 없거나 권한 문제 발생

**해결**:
- 빌드 전 로그 디렉토리 자동 생성
- EC2 배포 스크립트에서 로그 디렉토리 권한 설정

**변경된 파일**:
- `scripts/build-optimized.ts`: `prepareBuild()`에서 로그 디렉토리 생성
- `scripts/ec2-integrated-deploy.sh`: 로그 디렉토리 생성 및 권한 설정

### 5. PM2 설정 최적화

**문제**: EC2 환경에서 PM2 로그 경로 문제

**해결**:
- `ecosystem.config.cjs`에 로그 디렉토리 자동 생성 주석 추가
- 상대 경로 사용 (프로젝트 루트 기준)

**변경된 파일**:
- `ecosystem.config.cjs`: 로그 설정 개선 및 주석 추가

## 🛡️ 추가된 안전장치

### 1. EC2 사전 검사 스크립트

**파일**: `scripts/ec2-preflight-check.sh`

**기능**:
- OS 확인 (Linux 환경)
- Node.js/npm 버전 확인
- PM2, nginx, Git 설치 확인
- 디스크 공간 확인
- 메모리 확인
- 필수 포트 확인 (80, 443, 5000)
- 프로젝트 필수 파일 확인

**사용법**:
```bash
chmod +x scripts/ec2-preflight-check.sh
./scripts/ec2-preflight-check.sh
```

### 2. 빌드 스크립트 개선

**개선 사항**:
- 로그 디렉토리 자동 생성
- 경로 구분자 정규화
- Shell 옵션 추가 (Linux 환경)
- 에러 처리 강화

### 3. 배포 스크립트 개선

**개선 사항**:
- 로그 디렉토리 생성 및 권한 설정
- EC2 환경 변수 명시적 설정
- 빌드 실패 시 상세 로그 출력
- PM2 시작 전 로그 디렉토리 확인

## 📝 변경된 파일 목록

### 핵심 파일
1. **package.json**
   - `cross-env` 의존성 추가
   - 빌드 스크립트 크로스 플랫폼으로 수정
   - EC2 전용 빌드 스크립트 추가

2. **ecosystem.config.cjs**
   - 로그 설정 개선
   - 로그 디렉토리 자동 생성 주석 추가

3. **scripts/build-optimized.ts**
   - 경로 구분자 정규화
   - 로그 디렉토리 자동 생성
   - Shell 옵션 추가

4. **scripts/ec2-integrated-deploy.sh**
   - 로그 디렉토리 생성 및 권한 설정
   - EC2 환경 변수 명시적 설정
   - 빌드 스크립트 개선

### 새로 추가된 파일
5. **scripts/ec2-preflight-check.sh**
   - EC2 환경 사전 검사 스크립트

## 🚀 사용 방법

### EC2 배포 전 검사

```bash
# 1. EC2 환경 사전 검사
./scripts/ec2-preflight-check.sh

# 2. EC2 통합 배포 실행
npm run deploy:ec2
# 또는
bash scripts/ec2-integrated-deploy.sh
```

### EC2에서 빌드

```bash
# EC2 전용 빌드 스크립트 사용
npm run build:ec2

# 또는 기본 빌드 스크립트 (cross-env 사용)
npm run build
```

## ⚠️ 주의사항

1. **cross-env 설치 필요**
   ```bash
   npm install --save-dev cross-env
   ```

2. **EC2 환경 변수 확인**
   - `.env` 파일에 필요한 환경 변수가 설정되어 있는지 확인
   - 프로덕션 환경 변수 확인

3. **로그 디렉토리 권한**
   - EC2 환경에서 로그 디렉토리 권한이 올바른지 확인
   - PM2 실행 사용자 권한 확인

## 🔧 문제 해결

### 빌드 실패 시

1. **경로 문제 확인**
   ```bash
   # 경로 구분자 확인
   pwd
   ls -la
   ```

2. **환경 변수 확인**
   ```bash
   echo $NODE_ENV
   echo $MODE
   ```

3. **로그 확인**
   ```bash
   tail -f logs/ec2-deploy-*.log
   ```

### PM2 시작 실패 시

1. **로그 디렉토리 확인**
   ```bash
   ls -la logs/
   chmod -R 755 logs/
   ```

2. **PM2 로그 확인**
   ```bash
   pm2 logs
   pm2 status
   ```

## 📚 관련 문서

- [EC2 통합 배포 가이드](./DEUKGEUN_COMPLETE_GUIDE.md)
- [SSH 연결 문제 해결](./SSH_CONNECTION_TROUBLESHOOTING.md)

