#!/bin/bash

# 환경 최적화 스크립트
# 용량 정리 및 메모리 최적화

set -e

PROJECT_ROOT="/home/ec2-user/deukgeun_ReactProject/deukgeun"
cd "$PROJECT_ROOT"

echo "🔧 환경 최적화 시작..."

# 1. 오래된 백업 파일 정리 (최신 1개만 유지)
echo "📦 백업 파일 정리 중..."
if [ -d "backups" ]; then
    BACKUP_COUNT=$(ls -1 backups/ | wc -l)
    if [ "$BACKUP_COUNT" -gt 1 ]; then
        # 가장 오래된 백업 삭제 (최신 1개만 유지)
        ls -t backups/ | tail -n +2 | xargs -I {} rm -rf "backups/{}"
        echo "✅ 오래된 백업 파일 삭제 완료"
    else
        echo "ℹ️  백업 파일이 1개 이하입니다."
    fi
fi

# 2. 로그 파일 정리 (10MB 이상인 로그만 초기화)
echo "📋 로그 파일 정리 중..."
if [ -d "logs" ]; then
    find logs/ -name "*.log" -type f -size +10M -exec truncate -s 0 {} \;
    echo "✅ 큰 로그 파일 정리 완료"
fi

# 3. npm 캐시 정리
echo "🗑️  npm 캐시 정리 중..."
npm cache clean --force 2>/dev/null || true
echo "✅ npm 캐시 정리 완료"

# 4. PM2 로그 로테이션 확인
echo "🔄 PM2 로그 로테이션 확인 중..."
if pm2 list | grep -q "pm2-logrotate"; then
    echo "✅ PM2 로그 로테이션 모듈 설치됨"
else
    echo "📦 PM2 로그 로테이션 모듈 설치 중..."
    pm2 install pm2-logrotate 2>/dev/null || true
    pm2 set pm2-logrotate:max_size 10M 2>/dev/null || true
    pm2 set pm2-logrotate:retain 5 2>/dev/null || true
    pm2 set pm2-logrotate:compress true 2>/dev/null || true
    pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss 2>/dev/null || true
    echo "✅ PM2 로그 로테이션 설정 완료"
fi

# 5. 디스크 사용량 확인
echo ""
echo "📊 디스크 사용량:"
df -h / | tail -1

echo ""
echo "📊 프로젝트 크기:"
du -sh "$PROJECT_ROOT" 2>/dev/null || true

echo ""
echo "✅ 환경 최적화 완료!"

