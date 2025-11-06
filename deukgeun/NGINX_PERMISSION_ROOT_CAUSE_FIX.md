# Nginx 설정 파일 권한 문제 근본 해결

## 🔍 근본 원인 분석

### 문제 상황
```
EACCES: permission denied, open '/etc/nginx/conf.d/devtrail.conf'
```

### 근본 원인

1. **파일 소유권 문제**
   - `/etc/nginx/conf.d/devtrail.conf` 파일이 `root:root` 소유
   - 파일 권한이 `644` (rw-r--r--)로 설정되어 있어 일반 사용자는 읽기만 가능
   - ec2-user는 `wheel` 그룹에 속해 있지만 nginx 그룹에는 속해 있지 않음

2. **디렉토리 권한 문제**
   - `/etc/nginx/conf.d/` 디렉토리 권한이 일반 사용자가 쓰기 불가능

3. **워크플로우 문제**
   - 사용자가 IDE에서 `/etc/nginx/conf.d/devtrail.conf` 파일을 직접 편집하려고 시도
   - 하지만 시스템 파일은 root 소유로 유지되어야 함

## ✅ 근본 해결 방법

### 방법 1: 그룹 권한 설정 (적용됨)

**1단계: ec2-user를 nginx 그룹에 추가**
```bash
sudo usermod -a -G nginx ec2-user
```

**2단계: 파일 소유권을 nginx 그룹으로 변경**
```bash
sudo chgrp nginx /etc/nginx/conf.d/devtrail.conf
```

**3단계: 그룹 쓰기 권한 부여**
```bash
sudo chmod 664 /etc/nginx/conf.d/devtrail.conf
```

**4단계: 디렉토리 권한 설정**
```bash
sudo chmod 775 /etc/nginx/conf.d
```

**결과:**
- 파일 권한: `-rw-rw-r--` (root:nginx, 664)
- ec2-user가 nginx 그룹에 속해 있으므로 파일을 직접 수정 가능
- IDE에서도 저장 가능

### 방법 2: 프로젝트 파일만 편집 (권장 워크플로우)

**근본적인 해결책:**
- `/etc/nginx/conf.d/devtrail.conf` 파일을 IDE에서 직접 편집하지 않음
- 프로젝트의 `nginx-site.conf` 파일만 편집
- 자동화 스크립트로 nginx 설정 파일 업데이트

**워크플로우:**
1. 프로젝트의 `nginx-site.conf` 파일 수정
2. 스크립트로 nginx 설정 파일 업데이트:
   ```bash
   bash scripts/update-nginx-config.sh
   ```

## 🔧 적용된 변경 사항

### 1. 사용자 그룹 설정
```bash
# ec2-user를 nginx 그룹에 추가
sudo usermod -a -G nginx ec2-user
```

**확인:**
```bash
id ec2-user
# 출력: ... groups=1000(ec2-user),4(adm),10(wheel),190(systemd-journal),992(docker),991(nginx)
```

### 2. 파일 권한 설정
```bash
# 파일 소유권 변경
sudo chgrp nginx /etc/nginx/conf.d/devtrail.conf

# 파일 권한 변경 (그룹 쓰기 권한 부여)
sudo chmod 664 /etc/nginx/conf.d/devtrail.conf
```

**결과:**
```
-rw-rw-r--. 1 root nginx 5717 Nov  5 12:20 /etc/nginx/conf.d/devtrail.conf
```

### 3. 디렉토리 권한 설정
```bash
# 디렉토리 권한 변경 (그룹 쓰기 권한 부여)
sudo chmod 775 /etc/nginx/conf.d
```

**결과:**
```
drwxrwxr-x. 2 root nginx 4096 Nov  5 12:20 /etc/nginx/conf.d
```

### 4. 업데이트 스크립트 수정

**변경 전:**
```bash
sudo chmod 644 "$NGINX_TARGET"
sudo chown root:root "$NGINX_TARGET"
```

**변경 후:**
```bash
sudo chmod 664 "$NGINX_TARGET"
sudo chown root:nginx "$NGINX_TARGET"
```

## 🔄 새 세션 적용

**중요:** 그룹 변경 사항은 새 세션(재로그인)에서만 적용됩니다.

**즉시 적용하려면:**
```bash
# 현재 세션에서 그룹 변경 사항 적용
newgrp nginx

# 또는
exec su -l ec2-user
```

