#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 환경 변수 설정 스크립트
 * 배포 시 .env 파일을 생성하고 필요한 환경 변수를 설정합니다.
 */

function setupEnvironment() {
  const rootDir = path.join(__dirname, '..');
  const backendDir = path.join(rootDir, 'src', 'backend');
  
  console.log('🚀 환경 변수 설정을 시작합니다...');
  
  // 1. 루트 .env 파일 생성
  const rootEnvPath = path.join(rootDir, '.env');
  const rootEnvExamplePath = path.join(rootDir, 'env.example');
  
  if (fs.existsSync(rootEnvExamplePath) && !fs.existsSync(rootEnvPath)) {
    fs.copyFileSync(rootEnvExamplePath, rootEnvPath);
    console.log('✅ 루트 .env 파일이 생성되었습니다.');
  } else if (fs.existsSync(rootEnvPath)) {
    console.log('ℹ️  루트 .env 파일이 이미 존재합니다.');
  }
  
  // 2. 백엔드 .env 파일 생성
  const backendEnvPath = path.join(backendDir, '.env');
  const backendEnvExamplePath = path.join(backendDir, 'env.sample');
  
  if (fs.existsSync(backendEnvExamplePath) && !fs.existsSync(backendEnvPath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log('✅ 백엔드 .env 파일이 생성되었습니다.');
  } else if (fs.existsSync(backendEnvPath)) {
    console.log('ℹ️  백엔드 .env 파일이 이미 존재합니다.');
  }
  
  // 3. 프로덕션 환경 변수 확인
  const productionEnvPath = path.join(rootDir, 'env.production');
  if (fs.existsSync(productionEnvPath)) {
    console.log('ℹ️  프로덕션 환경 변수 파일이 존재합니다.');
    console.log('   배포 시 env.production 파일을 .env로 복사하세요.');
  }
  
  console.log('🎉 환경 변수 설정이 완료되었습니다!');
  console.log('');
  console.log('📝 다음 단계:');
  console.log('1. .env 파일들을 열어서 실제 값으로 수정하세요.');
  console.log('2. 데이터베이스 연결 정보를 확인하세요.');
  console.log('3. API 키들을 실제 값으로 설정하세요.');
}

// 스크립트 실행
setupEnvironment();

export { setupEnvironment };
