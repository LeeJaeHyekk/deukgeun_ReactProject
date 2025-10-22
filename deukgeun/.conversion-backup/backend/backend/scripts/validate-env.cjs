#!/usr/bin/env tsx
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const pathUtils_1 = require("../utils/pathUtils.cjs.cjs");
const __dirname = (0, pathUtils_1.getDirname)();
dotenv_1.default.config({ path: (0, path_1.join)(__dirname, '../../.env') });
dotenv_1.default.config({ path: (0, path_1.join)(__dirname, '../../env.development') });
const securityChecks = [
    {
        name: 'JWT_SECRET',
        value: process.env.JWT_SECRET,
        isRequired: true,
        isSecure: true,
        message: 'JWT 토큰 서명에 사용되는 시크릿 키'
    },
    {
        name: 'JWT_ACCESS_SECRET',
        value: process.env.JWT_ACCESS_SECRET,
        isRequired: true,
        isSecure: true,
        message: 'JWT 액세스 토큰 서명에 사용되는 시크릿 키'
    },
    {
        name: 'JWT_REFRESH_SECRET',
        value: process.env.JWT_REFRESH_SECRET,
        isRequired: true,
        isSecure: true,
        message: 'JWT 리프레시 토큰 서명에 사용되는 시크릿 키'
    },
    {
        name: 'DB_PASSWORD',
        value: process.env.DB_PASSWORD,
        isRequired: true,
        isSecure: true,
        message: '데이터베이스 비밀번호'
    },
    {
        name: 'SEOUL_OPENAPI_KEY',
        value: process.env.SEOUL_OPENAPI_KEY,
        isRequired: false,
        isSecure: true,
        message: '서울시 공공데이터 API 키'
    },
    {
        name: 'KAKAO_JAVASCRIPT_MAP_API_KEY',
        value: process.env.KAKAO_JAVASCRIPT_MAP_API_KEY,
        isRequired: false,
        isSecure: true,
        message: '카카오 지도 JavaScript API 키'
    },
    {
        name: 'KAKAO_REST_MAP_API_KEY',
        value: process.env.KAKAO_REST_MAP_API_KEY,
        isRequired: false,
        isSecure: true,
        message: '카카오 지도 REST API 키'
    },
    {
        name: 'RECAPTCHA_SECRET',
        value: process.env.RECAPTCHA_SECRET,
        isRequired: false,
        isSecure: true,
        message: 'reCAPTCHA 시크릿 키'
    },
    {
        name: 'EMAIL_PASS',
        value: process.env.EMAIL_PASS,
        isRequired: false,
        isSecure: true,
        message: '이메일 서비스 비밀번호'
    }
];
const dangerousDefaults = [
    'your-secret-key',
    'your-access-secret',
    'your-refresh-secret',
    'yourAccessSecret',
    'yourRefreshSecret',
    'your_database_password_here',
    'your_seoul_openapi_key_here',
    'your_kakao_javascript_api_key_here',
    'your_kakao_rest_api_key_here',
    'your_recaptcha_secret',
    'your_email_password_here'
];
function isDangerousValue(value) {
    if (!value)
        return false;
    return dangerousDefaults.some(defaultValue => value.toLowerCase().includes(defaultValue.toLowerCase()));
}
function generateSecureSecret(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function validateEnvironment() {
    console.log('🔒 환경변수 보안 검증 시작');
    console.log('='.repeat(60));
    let hasErrors = false;
    let hasWarnings = false;
    securityChecks.forEach(check => {
        const status = check.value ? '✅ SET' : '❌ NOT SET';
        const isDangerous = isDangerousValue(check.value);
        console.log(`\n📋 ${check.name}: ${status}`);
        console.log(`   📝 ${check.message}`);
        if (!check.value && check.isRequired) {
            console.error(`   🚨 CRITICAL: ${check.name}이 설정되지 않았습니다!`);
            console.error(`      보안상 매우 위험합니다. .env 파일에 ${check.name}을 설정해주세요.`);
            hasErrors = true;
        }
        else if (isDangerous) {
            console.warn(`   ⚠️  WARNING: ${check.name}이 기본값으로 설정되어 있습니다!`);
            console.warn(`      보안을 위해 실제 값으로 변경해주세요.`);
            hasWarnings = true;
        }
        else if (!check.value && !check.isRequired) {
            console.log(`   ℹ️  INFO: ${check.name}은 선택사항입니다.`);
        }
        else {
            console.log(`   ✅ ${check.name}이 안전하게 설정되었습니다.`);
        }
    });
    console.log('\n' + '='.repeat(60));
    if (hasErrors) {
        console.error('🚨 CRITICAL ERRORS FOUND!');
        console.error('   필수 환경변수가 설정되지 않았습니다.');
        console.error('   보안상 매우 위험하므로 서버를 시작할 수 없습니다.');
        console.error('\n💡 해결 방법:');
        console.error('   1. .env 파일을 생성하세요');
        console.error('   2. env.example을 참고하여 필요한 환경변수를 설정하세요');
        console.error('   3. 특히 JWT_SECRET, DB_PASSWORD는 반드시 설정해야 합니다');
        process.exit(1);
    }
    if (hasWarnings) {
        console.warn('⚠️  WARNINGS FOUND!');
        console.warn('   일부 환경변수가 기본값으로 설정되어 있습니다.');
        console.warn('   보안을 위해 실제 값으로 변경하는 것을 권장합니다.');
    }
    if (!hasErrors && !hasWarnings) {
        console.log('✅ 모든 환경변수가 안전하게 설정되었습니다!');
    }
    console.log('\n🔐 보안 권장사항:');
    console.log('   • JWT 시크릿은 최소 32자 이상의 복잡한 문자열을 사용하세요');
    console.log('   • 데이터베이스 비밀번호는 강력한 비밀번호를 사용하세요');
    console.log('   • API 키는 정기적으로 갱신하세요');
    console.log('   • .env 파일은 절대 Git에 커밋하지 마세요');
    console.log('   • 프로덕션 환경에서는 환경변수 관리 서비스를 사용하세요');
}
function generateSecrets() {
    console.log('\n🔧 보안 시크릿 생성 도우미');
    console.log('='.repeat(40));
    console.log('\n📋 다음 값들을 .env 파일에 추가하세요:');
    console.log('='.repeat(40));
    console.log(`JWT_SECRET=${generateSecureSecret(64)}`);
    console.log(`JWT_ACCESS_SECRET=${generateSecureSecret(64)}`);
    console.log(`JWT_REFRESH_SECRET=${generateSecureSecret(64)}`);
    console.log('\n⚠️  주의사항:');
    console.log('   • 이 값들은 예시입니다. 실제 사용 시에는 새로운 값을 생성하세요');
    console.log('   • 생성된 값은 안전한 곳에 보관하세요');
    console.log('   • .env 파일은 절대 Git에 커밋하지 마세요');
}
if (process.argv.includes('--generate-secrets')) {
    generateSecrets();
}
else {
    validateEnvironment();
}