**확인:**
```bash
groups
# 출력에 nginx가 포함되어야 함
```

## 🧪 테스트

### 1. 파일 쓰기 테스트
```bash
# ec2-user로 파일 수정 테스트
echo "# test" | sudo tee -a /etc/nginx/conf.d/devtrail.conf
```

### 2. IDE에서 저장 테스트
- IDE에서 `/etc/nginx/conf.d/devtrail.conf` 파일 열기
- 간단한 변경 사항 추가
- 저장 시도
- ✅ 권한 오류 없이 저장되어야 함

### 3. nginx 설정 테스트
```bash
sudo nginx -t
```

## ⚠️ 주의 사항

### 1. 보안 고려사항

**권한 설정:**
- 파일은 여전히 root 소유 (시스템 보안 유지)
- nginx 그룹에 쓰기 권한만 부여
- 다른 사용자는 읽기만 가능

**권장:**
- 프로덕션 환경에서는 프로젝트 파일만 편집하고 스크립트로 업데이트
- 개발 환경에서만 직접 편집 허용

### 2. 파일 동기화

**주의:**
- IDE에서 `/etc/nginx/conf.d/devtrail.conf` 파일을 직접 편집하면
- 프로젝트의 `nginx-site.conf` 파일과 동기화가 깨질 수 있음

**권장:**
- 프로젝트 파일(`nginx-site.conf`)을 원본으로 유지
- nginx 설정 파일은 프로젝트 파일에서 복사

### 3. 그룹 변경 적용

**중요:**
- `usermod -a -G nginx ec2-user` 실행 후
- 새 세션(재로그인) 또는 `newgrp nginx` 필요
- 현재 세션에서는 변경 사항이 적용되지 않을 수 있음

## 📋 권장 워크플로우

### 방법 A: 직접 편집 (개발 환경)

1. **그룹 변경 적용 확인**
   ```bash
   groups  # nginx 그룹이 포함되어 있는지 확인
   ```

2. **IDE에서 직접 편집**
   - `/etc/nginx/conf.d/devtrail.conf` 파일 열기
   - 수정 후 저장
   - ✅ 권한 오류 없이 저장 가능

3. **프로젝트 파일 동기화**
   ```bash
   # nginx 설정 파일을 프로젝트 파일로 복사
   cp /etc/nginx/conf.d/devtrail.conf nginx-site.conf
   ```

4. **nginx 설정 테스트 및 재시작**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 방법 B: 프로젝트 파일 편집 (프로덕션 환경)

1. **프로젝트 파일 편집**
   - `nginx-site.conf` 파일 수정

2. **nginx 설정 파일 업데이트**
   ```bash
   bash scripts/update-nginx-config.sh
   ```

3. **nginx 설정 테스트 및 재시작**
   - 스크립트가 자동으로 처리

## 🎯 해결 결과

### 변경 전
```
-rw-r--r--. 1 root root 5717 Nov  5 12:20 /etc/nginx/conf.d/devtrail.conf
```
- ❌ ec2-user가 파일 수정 불가
- ❌ IDE에서 저장 시 권한 오류 발생

### 변경 후
```
-rw-rw-r--. 1 root nginx 5717 Nov  5 12:20 /etc/nginx/conf.d/devtrail.conf
drwxrwxr-x. 2 root nginx 4096 Nov  5 12:20 /etc/nginx/conf.d
```
- ✅ ec2-user가 파일 수정 가능 (nginx 그룹 멤버)
- ✅ IDE에서 저장 가능
- ✅ 시스템 보안 유지 (root 소유)

## 📝 요약

**근본 원인:**
- `/etc/nginx/conf.d/devtrail.conf` 파일이 root 소유
- ec2-user가 nginx 그룹에 속해 있지 않음
- 파일에 그룹 쓰기 권한이 없음

**해결:**
1. ec2-user를 nginx 그룹에 추가
2. 파일 소유권을 nginx 그룹으로 변경
3. 파일에 그룹 쓰기 권한 부여 (664)
4. 디렉토리에 그룹 쓰기 권한 부여 (775)
5. 업데이트 스크립트 수정

**결과:**
- ✅ IDE에서 직접 저장 가능
- ✅ 시스템 보안 유지
- ✅ 워크플로우 개선

**참고:**
- 새 세션에서 그룹 변경 사항 적용
- 프로덕션 환경에서는 프로젝트 파일만 편집 권장

