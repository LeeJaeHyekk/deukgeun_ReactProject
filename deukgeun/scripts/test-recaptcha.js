const axios = require('axios');

const config = {
  backendUrl: 'http://localhost:5000',
  frontendUrl: 'http://localhost:5173',
  testUrl: 'http://localhost:5173/recaptcha-test.html'
};

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 서버 연결 테스트
async function testServerConnection() {
  logInfo('서버 연결 테스트 시작...');
  
  try {
    // 백엔드 헬스체크
    const backendResponse = await axios.get(`${config.backendUrl}/health`, { timeout: 5000 });
    logSuccess(`백엔드 서버 연결 성공: ${backendResponse.data.status}`);
    
    // 프론트엔드 연결 테스트
    const frontendResponse = await axios.get(config.frontendUrl, { timeout: 5000 });
    logSuccess(`프론트엔드 서버 연결 성공: ${frontendResponse.status}`);
    
    return true;
  } catch (error) {
    logError(`서버 연결 실패: ${error.message}`);
    return false;
  }
}

// reCAPTCHA 설정 확인
async function testRecaptchaConfig() {
  logInfo('reCAPTCHA 설정 확인...');
  
  try {
    const response = await axios.get(`${config.backendUrl}/api/recaptcha/config`);
    const config = response.data.config;
    
    logInfo('reCAPTCHA 설정 정보:');
    log(`  - 사이트 키: ${config.siteKey ? '설정됨' : '설정되지 않음'}`);
    log(`  - 프로젝트 ID: ${config.projectId || '설정되지 않음'}`);
    log(`  - API 키: ${config.hasApiKey ? '설정됨' : '설정되지 않음'}`);
    log(`  - 시크릿 키: ${config.hasSecret ? '설정됨' : '설정되지 않음'}`);
    
    if (config.siteKey && config.projectId && config.hasApiKey) {
      logSuccess('reCAPTCHA 설정이 완료되었습니다.');
      return true;
    } else {
      logWarning('reCAPTCHA 설정이 불완전합니다.');
      return false;
    }
  } catch (error) {
    logError(`reCAPTCHA 설정 확인 실패: ${error.message}`);
    return false;
  }
}

// reCAPTCHA 헬스체크
async function testRecaptchaHealth() {
  logInfo('reCAPTCHA 헬스체크...');
  
  try {
    const response = await axios.get(`${config.backendUrl}/api/recaptcha/health`);
    const health = response.data.health;
    
    logInfo(`reCAPTCHA 헬스체크 결과:`);
    log(`  - 상태: ${health.status}`);
    log(`  - 메시지: ${health.message}`);
    
    if (health.status === 'healthy') {
      logSuccess('reCAPTCHA 헬스체크 통과');
      return true;
    } else {
      logWarning(`reCAPTCHA 헬스체크 실패: ${health.message}`);
      return false;
    }
  } catch (error) {
    logError(`reCAPTCHA 헬스체크 실패: ${error.message}`);
    return false;
  }
}

// 가짜 토큰으로 검증 테스트
async function testRecaptchaVerification() {
  logInfo('reCAPTCHA 검증 테스트 (가짜 토큰)...');
  
  try {
    const fakeToken = 'fake_token_for_testing';
    
    const response = await axios.post(`${config.backendUrl}/api/recaptcha/verify`, {
      token: fakeToken,
      action: 'LOGIN'
    });
    
    // 가짜 토큰이므로 실패가 예상됨
    if (!response.data.success) {
      logSuccess(`가짜 토큰 검증 실패 (예상됨): ${response.data.error}`);
      return true;
    } else {
      logWarning('가짜 토큰이 성공으로 처리되었습니다.');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('가짜 토큰 검증 실패 (예상됨)');
      return true;
    } else {
      logError(`reCAPTCHA 검증 테스트 실패: ${error.message}`);
      return false;
    }
  }
}

// 브라우저 테스트 안내
function showBrowserTestInstructions() {
  logInfo('🌐 브라우저 테스트 안내:');
  log('');
  log('1. 브라우저에서 다음 URL을 열어주세요:');
  log(`   ${config.testUrl}`, 'cyan');
  log('');
  log('2. 테스트 페이지에서 다음을 확인하세요:');
  log('   - reCAPTCHA Enterprise 로드 상태');
  log('   - 토큰 생성 테스트');
  log('   - 서버 검증 테스트');
  log('   - 전체 플로우 테스트');
  log('');
  log('3. 브라우저 개발자 도구에서 다음을 실행하세요:');
  log('   grecaptcha.enterprise.ready(() => {');
  log('     grecaptcha.enterprise.execute("6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG", {action: "LOGIN"})');
  log('       .then(token => console.log("토큰:", token))');
  log('       .catch(error => console.error("오류:", error));');
  log('   });');
  log('');
}

// 메인 테스트 함수
async function runTests() {
  log('🧪 reCAPTCHA Enterprise 테스트 시작...', 'bright');
  log('');
  
  const results = {
    serverConnection: false,
    recaptchaConfig: false,
    recaptchaHealth: false,
    recaptchaVerification: false
  };
  
  // 1. 서버 연결 테스트
  results.serverConnection = await testServerConnection();
  log('');
  
  if (!results.serverConnection) {
    logError('서버 연결에 실패했습니다. 서버가 실행 중인지 확인하세요.');
    return;
  }
  
  // 2. reCAPTCHA 설정 확인
  results.recaptchaConfig = await testRecaptchaConfig();
  log('');
  
  // 3. reCAPTCHA 헬스체크
  results.recaptchaHealth = await testRecaptchaHealth();
  log('');
  
  // 4. reCAPTCHA 검증 테스트
  results.recaptchaVerification = await testRecaptchaVerification();
  log('');
  
  // 5. 브라우저 테스트 안내
  showBrowserTestInstructions();
  
  // 결과 요약
  log('📊 테스트 결과 요약:', 'bright');
  log(`  - 서버 연결: ${results.serverConnection ? '✅' : '❌'}`);
  log(`  - reCAPTCHA 설정: ${results.recaptchaConfig ? '✅' : '❌'}`);
  log(`  - reCAPTCHA 헬스체크: ${results.recaptchaHealth ? '✅' : '❌'}`);
  log(`  - reCAPTCHA 검증: ${results.recaptchaVerification ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    logSuccess('모든 테스트가 통과했습니다!');
  } else {
    logWarning('일부 테스트가 실패했습니다. 설정을 확인하세요.');
  }
  
  log('');
  log('🔗 테스트 URL:', 'cyan');
  log(`   ${config.testUrl}`, 'cyan');
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(error => {
    logError(`테스트 실행 중 오류 발생: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
