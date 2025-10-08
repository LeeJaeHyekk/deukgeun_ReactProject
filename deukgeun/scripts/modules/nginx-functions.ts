/**
 * Nginx 설정 및 관리 함수들
 * 모듈화된 nginx 설정 관리 기능
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { defaultLogger } from './logger'

// Nginx 설정 인터페이스
export interface NginxConfig {
  serverName: string
  root: string
  index: string
  listen: number
  backendUrl: string
  backendPort: number
  frontendUrl: string
  frontendPort: number
  enableGzip: boolean
  enableSecurity: boolean
  enableCaching: boolean
  enableProxy: boolean
  isProduction: boolean
}

// 기본 설정 (개발 환경)
export const defaultNginxConfig: NginxConfig = {
  serverName: 'devtrail.net www.devtrail.net',
  root: '/usr/share/nginx/html',
  index: 'index.html',
  listen: 80,
  backendUrl: 'http://localhost',
  backendPort: 5000,
  frontendUrl: 'http://localhost',
  frontendPort: 3000,
  enableGzip: true,
  enableSecurity: true,
  enableCaching: true,
  enableProxy: true,
  isProduction: false
}

// 프로덕션 설정
export const productionNginxConfig: NginxConfig = {
  serverName: 'devtrail.net www.devtrail.net',
  root: '/usr/share/nginx/html',
  index: 'index.html',
  listen: 80,
  backendUrl: 'http://localhost',
  backendPort: 5000,
  frontendUrl: 'http://localhost',
  frontendPort: 3000,
  enableGzip: true,
  enableSecurity: true,
  enableCaching: true,
  enableProxy: true,
  isProduction: true
}

/**
 * 기본 nginx 설정 생성
 */
export function generateBasicConfig(): string {
  return `events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # 로깅 설정
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # 성능 최적화 설정
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
}`
}

/**
 * Gzip 압축 설정 생성
 */
export function generateGzipConfig(): string {
  return `    # Gzip 압축 설정
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;`
}

/**
 * 보안 헤더 설정 생성
 */
export function generateSecurityConfig(): string {
  return `    # 보안 헤더 설정
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;`
}

/**
 * 서버 블록 설정 생성
 */
export function generateServerBlock(config: NginxConfig): string {
  return `    server {
        listen ${config.listen};
        server_name ${config.serverName};
        root ${config.root};
        index ${config.index};

        # 정적 파일 캐싱 설정
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }

        # HTML 파일 캐싱 설정
        location ~* \\.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # API 프록시 설정 (백엔드로 요청 전달)
        location /api/ {
            proxy_pass ${config.backendUrl}:${config.backendPort};
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # 프론트엔드 설정 (프로덕션/개발 환경 분기)
        location / {
            ${config.isProduction ? 
              `# 프로덕션: 정적 파일 서빙
              try_files $uri $uri/ /index.html;` : 
              `# 개발: 프론트엔드 프록시
              proxy_pass ${config.frontendUrl}:${config.frontendPort};
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection 'upgrade';
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
              proxy_cache_bypass $http_upgrade;
              proxy_read_timeout 86400;`
            }
        }

        # 헬스체크 엔드포인트
        location /health {
            access_log off;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }

        # 에러 페이지 설정
        error_page 404 /index.html;
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root ${config.root};
        }
    }`
}

/**
 * 전체 nginx 설정 생성
 */
export function generateNginxConfig(config: NginxConfig = defaultNginxConfig): string {
  let nginxConfig = generateBasicConfig()
  
  if (config.enableGzip) {
    nginxConfig += '\n\n' + generateGzipConfig()
  }
  
  if (config.enableSecurity) {
    nginxConfig += '\n\n' + generateSecurityConfig()
  }
  
  nginxConfig += '\n\n' + generateServerBlock(config)
  
  nginxConfig += '\n}'
  
  return nginxConfig
}

/**
 * nginx 설정 파일 저장
 */
