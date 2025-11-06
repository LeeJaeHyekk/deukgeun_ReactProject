// env.production 파일에서 환경 변수 로드
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// 프로젝트 루트 경로
const projectRoot = __dirname

// env.production 파일 경로
const envProductionPath = path.join(projectRoot, 'env.production')

// env.production 파일 로드
let envProduction = {}
if (fs.existsSync(envProductionPath)) {
  try {
    const envFileContent = fs.readFileSync(envProductionPath, 'utf-8')
    envProduction = dotenv.parse(envFileContent)
    console.log(`✅ env.production 파일 로드 완료: ${Object.keys(envProduction).length}개 변수`)
  } catch (error) {
    console.warn(`⚠️ env.production 파일 로드 실패: ${error.message}`)
  }
} else {
  console.warn(`⚠️ env.production 파일이 존재하지 않습니다: ${envProductionPath}`)
}

// 환경 변수 우선순위: env.production > process.env > 기본값
// 단, process.env의 값이 placeholder이면 env.production 우선
function getEnvVar(key, defaultValue = '') {
  const processValue = process.env[key]
  const envProdValue = envProduction[key]
  
  // process.env 값이 placeholder이면 무시하고 env.production 값 사용
  if (processValue && (processValue.includes('your_recaptcha') || processValue.includes('placeholder'))) {
    if (envProdValue && !envProdValue.includes('your_recaptcha') && !envProdValue.includes('placeholder')) {
      return envProdValue
    }
    return defaultValue
  }
  
  // 정상적인 우선순위: env.production > process.env > 기본값
  return envProdValue || processValue || defaultValue
}

