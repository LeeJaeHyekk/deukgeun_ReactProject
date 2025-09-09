#!/bin/bash

# ============================================================================
# Deukgeun 클라우드 배포 스크립트
# AWS/GCP/Azure 환경에서 자동 배포를 위한 스크립트
# ============================================================================

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 로드
if [ -f ".env.production" ]; then
    log_info "프로덕션 환경 변수 로드 중..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    log_error ".env.production 파일을 찾을 수 없습니다."
    exit 1
fi

# 배포 환경 확인
ENVIRONMENT=${1:-"production"}
log_info "배포 환경: $ENVIRONMENT"

# 전역 변수
PROJECT_NAME="deukgeun"
BACKEND_IMAGE_NAME="${PROJECT_NAME}-backend"
FRONTEND_IMAGE_NAME="${PROJECT_NAME}-frontend"
REGISTRY_URL=${DOCKER_REGISTRY_URL:-"your-registry-url"}
VERSION=$(git rev-parse --short HEAD)

# 함수: 의존성 확인
check_dependencies() {
    log_info "의존성 확인 중..."
    
    # Docker 확인
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        exit 1
    fi
    
    # Docker Compose 확인
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다."
        exit 1
    fi
    
    # Git 확인
    if ! command -v git &> /dev/null; then
        log_error "Git이 설치되지 않았습니다."
        exit 1
    fi
    
    log_success "모든 의존성이 확인되었습니다."
}

# 함수: 빌드 전 테스트
run_tests() {
    log_info "테스트 실행 중..."
    
    # 백엔드 테스트
    cd src/backend
    npm run test:ci
    cd ../..
    
    # 프론트엔드 테스트
    npm run test:ci
    
    log_success "모든 테스트가 통과했습니다."
}

# 함수: Docker 이미지 빌드
build_images() {
    log_info "Docker 이미지 빌드 중..."
    
    # 백엔드 이미지 빌드
    log_info "백엔드 이미지 빌드 중..."
    docker build -t $BACKEND_IMAGE_NAME:$VERSION -f src/backend/Dockerfile src/backend/
    docker tag $BACKEND_IMAGE_NAME:$VERSION $BACKEND_IMAGE_NAME:latest
    
    # 프론트엔드 이미지 빌드
    log_info "프론트엔드 이미지 빌드 중..."
    docker build -t $FRONTEND_IMAGE_NAME:$VERSION -f Dockerfile .
    docker tag $FRONTEND_IMAGE_NAME:$VERSION $FRONTEND_IMAGE_NAME:latest
    
    log_success "Docker 이미지 빌드가 완료되었습니다."
}

# 함수: 이미지 푸시 (레지스트리 사용 시)
push_images() {
    if [ ! -z "$REGISTRY_URL" ] && [ "$REGISTRY_URL" != "your-registry-url" ]; then
        log_info "Docker 레지스트리에 이미지 푸시 중..."
        
        # 로그인
        docker login $REGISTRY_URL
        
        # 태그 변경
        docker tag $BACKEND_IMAGE_NAME:$VERSION $REGISTRY_URL/$BACKEND_IMAGE_NAME:$VERSION
        docker tag $FRONTEND_IMAGE_NAME:$VERSION $REGISTRY_URL/$FRONTEND_IMAGE_NAME:$VERSION
        
        # 푸시
        docker push $REGISTRY_URL/$BACKEND_IMAGE_NAME:$VERSION
        docker push $REGISTRY_URL/$FRONTEND_IMAGE_NAME:$VERSION
        
        log_success "이미지 푸시가 완료되었습니다."
    else
        log_warning "레지스트리 URL이 설정되지 않아 이미지 푸시를 건너뜁니다."
    fi
}

# 함수: 배포 전 백업
create_backup() {
    log_info "데이터베이스 백업 생성 중..."
    
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Docker Compose로 실행 중인 MySQL 컨테이너에서 백업
    if docker ps | grep -q "deukgeun-mysql"; then
        docker exec deukgeun-mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > $BACKUP_DIR/database_backup.sql
        log_success "데이터베이스 백업이 생성되었습니다: $BACKUP_DIR/database_backup.sql"
    else
        log_warning "MySQL 컨테이너가 실행 중이지 않아 백업을 건너뜁니다."
    fi
}

# 함수: Docker Compose 배포
deploy_with_compose() {
    log_info "Docker Compose로 배포 중..."
    
    # 기존 컨테이너 중지
    docker-compose down
    
    # 새 이미지로 배포
    docker-compose up -d --build
    
    # 헬스체크 대기
    log_info "서비스 헬스체크 대기 중..."
    sleep 30
    
    # 서비스 상태 확인
    docker-compose ps
    
    log_success "Docker Compose 배포가 완료되었습니다."
}

