# AWS SSH 설정 가이드 (공식 문서 기반)

## 🔑 AWS 키 페어 구조 이해

### 키 페어 작동 원리
```
로컬 컴퓨터                    AWS EC2 인스턴스
┌─────────────────┐           ┌─────────────────┐
│ 개인키 (.pem)   │  ──────►  │ 공개키          │
│ - deukgeun_ReactProject   │           │ - ~/.ssh/       │
│ - 보안 저장     │           │   authorized_keys│
└─────────────────┘           └─────────────────┘
```

**핵심 포인트:**
- AWS는 공개키를 인스턴스의 `~/.ssh/authorized_keys`에 저장
- 로컬의 개인키(.pem)와 매칭되어야 SSH 연결 성공
- **AWS는 개인키를 저장하지 않음** - 분실 시 복구 불가

## 🚀 사용 가능한 스크립트들

### 1. SSH 진단 스크립트 (AWS 기반)
```bash
# AWS 공식 문서 기반 SSH 연결 진단
node scripts/ssh-diagnostic.cjs
```

**진단 항목:**
- ✅ AWS 키 페어 구조 검증
- ✅ EC2 인스턴스 상태 확인
- ✅ authorized_keys 파일 확인
- ✅ 네트워크 연결 진단
- ✅ SSH 클라이언트 확인

### 2. AWS 키 페어 복구 스크립트
```bash
# 개인키 분실 시 복구
node scripts/aws-key-pair-recovery.cjs
```

**복구 과정:**
- ✅ AWS CLI 및 Systems Manager 확인
- ✅ EC2 인스턴스 정보 확인
- ✅ Systems Manager를 통한 인스턴스 접근
- ✅ 새 키 페어 생성
- ✅ 인스턴스에 새 공개키 추가
- ✅ 새 키로 SSH 연결 테스트
- ✅ 기존 키 파일 교체

### 3. SSH 배포 명령어 (AWS 기반)
```bash
# 기본 명령어
./deploy-ssh-commands.sh test      # SSH 연결 테스트 (AWS 기반)
./deploy-ssh-commands.sh upload    # 프로젝트 파일 전송
./deploy-ssh-commands.sh deploy    # 전체 배포 실행
./deploy-ssh-commands.sh status    # 서비스 상태 확인
./deploy-ssh-commands.sh restart   # 서비스 재시작
./deploy-ssh-commands.sh stop      # 서비스 중지
./deploy-ssh-commands.sh logs      # 로그 확인

# AWS 기반 명령어
./deploy-ssh-commands.sh aws-status  # AWS EC2 인스턴스 상태 확인
./deploy-ssh-commands.sh ssm         # AWS Systems Manager로 인스턴스 접근
./deploy-ssh-commands.sh recover     # AWS 키 페어 복구
```

## 🔧 문제 해결 방법

### 1. SSH 연결 실패 시

#### 1-1. AWS EC2 인스턴스 확인
```bash
# AWS CLI로 인스턴스 상태 확인
aws ec2 describe-instances --filters "Name=ip-address,Values=43.203.30.167"
```

**확인 사항:**
- 인스턴스 상태가 "running"인지 확인
- 보안 그룹에서 SSH 포트(22)가 열려있는지 확인
- 키 페어가 올바르게 연결되어 있는지 확인

#### 1-2. 키 페어 검증
```bash
# 로컬 개인키에서 공개키 추출
ssh-keygen -y -f "./deukgeun_ReactProject.pem" > public_key.pub
```

**확인 사항:**
- 개인키 형식이 올바른지 확인
- 공개키가 올바르게 추출되는지 확인
- AWS 키 페어와 매칭되는지 확인

#### 1-3. authorized_keys 확인
```bash
# Systems Manager를 통한 인스턴스 접근
aws ssm start-session --target i-인스턴스ID

# 인스턴스 내부에서 실행
cat ~/.ssh/authorized_keys
ls -la ~/.ssh/
```

### 2. 개인키 분실 시

#### 2-1. AWS Systems Manager 사용 (권장)
```bash
# Systems Manager Session Manager
aws ssm start-session --target i-인스턴스ID
```

#### 2-2. EC2 Instance Connect 사용
```bash
# AWS 콘솔에서
EC2 → 인스턴스 → 연결 → EC2 Instance Connect
```

#### 2-3. 새 키 페어 생성
```bash
# 새 키 페어 생성
aws ec2 create-key-pair --key-name deukgeun_ReactProject_NEW --query "KeyMaterial" --output text > deukgeun_ReactProject_NEW.pem

# 인스턴스에 새 공개키 추가
aws ssm send-command --instance-ids i-인스턴스ID --document-name "AWS-RunShellScript" --parameters "commands=[\"echo '새공개키내용' >> ~/.ssh/authorized_keys\"]"
```

## 📚 AWS 공식 문서 참조

### 필수 문서
- [EC2 키 페어 관리](https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html)
- [SSH를 사용한 EC2 인스턴스 연결](https://docs.aws.amazon.com/ec2/latest/userguide/AccessingInstancesLinux.html)
- [Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [EC2 Instance Connect](https://docs.aws.amazon.com/ec2/latest/userguide/ec2-instance-connect.html)

### 추가 도구
- [AWS CLI 설치](https://aws.amazon.com/cli/)
- [AWS CLI 구성](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

## 🎯 사용 시나리오

### 시나리오 1: 정상적인 SSH 연결
```bash
# 1. SSH 연결 테스트
./deploy-ssh-commands.sh test

# 2. 프로젝트 배포
./deploy-ssh-commands.sh deploy
```

### 시나리오 2: SSH 연결 문제 발생
```bash
# 1. SSH 진단 실행
node scripts/ssh-diagnostic.cjs

# 2. AWS 인스턴스 상태 확인
./deploy-ssh-commands.sh aws-status

# 3. Systems Manager로 접근
./deploy-ssh-commands.sh ssm
```

### 시나리오 3: 개인키 분실
```bash
# 1. 키 페어 복구 실행
node scripts/aws-key-pair-recovery.cjs

# 2. 또는 수동 복구
./deploy-ssh-commands.sh recover
```

## ⚠️ 주의사항

1. **개인키 보안**: 개인키 파일을 안전하게 보관하세요
2. **AWS 자격 증명**: AWS CLI 자격 증명을 올바르게 설정하세요
3. **보안 그룹**: SSH 포트(22)가 올바르게 열려있는지 확인하세요
4. **네트워크**: 방화벽이나 VPN이 SSH 연결을 차단하지 않는지 확인하세요

## 🆘 문제가 지속되는 경우

1. **AWS 콘솔 확인**: EC2 인스턴스 상태 및 보안 그룹
2. **네트워크 확인**: 방화벽, VPN, 인터넷 연결
3. **다른 네트워크에서 테스트**: 모바일 핫스팟 등
4. **AWS 지원**: AWS 지원 티켓 생성

---

**참고**: 이 가이드는 AWS 공식 문서를 기반으로 deukgeun 프로젝트의 SSH 연결 문제를 체계적으로 해결하기 위해 작성되었습니다.
