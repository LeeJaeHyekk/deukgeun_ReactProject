# EC2 배포 문제 해결 가이드

## PM2 ecosystem.config.js 파일을 찾을 수 없는 오류

### 문제 상황

```
[PM2][ERROR] File ecosystem.config.js not found
```

### 해결 방법

#### 1. 즉시 해결 방법

```bash
# 프로젝트 루트로 이동
cd /path/to/your/project

# 파일 존재 확인
ls -la ecosystem.config.js

# PM2로 직접 시작
pm2 start ./ecosystem.config.js --env production
```

#### 2. 환경 테스트 실행

```bash
# EC2 환경 테스트
npm run test:ec2

# 또는 직접 실행
bash scripts/test-ec2-setup.sh
```

#### 3. 수동 배포

```bash
# 1. 프로젝트 루트로 이동
cd /path/to/your/project

# 2. 환경 변수 설정
cp env.production .env
chmod 600 .env

# 3. 의존성 설치
npm install

# 4. 빌드
npm run build:full:production:optimized

# 5. PM2 시작
pm2 start ./ecosystem.config.js --env production

# 6. 상태 확인
pm2 status
```

#### 4. 문제 진단 명령어

```bash
# 현재 디렉토리 확인
pwd
ls -la

# PM2 상태 확인
pm2 list
pm2 status

# PM2 로그 확인
pm2 logs

# 포트 사용 상태 확인
ss -tlnp | grep -E ':(3000|5000)'

# 프로세스 확인
ps aux | grep node

# 메모리 사용량 확인
free -h

# 디스크 공간 확인
df -h
```

#### 5. PM2 프로세스 정리

```bash
# 모든 PM2 프로세스 중지
pm2 stop all

# 모든 PM2 프로세스 삭제
pm2 delete all

# PM2 데몬 종료
pm2 kill

# PM2 재시작
pm2 start ./ecosystem.config.js --env production
```

#### 6. 환경 변수 확인

```bash
# .env 파일 확인
cat .env

# 환경 변수 파일 권한 확인
ls -la .env

# 권한 수정 (필요한 경우)
chmod 600 .env
```

#### 7. 빌드 파일 확인

```bash
# 빌드 디렉토리 확인
ls -la dist/

# 백엔드 빌드 파일 확인
ls -la dist/backend/

# 프론트엔드 빌드 파일 확인
ls -la dist/frontend/

# 빌드 파일 권한 확인
ls -la dist/backend/index.cjs
```

#### 8. 네트워크 및 방화벽 확인

```bash
# 방화벽 상태 확인
sudo ufw status

# 필요한 포트 열기
sudo ufw allow 3000
sudo ufw allow 5000
sudo ufw allow 80
sudo ufw allow 443

# 포트 리스닝 확인
ss -tlnp | grep -E ':(3000|5000|80|443)'
```

#### 9. 서비스 헬스 체크

```bash
# 백엔드 헬스 체크
curl http://localhost:5000/health

# 프론트엔드 확인
curl http://localhost:3000

# 외부 IP 확인
curl ifconfig.me

# 외부 접근 테스트
curl http://$(curl -s ifconfig.me):5000/health
```

#### 10. 로그 확인

```bash
# PM2 로그
pm2 logs

# 백엔드 로그
pm2 logs deukgeun-backend

# 프론트엔드 로그
pm2 logs deukgeun-frontend

# 시스템 로그
sudo journalctl -u nginx -f
sudo journalctl -u mysql -f
```

## 일반적인 문제와 해결책

### 1. 메모리 부족

```bash
# 메모리 확인
free -h

# 스왑 파일 생성
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 부팅 시 자동 마운트
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. 디스크 공간 부족

```bash
# 디스크 사용량 확인
df -h

# 불필요한 파일 정리
sudo apt-get autoremove -y
sudo apt-get autoclean
npm cache clean --force

# 로그 파일 정리
sudo find /var/log -name "*.log" -mtime +7 -delete
```

### 3. 포트 충돌

```bash
# 포트 사용 프로세스 확인
sudo lsof -i :3000
sudo lsof -i :5000

# 프로세스 종료
sudo kill -9 <PID>
```

### 4. 권한 문제

```bash
# 파일 권한 수정
chmod +x dist/backend/index.cjs
chmod 600 .env
chmod 755 logs
chmod 755 backups
```

## 배포 스크립트 개선사항

### 수정된 내용

1. **절대 경로 사용**: PM2가 `ecosystem.config.js` 파일을 찾을 수 있도록 절대 경로 사용
2. **파일 존재 확인**: 배포 전 필수 파일들의 존재 여부 확인
3. **상세한 로깅**: 문제 발생 시 더 자세한 디버깅 정보 제공
4. **환경 테스트**: EC2 환경을 사전에 테스트할 수 있는 스크립트 추가

### 사용법

```bash
# 환경 테스트
npm run test:ec2

# 간단 배포
npm run deploy:ec2:simple

# PM2 관리
npm run pm2:start
npm run pm2:stop
npm run pm2:restart
npm run pm2:status
npm run pm2:logs
```

## 연락처 및 지원

문제가 지속되는 경우:

1. 로그 파일 확인: `./logs/deployment-*.log`
2. PM2 로그 확인: `pm2 logs`
3. 시스템 로그 확인: `sudo journalctl -u nginx -f`

## 참고사항

- EC2 인스턴스 타입에 따라 메모리 제한이 다를 수 있습니다
- 보안 그룹에서 필요한 포트(22, 80, 443, 3000, 5000)가 열려있는지 확인하세요
- SSL 인증서가 필요한 경우 Let's Encrypt를 사용하세요