# 함수: AWS ECS 배포
deploy_to_aws_ecs() {
    if command -v aws &> /dev/null; then
        log_info "AWS ECS에 배포 중..."
        
        # ECS 클러스터 업데이트
        aws ecs update-service \
            --cluster ${ECS_CLUSTER_NAME:-"deukgeun-cluster"} \
            --service ${ECS_SERVICE_NAME:-"deukgeun-service"} \
            --force-new-deployment
        
        log_success "AWS ECS 배포가 완료되었습니다."
    else
        log_error "AWS CLI가 설치되지 않았습니다."
        exit 1
    fi
}

# 함수: GCP Cloud Run 배포
deploy_to_gcp_cloudrun() {
    if command -v gcloud &> /dev/null; then
        log_info "GCP Cloud Run에 배포 중..."
        
        # 백엔드 배포
        gcloud run deploy deukgeun-backend \
            --image $BACKEND_IMAGE_NAME:$VERSION \
            --platform managed \
            --region ${GCP_REGION:-"asia-northeast3"} \
            --allow-unauthenticated
        
        # 프론트엔드 배포
        gcloud run deploy deukgeun-frontend \
            --image $FRONTEND_IMAGE_NAME:$VERSION \
            --platform managed \
            --region ${GCP_REGION:-"asia-northeast3"} \
            --allow-unauthenticated
        
        log_success "GCP Cloud Run 배포가 완료되었습니다."
    else
        log_error "Google Cloud CLI가 설치되지 않았습니다."
        exit 1
    fi
}

# 함수: Azure Container Instances 배포
deploy_to_azure_aci() {
    if command -v az &> /dev/null; then
        log_info "Azure Container Instances에 배포 중..."
        
        # 백엔드 배포
        az container create \
            --resource-group ${AZURE_RESOURCE_GROUP:-"deukgeun-rg"} \
            --name deukgeun-backend \
            --image $BACKEND_IMAGE_NAME:$VERSION \
            --ports 5000 \
            --environment-variables \
                NODE_ENV=production \
                DB_HOST=${DB_HOST} \
                DB_PORT=${DB_PORT} \
                DB_USERNAME=${DB_USERNAME} \
                DB_PASSWORD=${DB_PASSWORD} \
                DB_NAME=${DB_NAME}
        
        log_success "Azure Container Instances 배포가 완료되었습니다."
    else
        log_error "Azure CLI가 설치되지 않았습니다."
        exit 1
    fi
}

# 함수: 배포 후 검증
verify_deployment() {
    log_info "배포 검증 중..."
    
    # 백엔드 헬스체크
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_success "백엔드 서비스가 정상적으로 실행 중입니다."
    else
        log_error "백엔드 서비스에 연결할 수 없습니다."
        exit 1
    fi
    
    # 프론트엔드 헬스체크
    if curl -f http://localhost:80/ > /dev/null 2>&1; then
        log_success "프론트엔드 서비스가 정상적으로 실행 중입니다."
    else
        log_error "프론트엔드 서비스에 연결할 수 없습니다."
        exit 1
    fi
    
    log_success "배포 검증이 완료되었습니다."
}

# 함수: 롤백
rollback() {
    log_warning "롤백을 시작합니다..."
    
    # 이전 버전으로 되돌리기
    git checkout HEAD~1
    
    # 이미지 재빌드 및 배포
    build_images
    deploy_with_compose
    
    log_success "롤백이 완료되었습니다."
}

# 메인 실행 함수
main() {
    log_info "Deukgeun 클라우드 배포를 시작합니다..."
    
    # 의존성 확인
    check_dependencies
    
    # 테스트 실행
    run_tests
    
    # 배포 전 백업
    create_backup
    
    # 이미지 빌드
    build_images
    
    # 이미지 푸시 (선택사항)
    push_images
    
    # 배포 방식 선택
    case ${CLOUD_PLATFORM:-"docker-compose"} in
        "aws-ecs")
            deploy_to_aws_ecs
            ;;
        "gcp-cloudrun")
            deploy_to_gcp_cloudrun
            ;;
        "azure-aci")
            deploy_to_azure_aci
            ;;
        "docker-compose"|*)
            deploy_with_compose
            ;;
    esac
    
    # 배포 검증
    verify_deployment
    
    log_success "배포가 성공적으로 완료되었습니다!"
    log_info "프론트엔드: http://localhost:80"
    log_info "백엔드 API: http://localhost:5000"
    log_info "헬스체크: http://localhost:5000/health"
}

# 스크립트 실행
main "$@"
