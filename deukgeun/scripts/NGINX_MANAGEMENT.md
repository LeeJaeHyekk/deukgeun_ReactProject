# Nginx 관리 시스템

## 개요

이 프로젝트는 모듈화된 nginx 설정 및 관리 기능을 제공합니다. 기존 nginx.conf 파일을 기반으로 최적화된 설정을 자동 생성하고, nginx 서비스를 관리할 수 있는 통합 스크립트를 제공합니다.

## 주요 기능

### 1. 모듈화된 Nginx 설정
- **기본 설정**: 이벤트, HTTP 블록, 로깅 설정
- **성능 최적화**: Gzip 압축, 캐싱, 연결 최적화
- **보안 설정**: 보안 헤더, CSP, XSS 보호
- **프록시 설정**: 백엔드 API 프록시, 헬스체크
- **SSL 지원**: HTTPS 설정 및 인증서 관리

### 2. 자동화된 관리
- 설정 파일 자동 생성 및 검증
- 서비스 시작/중지/재시작
- 백업 및 복원 기능
- 성능 모니터링
- 로그 관리

### 3. 통합 배포
- 빌드 + PM2 배포 + Nginx 설정을 통합한 원스톱 배포
- 헬스체크 및 모니터링
- 에러 복구 및 롤백

## 파일 구조

```
scripts/
├── modules/
│   └── nginx-functions.ts          # Nginx 관리 함수들
├── nginx-manager.ts                # Nginx 관리 스크립트
├── optimized-nginx-deploy.ts       # 통합 배포 스크립트
└── NGINX_MANAGEMENT.md            # 이 문서
```

## 사용법

### 1. 도메인별 Nginx 설정 (devtrail.net)

#### 도메인 설정 생성
```bash
npm run script:nginx:domain
```

#### 개발/프로덕션 환경별 설정
```bash
# 개발 환경 설정
npm run nginx:config:dev

# 프로덕션 환경 설정
npm run nginx:config:prod
```

### 2. 기본 Nginx 관리

#### Nginx 설정 생성
```bash
npm run nginx:config
```

#### Nginx 서비스 관리
```bash
# 서비스 시작
npm run nginx:start

# 서비스 중지
npm run nginx:stop

# 서비스 재시작
npm run nginx:restart

# 상태 확인
npm run nginx:status
```

#### 모니터링
```bash
# 로그 확인
npm run nginx:logs

# 성능 모니터링
npm run nginx:monitor
```

### 2. 통합 관리

#### 전체 Nginx 관리
```bash
npm run script:nginx
```

#### 통합 배포 (빌드 + PM2 + Nginx)
```bash
npm run script:nginx:deploy
```

### 3. 프로그래밍 방식 사용

```typescript
import * as NginxFunctions from './scripts/modules/nginx-functions'

// 설정 생성
const config = NginxFunctions.generateNginxConfig()
NginxFunctions.saveNginxConfig('./nginx.conf', config)

// 서비스 관리
NginxFunctions.startNginx()
NginxFunctions.checkNginxStatus()

// 모니터링
NginxFunctions.monitorNginxPerformance()
NginxFunctions.checkNginxLogs()
```

## 설정 옵션

### NginxConfig 인터페이스

```typescript
interface NginxConfig {
  serverName: string          // 서버 이름 (기본: localhost)
  root: string               // 웹 루트 디렉토리 (기본: /usr/share/nginx/html)
  index: string              // 기본 인덱스 파일 (기본: index.html)
  listen: number             // 포트 번호 (기본: 80)
  backendUrl: string         // 백엔드 URL (기본: http://backend)
  backendPort: number        // 백엔드 포트 (기본: 5000)
  enableGzip: boolean        // Gzip 압축 활성화 (기본: true)
  enableSecurity: boolean    // 보안 헤더 활성화 (기본: true)
  enableCaching: boolean     // 캐싱 활성화 (기본: true)
  enableProxy: boolean       // 프록시 활성화 (기본: true)
}
```

### 통합 배포 설정

```typescript
interface NginxDeployConfig {
  projectRoot: string
  buildTimeout: number
  nginxConfigPath: string
  backupDir: string
  healthCheckTimeout: number
  pm2ConfigPath: string
  maxRetries: number
  autoRecovery: boolean
  enableNginx: boolean       // Nginx 활성화 여부
  enableSSL: boolean        // SSL 활성화 여부
  sslCertPath?: string      // SSL 인증서 경로
  sslKeyPath?: string       // SSL 키 경로
}
```

## 생성되는 Nginx 설정

### 기본 설정
- 이벤트 블록: worker_connections 1024
- HTTP 블록: MIME 타입, 로깅, 성능 최적화
- 서버 블록: 포트 80, SPA 라우팅, API 프록시

