#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 배포용 환경 변수 설정 스크립트
 * 프로덕션 배포 시 환경 변수를 설정합니다.
 */

function setupDeploymentEnvironment() {
  const rootDir = path.join(__dirname, '..');
  const backendDir = path.join(rootDir, 'src', 'backend');
  
  console.log('🚀 배포용 환경 변수 설정을 시작합니다...');
  
  // 환경 변수 소스 확인
  const productionEnvPath = path.join(rootDir, 'env.production');
  const rootEnvExamplePath = path.join(rootDir, 'env.example');
  const backendEnvExamplePath = path.join(backendDir, 'env.sample');
  
  // 1. 프로덕션 환경 변수가 있으면 사용
  if (fs.existsSync(productionEnvPath)) {
    console.log('📋 프로덕션 환경 변수 파일을 사용합니다...');
    
    // 루트 .env 생성
    const rootEnvPath = path.join(rootDir, '.env');
    fs.copyFileSync(productionEnvPath, rootEnvPath);
    console.log('✅ 루트 .env 파일이 프로덕션 설정으로 생성되었습니다.');
    
    // 백엔드 .env 생성 (프로덕션 설정에서 백엔드 관련 부분만 추출)
    const backendEnvPath = path.join(backendDir, '.env');
    const productionContent = fs.readFileSync(productionEnvPath, 'utf8');
    
    // 백엔드 관련 환경 변수만 필터링
    const backendLines = productionContent
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.startsWith('#') && 
               !trimmed.startsWith('VITE_') &&
               (trimmed.includes('DB_') || 
                trimmed.includes('JWT_') || 
                trimmed.includes('EMAIL_') || 
                trimmed.includes('SMS_') || 
                trimmed.includes('RECAPTCHA_') || 
                trimmed.includes('KAKAO_') || 
                trimmed.includes('GOOGLE_') || 
                trimmed.includes('SEOUL_') || 
                trimmed.includes('NODE_ENV') || 
                trimmed.includes('PORT') || 
                trimmed.includes('CORS_') ||
                trimmed.includes('UPLOAD_') ||
                trimmed.includes('AUTO_UPDATE_') ||
                trimmed.includes('LOG_') ||
                trimmed.includes('MAX_') ||
                trimmed.includes('CONNECTION_') ||
                trimmed.includes('VAPID_'));
      });
    
    const backendEnvContent = [
      '# ============================================================================',
      '# Deukgeun Backend 환경 변수 (프로덕션)',
      '# ============================================================================',
      '',
      ...backendLines,
      ''
    ].join('\n');
    
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ 백엔드 .env 파일이 프로덕션 설정으로 생성되었습니다.');
    
  } else {
    console.log('⚠️  프로덕션 환경 변수 파일이 없습니다. 기본 설정을 사용합니다.');
    
    // 기본 설정 사용
    if (fs.existsSync(rootEnvExamplePath)) {
      const rootEnvPath = path.join(rootDir, '.env');
      fs.copyFileSync(rootEnvExamplePath, rootEnvPath);
      console.log('✅ 루트 .env 파일이 기본 설정으로 생성되었습니다.');
    }
    
    if (fs.existsSync(backendEnvExamplePath)) {
      const backendEnvPath = path.join(backendDir, '.env');
      fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
      console.log('✅ 백엔드 .env 파일이 기본 설정으로 생성되었습니다.');
    }
  }
  
  console.log('🎉 배포용 환경 변수 설정이 완료되었습니다!');
  console.log('');
  console.log('📝 배포 전 확인사항:');
  console.log('1. 데이터베이스 연결 정보가 올바른지 확인하세요.');
  console.log('2. JWT 시크릿 키가 안전한지 확인하세요.');
  console.log('3. API 키들이 올바르게 설정되었는지 확인하세요.');
  console.log('4. CORS 설정이 프로덕션 도메인과 일치하는지 확인하세요.');
}

// 스크립트 실행
setupDeploymentEnvironment();

export { setupDeploymentEnvironment };
