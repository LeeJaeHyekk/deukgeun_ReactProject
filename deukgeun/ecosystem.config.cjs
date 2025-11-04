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
        PORT: 5000,
        CORS_ORIGIN: 'https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000',
        VITE_BACKEND_URL: 'http://43.203.30.167:5000',
        VITE_FRONTEND_URL: 'https://devtrail.net',
        VITE_RECAPTCHA_SITE_KEY: '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',
        RECAPTCHA_SITE_KEY: '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',
        NODE_PATH: './dist/backend/backend'
      },
      // 로그 설정 개선 (EC2 환경에서 절대 경로 사용)
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      // 로그 디렉토리 자동 생성 보장
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      // 메모리 설정 최적화
      max_memory_restart: '2G',
      node_args: '--max-old-space-size=4096 --optimize-for-size',
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
      listen_timeout: 10000
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