export function saveNginxConfig(configPath: string, config: NginxConfig = defaultNginxConfig): boolean {
  try {
    const nginxConfig = generateNginxConfig(config)
    fs.writeFileSync(configPath, nginxConfig, 'utf8')
    defaultLogger.success(`Nginx 설정 파일이 저장되었습니다: ${configPath}`)
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 설정 파일 저장 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 설정 검증
 */
export function validateNginxConfig(configPath: string): boolean {
  try {
    execSync(`nginx -t -c ${configPath}`, { stdio: 'pipe' })
    defaultLogger.success('Nginx 설정 검증 통과')
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 설정 검증 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 서비스 시작
 */
export function startNginx(): boolean {
  try {
    execSync('nginx', { stdio: 'pipe' })
    defaultLogger.success('Nginx 서비스가 시작되었습니다')
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 서비스 시작 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 서비스 중지
 */
export function stopNginx(): boolean {
  try {
    execSync('nginx -s stop', { stdio: 'pipe' })
    defaultLogger.success('Nginx 서비스가 중지되었습니다')
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 서비스 중지 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 서비스 재시작
 */
export function restartNginx(): boolean {
  try {
    execSync('nginx -s reload', { stdio: 'pipe' })
    defaultLogger.success('Nginx 서비스가 재시작되었습니다')
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 서비스 재시작 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 상태 확인
 */
export function checkNginxStatus(): boolean {
  try {
    execSync('nginx -t', { stdio: 'pipe' })
    defaultLogger.success('Nginx 상태 정상')
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 상태 확인 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 로그 확인
 */
export function checkNginxLogs(): void {
  try {
    const accessLog = execSync('tail -n 20 /var/log/nginx/access.log', { encoding: 'utf8' })
    const errorLog = execSync('tail -n 20 /var/log/nginx/error.log', { encoding: 'utf8' })
    
    defaultLogger.log('\n📋 Nginx Access Log (최근 20줄):', 'cyan')
    console.log(accessLog)
    
    defaultLogger.log('\n📋 Nginx Error Log (최근 20줄):', 'cyan')
    console.log(errorLog)
    
  } catch (error: any) {
    defaultLogger.warning(`Nginx 로그 확인 실패: ${error.message}`)
  }
}

/**
 * nginx 프로세스 확인
 */
export function checkNginxProcesses(): void {
  try {
    const processes = execSync('ps aux | grep nginx', { encoding: 'utf8' })
    defaultLogger.log('\n📋 Nginx 프로세스:', 'cyan')
    console.log(processes)
  } catch (error: any) {
    defaultLogger.warning(`Nginx 프로세스 확인 실패: ${error.message}`)
  }
}

/**
 * nginx 설정 백업
 */
export function backupNginxConfig(configPath: string, backupPath?: string): boolean {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = backupPath || `${configPath}.backup.${timestamp}`
    
    fs.copyFileSync(configPath, backupFile)
    defaultLogger.success(`Nginx 설정 백업 완료: ${backupFile}`)
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 설정 백업 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 설정 복원
 */
export function restoreNginxConfig(backupPath: string, configPath: string): boolean {
  try {
    if (!fs.existsSync(backupPath)) {
      defaultLogger.error(`백업 파일이 존재하지 않습니다: ${backupPath}`)
      return false
    }
    
    fs.copyFileSync(backupPath, configPath)
    defaultLogger.success(`Nginx 설정 복원 완료: ${configPath}`)
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 설정 복원 실패: ${error.message}`)
    return false
  }
}

/**
 * nginx 성능 모니터링
 */
export function monitorNginxPerformance(): void {
  try {
    defaultLogger.log('\n📊 Nginx 성능 모니터링:', 'cyan')
    
    // 연결 수 확인
    const connections = execSync('netstat -an | grep :80 | wc -l', { encoding: 'utf8' })
    defaultLogger.log(`- 활성 연결 수: ${connections.trim()}`, 'blue')
    
    // 메모리 사용량 확인
    const memory = execSync('ps aux | grep nginx | grep -v grep | awk \'{sum+=$6} END {print sum}\'', { encoding: 'utf8' })
    defaultLogger.log(`- 메모리 사용량: ${memory.trim()}KB`, 'blue')
    
    // CPU 사용량 확인
    const cpu = execSync('ps aux | grep nginx | grep -v grep | awk \'{sum+=$3} END {print sum}\'', { encoding: 'utf8' })
    defaultLogger.log(`- CPU 사용량: ${cpu.trim()}%`, 'blue')
    
  } catch (error: any) {
    defaultLogger.warning(`Nginx 성능 모니터링 실패: ${error.message}`)
  }
}

/**
 * nginx 설정 최적화
 */
export function optimizeNginxConfig(config: NginxConfig): NginxConfig {
  const optimizedConfig = { ...config }
  
  // 성능 최적화
  optimizedConfig.enableGzip = true
  optimizedConfig.enableCaching = true
  
  // 보안 최적화
  optimizedConfig.enableSecurity = true
  
  defaultLogger.success('Nginx 설정이 최적화되었습니다')
  return optimizedConfig
}

/**
 * nginx SSL 설정 생성
 */
export function generateSSLConfig(domain: string, sslCertPath: string, sslKeyPath: string): string {
  return `    server {
        listen 443 ssl http2;
        server_name ${domain};
        
        ssl_certificate ${sslCertPath};
        ssl_certificate_key ${sslKeyPath};
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        root ${defaultNginxConfig.root};
        index ${defaultNginxConfig.index};
        
        # 기존 설정들...
    }`
}

/**
 * 도메인별 nginx 설정 생성
 */
export function generateDomainConfig(domain: string, isProduction: boolean = false): NginxConfig {
  const baseConfig = isProduction ? productionNginxConfig : defaultNginxConfig
  
  return {
    ...baseConfig,
    serverName: `${domain} www.${domain}`,
    isProduction
  }
}

/**
 * 개발 환경용 nginx 설정 생성
 */
export function generateDevelopmentConfig(): NginxConfig {
  return {
    ...defaultNginxConfig,
    serverName: 'devtrail.net www.devtrail.net localhost',
    isProduction: false
  }
}

/**
 * 프로덕션 환경용 nginx 설정 생성
 */
export function generateProductionConfig(): NginxConfig {
  return {
    ...productionNginxConfig,
    serverName: 'devtrail.net www.devtrail.net',
    isProduction: true
  }
}

/**
 * nginx 설정 검증 및 최적화
 */
export function validateAndOptimizeNginxConfig(configPath: string, config: NginxConfig = defaultNginxConfig): boolean {
  try {
    // 1. 설정 검증
    if (!validateNginxConfig(configPath)) {
      return false
    }
    
    // 2. 설정 최적화
    const optimizedConfig = optimizeNginxConfig(config)
    
    // 3. 최적화된 설정 저장
    if (saveNginxConfig(configPath, optimizedConfig)) {
      defaultLogger.success('Nginx 설정이 검증되고 최적화되었습니다')
      return true
    }
    
    return false
  } catch (error: any) {
    defaultLogger.error(`Nginx 설정 검증 및 최적화 실패: ${error.message}`)
    return false
  }
}
