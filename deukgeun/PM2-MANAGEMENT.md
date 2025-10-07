# Deukgeun PM2 관리 가이드

## 개요

이 문서는 Deukgeun 프로젝트의 PM2 설정과 관리 방법을 설명합니다. Windows 환경에서 CMD 창이 반복 열리는 문제를 해결하고, 더 효율적인 프로세스 관리를 제공합니다.

## 주요 개선사항

### 1. CMD 창 문제 해결
- `windowsHide: true` 설정으로 Windows에서 CMD 창이 숨겨집니다
- `autorestart: false` 설정으로 개발 중 불필요한 재시작을 방지합니다
- 백그라운드 실행으로 시스템 리소스를 절약합니다

### 2. 메모리 최적화
- 백엔드: 2GB 메모리 제한
- 프론트엔드: 1GB 메모리 제한
- 헬스 모니터: 512MB 메모리 제한
- Node.js 옵션 최적화 (`--optimize-for-size`)

### 3. 로그 관리 개선
- 자동 로그 로테이션 (10MB, 5개 파일 유지)
- 압축된 로그 파일
- 날짜별 로그 포맷

### 4. 재시작 정책 개선
- 개발 환경에서는 자동 재시작 비활성화
- 프로덕션 환경에서만 자동 재시작 활성화
- 적절한 재시작 지연 시간 설정

## 사용법

### 기본 명령어

```bash
# 프로세스 시작
npm run pm2:start

# 프로세스 중지
npm run pm2:stop

# 프로세스 재시작
npm run pm2:restart

# 프로세스 상태 확인
npm run pm2:status

# 로그 확인
npm run pm2:logs

# 실시간 모니터링
npm run pm2:monitor
```

### Windows 전용 관리 스크립트

#### 1. 배치 스크립트 (CMD)
```cmd
# 프로세스 시작
scripts\pm2-manager.bat start

# 프로세스 상태 확인
scripts\pm2-manager.bat status

# 로그 정리
scripts\pm2-manager.bat clean
```

#### 2. PowerShell 스크립트
```powershell
# 프로세스 시작
.\scripts\pm2-manager.ps1 start

# 프로세스 상태 확인
.\scripts\pm2-manager.ps1 status

# 실시간 모니터링
.\scripts\pm2-manager.ps1 monitor
```

#### 3. Node.js 스크립트
```bash
# 프로세스 시작
npm run pm2:manager start

# 프로세스 상태 확인
npm run pm2:manager status

# 로그 정리
npm run pm2:manager clean
```

## 프로세스 구성

### 1. 백엔드 (deukgeun-backend)
- **스크립트**: `dist/backend/index.js`
- **포트**: 5000
- **메모리 제한**: 2GB
- **자동 재시작**: 비활성화 (개발 환경)

### 2. 프론트엔드 (deukgeun-frontend)
- **스크립트**: `scripts/serve-frontend-optimized.cjs`
- **포트**: 3000
- **메모리 제한**: 1GB
- **자동 재시작**: 비활성화 (개발 환경)

### 3. 헬스 모니터 (deukgeun-health-monitor)
- **스크립트**: `scripts/health-monitor.cjs`
- **메모리 제한**: 512MB
- **자동 재시작**: 활성화
- **주기적 재시작**: 매일 새벽 2시

## 로그 관리

### 로그 파일 위치
```
logs/
├── backend-error.log
├── backend-out.log
├── backend-combined.log
├── frontend-error.log
├── frontend-out.log
├── frontend-combined.log
├── health-monitor-error.log
├── health-monitor-out.log
└── health-monitor-combined.log
```

### 로그 로테이션 설정
- **최대 크기**: 10MB
- **유지 파일 수**: 5개
- **압축**: 활성화
- **자동 정리**: 7일 이상 된 파일 삭제

## 환경별 설정

### 개발 환경
- 자동 재시작: 비활성화
- 파일 감시: 비활성화
- 로그 레벨: 상세

### 프로덕션 환경
- 자동 재시작: 활성화 (헬스 모니터만)
- 로그 압축: 활성화
- 모니터링: 활성화

## 문제 해결

### 1. CMD 창이 계속 열리는 문제
```bash
# PM2 설정 확인
pm2 show deukgeun-backend

# Windows 설정 확인
pm2 describe deukgeun-backend
```

### 2. 메모리 사용량이 높은 경우
```bash
# 메모리 사용량 확인
pm2 monit

# 프로세스 재시작
pm2 restart ecosystem.config.cjs
```

### 3. 로그 파일이 너무 큰 경우
```bash
# 로그 정리
npm run pm2:manager clean

# 또는 수동 정리
pm2 flush
```

## 모니터링

### 실시간 모니터링
```bash
# PM2 모니터링 대시보드
pm2 monit

# 또는
npm run pm2:monitor
```

### 헬스 체크
```bash
# 애플리케이션 헬스 체크
npm run health:check

# 지속적인 모니터링
npm run health:monitor
```

## 배포

### 프로덕션 배포
```bash
# 환경 설정
npm run setup:env:deploy

# 빌드 및 배포
npm run deploy:ec2
```

### 스테이징 배포
```bash
# 스테이징 환경 배포
pm2 deploy staging
```

## 보안 고려사항

1. **환경 변수**: 민감한 정보는 환경 변수로 관리
2. **로그 보안**: 로그 파일에 민감한 정보 포함 금지
3. **포트 관리**: 필요한 포트만 열어두기
4. **접근 제어**: PM2 대시보드 접근 제한

## 성능 최적화

1. **메모리 관리**: 적절한 메모리 제한 설정
2. **CPU 사용량**: 모니터링을 통한 CPU 사용량 추적
3. **로그 관리**: 정기적인 로그 정리
4. **프로세스 관리**: 불필요한 프로세스 정리

## 추가 리소스

- [PM2 공식 문서](https://pm2.keymetrics.io/docs/)
- [Node.js 성능 최적화](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Windows PM2 설정](https://pm2.keymetrics.io/docs/usage/startup/)
