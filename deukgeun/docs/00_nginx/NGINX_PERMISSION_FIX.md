# nginx 설정 파일 권한 오류 해결

## 🔍 문제 상황

### 발생한 오류
```
EACCES: permission denied, open '/etc/nginx/conf.d/devtrail.conf'
```

### 원인
- `/etc/nginx/conf.d/devtrail.conf` 파일이 root 소유
- 일반 사용자(ec2-user)는 읽기만 가능하고 쓰기 불가
- `/etc/nginx/` 디렉토리는 시스템 디렉토리로 root 권한 필요

## ✅ 해결 방법

### 방법 1: sudo를 사용하여 파일 복사 (권장)

**프로젝트의 nginx-site.conf를 실제 nginx 설정 파일로 복사:**

```bash
# 프로젝트 설정 파일을 nginx 설정 디렉토리로 복사
sudo cp /home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf /etc/nginx/conf.d/devtrail.conf

# 파일 권한 설정
sudo chmod 644 /etc/nginx/conf.d/devtrail.conf
sudo chown root:root /etc/nginx/conf.d/devtrail.conf

# nginx 설정 테스트
sudo nginx -t

# nginx 재시작
sudo systemctl reload nginx
```

### 방법 2: 자동화 스크립트 사용

**프로젝트에 제공된 스크립트 사용:**

```bash
# 스크립트 실행
bash /home/ec2-user/deukgeun_ReactProject/deukgeun/scripts/update-nginx-config.sh
```

이 스크립트는:
1. 프로젝트의 `nginx-site.conf`를 `/etc/nginx/conf.d/devtrail.conf`로 복사
2. 파일 권한 설정
3. nginx 설정 테스트
4. nginx 재시작 여부 확인

### 방법 3: IDE에서 직접 수정 (권장하지 않음)

**IDE에서 직접 수정하려면:**
1. 프로젝트의 `nginx-site.conf` 파일을 수정
2. 위의 방법 1 또는 2를 사용하여 파일 복사

**주의:** `/etc/nginx/conf.d/devtrail.conf`를 IDE에서 직접 수정하면 권한 오류가 발생합니다.

## 📋 작업 흐름 (권장)

### 1. 프로젝트 파일 수정
```bash
# 프로젝트의 nginx 설정 파일 수정
vim /home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf
# 또는 IDE에서 수정
```

### 2. nginx 설정 파일 업데이트
```bash
# 방법 1: 직접 복사
sudo cp /home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf /etc/nginx/conf.d/devtrail.conf

# 방법 2: 스크립트 사용
bash scripts/update-nginx-config.sh
```

### 3. nginx 설정 테스트 및 재시작
```bash
# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl reload nginx
```

## 🔄 자동화 스크립트 상세

### 스크립트 위치
```
/home/ec2-user/deukgeun_ReactProject/deukgeun/scripts/update-nginx-config.sh
```

### 스크립트 기능
1. ✅ 소스 파일 존재 확인
2. ✅ nginx 설정 파일 복사
3. ✅ 파일 권한 설정
4. ✅ nginx 설정 테스트
5. ✅ nginx 재시작 확인 (대화형)

### 사용 예시
```bash
# 프로젝트 루트에서 실행
cd /home/ec2-user/deukgeun_ReactProject/deukgeun
bash scripts/update-nginx-config.sh
```

## ⚠️ 주의 사항

### 1. 파일 권한
- `/etc/nginx/conf.d/devtrail.conf`는 root 소유로 유지
- 일반 사용자는 읽기만 가능
- 수정 시 sudo 사용 필요

### 2. 작업 순서
1. 프로젝트 파일 (`nginx-site.conf`) 수정
2. 실제 nginx 설정 파일로 복사
3. nginx 설정 테스트
4. nginx 재시작

### 3. 백업
- nginx 설정 파일 수정 전 백업 권장
```bash
sudo cp /etc/nginx/conf.d/devtrail.conf /etc/nginx/conf.d/devtrail.conf.backup
```

## 🎯 권장 워크플로우

### 개발 환경
1. 프로젝트의 `nginx-site.conf` 파일 수정
2. 로컬에서 테스트
3. 스크립트로 nginx 설정 파일 업데이트
4. nginx 재시작

### 프로덕션 환경
1. 프로젝트의 `nginx-site.conf` 파일 수정
2. Git에 커밋
3. 배포 스크립트에서 자동으로 nginx 설정 파일 업데이트
4. nginx 재시작

## 📝 요약

**문제:**
- `/etc/nginx/conf.d/devtrail.conf`는 root 소유
- 일반 사용자는 직접 수정 불가

**해결:**
1. 프로젝트의 `nginx-site.conf` 파일 수정
2. `sudo cp` 명령어로 복사 또는 스크립트 사용
3. nginx 설정 테스트 및 재시작

**향후:**
- 프로젝트 파일만 수정
- 스크립트로 자동 업데이트
- IDE에서 직접 `/etc/nginx/` 파일 수정 시도하지 않음

