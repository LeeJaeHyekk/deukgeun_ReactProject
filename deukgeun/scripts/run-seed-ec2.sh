#!/bin/bash
# ============================================================================
# EC2 환경에서 통합 DB 시드 스크립트 실행
# ============================================================================

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 EC2 환경 DB 시드 스크립트 시작..."
echo "============================================================"

# 환경 변수 로드
if [ -f "env.unified" ]; then
    echo "📋 환경 변수 로드 중..."
    export $(grep -v '^#' env.unified | xargs)
fi

# Node.js 버전 확인
echo "🔍 Node.js 버전 확인..."
node --version
npm --version

# 의존성 설치 (필요한 경우)
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install
fi

# TypeScript 컴파일
echo "🔨 TypeScript 컴파일 중..."
npx tsc src/backend/scripts/unifiedSeedScript.ts --outDir dist/backend/scripts --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck

# 통합 시드 스크립트 실행
echo "🌱 통합 DB 시드 스크립트 실행 중..."
node dist/backend/scripts/unifiedSeedScript.js

echo "✅ EC2 환경 DB 시드 완료!"
echo "============================================================"
