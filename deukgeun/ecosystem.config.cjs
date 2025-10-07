module.exports = {
  apps: [
    {
      name: 'deukgeun-backend',
      script: 'dist/backend/index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      // Windows에서 CMD 창이 열리지 않도록 설정
      windowsHide: true,
      // 자동 재시작 방지 (개발 중에는 수동으로 관리)
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        // TypeScript 경로 매핑 지원
        NODE_PATH: './dist/backend'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        NODE_PATH: './dist/backend'
      },
      // 로그 설정 개선
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
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
    {
      name: 'deukgeun-frontend',
      script: 'scripts/serve-frontend-optimized.cjs',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      // Windows에서 CMD 창이 열리지 않도록 설정
      windowsHide: true,
      // 자동 재시작 방지
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: 'development',
        FRONTEND_PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        FRONTEND_PORT: 3000
      },
      // 로그 설정 개선
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      // 메모리 설정 최적화
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=2048',
      // 재시작 설정 개선
      restart_delay: 3000,
      max_restarts: 3,
      min_uptime: '20s',
      // 로그 로테이션 설정
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 프로세스 그룹 설정
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 8000
    },
    {
      name: 'deukgeun-health-monitor',
      script: 'scripts/health-monitor.cjs',
      args: 'monitor',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      // Windows에서 CMD 창이 열리지 않도록 설정
      windowsHide: true,
      // 헬스 모니터는 자동 재시작 허용
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      // 로그 설정 개선
      error_file: './logs/health-monitor-error.log',
      out_file: './logs/health-monitor-out.log',
      log_file: './logs/health-monitor-combined.log',
      time: true,
      // 메모리 설정 최적화
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=1024',
      // 재시작 설정 개선
      restart_delay: 15000,
      max_restarts: 3,
      min_uptime: '60s',
      // 로그 로테이션 설정
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 프로세스 그룹 설정
      kill_timeout: 10000,
      wait_ready: true,
      listen_timeout: 15000,
      // 주기적 재시작 (매일 새벽 2시)
      cron_restart: '0 2 * * *'
    }
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
  deploy: {
    production: {
      user: 'ubuntu',
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
      user: 'ubuntu',
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
