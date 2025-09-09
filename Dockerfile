# ============================================================================
# Deukgeun Frontend Dockerfile
# 프로덕션 환경을 위한 최적화된 정적 파일 서빙
# ============================================================================

# 빌드 단계
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build:production

# 프로덕션 단계 (Nginx 사용)
FROM nginx:alpine AS production

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 파일을 Nginx 서빙 디렉토리로 복사
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]
