#!/bin/bash

# SSH 연결 테스트 스크립트 (Linux/Mac)
# 사용법: ./scripts/ssh-connection-test.sh

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 설정
KEY_PATH="./deukgeun_ReactProject.pem"
HOST="43.203.30.167"
USERS=("ec2-user" "ubuntu" "admin")

echo -e "${CYAN}🔍 SSH 연결 진단을 시작합니다...${NC}\n"

# 1. 키 파일 확인
echo -e "${YELLOW}1️⃣ SSH 키 파일 확인 중...${NC}"
if [ ! -f "$KEY_PATH" ]; then
    echo -e "${RED}❌ SSH 키 파일을 찾을 수 없습니다: $KEY_PATH${NC}"
    echo -e "${YELLOW}📝 키 파일 경로를 확인하고 수정하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH 키 파일 확인: $KEY_PATH${NC}"

# 2. 키 파일 권한 확인 및 수정
echo -e "\n${YELLOW}2️⃣ SSH 키 파일 권한 확인 중...${NC}"
CURRENT_PERMS=$(stat -c "%a" "$KEY_PATH" 2>/dev/null || stat -f "%OLp" "$KEY_PATH" 2>/dev/null || echo "unknown")
if [ "$CURRENT_PERMS" = "600" ]; then
    echo -e "${GREEN}✅ SSH 키 파일 권한이 올바릅니다 (600)${NC}"
else
    echo -e "${YELLOW}⚠️ SSH 키 파일 권한 수정 중... (현재: $CURRENT_PERMS)${NC}"
    chmod 600 "$KEY_PATH"
    echo -e "${GREEN}✅ SSH 키 파일 권한 수정 완료 (600)${NC}"
fi

# 3. 네트워크 연결 확인
echo -e "\n${YELLOW}3️⃣ 네트워크 연결 확인 중...${NC}"
if ping -c 2 -W 2 "$HOST" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Ping 연결 성공 ($HOST)${NC}"
else
    echo -e "${RED}❌ Ping 연결 실패 ($HOST)${NC}"
fi

# 4. 포트 22 연결 확인
echo -e "\n${YELLOW}4️⃣ 포트 22 연결 확인 중...${NC}"
if command -v nc >/dev/null 2>&1; then
    if nc -zv -w 2 "$HOST" 22 2>&1 | grep -q "succeeded\|open"; then
        echo -e "${GREEN}✅ 포트 22 연결 성공${NC}"
    else
        echo -e "${RED}❌ 포트 22 연결 실패${NC}"
        echo -e "${YELLOW}📝 보안 그룹에서 SSH 규칙(포트 22)을 확인하세요.${NC}"
    fi
elif command -v telnet >/dev/null 2>&1; then
    if timeout 2 telnet "$HOST" 22 2>&1 | grep -q "Connected\|open"; then
        echo -e "${GREEN}✅ 포트 22 연결 성공${NC}"
    else
        echo -e "${RED}❌ 포트 22 연결 실패${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ nc 또는 telnet이 설치되지 않았습니다. 포트 테스트를 건너뜁니다.${NC}"
fi

# 5. SSH 연결 테스트 (각 사용자)
echo -e "\n${YELLOW}5️⃣ SSH 연결 테스트 중...${NC}"
SUCCESS_USER=""

for user in "${USERS[@]}"; do
    echo -e "\n   ${CYAN}🔍 $user 사용자로 시도 중...${NC}"
    
    if ssh -i "$KEY_PATH" \
           -o StrictHostKeyChecking=no \
           -o ConnectTimeout=10 \
           -o LogLevel=ERROR \
           -o BatchMode=yes \
           "$user@$HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo -e "   ${GREEN}✅ $user 사용자로 SSH 연결 성공!${NC}"
        SUCCESS_USER="$user"
        break
    else
        echo -e "   ${RED}❌ $user 사용자로 SSH 연결 실패${NC}"
    fi
done

# 6. 결과 요약
echo -e "\n${CYAN}============================================================${NC}"
echo -e "${CYAN}📊 진단 결과 요약${NC}"
echo -e "${CYAN}============================================================${NC}"

if [ -n "$SUCCESS_USER" ]; then
    echo -e "${GREEN}✅ SSH 연결 성공!${NC}"
    echo -e "${CYAN}올바른 사용자 이름: $SUCCESS_USER${NC}"
    echo -e "\n${YELLOW}📝 ssh-config 파일에서 User를 '$SUCCESS_USER'로 변경하세요.${NC}"
    
    # ssh-config 파일 업데이트 제안
    SSH_CONFIG_PATH="ssh-config"
    if [ -f "$SSH_CONFIG_PATH" ]; then
        echo -e "\n${YELLOW}💡 ssh-config 파일 업데이트 명령어:${NC}"
        echo -e "sed -i 's/User ec2-user/User $SUCCESS_USER/g' $SSH_CONFIG_PATH"
    fi
else
    echo -e "${RED}❌ SSH 연결 실패${NC}"
    echo -e "\n${YELLOW}다음 사항을 확인하세요:${NC}"
    echo -e "1. EC2 인스턴스 상태 (running)"
    echo -e "2. 보안 그룹 SSH 규칙 (포트 22, Source: 0.0.0.0/0)"
    echo -e "3. SSH 키 파일 경로 및 권한"
    echo -e "4. 인스턴스의 AMI 유형 (ec2-user 또는 ubuntu)"
    echo -e "\n${CYAN}📚 상세 가이드: docs/08_deployment/SSH_CONNECTION_TROUBLESHOOTING.md${NC}"
fi

echo -e "\n${CYAN}============================================================${NC}"

