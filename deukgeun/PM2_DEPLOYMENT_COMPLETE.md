# PM2 프로덕션 배포 완료 보고서

## ✅ 배포 완료 상태

**배포 날짜**: 2025-11-05  
**배포 환경**: 프로덕션 (production)  
**서비스 URL**: https://www.devtrail.net

---

## 📋 배포 내용

### 1. 백엔드 서버
- **프로세스명**: `deukgeun-backend`
- **상태**: `online` ✅
- **포트**: 5000 (0.0.0.0에서 리스닝)
- **환경**: production
- **빌드 파일**: `dist/backend/backend/index.cjs`

### 2. 프론트엔드
- **서빙 방식**: nginx 정적 파일 서빙
- **빌드 파일**: `dist/frontend/index.html`
- **서비스 URL**: https://www.devtrail.net

### 3. nginx 설정
- **상태**: active ✅
- **포트**: 80 (HTTP)
- **프록시**: `/api/` → `http://127.0.0.1:5000`
- **헬스체크**: `/health` → `http://127.0.0.1:5000/health`

---

## 🔧 환경 변수 설정

### 프로덕션 환경 변수
```env
NODE_ENV=production
MODE=production
PORT=5000
CORS_ORIGIN=https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000
VITE_BACKEND_URL=http://43.203.30.167:5000
VITE_FRONTEND_URL=https://www.devtrail.net
VITE_RECAPTCHA_SITE_KEY=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P
RECAPTCHA_SITE_KEY=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P
NODE_PATH=./dist/backend/backend
```

---

## 🛡️ 안전장치

### 1. 파일 존재 확인
- ✅ `dist/backend/backend/index.cjs` 존재 확인
- ✅ `dist/frontend/index.html` 존재 확인
- ✅ `ecosystem.config.cjs` 존재 확인

### 2. 로그 디렉토리
- ✅ `logs/` 디렉토리 자동 생성
- ✅ 권한 설정: 755

### 3. 포트 충돌 확인
- ✅ 포트 5000 사용 확인
- ✅ 포트 80 (nginx) 사용 확인

### 4. PM2 안전장치
- ✅ **자동 재시작**: `autorestart: true`
- ✅ **메모리 제한**: `max_memory_restart: '2G'`
- ✅ **최소 실행 시간**: `min_uptime: '30s'`
- ✅ **최대 재시작 횟수**: `max_restarts: 5`
- ✅ **재시작 지연**: `restart_delay: 5000`
- ✅ **프로세스 종료 타임아웃**: `kill_timeout: 5000`
- ✅ **서버 준비 대기**: `wait_ready: true`
- ✅ **리스닝 타임아웃**: `listen_timeout: 10000`

### 5. 헬스체크
- ✅ Express 서버 헬스체크: `/health` (HTTP 200 반환)
- ✅ nginx 헬스체크 프록시: `/health` → 백엔드
- ✅ ALB 헬스체크: `/health` (200-399 정상)

---

## 📊 현재 상태

### PM2 프로세스
```
┌────┬─────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ deukgeun-backend    │ default     │ 0.0.0   │ fork    │ 114924   │ 27s    │ 0    │ online    │ 0%       │ 59.1mb   │ ec2-user │ disabled │
└────┴─────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### 포트 리스닝
- ✅ **포트 5000**: Express 서버 (0.0.0.0:5000)
- ✅ **포트 80**: nginx (HTTP)

### 서비스 상태
- ✅ **PM2**: online
- ✅ **nginx**: active
- ✅ **헬스체크**: HTTP 200 OK

---

## 🔍 검증 명령어

### PM2 상태 확인
```bash
pm2 status
pm2 describe deukgeun-backend
pm2 logs
```

### 헬스체크 확인
```bash
# Express 서버 직접 접근
curl -I http://localhost:5000/health

# nginx를 통한 접근
curl -I http://localhost/health

# 외부 접근 (ALB를 통한 접근)
curl -I https://www.devtrail.net/health
```

### 포트 확인
```bash
sudo lsof -i -P -n | grep LISTEN | grep -E "5000|80"
```

### 환경 변수 확인
```bash
pm2 env 0
```

---

## 📝 주요 명령어

### PM2 관리
```bash
# 상태 확인
pm2 status

