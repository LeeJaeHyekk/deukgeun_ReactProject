# 파일 동기화 문제 해결

## 🔍 문제 상황

### 발생한 오류
```
'devtrail.conf'을(를) 저장하지 못했습니다. 
파일의 내용이 최신입니다. 
버전을 파일 내용과 비교하거나 파일 내용을 변경 사항으로 덮어쓰십시오.
```

### 원인 분석

**문제 원인:**
- IDE에서 열어둔 `/etc/nginx/conf.d/devtrail.conf` 파일과 서버의 실제 파일이 다름
- 서버에서 직접 수정하여 버전 충돌 발생
- 파일이 root 소유로 일반 사용자는 직접 수정 불가

**차이점:**
- 실제 nginx 설정 파일: 이전 버전 (정규식 location이 먼저)
- 프로젝트 파일: 최신 버전 (prefix location이 먼저, 헬스체크 위치 변경)

## ✅ 해결 방법

### 방법 1: 자동화 스크립트 사용 (권장)

**프로젝트에 제공된 스크립트 사용:**

```bash
bash /home/ec2-user/deukgeun_ReactProject/deukgeun/scripts/update-nginx-config.sh
```

이 스크립트는:
1. 프로젝트의 `nginx-site.conf`를 `/etc/nginx/conf.d/devtrail.conf`로 복사
2. 파일 권한 설정
3. nginx 설정 테스트
4. nginx 재시작 여부 확인

### 방법 2: 직접 복사 (간단)

```bash
# 프로젝트 파일을 nginx 설정 파일로 복사
sudo cp /home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf /etc/nginx/conf.d/devtrail.conf

# 파일 권한 설정
sudo chmod 644 /etc/nginx/conf.d/devtrail.conf
sudo chown root:root /etc/nginx/conf.d/devtrail.conf

# nginx 설정 테스트
sudo nginx -t

# nginx 재시작
sudo systemctl reload nginx
```

### 방법 3: IDE에서 파일 새로고침

**IDE에서:**
1. `/etc/nginx/conf.d/devtrail.conf` 파일 닫기
2. 파일 다시 열기
3. 최신 버전으로 새로고침

또는

1. IDE에서 "Discard Changes" 또는 "Reload from Disk" 선택
2. 프로젝트의 `nginx-site.conf` 파일을 수정
3. 위의 방법 1 또는 2로 복사

## 📋 권장 워크플로우

### 올바른 작업 순서

1. **프로젝트 파일 수정**
   ```bash
   # 프로젝트의 nginx 설정 파일 수정
   vim /home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf
   # 또는 IDE에서 수정
   ```

2. **nginx 설정 파일 업데이트**
   ```bash
   # 방법 1: 스크립트 사용
   bash scripts/update-nginx-config.sh
   
   # 방법 2: 직접 복사
   sudo cp nginx-site.conf /etc/nginx/conf.d/devtrail.conf
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **검증**
   ```bash
   # nginx 설정 테스트
   sudo nginx -t
   
   # 정적 파일 테스트
   curl -I http://localhost/js/vendor-BDnF4zds.js
   ```

### 잘못된 작업 순서

❌ **IDE에서 `/etc/nginx/conf.d/devtrail.conf` 직접 수정**
- 권한 오류 발생
- 파일이 root 소유이므로 일반 사용자는 수정 불가

❌ **두 파일을 독립적으로 수정**
- 버전 충돌 발생
- 파일이 서로 다른 상태가 됨

## 🔄 파일 동기화 확인

### 파일 동기화 확인 방법

```bash
# 파일 비교
sudo diff /etc/nginx/conf.d/devtrail.conf /home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf

# MD5 해시 비교
sudo md5sum /etc/nginx/conf.d/devtrail.conf /home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf

# 동일하면 해시가 같아야 함
```

### 동기화 스크립트

```bash
#!/bin/bash
# nginx 설정 파일 동기화 스크립트

PROJECT_ROOT="/home/ec2-user/deukgeun_ReactProject/deukgeun"
NGINX_SOURCE="$PROJECT_ROOT/nginx-site.conf"
NGINX_TARGET="/etc/nginx/conf.d/devtrail.conf"

# 파일 비교
if sudo diff "$NGINX_SOURCE" "$NGINX_TARGET" > /dev/null 2>&1; then
    echo "✅ 파일이 동기화되어 있습니다."
else
    echo "⚠️  파일이 다릅니다. 동기화 중..."
    sudo cp "$NGINX_SOURCE" "$NGINX_TARGET"
    sudo chmod 644 "$NGINX_TARGET"
    sudo chown root:root "$NGINX_TARGET"
    
    if sudo nginx -t; then
        echo "✅ 동기화 완료. nginx 설정이 유효합니다."
        read -p "nginx를 재시작하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo systemctl reload nginx
            echo "✅ nginx가 재시작되었습니다."
        fi
    else
        echo "❌ nginx 설정이 유효하지 않습니다."
    fi
fi
```

## ⚠️ 주의 사항

### 1. 파일 권한
- `/etc/nginx/conf.d/devtrail.conf`는 root 소유
- 일반 사용자는 읽기만 가능
- 수정 시 sudo 사용 필요

### 2. 작업 순서
1. 프로젝트 파일 (`nginx-site.conf`) 수정
2. 실제 nginx 설정 파일로 복사
3. nginx 설정 테스트
4. nginx 재시작

### 3. IDE 사용
- IDE에서 `/etc/nginx/` 파일 직접 수정 시도하지 않음
- 프로젝트 파일만 수정
- 스크립트로 자동 업데이트

## 🎯 예방 방법

### 1. 자동화 스크립트 사용
- `scripts/update-nginx-config.sh` 사용
- 일관된 워크플로우 유지

### 2. 파일 동기화 확인
- 수정 전후 파일 비교
- MD5 해시 확인

### 3. Git 커밋
- 프로젝트 파일 (`nginx-site.conf`)만 Git에 커밋
- 실제 nginx 설정 파일은 Git에 포함하지 않음

## 📝 요약

**문제:**
- IDE에서 열어둔 파일과 서버의 실제 파일이 다름
- 버전 충돌 발생

**해결:**
1. 프로젝트 파일 (`nginx-site.conf`) 수정
2. `sudo cp` 명령어로 복사 또는 스크립트 사용
3. nginx 설정 테스트 및 재시작

**향후:**
- 프로젝트 파일만 수정
- 스크립트로 자동 업데이트
- IDE에서 `/etc/nginx/` 파일 직접 수정 시도하지 않음