### 성능 최적화
- Gzip 압축 (레벨 6)
- 정적 파일 캐싱 (1년)
- HTML 파일 캐싱 비활성화
- Keep-alive 연결

### 보안 설정
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade
- Content-Security-Policy

### 프록시 설정
- `/api/` 경로를 백엔드로 프록시
- WebSocket 지원
- 헤더 전달
- 타임아웃 설정

## 모니터링 기능

### 성능 모니터링
- 활성 연결 수
- 메모리 사용량
- CPU 사용량

### 로그 관리
- Access 로그 (최근 20줄)
- Error 로그 (최근 20줄)
- 프로세스 정보

### 헬스체크
- 프론트엔드: http://localhost
- 백엔드 API: http://localhost/api
- 헬스체크: http://localhost/health

## 백업 및 복원

### 자동 백업
- 설정 변경 전 자동 백업
- 타임스탬프가 포함된 백업 파일명
- 백업 디렉토리: `./nginx-backups/`

### 수동 백업/복원
```typescript
// 백업
NginxFunctions.backupNginxConfig('./nginx.conf', './backup/nginx.conf.backup')

// 복원
NginxFunctions.restoreNginxConfig('./backup/nginx.conf.backup', './nginx.conf')
```

## SSL 지원

### SSL 설정 생성
```typescript
const sslConfig = NginxFunctions.generateSSLConfig(
  'example.com',
  '/path/to/cert.pem',
  '/path/to/key.pem'
)
```

### SSL 최적화
- TLS 1.2, 1.3 지원
- 강력한 암호화 스위트
- HSTS 헤더
- 세션 캐싱

## 에러 처리

### 자동 복구
- 설정 검증 실패 시 이전 설정으로 롤백
- 서비스 시작 실패 시 재시도
- 헬스체크 실패 시 알림

### 로깅
- 상세한 에러 로그
- 단계별 진행 상황
- 성능 메트릭

## 통합 배포 프로세스

1. **시스템 정보 수집**: 플랫폼, CPU, 메모리 정보
2. **사전 검증**: 의존성, 파일, 권한 확인
3. **환경 설정**: 환경 변수 설정
4. **빌드 실행**: 전체 프로젝트 빌드
5. **PM2 배포**: 백엔드/프론트엔드 서비스 시작
6. **Nginx 설정**: 설정 생성, 검증, 서비스 시작
7. **헬스체크**: 모든 서비스 상태 확인
8. **후처리**: 로깅, 모니터링 설정

## 관리 명령어

### PM2 관리
```bash
pm2 status          # 상태 확인
pm2 logs            # 로그 확인
pm2 restart all     # 재시작
pm2 stop all        # 중지
pm2 delete all      # 삭제
```

### Nginx 관리
```bash
nginx -t            # 설정 검증
nginx -s reload     # 재시작
nginx -s stop       # 중지
tail -f /var/log/nginx/access.log    # Access 로그
tail -f /var/log/nginx/error.log     # Error 로그
```

## 서비스 URL

### 도메인 설정 (devtrail.net)
- 메인 도메인: http://devtrail.net
- WWW 도메인: http://www.devtrail.net
- IP 직접 접속: http://3.36.230.117
- 백엔드 API: http://devtrail.net/api
- 헬스체크: http://devtrail.net/health

### Nginx 비활성화 시
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5000
- 헬스체크: http://localhost:5000/health

## 주의사항

1. **권한**: nginx 설정 파일에 대한 쓰기 권한 필요
2. **포트**: 80번 포트 사용 시 관리자 권한 필요
3. **SSL**: 인증서 파일 경로 확인 필요
4. **백업**: 중요한 설정 변경 전 수동 백업 권장
5. **모니터링**: 프로덕션 환경에서 정기적인 모니터링 필요

## 문제 해결

### 일반적인 문제
1. **권한 오류**: `sudo` 권한으로 실행
2. **포트 충돌**: 다른 서비스가 80번 포트 사용 중인지 확인
3. **설정 오류**: `nginx -t`로 설정 검증
4. **서비스 시작 실패**: 로그 확인 후 설정 수정

### 디버깅
```bash
# Nginx 설정 검증
nginx -t

# 상세 로그 확인
tail -f /var/log/nginx/error.log

# 프로세스 확인
ps aux | grep nginx

# 포트 사용 확인
netstat -tlnp | grep :80
```

## 확장 가능성

### 추가 모듈
- 로드 밸런싱 설정
- CDN 통합
- 캐시 최적화
- 보안 강화

### 커스터마이징
- 설정 템플릿 수정
- 추가 헬스체크 엔드포인트
- 커스텀 모니터링 메트릭
- 알림 시스템 통합

이 문서는 nginx 관리 시스템의 전체적인 사용법과 기능을 설명합니다. 추가 질문이나 기능 요청이 있으시면 언제든지 문의해주세요.
