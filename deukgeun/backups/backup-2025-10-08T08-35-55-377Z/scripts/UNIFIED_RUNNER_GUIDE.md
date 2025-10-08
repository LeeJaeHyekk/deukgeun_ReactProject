# 🚀 통합 실행 스크립트 가이드

## 📋 개요

`unified-runner.ts`는 모든 빌드, 변환, 배포, 서비스 관리를 하나의 스크립트로 통합한 통합 실행 스크립트입니다.

## 🎯 주요 기능

- **단계별 실행**: 환경 설정 → 안전 검사 → 변환 → 빌드 → 배포 → PM2 관리 → 헬스체크
- **자동 복구**: 실패 시 자동으로 복구 시도
- **백업 생성**: 중요한 작업 전 자동 백업
- **유연한 구성**: 원하는 단계만 실행하거나 특정 단계 건너뛰기
- **상세 로깅**: 각 단계별 진행 상황 및 결과 표시

## 🚀 사용법

### 기본 사용법

```bash
# 전체 프로세스 실행
npm run unified

# 상세 로그와 함께 실행
npm run unified:prod

# 개발 환경으로 실행
npm run unified:dev
```

### 고급 사용법

```bash
# 특정 단계만 실행
npm run unified:build    # 변환 + 빌드만
npm run unified:deploy   # 배포 + PM2 + 헬스체크만

# 드라이 런 모드 (실제 실행 없이 시뮬레이션)
npm run unified:dry

# 직접 실행
npx ts-node scripts/unified-runner.ts [옵션]
```

## 📊 실행 단계

### 1. **env** - 환경 설정
- 환경 변수 설정
- .env 파일 확인
- NODE_ENV 설정

### 2. **safety** - 안전 검사
- 백업 디렉토리 생성
- 중요 파일들 백업
- 안전 검사 실행

### 3. **convert** - 코드 변환
- ES 모듈을 CommonJS로 변환
- import.meta.env 변환
- 브라우저 API polyfill 추가

### 4. **build** - 프로젝트 빌드
- 백엔드 빌드 실행
- 프론트엔드 빌드 실행
- 빌드 결과 검증

### 5. **deploy** - 배포
- dist 디렉토리 확인
- 배포 스크립트 실행
- 배포 결과 검증

### 6. **pm2** - PM2 서비스 관리
- PM2 설치 확인
- PM2 설정 파일 생성 (없는 경우)
- PM2 프로세스 시작

### 7. **health** - 헬스체크
- PM2 상태 확인
- 서비스 정상 동작 확인
- 헬스체크 결과 보고

## ⚙️ 옵션 설정

### 명령행 옵션

```bash
# 기본 옵션
npx ts-node scripts/unified-runner.ts

# 프로젝트 루트 지정
npx ts-node scripts/unified-runner.ts --project-root /path/to/project

# 환경 지정
npx ts-node scripts/unified-runner.ts --environment production

# 실행할 단계 지정
npx ts-node scripts/unified-runner.ts --phases env,safety,build

# 건너뛸 단계 지정
npx ts-node scripts/unified-runner.ts --skip-phases safety,health

# 상세 로그 활성화
npx ts-node scripts/unified-runner.ts --verbose

# 드라이 런 모드
npx ts-node scripts/unified-runner.ts --dry-run

# 백업 비활성화
npx ts-node scripts/unified-runner.ts --no-backup

# 자동 복구 비활성화
npx ts-node scripts/unified-runner.ts --no-auto-recovery

# 안전장치 비활성화
npx ts-node scripts/unified-runner.ts --no-safety
```

### package.json 스크립트

```json
{
  "scripts": {
    "unified": "npx ts-node scripts/unified-runner.ts",
    "unified:prod": "npx ts-node scripts/unified-runner.ts --environment production --verbose",
    "unified:dev": "npx ts-node scripts/unified-runner.ts --environment development --verbose",
    "unified:build": "npx ts-node scripts/unified-runner.ts --phases convert,build --verbose",
    "unified:deploy": "npx ts-node scripts/unified-runner.ts --phases deploy,pm2,health --verbose",
    "unified:dry": "npx ts-node scripts/unified-runner.ts --dry-run --verbose"
  }
}
```

## 🔧 설정 옵션

### 환경별 설정

