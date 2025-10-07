module.exports = {
  apps: [
    {
      name: 'deukgeun-backend',
      script: 'dist/backend/index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=4096',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'deukgeun-frontend',
      script: 'scripts/serve-frontend-optimized.cjs',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        FRONTEND_PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        FRONTEND_PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'deukgeun-health-monitor',
      script: 'scripts/health-monitor.cjs',
      args: 'monitor',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/health-monitor-error.log',
      out_file: './logs/health-monitor-out.log',
      log_file: './logs/health-monitor-combined.log',
      time: true,
      max_memory_restart: '256M',
      restart_delay: 10000,
      max_restarts: 5,
      min_uptime: '30s',
      cron_restart: '0 2 * * *' // 매일 새벽 2시 재시작
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/deukgeun.git',
      path: '/var/www/deukgeun',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:full:production && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
}