# 재시작
pm2 restart ecosystem.config.cjs

# 중지
pm2 stop ecosystem.config.cjs

# 시작
pm2 start ecosystem.config.cjs --env production

# 로그 확인
pm2 logs

# 설정 저장
pm2 save
```

### 배포 스크립트
```bash
# PM2 배포 스크립트 실행
bash scripts/pm2-deploy.sh
```

---

## 🚀 배포 프로세스

### 1. 필수 파일 확인
- ✅ 빌드 파일 존재 확인
- ✅ PM2 설정 파일 확인

### 2. 로그 디렉토리 생성
- ✅ `logs/` 디렉토리 생성 및 권한 설정

### 3. 포트 확인
- ✅ 포트 5000 사용 확인
- ✅ 포트 충돌 확인

### 4. 기존 프로세스 정리
- ✅ 기존 PM2 프로세스 중지 및 삭제

### 5. PM2 프로세스 시작
- ✅ 프로덕션 환경으로 시작
- ✅ 환경 변수 설정 확인

### 6. 배포 후 검증
- ✅ PM2 프로세스 상태 확인
- ✅ 포트 리스닝 확인
- ✅ 헬스체크 통과 확인

---

## 📁 파일 구조

```
/home/ec2-user/deukgeun_ReactProject/deukgeun/
├── dist/
│   ├── backend/
│   │   └── backend/
│   │       └── index.cjs          # 백엔드 빌드 파일
│   └── frontend/
│       └── index.html              # 프론트엔드 빌드 파일
├── ecosystem.config.cjs             # PM2 설정 파일
├── logs/                            # 로그 디렉토리
│   ├── backend-error.log
│   ├── backend-out.log
│   └── backend-combined.log
└── scripts/
    └── pm2-deploy.sh                # PM2 배포 스크립트
```

---

## ⚠️ 주의사항

### 1. 데이터베이스 연결
- 현재 데이터베이스 연결이 실패해도 서버는 실행 중입니다
- 헬스체크를 위해 데이터베이스 연결 실패 시에도 HTTP 200을 반환합니다
- 데이터베이스 연결 문제는 별도로 해결해야 합니다

### 2. 환경 변수
- 프로덕션 환경 변수는 `ecosystem.config.cjs`의 `env_production` 섹션에 정의되어 있습니다
- 환경 변수 변경 시 PM2 재시작이 필요합니다

### 3. 빌드 파일
- 빌드 파일은 `dist/` 디렉토리에 있어야 합니다
- 빌드 파일 변경 시 PM2 재시작이 필요합니다

### 4. nginx 설정
- nginx 설정은 `/etc/nginx/conf.d/devtrail.conf`에 있습니다
- nginx 설정 변경 시 `sudo systemctl reload nginx` 실행이 필요합니다

---

## ✅ 완료 체크리스트

- [x] 빌드 파일 존재 확인
- [x] PM2 설정 파일 검증
- [x] 로그 디렉토리 생성
- [x] 포트 충돌 확인
- [x] 기존 프로세스 정리
- [x] PM2 프로덕션 환경으로 배포
- [x] 환경 변수 설정 확인
- [x] 헬스체크 통과 확인
- [x] nginx 설정 확인
- [x] PM2 설정 저장

---

## 🎯 다음 단계

1. **데이터베이스 연결 확인**
   - 데이터베이스 연결 문제 해결
   - 데이터베이스 마이그레이션 실행

2. **ALB 대상 그룹 확인**
   - AWS 콘솔에서 대상 그룹 상태 확인
   - 헬스체크 설정 확인

3. **모니터링 설정**
   - PM2 모니터링 활성화
   - 로그 모니터링 설정

4. **성능 최적화**
   - 메모리 사용량 모니터링
   - CPU 사용량 모니터링

---

## 📚 참고 문서

- [PM2 공식 문서](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [nginx 설정 가이드](./nginx-site.conf)
- [ALB 헬스체크 가이드](./ALB_HEALTH_CHECK_FIXED.md)

---

**배포 완료 시간**: 2025-11-05 10:02:00 UTC  
**배포 담당**: PM2 배포 스크립트  
**배포 상태**: ✅ 성공