```bash
# 개발 환경
npm run unified:dev

# 프로덕션 환경
npm run unified:prod

# 스테이징 환경
npx ts-node scripts/unified-runner.ts --environment staging --verbose
```

### 단계별 실행

```bash
# 환경 설정만
npx ts-node scripts/unified-runner.ts --phases env --verbose

# 빌드 관련만
npx ts-node scripts/unified-runner.ts --phases convert,build --verbose

# 배포 관련만
npx ts-node scripts/unified-runner.ts --phases deploy,pm2,health --verbose

# 안전 검사 건너뛰기
npx ts-node scripts/unified-runner.ts --skip-phases safety --verbose
```

## 🛡️ 안전 기능

### 자동 백업
- 실행 전 자동으로 중요 파일들 백업
- 타임스탬프가 포함된 백업 디렉토리 생성
- 백업 경로: `backups/backup-YYYY-MM-DDTHH-mm-ss-sssZ/`

### 자동 복구
- 실패 시 자동으로 복구 시도
- 백업에서 복원
- 재시도 로직

### 안전 검사
- 시스템 요구사항 확인
- 필수 파일 존재 확인
- 권한 검사

## 📊 결과 확인

### 성공 시
```
🎉 통합 실행이 성공적으로 완료되었습니다!
⏱️  총 소요시간: 45.32초

📊 단계별 결과:
  ✅ env: 성공
  ✅ safety: 성공
  ✅ convert: 성공
  ✅ build: 성공
  ✅ deploy: 성공
  ✅ pm2: 성공
  ✅ health: 성공
```

### 실패 시
```
❌ 통합 실행 실패
⏱️  총 소요시간: 23.15초

📊 단계별 결과:
  ✅ env: 성공
  ✅ safety: 성공
  ❌ convert: 실패
  ❌ build: 실패
  ❌ deploy: 실패
  ❌ pm2: 실패
  ❌ health: 실패
```

## 🔍 문제 해결

### 일반적인 문제들

1. **PM2가 설치되지 않음**
   ```bash
   npm install -g pm2
   ```

2. **권한 오류**
   ```bash
   chmod +x scripts/unified-runner.ts
   ```

3. **메모리 부족**
   ```bash
   node --max-old-space-size=4096 scripts/unified-runner.ts
   ```

4. **타임아웃 오류**
   ```bash
   npx ts-node scripts/unified-runner.ts --timeout 600
   ```

### 디버깅

```bash
# 상세 로그와 함께 실행
npx ts-node scripts/unified-runner.ts --verbose

# 드라이 런으로 시뮬레이션
npx ts-node scripts/unified-runner.ts --dry-run --verbose

# 특정 단계만 실행하여 문제 격리
npx ts-node scripts/unified-runner.ts --phases convert --verbose
```

## 📈 성능 최적화

### 병렬 처리
```bash
npx ts-node scripts/unified-runner.ts --parallel
```

### 메모리 제한
```bash
node --max-old-space-size=2048 scripts/unified-runner.ts
```

### 타임아웃 조정
```bash
npx ts-node scripts/unified-runner.ts --timeout 300
```

## 🎯 사용 시나리오

### 개발 환경 설정
```bash
npm run unified:dev
```

### 프로덕션 배포
```bash
npm run unified:prod
```

### 빌드만 실행
```bash
npm run unified:build
```

### 배포만 실행
```bash
npm run unified:deploy
```

### 테스트 실행
```bash
npm run unified:dry
```

## 📝 로그 파일

실행 로그는 다음 위치에 저장됩니다:
- `logs/unified-runner-YYYY-MM-DD.log`
- `logs/backup-YYYY-MM-DD.log`

## 🔄 업데이트

스크립트 업데이트 시:
1. 기존 백업 확인
2. 새 버전으로 업데이트
3. 테스트 실행
4. 프로덕션 적용

## 🤝 기여하기

1. 이슈 리포트
2. 기능 요청
3. 코드 기여
4. 문서 개선

## 📚 관련 문서

- [빌드 스크립트 가이드](./README.md)
- [PM2 관리 가이드](./PM2-MANAGEMENT.md)
- [NGINX 관리 가이드](./NGINX_MANAGEMENT.md)
- [EC2 배포 가이드](./EC2_DEPLOYMENT_GUIDE.md)
