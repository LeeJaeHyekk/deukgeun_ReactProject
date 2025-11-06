#!/bin/bash
# nginx 설정 파일 업데이트 스크립트
# 프로젝트의 nginx-site.conf를 /etc/nginx/conf.d/devtrail.conf로 복사

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NGINX_SOURCE="$PROJECT_ROOT/nginx-site.conf"
NGINX_TARGET="/etc/nginx/conf.d/devtrail.conf"

echo "📋 nginx 설정 파일 업데이트 중..."
echo "   소스: $NGINX_SOURCE"
echo "   대상: $NGINX_TARGET"

# 소스 파일 확인
if [ ! -f "$NGINX_SOURCE" ]; then
    echo "❌ 오류: 소스 파일을 찾을 수 없습니다: $NGINX_SOURCE"
    exit 1
fi

# nginx 설정 파일 복사
sudo cp "$NGINX_SOURCE" "$NGINX_TARGET"

# 파일 권한 설정 (ec2-user가 nginx 그룹에 속해 있으므로 그룹 쓰기 권한 부여)
sudo chmod 664 "$NGINX_TARGET"
sudo chown root:nginx "$NGINX_TARGET"

# nginx 설정 테스트
echo "🔍 nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo "✅ nginx 설정이 유효합니다."
    
    # nginx 재시작 여부 확인
    read -p "nginx를 재시작하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 nginx 재시작 중..."
        sudo systemctl reload nginx
        echo "✅ nginx가 재시작되었습니다."
    else
        echo "ℹ️  nginx 설정은 업데이트되었지만 재시작되지 않았습니다."
        echo "   다음 명령어로 재시작하세요: sudo systemctl reload nginx"
    fi
else
    echo "❌ 오류: nginx 설정이 유효하지 않습니다."
    echo "   설정을 확인하고 다시 시도하세요."
    exit 1
fi

echo "✅ 완료!"

