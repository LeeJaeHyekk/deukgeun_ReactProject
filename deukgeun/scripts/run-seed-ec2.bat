@echo off
REM ============================================================================
REM EC2 환경에서 통합 DB 시드 스크립트 실행 (Windows)
REM ============================================================================

echo 🚀 EC2 환경 DB 시드 스크립트 시작...
echo ============================================================

REM 환경 변수 로드
if exist "env.unified" (
    echo 📋 환경 변수 로드 중...
    for /f "tokens=1,2 delims==" %%a in (env.unified) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set %%a=%%b
        )
    )
)

REM Node.js 버전 확인
echo 🔍 Node.js 버전 확인...
node --version
npm --version

REM 의존성 설치 (필요한 경우)
if not exist "node_modules" (
    echo 📦 의존성 설치 중...
    npm install
)

REM TypeScript 컴파일
echo 🔨 TypeScript 컴파일 중...
npx tsc src/backend/scripts/unifiedSeedScript.ts --outDir dist/backend/scripts --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck

REM 통합 시드 스크립트 실행
echo 🌱 통합 DB 시드 스크립트 실행 중...
node dist/backend/scripts/unifiedSeedScript.js

echo ✅ EC2 환경 DB 시드 완료!
echo ============================================================
