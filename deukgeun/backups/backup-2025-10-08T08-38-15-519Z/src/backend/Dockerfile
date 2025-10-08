# ============================================================================
# Deukgeun Backend Dockerfile
# 프로덕션 환경을 위한 최적화된 컨테이너 이미지
# ============================================================================

# Node.js 18 Alpine 이미지 사용 (가벼운 리눅스 기반)
FROM node:18-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./
COPY tsconfig*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

# 프로덕션 이미지 생성
FROM node:18-alpine AS production

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/logs /app/uploads && chown -R nodejs:nodejs /app

# 패키지 파일 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production && npm cache clean --force

# 빌드된 파일 복사
COPY --from=base /app/dist ./dist
COPY --from=base /app/public ./public

# 사용자 변경
USER nodejs

# 포트 노출
EXPOSE 5000

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 애플리케이션 시작
CMD ["node", "dist/index.js"]
