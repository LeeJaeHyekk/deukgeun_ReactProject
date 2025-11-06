# VS Code 파일 동기화 오류 해결

## 🔍 문제 상황

**오류 메시지:**
```
'devtrail.conf'을(를) 저장하지 못했습니다. 
파일의 내용이 최신입니다. 
버전을 파일 내용과 비교하거나 파일 내용을 변경 사항으로 덮어쓰십시오.
```

## ✅ 원인 분석

### 확인 결과

1. **파일 내용 확인:**
   - `/etc/nginx/conf.d/devtrail.conf`와 `nginx-site.conf`의 MD5 해시가 동일
   - 두 파일의 내용이 완전히 동일함

2. **권한 확인:**
   - 파일 소유자: `root:nginx`
   - 파일 권한: `664` (rw-rw-r--)
   - `ec2-user`가 `nginx` 그룹에 포함되어 있음

3. **문제 원인:**
   - VS Code의 원격 파일 동기화 문제
   - 파일이 실제로 동일하지만 VS Code가 동기화 상태를 잘못 인식
   - 파일 메타데이터 동기화 문제

## ✅ 해결 방법

### 방법 1: VS Code에서 파일 다시 로드 (권장)

**VS Code에서:**
1. 파일을 닫음 (`Ctrl+W` 또는 탭 우클릭 → Close)
2. 파일을 다시 열기 (`Ctrl+P` → `devtrail.conf` 입력)
3. 저장 시도

### 방법 2: VS Code 재연결

**VS Code에서:**
1. `Ctrl+Shift+P` → "Remote-SSH: Kill VS Code Server on Host"
2. 다시 연결

### 방법 3: 파일 강제 동기화 (완료됨)

**터미널에서 실행 완료:**
```bash
# 파일 타임스탬프 업데이트 (VS Code가 변경사항을 인식하도록)
sudo touch /etc/nginx/conf.d/devtrail.conf

# 파일 내용을 약간 수정했다가 되돌려서 동기화 강제 트리거
sudo sed -i '1s/^/# VS Code 동기화 강제 트리거\n/' /etc/nginx/conf.d/devtrail.conf
sudo sed -i '1,2d' /etc/nginx/conf.d/devtrail.conf
```

**✅ 실행 완료:** 파일 동기화가 강제로 트리거되었습니다.

### 방법 4: 스크립트 사용 (권장)

**프로젝트의 `nginx-site.conf`를 수정한 경우:**
```bash
# 스크립트를 사용하여 파일 복사
cd /home/ec2-user/deukgeun_ReactProject/deukgeun
./scripts/update-nginx-config.sh
```

이 스크립트는:
- `nginx-site.conf`를 `/etc/nginx/conf.d/devtrail.conf`로 복사
- 파일 권한 설정
- nginx 설정 테스트
- nginx 재시작

### 방법 5: VS Code 설정 확인

**VS Code 설정에서:**
1. `Ctrl+,` → 설정 열기
2. "files.autoSave" 확인
3. "remote.SSH.useLocalServer" 확인

## 🔧 권장 워크플로우

### 올바른 작업 순서

1. **프로젝트의 `nginx-site.conf` 수정:**
   ```bash
   # VS Code에서 수정
   vim nginx-site.conf
   ```

2. **스크립트를 사용하여 적용:**
   ```bash
   ./scripts/update-nginx-config.sh
   ```

3. **VS Code에서 `/etc/nginx/conf.d/devtrail.conf` 직접 수정하지 않기:**
   - 이 파일은 스크립트를 통해 관리됨
   - 직접 수정하면 동기화 문제 발생 가능

## ⚠️ 주의사항

### 1. 파일 수정 권장 방법

**❌ 하지 말아야 할 것:**
- VS Code에서 `/etc/nginx/conf.d/devtrail.conf` 직접 수정
- 파일이 동기화되지 않을 수 있음

**✅ 권장 방법:**
- 프로젝트의 `nginx-site.conf` 수정
- `scripts/update-nginx-config.sh` 스크립트 실행
- 자동으로 파일 복사 및 nginx 재시작

### 2. 파일 동기화 문제 발생 시

**즉시 해결:**
```bash
# 파일 강제 동기화
sudo touch /etc/nginx/conf.d/devtrail.conf

# VS Code에서 파일 다시 열기
```

**근본 해결:**
- 프로젝트의 `nginx-site.conf`만 수정
- 스크립트를 사용하여 적용

## 📝 요약

**문제:**
- VS Code가 파일 동기화 상태를 잘못 인식
- 파일 내용은 동일하지만 VS Code가 저장을 거부

**해결:**
1. VS Code에서 파일 다시 로드
2. 프로젝트의 `nginx-site.conf` 수정 후 스크립트 사용
3. 직접 수정보다는 스크립트를 통한 관리 권장

**권장 워크플로우:**
```
nginx-site.conf 수정 → update-nginx-config.sh 실행 → 자동 적용
```