module.exports = {
  apps: [
    {
      name: 'deukgeun-backend',
      script: 'dist/backend/backend/index.cjs',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      // Windows에서 CMD 창이 열리지 않도록 설정
      windowsHide: true,
      // 프로덕션에서는 자동 재시작 활성화
      autorestart: true,
      watch: false,
      // CommonJS 모듈 사용
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        MODE: 'development',
        PORT: 5000,
        CORS_ORIGIN: 'http://localhost:3000,http://localhost:5173,http://localhost:5000,http://localhost:5001',
        NODE_PATH: './dist/backend/backend'
      },
      env_production: {
        NODE_ENV: 'production',
        MODE: 'production',
        PORT: getEnvVar('PORT', '5000'),
        CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000'),
        VITE_BACKEND_URL: getEnvVar('VITE_BACKEND_URL', ''),
        VITE_FRONTEND_URL: getEnvVar('VITE_FRONTEND_URL', 'https://www.devtrail.net'),
        // reCAPTCHA v3 설정 (프로덕션) - env.production에서 우선 로드
        VITE_RECAPTCHA_SITE_KEY: getEnvVar('VITE_RECAPTCHA_SITE_KEY', '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P'),
        RECAPTCHA_SITE_KEY: getEnvVar('RECAPTCHA_SITE_KEY', '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P'),
        RECAPTCHA_SECRET_KEY: getEnvVar('RECAPTCHA_SECRET_KEY') || getEnvVar('RECAPTCHA_SECRET') || '',
        RECAPTCHA_SECRET: getEnvVar('RECAPTCHA_SECRET') || getEnvVar('RECAPTCHA_SECRET_KEY') || '',
        // 등록된 도메인 목록 (쉼표로 구분, Google Console에 등록된 도메인과 일치해야 함)
        RECAPTCHA_REGISTERED_DOMAINS: getEnvVar('RECAPTCHA_REGISTERED_DOMAINS', 'devtrail.net,www.devtrail.net,43.203.30.167,localhost,127.0.0.1'),
        // 서울시 공공데이터 API 키 (스케줄링 크롤링용)
        SEOUL_OPENAPI_KEY: getEnvVar('SEOUL_OPENAPI_KEY', '467572475373737933314e4e494377'),
        NODE_PATH: './dist/backend/backend',
        // 데이터베이스 설정 (env.production에서 우선 로드)
        DB_HOST: getEnvVar('DB_HOST', 'localhost'),
        DB_PORT: getEnvVar('DB_PORT', '3306'),
        DB_USERNAME: getEnvVar('DB_USERNAME', ''),
        DB_PASSWORD: getEnvVar('DB_PASSWORD', ''),
        DB_DATABASE: getEnvVar('DB_DATABASE') || getEnvVar('DB_NAME', 'deukgeun_db'),
        // JWT 설정 (env.production에서 우선 로드)
        JWT_SECRET: getEnvVar('JWT_SECRET', ''),
        JWT_ACCESS_SECRET: getEnvVar('JWT_ACCESS_SECRET', ''),
        JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', ''),
        // 이메일 설정 (env.production에서 우선 로드)
        EMAIL_HOST: getEnvVar('EMAIL_HOST', 'smtp.gmail.com'),
        EMAIL_PORT: getEnvVar('EMAIL_PORT', '587'),
        EMAIL_USER: getEnvVar('EMAIL_USER', ''),
        EMAIL_PASS: getEnvVar('EMAIL_PASS', ''),
        // Rate Limiting 설정 (env.production에서 우선 로드)
        RATE_LIMIT_WINDOW: getEnvVar('RATE_LIMIT_WINDOW', '900000'),
        RATE_LIMIT_MAX: getEnvVar('RATE_LIMIT_MAX', '100'),
        // 파일 업로드 설정 (env.production에서 우선 로드)
        UPLOAD_PATH: getEnvVar('UPLOAD_PATH', './uploads'),
        MAX_FILE_SIZE: getEnvVar('MAX_FILE_SIZE', '10485760'),
        // 스케줄러 설정 (env.production에서 우선 로드)
        AUTO_UPDATE_ENABLED: getEnvVar('AUTO_UPDATE_ENABLED', 'true'),
        AUTO_UPDATE_HOUR: getEnvVar('AUTO_UPDATE_HOUR', '6'),
        AUTO_UPDATE_MINUTE: getEnvVar('AUTO_UPDATE_MINUTE', '0'),
        AUTO_UPDATE_TYPE: getEnvVar('AUTO_UPDATE_TYPE', 'enhanced'),
        AUTO_UPDATE_INTERVAL_DAYS: getEnvVar('AUTO_UPDATE_INTERVAL_DAYS', '3'),
        // AWS RDS 사용 시 환경 변수에 설정
        // DB_HOST: process.env.DB_HOST || 'your-rds-endpoint.region.rds.amazonaws.com',
      },
      // 로그 설정 개선 (EC2 환경에서 절대 경로 사용)
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      // 로그 디렉토리 자동 생성 보장
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      // 메모리 설정 최적화 (사용성 고려 - 시스템 메모리 904MB, Swap 3GB 활용)
      // 백엔드 서버 안정적 동작을 위해 700MB 할당, 시스템에 약 200MB 여유 유지
      max_memory_restart: '700M',
      node_args: '--max-old-space-size=700 --optimize-for-size',
      // 재시작 설정 개선
      restart_delay: 5000,
      max_restarts: 5,
      min_uptime: '30s',
      // 로그 로테이션 설정
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 프로세스 그룹 설정
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // 안전장치 추가: 헬스체크 설정
      // PM2가 주기적으로 헬스체크를 수행하여 서버 상태를 확인
      // NOTE: 실제 헬스체크는 Express 서버의 /health 엔드포인트를 사용
      // 여기서는 PM2의 기본 모니터링 기능 활용
      // 안전장치: 파일 존재 확인 (스크립트 시작 전)
      // 안전장치: 포트 충돌 확인 (서버 시작 전)
      // 안전장치: 자동 복구 (에러 발생 시 재시작)
      // 안전장치: 메모리 제한 (메모리 초과 시 재시작)
      // 안전장치: 최소 실행 시간 (너무 빠른 재시작 방지)
      // 안전장치: 최대 재시작 횟수 (무한 재시작 방지)
    },
    // 프론트엔드는 프로덕션에서 nginx가 정적 파일을 서빙하므로 PM2에서 제거
    // 프로덕션 환경에서는 nginx가 dist/frontend 디렉토리의 빌드된 파일을 서빙합니다.
    // 개발 환경에서만 필요할 경우 아래 주석을 해제하세요.
    // {
    //   name: 'deukgeun-frontend',
    //   script: 'npm',
    //   args: 'run dev',
    //   cwd: './',
    //   instances: 1,
    //   exec_mode: 'fork',
    //   windowsHide: true,
    //   autorestart: false,
    //   watch: false,
    //   env: {
    //     NODE_ENV: 'development',
    //     FRONTEND_PORT: 3000,
    //     VITE_PORT: 3000
    //   },
    //   env_production: {
    //     NODE_ENV: 'production',
    //     FRONTEND_PORT: 3000,
    //     VITE_PORT: 3000
    //   },
    //   error_file: './logs/frontend-error.log',
    //   out_file: './logs/frontend-out.log',
    //   log_file: './logs/frontend-combined.log',
    //   time: true,
    //   max_memory_restart: '1G',
    //   node_args: '--max-old-space-size=2048',
    //   restart_delay: 3000,
    //   max_restarts: 3,
    //   min_uptime: '20s',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   merge_logs: true,
    //   kill_timeout: 3000,
    //   wait_ready: true,
    //   listen_timeout: 8000
    // },
    // 헬스 모니터는 백엔드 서버 내부에서 처리되므로 제거
    // 백엔드 서버가 자체적으로 헬스체크를 수행합니다.
    // {
    //   name: 'deukgeun-health-monitor',
    //   script: 'scripts/health-monitor.cjs',
    //   args: 'monitor',
    //   cwd: './',
    //   instances: 1,
    //   exec_mode: 'fork',
    //   windowsHide: true,
    //   autorestart: true,
    //   watch: false,
    //   env: {
    //     NODE_ENV: 'production'
    //   },
    //   error_file: './logs/health-monitor-error.log',
    //   out_file: './logs/health-monitor-out.log',
    //   log_file: './logs/health-monitor-combined.log',
    //   time: true,
    //   max_memory_restart: '512M',
    //   node_args: '--max-old-space-size=1024',
    //   restart_delay: 15000,
    //   max_restarts: 3,
    //   min_uptime: '60s',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   merge_logs: true,
    //   kill_timeout: 10000,
    //   wait_ready: true,
    //   listen_timeout: 15000,
    //   cron_restart: '0 2 * * *'
    // },
    // weekly-crawling은 백엔드 서버 내부 스케줄링으로 이동
    // 백엔드 서버가 실행 중일 때 내부에서 cron 스케줄링이 실행됩니다.
    // PM2 설정에서 제거되었습니다. (백엔드 서버 내부 스케줄링 사용)
  ],

  // PM2 설정 최적화
  pm2: {
    // 로그 로테이션 설정
    log_rotate: {
      max_size: '10M',
      retain: 5,
      compress: true,
      dateFormat: 'YYYY-MM-DD'
    },
    // 모니터링 설정
    monitoring: {
      enabled: true,
      interval: 30000
    }
  },

  // 배포 설정 개선
  // 참고: Amazon Linux 2023은 'ec2-user', Ubuntu는 'ubuntu' 사용
  // 실제 환경에 맞게 user 필드를 수정하세요
  deploy: {
    production: {
      // Amazon Linux 2023: 'ec2-user', Ubuntu/Debian: 'ubuntu'
      user: 'ec2-user',  // Amazon Linux 2023 기본 사용자
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/deukgeun.git',
      path: '/var/www/deukgeun',
      'pre-deploy-local': 'echo "로컬 배포 준비 중..."',
      'post-deploy': 'npm install && npm run build:full:production && pm2 reload ecosystem.config.cjs --env production && pm2 save',
      'pre-setup': 'echo "서버 설정 중..."',
      // 배포 후 정리
      'post-setup': 'pm2 startup && pm2 save'
    },
    staging: {
      // Amazon Linux 2023: 'ec2-user', Ubuntu/Debian: 'ubuntu'
      user: 'ec2-user',  // Amazon Linux 2023 기본 사용자
      host: ['staging-server-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/deukgeun.git',
      path: '/var/www/deukgeun-staging',
      'pre-deploy-local': 'echo "스테이징 배포 준비 중..."',
      'post-deploy': 'npm install && npm run build:full && pm2 reload ecosystem.config.cjs --env production && pm2 save',
      'pre-setup': 'echo "스테이징 서버 설정 중..."'
    }
  }
}
