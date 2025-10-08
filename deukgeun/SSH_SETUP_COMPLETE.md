# SSH 키 설정 완료 안내

## 🎉 SSH 키 설정이 완료되었습니다!

새로운 AWS EC2 키 페어 `deukgeun_ReactProject.pem`을 사용하여 연결 설정이 완료되었습니다.

## 📋 생성된 파일들

1. **ssh-config** - SSH 설정 파일
2. **deploy-ssh-commands.sh** - 배포용 SSH 명령어 스크립트
3. **deukgeun_ReactProject.pem** - SSH 키 파일 (프로젝트 디렉토리에 복사됨)
4. **.env** - 환경 변수 파일 (SSH 설정 추가됨)

## 🔧 현재 상황

- ✅ SSH 키 파일 확인 완료
- ✅ SSH 설정 파일 생성 완료
- ✅ 배포 스크립트 생성 완료
- ⚠️ Windows에서 SSH 권한 문제 발생

## 🚀 사용 방법

### 방법 1: WSL (Windows Subsystem for Linux) 사용 (권장)

```bash
# WSL에서 실행
cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
chmod 600 deukgeun_ReactProject.pem
ssh -i deukgeun_ReactProject.pem ubuntu@43.203.30.167
```

### 방법 2: Git Bash 사용

```bash
# Git Bash에서 실행
cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
chmod 600 deukgeun_ReactProject.pem
ssh -i deukgeun_ReactProject.pem ubuntu@43.203.30.167
```

### 방법 3: 배포 스크립트 사용

```bash
# Linux/Mac에서 실행
./deploy-ssh-commands.sh test    # SSH 연결 테스트
./deploy-ssh-commands.sh upload # 프로젝트 파일 전송
./deploy-ssh-commands.sh deploy # 전체 배포 실행
```

## 📝 배포 스크립트 명령어

- `test` - SSH 연결 테스트
- `upload` - 프로젝트 파일 전송
- `deploy` - 전체 배포 실행
- `status` - 서비스 상태 확인
- `restart` - 서비스 재시작
- `stop` - 서비스 중지
- `logs` - 로그 확인

## 🔍 SSH 설정 정보

- **키 파일**: `./deukgeun_ReactProject.pem`
- **EC2 호스트**: `43.203.30.167`
- **사용자**: `ubuntu`
- **포트**: `22`

## ⚠️ 주의사항

1. **Windows 권한 문제**: Windows에서 직접 SSH 사용 시 권한 문제가 발생할 수 있습니다.
2. **WSL 권장**: WSL을 사용하면 Linux 환경에서 SSH를 사용할 수 있습니다.
3. **보안**: SSH 키 파일은 안전하게 보관하세요.

## 🆘 문제 해결

### SSH 연결 실패 시

1. **WSL 사용**: `wsl` 명령어로 WSL 환경 진입
2. **권한 수정**: `chmod 600 deukgeun_ReactProject.pem`
3. **연결 테스트**: `ssh -i deukgeun_ReactProject.pem ubuntu@43.203.30.167`

### Windows에서 권한 문제 해결

1. 파일 속성 > 보안 > 고급
2. 상속 사용 안 함 > 제거
3. 현재 사용자에게만 읽기 권한 부여

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. SSH 키 파일이 올바른 위치에 있는지
2. EC2 인스턴스가 실행 중인지
3. 보안 그룹에서 SSH 포트(22)가 열려있는지
4. SSH 키 파일의 권한이 올바른지

---

**생성일**: 2024년 12월 19일  
**마지막 업데이트**: 2024년 12월 19일
