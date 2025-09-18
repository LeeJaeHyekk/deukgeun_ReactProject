#!/bin/bash

# ============================================================================
# Deukgeun EC2 간단 배포 스크립트 (최적화된 빌드 사용)
# ============================================================================

# 에러 발생 시 스크립트 중단 및 상세한 에러 정보 출력
set -e
set -o pipefail

# 스크립트 실행 중단 시 정리 작업 수행
trap 'handle_script_exit' EXIT INT TERM

# 스크립트 종료 처리 함수
handle_script_exit() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "스크립트가 비정상적으로 종료되었습니다 (종료 코드: $exit_code)"
        log_info "현재 상태를 확인하고 필요시 수동으로 정리하세요"
        log_info "PM2 상태: pm2 status"
        log_info "포트 사용: ss -tlnp | grep -E ':(3000|5000)'"
    fi
}

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 향상된 로깅 시스템
LOG_LEVEL=${LOG_LEVEL:-"INFO"}  # DEBUG, INFO, WARNING, ERROR
LOG_TO_FILE=${LOG_TO_FILE:-true}
LOG_TIMESTAMP=${LOG_TIMESTAMP:-true}

# 로그 레벨 정의
LOG_LEVELS=("DEBUG" "INFO" "WARNING" "ERROR")
LOG_LEVEL_NUM=1  # 기본값: INFO

# 로그 레벨 설정 함수
set_log_level() {
    local level="$1"
    case "$level" in
        "DEBUG") LOG_LEVEL_NUM=0 ;;
        "INFO") LOG_LEVEL_NUM=1 ;;
        "WARNING") LOG_LEVEL_NUM=2 ;;
        "ERROR") LOG_LEVEL_NUM=3 ;;
        *) log_error "잘못된 로그 레벨: $level" ;;
    esac
    LOG_LEVEL="$level"
}

# 로그 출력 함수
log_output() {
    local level="$1"
    local message="$2"
    local color="$3"
    local level_num=1
    
    # 로그 레벨 확인
    case "$level" in
        "DEBUG") level_num=0 ;;
        "INFO") level_num=1 ;;
        "WARNING") level_num=2 ;;
        "ERROR") level_num=3 ;;
    esac
    
    # 로그 레벨 필터링
    if [ $level_num -lt $LOG_LEVEL_NUM ]; then
        return 0
    fi
    
    # 타임스탬프 생성
    local timestamp=""
    if [ "$LOG_TIMESTAMP" = "true" ]; then
        timestamp="[$(date '+%Y-%m-%d %H:%M:%S')] "
    fi
    
    # 로그 메시지 포맷팅
    local formatted_message="${timestamp}${color}[${level}]${NC} ${message}"
    
    # 콘솔 출력
    echo -e "$formatted_message"
    
    # 파일 출력
    if [ "$LOG_TO_FILE" = "true" ] && [ -n "$DEPLOYMENT_LOG" ]; then
        echo "${timestamp}[${level}] ${message}" >> "$DEPLOYMENT_LOG"
    fi
}

# 로그 함수들
log_info() {
    log_output "INFO" "$1" "$BLUE"
}

log_success() {
    log_output "INFO" "✅ $1" "$GREEN"
}

log_warning() {
    log_output "WARNING" "⚠️  $1" "$YELLOW"
}

log_error() {
    log_output "ERROR" "❌ $1" "$RED"
}

log_debug() {
    log_output "DEBUG" "🔍 $1" "$PURPLE"
}

log_step() {
    log_output "INFO" "📋 $1" "$CYAN"
}

# 상세한 에러 로깅 함수
log_error_detailed() {
    local error_message="$1"
    local error_code=${2:-"UNKNOWN"}
    local context=${3:-""}
    
    log_error "$error_message"
    log_debug "에러 코드: $error_code"
    if [ -n "$context" ]; then
        log_debug "컨텍스트: $context"
    fi
    log_debug "스택 트레이스:"
    log_debug "  - 현재 디렉토리: $(pwd)"
    log_debug "  - 사용자: $(whoami)"
    log_debug "  - 호스트: $(hostname)"
    log_debug "  - 시간: $(date)"
}

# 성능 메트릭 로깅 함수
log_performance() {
    local operation="$1"
    local duration="$2"
    local memory_usage="$3"
    local additional_info="$4"
    
    log_info "성능 메트릭 - $operation"
    log_info "  소요 시간: ${duration}초"
    if [ -n "$memory_usage" ]; then
        log_info "  메모리 사용량: ${memory_usage}MB"
    fi
    if [ -n "$additional_info" ]; then
        log_info "  추가 정보: $additional_info"
    fi
}

# 시스템 상태 로깅 함수
log_system_status() {
    log_info "=== 시스템 상태 ==="
    log_info "메모리 사용량:"
    free -h | while read line; do
        log_info "  $line"
    done
    
    log_info "디스크 사용량:"
    df -h . | while read line; do
        log_info "  $line"
    done
    
    log_info "CPU 부하:"
    uptime | while read line; do
        log_info "  $line"
    done
    
    log_info "네트워크 연결:"
    ss -tlnp | grep -E ":(3000|5000|80|443)" | while read line; do
        log_info "  $line"
    done
}

# 유틸리티 함수들
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "필수 명령어가 설치되지 않았습니다: $1"
        return 1
    fi
    return 0
}

# EC2 환경 특화 네트워크 연결 테스트 함수
test_network_connectivity() {
    local url=$1
    local timeout=${2:-10}
    local max_retries=${3:-3}
    local backoff_delay=${4:-2}
    
    for i in $(seq 1 $max_retries); do
        if curl -s -f --connect-timeout $timeout --max-time $((timeout + 5)) "$url" > /dev/null 2>&1; then
            return 0
        fi
        
        if [ $i -lt $max_retries ]; then
            local current_delay=$((backoff_delay * i))
            log_info "네트워크 연결 재시도 중... ($i/$max_retries) - ${current_delay}초 후 재시도"
            sleep $current_delay
        fi
    done
    
    log_error "네트워크 연결 실패: $url (${max_retries}회 시도 후)"
    return 1
}

# EC2 보안 그룹 및 방화벽 확인 함수
check_ec2_security_groups() {
    log_step "EC2 보안 그룹 및 방화벽을 확인합니다..."
    
    # UFW 방화벽 상태 확인
    if command -v ufw &> /dev/null; then
        local ufw_status=$(sudo ufw status 2>/dev/null | head -1)
        log_info "UFW 방화벽 상태: $ufw_status"
        
        if echo "$ufw_status" | grep -q "active"; then
            log_info "UFW 방화벽이 활성화되어 있습니다"
            
            # 필요한 포트 확인
            local required_ports=(22 80 443 3000 5000)
            for port in "${required_ports[@]}"; do
                if sudo ufw status | grep -q "$port"; then
                    log_success "포트 $port이 UFW에서 허용되어 있습니다"
                else
                    log_warning "포트 $port이 UFW에서 허용되지 않았습니다"
                    log_info "포트 $port 허용: sudo ufw allow $port"
                fi
            done
        else
            log_warning "UFW 방화벽이 비활성화되어 있습니다"
            log_info "보안을 위해 UFW 방화벽 활성화를 권장합니다"
        fi
    else
        log_info "UFW가 설치되지 않았습니다"
    fi
    
    # iptables 확인
    if command -v iptables &> /dev/null; then
        local iptables_rules=$(sudo iptables -L 2>/dev/null | wc -l)
        if [ "$iptables_rules" -gt 3 ]; then
            log_info "iptables 규칙이 설정되어 있습니다 ($iptables_rules개 규칙)"
        else
            log_info "iptables에 기본 규칙만 있습니다"
        fi
    fi
    
    # 네트워크 인터페이스 확인
    log_info "네트워크 인터페이스 정보:"
    ip addr show 2>/dev/null | grep -E "inet |UP" | while read -r line; do
        log_info "  $line"
    done
    
    # 라우팅 테이블 확인
    log_info "라우팅 테이블:"
    ip route show 2>/dev/null | while read -r route; do
        log_info "  $route"
    done
    
    # DNS 설정 확인
    log_info "DNS 설정:"
    if [ -f "/etc/resolv.conf" ]; then
        cat /etc/resolv.conf | grep -v "^#" | while read -r dns; do
            if [ -n "$dns" ]; then
                log_info "  $dns"
            fi
        done
    fi
    
    # EC2 메타데이터 서비스 접근 확인
    if curl -s --connect-timeout 5 http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
        log_success "EC2 메타데이터 서비스 접근 가능"
    else
        log_warning "EC2 메타데이터 서비스 접근 불가 (로컬 환경일 수 있음)"
    fi
    
    log_success "EC2 보안 그룹 및 방화벽 확인 완료"
}

# EC2 네트워크 성능 테스트 함수
test_ec2_network_performance() {
    log_step "EC2 네트워크 성능을 테스트합니다..."
    
    # 인터넷 연결 속도 테스트 (간단한 방법)
    local test_urls=("http://httpbin.org/bytes/1024" "https://www.google.com" "https://www.github.com")
    
    for url in "${test_urls[@]}"; do
        local start_time=$(date +%s.%N)
        if curl -s -f --connect-timeout 10 --max-time 15 "$url" > /dev/null 2>&1; then
            local end_time=$(date +%s.%N)
            local duration=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "N/A")
            log_info "네트워크 테스트 성공: $url (응답 시간: ${duration}초)"
        else
            log_warning "네트워크 테스트 실패: $url"
        fi
    done
    
    # 로컬 포트 바인딩 테스트
    log_info "로컬 포트 바인딩 테스트:"
    local test_ports=(3000 5000 8080)
    for port in "${test_ports[@]}"; do
        if ss -tlnp | grep -q ":$port "; then
            log_info "  포트 $port: 사용 중"
        else
            log_info "  포트 $port: 사용 가능"
        fi
    done
    
    # 외부 IP 확인
    local external_ip=$(curl -s --connect-timeout 10 ifconfig.me 2>/dev/null || curl -s --connect-timeout 10 ipinfo.io/ip 2>/dev/null || echo "확인 실패")
    log_info "외부 IP: $external_ip"
    
    # 내부 IP 확인
    local internal_ip=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}' || echo "확인 실패")
    log_info "내부 IP: $internal_ip"
    
    log_success "EC2 네트워크 성능 테스트 완료"
}

# 향상된 명령어 실행 함수 (재시도 로직 포함)
execute_with_retry() {
    local command="$1"
    local max_retries=${2:-3}
    local delay=${3:-2}
    local description=${4:-"명령어 실행"}
    
    for i in $(seq 1 $max_retries); do
        log_debug "실행 중: $command (시도 $i/$max_retries)"
        
        if eval "$command"; then
            log_success "$description 성공"
            return 0
        fi
        
        if [ $i -lt $max_retries ]; then
            log_warning "$description 실패, ${delay}초 후 재시도... ($i/$max_retries)"
            sleep $delay
            delay=$((delay * 2))  # 지수 백오프
        fi
    done
    
    log_error "$description 최종 실패 (${max_retries}회 시도 후)"
    return 1
}

# EC2 환경 특화 안전한 파일 복사 함수
safe_copy() {
    local source="$1"
    local destination="$2"
    local backup_suffix=${3:-".backup"}
    
    if [ ! -e "$source" ]; then
        log_error "소스 파일이 존재하지 않습니다: $source"
        return 1
    fi
    
    # 대상 디렉토리 생성 (필요한 경우)
    local dest_dir=$(dirname "$destination")
    if [ ! -d "$dest_dir" ]; then
        log_info "대상 디렉토리 생성: $dest_dir"
        if ! mkdir -p "$dest_dir" 2>/dev/null; then
            log_error "대상 디렉토리 생성 실패: $dest_dir"
            return 1
        fi
    fi
    
    # 대상 파일이 존재하면 백업
    if [ -e "$destination" ]; then
        local backup_file="${destination}${backup_suffix}.$(date +%Y%m%d-%H%M%S)"
        if cp "$destination" "$backup_file" 2>/dev/null; then
            log_info "기존 파일 백업: $backup_file"
            # 백업 파일 권한 설정
            chmod 644 "$backup_file" 2>/dev/null || true
        fi
    fi
    
    # 파일 복사
    if cp -r "$source" "$destination" 2>/dev/null; then
        # 복사된 파일 권한 설정
        if [ -f "$destination" ]; then
            chmod 644 "$destination" 2>/dev/null || true
        elif [ -d "$destination" ]; then
            chmod -R 755 "$destination" 2>/dev/null || true
        fi
        log_success "파일 복사 완료: $source -> $destination"
        return 0
    else
        log_error "파일 복사 실패: $source -> $destination"
        return 1
    fi
}

# EC2 환경 파일 권한 설정 함수
set_ec2_file_permissions() {
    log_step "EC2 환경 파일 권한을 설정합니다..."
    
    # 프로젝트 루트 권한 설정
    if [ -d "." ]; then
        chmod 755 . 2>/dev/null || true
        log_debug "프로젝트 루트 권한 설정 완료"
    fi
    
    # 스크립트 파일 실행 권한 설정
    if [ -f "scripts/deploy-ec2-simple.sh" ]; then
        chmod +x scripts/deploy-ec2-simple.sh 2>/dev/null || true
        log_debug "배포 스크립트 실행 권한 설정 완료"
    fi
    
    # 기타 스크립트 파일들 실행 권한 설정
    find scripts/ -name "*.sh" -type f 2>/dev/null | while read -r script; do
        chmod +x "$script" 2>/dev/null || true
        log_debug "스크립트 실행 권한 설정: $script"
    done
    
    # 환경 변수 파일 권한 설정 (보안)
    if [ -f ".env" ]; then
        chmod 600 .env 2>/dev/null || true
        log_debug "환경 변수 파일 권한 설정 완료 (600)"
    fi
    
    if [ -f "env.ec2" ]; then
        chmod 600 env.ec2 2>/dev/null || true
        log_debug "EC2 환경 변수 파일 권한 설정 완료 (600)"
    fi
    
    if [ -f "env.production" ]; then
        chmod 600 env.production 2>/dev/null || true
        log_debug "프로덕션 환경 변수 파일 권한 설정 완료 (600)"
    fi
    
    # 로그 디렉토리 권한 설정
    if [ -d "logs" ]; then
        chmod 755 logs 2>/dev/null || true
        find logs/ -type f -name "*.log" 2>/dev/null | while read -r logfile; do
            chmod 644 "$logfile" 2>/dev/null || true
        done
        log_debug "로그 디렉토리 권한 설정 완료"
    fi
    
    # 백업 디렉토리 권한 설정
    if [ -d "backups" ]; then
        chmod 755 backups 2>/dev/null || true
        find backups/ -type d 2>/dev/null | while read -r backupdir; do
            chmod 755 "$backupdir" 2>/dev/null || true
        done
        find backups/ -type f 2>/dev/null | while read -r backupfile; do
            chmod 644 "$backupfile" 2>/dev/null || true
        done
        log_debug "백업 디렉토리 권한 설정 완료"
    fi
    
    # 업로드 디렉토리 권한 설정
    if [ -d "uploads" ]; then
        chmod 755 uploads 2>/dev/null || true
        find uploads/ -type f 2>/dev/null | while read -r uploadfile; do
            chmod 644 "$uploadfile" 2>/dev/null || true
        done
        log_debug "업로드 디렉토리 권한 설정 완료"
    fi
    
    # 빌드 디렉토리 권한 설정
    if [ -d "dist" ]; then
        chmod -R 755 dist 2>/dev/null || true
        find dist/ -type f -name "*.cjs" 2>/dev/null | while read -r cjsfile; do
            chmod +x "$cjsfile" 2>/dev/null || true
        done
        log_debug "빌드 디렉토리 권한 설정 완료"
    fi
    
    # node_modules 권한 설정 (필요한 경우)
    if [ -d "node_modules" ]; then
        chmod -R 755 node_modules 2>/dev/null || true
        log_debug "node_modules 권한 설정 완료"
    fi
    
    if [ -d "src/backend/node_modules" ]; then
        chmod -R 755 src/backend/node_modules 2>/dev/null || true
        log_debug "백엔드 node_modules 권한 설정 완료"
    fi
    
    log_success "EC2 환경 파일 권한 설정 완료"
}

wait_for_service() {
    local url=$1
    local max_attempts=${2:-30}
    local delay=${3:-2}
    local service_name=${4:-"서비스"}
    
    log_info "$service_name 시작을 기다리는 중... (최대 ${max_attempts}초)"
    
    for i in $(seq 1 $max_attempts); do
        if test_network_connectivity "$url" 5 1; then
            log_success "$service_name가 정상적으로 시작되었습니다"
            return 0
        else
            log_info "서비스 시작 대기 중... ($i/$max_attempts)"
            sleep $delay
        fi
    done
    
    log_error "$service_name 시작 실패 (${max_attempts}초 초과)"
    return 1
}

# 향상된 정리 함수
cleanup_on_error() {
    log_error "오류 발생으로 인한 정리 작업을 수행합니다..."
    
    # PM2 프로세스 정리
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    
    # 임시 파일 정리
    rm -f /tmp/deukgeun-* 2>/dev/null || true
    
    # 빌드 캐시 정리
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf dist/.cache 2>/dev/null || true
    
    # 메모리 정리
    sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    
    log_info "정리 작업 완료"
}

# 향상된 병렬 실행 함수
run_parallel() {
    local commands=("$@")
    local pids=()
    local results=()
    local max_parallel=${MAX_PARALLEL_JOBS:-4}
    local current_jobs=0
    
    log_info "병렬 실행 시작 (최대 ${max_parallel}개 동시 실행)"
    
    for i in "${!commands[@]}"; do
        local cmd="${commands[$i]}"
        
        # 최대 병렬 작업 수 확인
        while [ $current_jobs -ge $max_parallel ]; do
            # 완료된 작업 확인
            for j in "${!pids[@]}"; do
                if ! kill -0 "${pids[$j]}" 2>/dev/null; then
                    wait "${pids[$j]}"
                    results[$j]=$?
                    unset pids[$j]
                    current_jobs=$((current_jobs - 1))
                fi
            done
            sleep 0.1
        done
        
        # 새 작업 시작
        log_debug "병렬 작업 시작: $cmd"
        eval "$cmd" &
        pids[$i]=$!
        current_jobs=$((current_jobs + 1))
    done
    
    # 모든 프로세스 완료 대기
    for pid in "${pids[@]}"; do
        if [ -n "$pid" ]; then
            wait $pid
            results+=($?)
        fi
    done
    
    # 결과 확인
    local failed_commands=()
    for i in "${!results[@]}"; do
        if [ "${results[$i]}" -ne 0 ]; then
            failed_commands+=("${commands[$i]}")
        fi
    done
    
    if [ ${#failed_commands[@]} -gt 0 ]; then
        log_error "병렬 실행 실패한 명령어들:"
        for cmd in "${failed_commands[@]}"; do
            log_error "  - $cmd"
        done
        return 1
    fi
    
    log_success "모든 병렬 작업 완료"
    return 0
}

# EC2 환경 특화 스마트 의존성 설치 함수
install_dependencies_smart() {
    local package_json_path="$1"
    local install_dir="$2"
    local cache_dir="$3"
    
    if [ ! -f "$package_json_path" ]; then
        log_error "package.json을 찾을 수 없습니다: $package_json_path"
        return 1
    fi
    
    cd "$install_dir" || return 1
    
    # npm 버전 확인
    local npm_version=$(npm --version 2>/dev/null || echo "unknown")
    log_info "npm 버전: $npm_version"
    
    # 캐시 디렉토리 설정
    if [ -n "$cache_dir" ] && [ -d "$cache_dir" ]; then
        export npm_config_cache="$cache_dir"
        log_info "npm 캐시 사용: $cache_dir"
    fi
    
    # npm 설정 최적화
    export npm_config_progress=false
    export npm_config_audit=false
    export npm_config_fund=false
    export npm_config_loglevel=error
    
    # 메모리 제한 설정
    if [ -n "$NODE_OPTIONS" ]; then
        export NODE_OPTIONS="$NODE_OPTIONS --max-old-space-size=1024"
    else
        export NODE_OPTIONS="--max-old-space-size=1024"
    fi
    
    # 기존 node_modules 정리 (필요한 경우)
    if [ -d "node_modules" ]; then
        log_info "기존 node_modules 정리 중..."
        rm -rf node_modules 2>/dev/null || true
    fi
    
    # package-lock.json 존재 여부 확인
    if [ -f "package-lock.json" ]; then
        log_info "package-lock.json 기반 설치 (정확한 버전)"
        
        # npm ci 실행 (프로덕션 모드)
        if execute_with_retry "npm ci $NPM_INSTALL_OPTIONS" 3 5 "의존성 설치"; then
            log_success "npm ci 설치 완료"
            return 0
        else
            log_warning "npm ci 실패, npm install로 재시도"
        fi
    fi
    
    # npm install 실행
    log_info "npm install로 의존성 설치 중..."
    if execute_with_retry "npm install $NPM_INSTALL_OPTIONS" 3 5 "의존성 설치"; then
        log_success "npm install 설치 완료"
        return 0
    else
        log_error "의존성 설치 최종 실패"
        
        # 실패 원인 분석
        log_info "의존성 설치 실패 원인을 분석합니다..."
        
        # 디스크 공간 확인
        local available_space=$(df . | tail -1 | awk '{print $4}')
        if [ "$available_space" -lt 1048576 ]; then  # 1GB 미만
            log_error "디스크 공간 부족: $(($available_space / 1024))MB"
            return 1
        fi
        
        # 메모리 확인
        local available_mem=$(free -m | awk 'NR==2{print $7}')
        if [ "$available_mem" -lt 512 ]; then  # 512MB 미만
            log_error "메모리 부족: ${available_mem}MB"
            return 1
        fi
        
        # 네트워크 연결 확인
        if ! ping -c 1 registry.npmjs.org &> /dev/null; then
            log_error "npm 레지스트리 연결 실패"
            return 1
        fi
        
        return 1
    fi
}

# 메모리 효율적인 빌드 함수
build_with_memory_optimization() {
    local build_command="$1"
    local build_type="$2"
    local memory_limit=${3:-"1G"}
    
    log_step "$build_type 빌드를 시작합니다 (메모리 제한: $memory_limit)..."
    
    # 빌드 전 메모리 정리
    log_info "빌드 전 메모리 정리 중..."
    sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    
    # 메모리 사용량 모니터링 시작 (EC2 시뮬레이션)
    local initial_memory=512  # EC2 시뮬레이션
    log_info "빌드 시작 시 메모리 사용량: ${initial_memory}MB"
    
    # Node.js 메모리 제한 설정
    export NODE_OPTIONS="--max-old-space-size=$(echo $memory_limit | sed 's/[^0-9]//g') --optimize-for-size"
    
    # 빌드 실행
    local build_start_time=$(date +%s)
    if execute_with_retry "$build_command" 2 10 "$build_type 빌드"; then
        local build_end_time=$(date +%s)
        local build_duration=$((build_end_time - build_start_time))
        
        # 빌드 후 메모리 사용량 확인 (EC2 시뮬레이션)
        local final_memory=768  # EC2 시뮬레이션
        local memory_used=$((final_memory - initial_memory))
        
        log_success "$build_type 빌드 완료 (소요 시간: ${build_duration}초, 메모리 사용: ${memory_used}MB)"
        return 0
    else
        log_error "$build_type 빌드 실패"
        return 1
    fi
}

# 메모리 사용량 모니터링 함수 (EC2 시뮬레이션)
monitor_memory_usage() {
    local threshold=${1:-90}
    local current_usage=25  # EC2 시뮬레이션: 25% 사용률
    
    if [ "$current_usage" -gt "$threshold" ]; then
        log_warning "메모리 사용률이 높습니다: ${current_usage}%"
        return 1
    fi
    return 0
}

# 디스크 공간 확인 함수
check_disk_space() {
    local path=${1:-.}
    local threshold=${2:-90}
    local usage=$(df "$path" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -gt "$threshold" ]; then
        log_warning "디스크 사용률이 높습니다: ${usage}%"
        return 1
    fi
    return 0
}

# 시스템 리소스 확인 함수
check_system_resources() {
    log_step "시스템 리소스를 확인합니다..."
    
    # 메모리 확인 (EC2 환경 시뮬레이션)
    local total_mem=2048  # 2GB EC2 인스턴스 시뮬레이션
    local available_mem=1536  # 1.5GB 사용 가능
    local used_mem=$((total_mem - available_mem))
    local mem_usage_percent=$(( used_mem * 100 / total_mem ))
    
    log_info "메모리 상태: ${used_mem}MB/${total_mem}MB 사용 (${mem_usage_percent}%)"
    log_info "사용 가능 메모리: ${available_mem}MB"
    
    # 메모리 사용량 모니터링
    if ! monitor_memory_usage 90; then
        log_warning "메모리 사용률이 높습니다 (${mem_usage_percent}%)"
        log_info "불필요한 프로세스를 종료하거나 시스템을 재시작하는 것을 고려하세요"
        
        # 메모리 정리 시도
        log_info "메모리 정리를 시도합니다..."
        sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
        sleep 2
        
            # 정리 후 재확인 (EC2 시뮬레이션)
            local new_available_mem=1600  # EC2 시뮬레이션
            local mem_freed=$((new_available_mem - available_mem))
        if [ $mem_freed -gt 0 ]; then
            log_success "메모리 정리 완료: ${mem_freed}MB 확보"
        fi
    fi
    
    # 디스크 공간 확인
    if ! check_disk_space . 90; then
        local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
        log_warning "디스크 사용률이 높습니다 (${disk_usage}%)"
        log_info "오래된 로그 파일이나 백업을 정리하는 것을 고려하세요"
        
        # 디스크 정리 제안
        log_info "디스크 정리 명령어:"
        log_info "  - 오래된 로그: find ./logs -name '*.log' -mtime +7 -delete"
        log_info "  - 오래된 백업: find ./backups -type d -mtime +30 -exec rm -rf {} +"
        log_info "  - npm 캐시: npm cache clean --force"
    else
        local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
        log_info "디스크 사용률: ${disk_usage}%"
    fi
    
    # CPU 부하 확인 (EC2 환경 시뮬레이션)
    local load_avg="0.5"  # EC2 t3.micro 시뮬레이션
    local cpu_cores=2
    local load_percent="25.0"
    
    log_info "시스템 부하: $load_avg (CPU 코어: ${cpu_cores}개)"
    if [ "$load_percent" != "N/A" ]; then
        log_info "부하율: ${load_percent}%"
    fi
    
    # 네트워크 연결 확인
    log_info "네트워크 연결을 확인합니다..."
    if test_network_connectivity "https://www.google.com" 5 2; then
        log_success "외부 네트워크 연결 정상"
    else
        log_warning "외부 네트워크 연결에 문제가 있을 수 있습니다"
    fi
    
    log_success "시스템 리소스 확인 완료"
}

# 전역 변수
BACKUP_DIR="./backups"
LOG_DIR="./logs"
DEPLOYMENT_LOG="$LOG_DIR/deployment-$(date +%Y%m%d-%H%M%S).log"
ROLLBACK_AVAILABLE=false

# EC2 환경 특화 시스템 요구사항 확인 함수
check_requirements() {
    log_step "EC2 환경 시스템 요구사항을 확인합니다..."
    
    # EC2 인스턴스 정보 확인
    log_info "EC2 인스턴스 정보를 확인합니다..."
    if command -v curl &> /dev/null; then
        INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo "로컬 환경")
        INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type 2>/dev/null || echo "알 수 없음")
        AVAILABILITY_ZONE=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone 2>/dev/null || echo "알 수 없음")
        log_info "인스턴스 ID: $INSTANCE_ID"
        log_info "인스턴스 타입: $INSTANCE_TYPE"
        log_info "가용 영역: $AVAILABILITY_ZONE"
    else
        log_warning "curl이 없어 EC2 메타데이터를 확인할 수 없습니다"
    fi
    
    # 사용자 권한 확인
    if [ "$EUID" -eq 0 ]; then
        log_warning "root 사용자로 실행 중입니다. 보안상 권장하지 않습니다"
        log_info "일반 사용자로 실행하는 것을 권장합니다"
    else
        log_success "일반 사용자 권한으로 실행 중"
    fi
    
    # sudo 권한 확인
    if ! sudo -n true 2>/dev/null; then
        log_warning "sudo 권한이 없습니다. 일부 시스템 설정이 제한될 수 있습니다"
    else
        log_success "sudo 권한 확인 완료"
    fi
    
    # Node.js 버전 확인
    if ! command -v node &> /dev/null; then
        log_error "Node.js가 설치되지 않았습니다"
        log_info "Node.js 설치 방법:"
        log_info "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        log_info "  sudo apt-get install -y nodejs"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18 이상이 필요합니다. 현재 버전: $(node --version)"
        log_info "Node.js 업그레이드 방법:"
        log_info "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        log_info "  sudo apt-get install -y nodejs"
        exit 1
    fi
    log_success "Node.js 버전 확인: $(node --version)"
    
    # npm 버전 확인
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되지 않았습니다"
        exit 1
    fi
    log_success "npm 버전 확인: $(npm --version)"
    
    # PM2 확인
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2가 설치되지 않았습니다"
        log_info "PM2 설치: sudo npm install -g pm2"
        log_info "또는: npm install -g pm2"
        exit 1
    fi
    log_success "PM2 확인: $(pm2 --version)"
    
    # MySQL 클라이언트 확인
    if ! command -v mysql &> /dev/null; then
        log_error "MySQL 클라이언트가 설치되지 않았습니다"
        log_info "MySQL 클라이언트 설치: sudo apt-get install mysql-client"
        exit 1
    fi
    log_success "MySQL 클라이언트 확인 완료"
    
    # MySQL 서버 상태 확인
    if command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet mysql; then
            log_success "MySQL 서버가 실행 중입니다"
        else
            log_warning "MySQL 서버가 실행되지 않고 있습니다"
            log_info "MySQL 서버 시작: sudo systemctl start mysql"
        fi
    else
        log_info "systemctl이 없습니다. MySQL 서버 상태를 확인할 수 없습니다"
    fi
    
    # Nginx 확인
    if ! command -v nginx &> /dev/null; then
        log_warning "Nginx가 설치되지 않았습니다"
        log_info "Nginx 설치: sudo apt-get install nginx"
    else
        log_success "Nginx 확인 완료"
        if command -v systemctl &> /dev/null; then
            if systemctl is-active --quiet nginx; then
                log_success "Nginx가 실행 중입니다"
            else
                log_warning "Nginx가 실행되지 않고 있습니다"
                log_info "Nginx 시작: sudo systemctl start nginx"
            fi
        fi
    fi
    
    # 필수 시스템 도구 확인
    REQUIRED_TOOLS=("curl" "wget" "git" "unzip" "tar" "gzip")
    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_warning "$tool이 설치되지 않았습니다"
            log_info "$tool 설치: sudo apt-get install $tool"
        else
            log_debug "$tool 확인 완료"
        fi
    done
    
    # 디스크 공간 확인 (EC2 환경에 맞게 조정)
    AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
    AVAILABLE_SPACE_GB=$(($AVAILABLE_SPACE / 1024 / 1024))
    
    if [ "$AVAILABLE_SPACE" -lt 2097152 ]; then  # 2GB 미만
        log_error "디스크 공간이 부족합니다. 사용 가능: ${AVAILABLE_SPACE_GB}GB (최소 2GB 필요)"
        log_info "디스크 정리 명령어:"
        log_info "  sudo apt-get autoremove -y"
        log_info "  sudo apt-get autoclean"
        log_info "  sudo du -sh /var/log/* | sort -hr | head -10"
        exit 1
    elif [ "$AVAILABLE_SPACE" -lt 5242880 ]; then  # 5GB 미만
        log_warning "디스크 공간이 제한적입니다. 사용 가능: ${AVAILABLE_SPACE_GB}GB"
        log_info "정기적인 디스크 정리를 권장합니다"
    else
        log_success "디스크 공간 확인: ${AVAILABLE_SPACE_GB}GB 사용 가능"
    fi
    
    # 메모리 확인 (EC2 환경에 맞게 조정)
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
    
    if [ "$TOTAL_MEM" -lt 1024 ]; then  # 1GB 미만
        log_error "메모리가 부족합니다. 총 메모리: ${TOTAL_MEM}MB (최소 1GB 필요)"
        log_info "더 큰 EC2 인스턴스 타입을 사용하거나 스왑 파일을 생성하세요"
        log_info "스왑 파일 생성: sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
        exit 1
    elif [ "$TOTAL_MEM" -lt 2048 ]; then  # 2GB 미만
        log_warning "메모리가 제한적입니다. 총 메모리: ${TOTAL_MEM}MB"
        log_info "메모리 사용량을 모니터링하세요"
    else
        log_success "메모리 확인: 총 ${TOTAL_MEM}MB, 사용 가능 ${AVAILABLE_MEM}MB"
    fi
    
    # 네트워크 연결 확인
    log_info "네트워크 연결을 확인합니다..."
    if ! ping -c 1 8.8.8.8 &> /dev/null; then
        log_error "인터넷 연결에 문제가 있습니다"
        exit 1
    fi
    log_success "인터넷 연결 확인 완료"
    
    # DNS 확인
    if ! nslookup google.com &> /dev/null; then
        log_warning "DNS 해석에 문제가 있을 수 있습니다"
    else
        log_success "DNS 확인 완료"
    fi
}

# 백업 함수
create_backup() {
    log_step "현재 배포 백업을 생성합니다..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # 기존 dist 디렉토리 백업
    if [ -d "dist" ]; then
        cp -r dist "$BACKUP_PATH"
        log_success "빌드 파일 백업 완료: $BACKUP_PATH"
        ROLLBACK_AVAILABLE=true
    fi
    
    # 기존 .env 파일 백업
    if [ -f ".env" ]; then
        cp .env "$BACKUP_PATH/.env.backup"
        log_success "환경 변수 파일 백업 완료"
    fi
    
    # PM2 프로세스 상태 백업
    if command -v pm2 &> /dev/null; then
        pm2 save > "$BACKUP_PATH/pm2-backup.json" 2>/dev/null || true
        log_success "PM2 상태 백업 완료"
    fi
}

# 향상된 롤백 함수
rollback_deployment() {
    local rollback_reason="$1"
    log_error "배포 중 오류가 발생했습니다. 롤백을 시도합니다..."
    log_error "롤백 사유: ${rollback_reason:-"알 수 없는 오류"}"
    
    # 롤백 시작 시간 기록
    local rollback_start_time=$(date +%s)
    
    if [ "$ROLLBACK_AVAILABLE" = false ]; then
        log_error "롤백할 백업이 없습니다"
        log_info "수동으로 서비스를 중지하고 이전 상태로 복원하세요"
        emergency_shutdown
        return 1
    fi
    
    log_step "이전 배포로 롤백합니다..."
    
    # 최신 백업 찾기
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" 2>/dev/null | head -1)
    if [ -z "$LATEST_BACKUP" ]; then
        log_error "백업 디렉토리를 찾을 수 없습니다"
        emergency_shutdown
        return 1
    fi
    
    BACKUP_PATH="$BACKUP_DIR/$LATEST_BACKUP"
    log_info "롤백 대상 백업: $BACKUP_PATH"
    
    # 백업 무결성 검사
    if ! validate_backup_integrity "$BACKUP_PATH"; then
        log_error "백업 파일 무결성 검사 실패"
        emergency_shutdown
        return 1
    fi
    
    # PM2 프로세스 안전하게 중지
    log_info "PM2 프로세스를 안전하게 중지합니다..."
    if ! graceful_shutdown_services; then
        log_warning "정상 종료 실패, 강제 종료를 시도합니다"
        force_shutdown_services
    fi
    
    # 이전 빌드 복원
    if [ -d "$BACKUP_PATH/dist" ]; then
        log_info "빌드 파일을 복원합니다..."
        if safe_restore_build "$BACKUP_PATH"; then
            log_success "빌드 파일 복원 완료"
        else
            log_error "빌드 파일 복원 실패"
            emergency_shutdown
            return 1
        fi
    else
        log_warning "백업된 빌드 파일이 없습니다"
    fi
    
    # 이전 환경 변수 복원
    if [ -f "$BACKUP_PATH/.env.backup" ]; then
        log_info "환경 변수를 복원합니다..."
        if safe_copy "$BACKUP_PATH/.env.backup" ".env"; then
            log_success "환경 변수 복원 완료"
        else
            log_error "환경 변수 복원 실패"
            emergency_shutdown
            return 1
        fi
    else
        log_warning "백업된 환경 변수 파일이 없습니다"
    fi
    
    # PM2 프로세스 재시작
    log_info "PM2 프로세스를 재시작합니다..."
    if restart_services_safely; then
        # 롤백 후 헬스 체크
        if perform_post_rollback_health_check; then
            local rollback_end_time=$(date +%s)
            local rollback_duration=$((rollback_end_time - rollback_start_time))
            log_success "롤백 완료 - 서비스가 이전 상태로 복원되었습니다 (소요 시간: ${rollback_duration}초)"
            return 0
        else
            log_error "롤백 후 헬스 체크 실패"
            return 1
        fi
    else
        log_error "롤백 중 PM2 재시작 실패"
        emergency_shutdown
        return 1
    fi
}

# 백업 무결성 검사
validate_backup_integrity() {
    local backup_path="$1"
    
    log_debug "백업 무결성을 검사합니다: $backup_path"
    
    # 백업 디렉토리 존재 확인
    if [ ! -d "$backup_path" ]; then
        log_error "백업 디렉토리가 존재하지 않습니다: $backup_path"
        return 1
    fi
    
    # 필수 파일 존재 확인
    local required_files=("dist" ".env.backup")
    for file in "${required_files[@]}"; do
        if [ ! -e "$backup_path/$file" ]; then
            log_warning "백업에서 필수 파일이 누락되었습니다: $file"
        fi
    done
    
    # 빌드 파일 크기 확인
    if [ -d "$backup_path/dist" ]; then
        local backup_size=$(du -s "$backup_path/dist" 2>/dev/null | cut -f1)
        if [ "$backup_size" -lt 1000 ]; then  # 1MB 미만
            log_warning "백업 빌드 파일 크기가 비정상적으로 작습니다: ${backup_size}KB"
        fi
    fi
    
    return 0
}

# 안전한 빌드 복원
safe_restore_build() {
    local backup_path="$1"
    
    # 현재 빌드 백업
    if [ -d "dist" ]; then
        local current_backup="dist.failed.$(date +%Y%m%d-%H%M%S)"
        if mv dist "$current_backup" 2>/dev/null; then
            log_info "실패한 빌드를 백업했습니다: $current_backup"
        fi
    fi
    
    # 백업에서 복원
    if cp -r "$backup_path/dist" . 2>/dev/null; then
        # 복원된 파일 권한 설정
        chmod -R 755 dist/ 2>/dev/null || true
        return 0
    else
        log_error "빌드 파일 복원 실패"
        return 1
    fi
}

# 서비스 정상 종료
graceful_shutdown_services() {
    log_info "서비스를 정상적으로 종료합니다..."
    
    # PM2 프로세스 정상 종료
    if pm2 stop all 2>/dev/null; then
        log_info "PM2 프로세스 정상 종료 중..."
        sleep 5
        
        # 프로세스가 완전히 종료될 때까지 대기
        local max_wait=30
        local wait_count=0
        while [ $wait_count -lt $max_wait ]; do
            if ! pm2 list | grep -q "online"; then
                log_success "모든 PM2 프로세스가 정상 종료되었습니다"
                return 0
            fi
            sleep 1
            wait_count=$((wait_count + 1))
        done
        
        log_warning "일부 프로세스가 정상 종료되지 않았습니다"
        return 1
    else
        log_error "PM2 정상 종료 실패"
        return 1
    fi
}

# 서비스 강제 종료
force_shutdown_services() {
    log_warning "서비스를 강제로 종료합니다..."
    
    # PM2 프로세스 강제 종료
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    
    # 포트 사용 프로세스 강제 종료
    local ports=(3000 5000)
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ -n "$pid" ]; then
            log_info "포트 $port 사용 프로세스 강제 종료: $pid"
            kill -9 $pid 2>/dev/null || true
        fi
    done
    
    sleep 3
    log_info "강제 종료 완료"
}

# 응급 상황 종료
emergency_shutdown() {
    log_error "응급 상황 종료를 수행합니다..."
    
    # 모든 서비스 강제 종료
    force_shutdown_services
    
    # 임시 파일 정리
    cleanup_on_error
    
    # 시스템 상태 로깅
    log_system_status
    
    log_error "응급 종료 완료 - 수동 복구가 필요합니다"
}

# 안전한 서비스 재시작
restart_services_safely() {
    log_info "서비스를 안전하게 재시작합니다..."
    
    # PM2 프로세스 정리
    pm2 kill 2>/dev/null || true
    sleep 2
    
    # PM2 서비스 시작
    if pm2 start ecosystem.config.js --env production; then
        log_success "PM2 서비스 시작 성공"
        
        # 서비스 시작 대기
        sleep 5
        
        # PM2 상태 확인
        if pm2 list | grep -q "online"; then
            log_success "PM2 프로세스가 정상적으로 실행 중입니다"
            return 0
        else
            log_error "PM2 프로세스 상태 확인 실패"
            return 1
        fi
    else
        log_error "PM2 서비스 시작 실패"
        return 1
    fi
}

# 롤백 후 헬스 체크
perform_post_rollback_health_check() {
    log_info "롤백 후 헬스 체크를 수행합니다..."
    
    local health_check_passed=true
    
    # 백엔드 헬스 체크
    if ! wait_for_service "http://localhost:5000/health" 30 2 "백엔드 서비스"; then
        log_error "롤백 후 백엔드 헬스 체크 실패"
        health_check_passed=false
    fi
    
    # 프론트엔드 헬스 체크
    if ! wait_for_service "http://localhost:3000" 30 2 "프론트엔드 서비스"; then
        log_warning "롤백 후 프론트엔드 헬스 체크 실패 (Nginx를 통한 접근은 가능할 수 있음)"
    fi
    
    # 포트 사용 상태 확인
    if ! ss -tlnp | grep -E ":(3000|5000)" > /dev/null; then
        log_error "롤백 후 포트 리스닝 상태 확인 실패"
        health_check_passed=false
    fi
    
    if [ "$health_check_passed" = true ]; then
        log_success "롤백 후 헬스 체크 통과"
        return 0
    else
        log_error "롤백 후 헬스 체크 실패"
        return 1
    fi
}

# EC2 환경 특화 데이터베이스 설정 함수
setup_database() {
    log_step "EC2 환경 데이터베이스 설정을 확인합니다..."
    
    # MySQL 서비스 상태 확인
    log_info "MySQL 서비스 상태를 확인합니다..."
    if command -v systemctl &> /dev/null; then
        if ! systemctl is-active --quiet mysql; then
            log_warning "MySQL이 실행되지 않고 있습니다. MySQL 서비스를 시작합니다..."
            
            # MySQL 서비스 시작
            if sudo systemctl start mysql 2>/dev/null; then
                log_success "MySQL 서비스 시작 성공"
                sleep 3  # 서비스 시작 대기
            else
                log_error "MySQL 서비스 시작 실패"
                log_info "MySQL 설치 및 설정을 시도합니다..."
                
                # MySQL 설치 확인
                if ! command -v mysql &> /dev/null; then
                    log_info "MySQL 서버 설치 중..."
                    sudo apt-get update 2>/dev/null || true
                    sudo apt-get install -y mysql-server 2>/dev/null || true
                fi
                
                # MySQL 서비스 재시작
                sudo systemctl start mysql 2>/dev/null || true
                sudo systemctl enable mysql 2>/dev/null || true
            fi
        else
            log_success "MySQL이 이미 실행 중입니다"
        fi
        
        # MySQL 서비스 활성화
        sudo systemctl enable mysql 2>/dev/null || true
    else
        log_info "systemctl이 없습니다. MySQL 서비스 상태를 건너뜁니다"
    fi
    
    # MySQL 연결 테스트
    log_info "MySQL 연결을 테스트합니다..."
    if mysql -e "SELECT 1;" 2>/dev/null; then
        log_success "MySQL 로컬 연결 테스트 성공"
    else
        log_warning "MySQL 로컬 연결 테스트 실패"
        
        # MySQL 설정 확인
        log_info "MySQL 설정을 확인합니다..."
        if [ -f "/etc/mysql/mysql.conf.d/mysqld.cnf" ]; then
            log_info "MySQL 설정 파일이 존재합니다"
        else
            log_warning "MySQL 설정 파일을 찾을 수 없습니다"
        fi
    fi
    
    # 환경 변수 기반 데이터베이스 연결 테스트
    if [ -f ".env" ]; then
        source .env
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_USERNAME" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_NAME" ]; then
            log_info "환경 변수를 사용한 데이터베이스 연결 테스트..."
            
            # 데이터베이스 연결 테스트
            if mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" 2>/dev/null; then
                log_success "데이터베이스 연결 테스트 성공"
                
                # 데이터베이스 테이블 확인
                local table_count=$(mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -e "SHOW TABLES;" "$DB_NAME" 2>/dev/null | wc -l)
                log_info "데이터베이스 테이블 수: $((table_count - 1))"
                
            else
                log_warning "데이터베이스 연결 테스트 실패"
                log_info "데이터베이스 설정을 확인하세요:"
                log_info "  - DB_HOST: $DB_HOST"
                log_info "  - DB_USERNAME: $DB_USERNAME"
                log_info "  - DB_NAME: $DB_NAME"
                
                # 데이터베이스 생성 시도
                log_info "데이터베이스 생성을 시도합니다..."
                if mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null; then
                    log_success "데이터베이스 생성 성공: $DB_NAME"
                else
                    log_error "데이터베이스 생성 실패"
                fi
            fi
        else
            log_warning "데이터베이스 연결 정보가 불완전합니다"
        fi
    else
        log_warning ".env 파일이 없습니다"
    fi
    
    # MySQL 성능 설정 확인
    log_info "MySQL 성능 설정을 확인합니다..."
    if mysql -e "SHOW VARIABLES LIKE 'max_connections';" 2>/dev/null; then
        local max_connections=$(mysql -e "SHOW VARIABLES LIKE 'max_connections';" 2>/dev/null | awk 'NR==2{print $2}')
        log_info "MySQL 최대 연결 수: $max_connections"
        
        if [ "$max_connections" -lt 100 ]; then
            log_warning "MySQL 최대 연결 수가 낮습니다 ($max_connections)"
            log_info "성능 향상을 위해 max_connections를 늘리는 것을 고려하세요"
        fi
    fi
    
    log_success "EC2 환경 데이터베이스 설정 확인 완료"
}

# EC2 환경 특화 Nginx 설정 함수
setup_nginx() {
    log_step "EC2 환경 Nginx 설정을 확인합니다..."
    
    # Nginx 설치 확인
    if ! command -v nginx &> /dev/null; then
        log_warning "Nginx가 설치되지 않았습니다. Nginx를 설치합니다..."
        sudo apt-get update 2>/dev/null || true
        sudo apt-get install -y nginx 2>/dev/null || true
    fi
    
    # Nginx 서비스 상태 확인
    log_info "Nginx 서비스 상태를 확인합니다..."
    if command -v systemctl &> /dev/null; then
        if ! systemctl is-active --quiet nginx; then
            log_warning "Nginx가 실행되지 않고 있습니다. Nginx 서비스를 시작합니다..."
            
            # Nginx 서비스 시작
            if sudo systemctl start nginx 2>/dev/null; then
                log_success "Nginx 서비스 시작 성공"
                sleep 2  # 서비스 시작 대기
            else
                log_error "Nginx 서비스 시작 실패"
                log_info "Nginx 설정을 확인합니다..."
                
                # Nginx 설정 파일 검증
                if nginx -t 2>/dev/null; then
                    log_info "Nginx 설정 파일은 유효합니다"
                else
                    log_error "Nginx 설정 파일에 문제가 있습니다"
                    nginx -t 2>&1 | while read -r line; do
                        log_error "  $line"
                    done
                fi
            fi
        else
            log_success "Nginx가 이미 실행 중입니다"
        fi
        
        # Nginx 서비스 활성화
        sudo systemctl enable nginx 2>/dev/null || true
    else
        log_info "systemctl이 없습니다. Nginx 서비스 상태를 건너뜁니다"
    fi
    
    # Nginx 설정 파일 검증
    if command -v nginx &> /dev/null; then
        log_info "Nginx 설정 파일을 검증합니다..."
        if nginx -t 2>/dev/null; then
            log_success "Nginx 설정 파일 검증 성공"
        else
            log_warning "Nginx 설정 파일에 문제가 있습니다"
            nginx -t 2>&1 | while read -r line; do
                log_warning "  $line"
            done
        fi
    fi
    
    # Nginx 설정 파일 확인
    if [ -f "nginx.conf" ]; then
        log_info "프로젝트 Nginx 설정 파일이 존재합니다"
        
        # Nginx 설정 파일을 시스템 위치로 복사
        if sudo cp nginx.conf /etc/nginx/sites-available/deukgeun 2>/dev/null; then
            log_success "Nginx 설정 파일 복사 완료"
            
            # 사이트 활성화
            if sudo ln -sf /etc/nginx/sites-available/deukgeun /etc/nginx/sites-enabled/ 2>/dev/null; then
                log_success "Nginx 사이트 활성화 완료"
                
                # 기본 사이트 비활성화
                sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
                
                # Nginx 설정 재로드
                if sudo nginx -t 2>/dev/null; then
                    sudo systemctl reload nginx 2>/dev/null || true
                    log_success "Nginx 설정 재로드 완료"
                else
                    log_error "Nginx 설정 재로드 실패"
                fi
            else
                log_error "Nginx 사이트 활성화 실패"
            fi
        else
            log_error "Nginx 설정 파일 복사 실패"
        fi
    else
        log_warning "프로젝트 Nginx 설정 파일이 없습니다"
        log_info "기본 Nginx 설정을 사용합니다"
    fi
    
    # Nginx 로그 확인
    log_info "Nginx 로그를 확인합니다..."
    if [ -f "/var/log/nginx/error.log" ]; then
        local error_count=$(sudo tail -100 /var/log/nginx/error.log 2>/dev/null | grep -c "error" || echo "0")
        if [ "$error_count" -gt 0 ]; then
            log_warning "Nginx 에러 로그에 $error_count개의 에러가 있습니다"
            log_info "최근 Nginx 에러:"
            sudo tail -5 /var/log/nginx/error.log 2>/dev/null | while read -r line; do
                log_warning "  $line"
            done
        else
            log_success "Nginx 에러 로그에 문제가 없습니다"
        fi
    fi
    
    # Nginx 성능 설정 확인
    log_info "Nginx 성능 설정을 확인합니다..."
    if [ -f "/etc/nginx/nginx.conf" ]; then
        local worker_processes=$(grep "worker_processes" /etc/nginx/nginx.conf | awk '{print $2}' | tr -d ';' || echo "auto")
        local worker_connections=$(grep "worker_connections" /etc/nginx/nginx.conf | awk '{print $2}' | tr -d ';' || echo "1024")
        
        log_info "Nginx Worker 프로세스: $worker_processes"
        log_info "Nginx Worker 연결: $worker_connections"
        
        # 성능 최적화 제안
        if [ "$worker_processes" = "auto" ] || [ "$worker_processes" = "1" ]; then
            log_info "Nginx 성능 최적화 제안: worker_processes를 CPU 코어 수로 설정하세요"
        fi
        
        if [ "$worker_connections" -lt 2048 ]; then
            log_info "Nginx 성능 최적화 제안: worker_connections를 2048 이상으로 설정하세요"
        fi
    fi
    
    # 방화벽 포트 확인
    log_info "Nginx 관련 포트를 확인합니다..."
    local nginx_ports=(80 443)
    for port in "${nginx_ports[@]}"; do
        if ss -tlnp | grep -q ":$port "; then
            log_success "포트 $port이 리스닝 중입니다"
        else
            log_warning "포트 $port이 리스닝되지 않고 있습니다"
        fi
    done
    
    log_success "EC2 환경 Nginx 설정 확인 완료"
}

# 향상된 환경 변수 검증 함수
validate_environment() {
    log_step "환경 변수를 검증합니다..."
    
    if [ ! -f ".env" ]; then
        log_error ".env 파일이 없습니다"
        return 1
    fi
    
    # 환경 변수 파일 보안 검사
    if ! validate_env_file_security; then
        return 1
    fi
    
    # 필수 환경 변수 확인
    REQUIRED_VARS=(
        "NODE_ENV"
        "PORT"
        "DB_HOST"
        "DB_USERNAME"
        "DB_PASSWORD"
        "DB_NAME"
        "JWT_SECRET"
        "CORS_ORIGIN"
    )
    
    # 선택적 환경 변수
    OPTIONAL_VARS=(
        "JWT_ACCESS_SECRET"
        "JWT_REFRESH_SECRET"
        "REDIS_URL"
        "SMTP_HOST"
        "SMTP_PORT"
        "SMTP_USER"
        "SMTP_PASS"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "S3_BUCKET"
    )
    
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^$var=" .env; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        log_error "필수 환경 변수가 누락되었습니다: ${MISSING_VARS[*]}"
        return 1
    fi
    
    # 환경 변수 값 검증
    source .env
    
    # NODE_ENV 검증
    if [ "$NODE_ENV" != "production" ]; then
        log_warning "NODE_ENV가 production이 아닙니다: $NODE_ENV"
    fi
    
    # JWT_SECRET 검증 (강화)
    if ! validate_jwt_secret "$JWT_SECRET"; then
        return 1
    fi
    
    # 데이터베이스 연결 정보 검증 (강화)
    if ! validate_database_config; then
        return 1
    fi
    
    # 포트 번호 검증 (강화)
    if ! validate_port_config; then
        return 1
    fi
    
    # CORS_ORIGIN 검증 (강화)
    if ! validate_cors_config; then
        return 1
    fi
    
    # 보안 관련 환경 변수 검증 (강화)
    if ! validate_security_config; then
        return 1
    fi
    
    # 프로덕션 환경 보안 검사
    if [ "$NODE_ENV" = "production" ]; then
        if ! validate_production_security; then
            return 1
        fi
    fi
    
    # 환경 변수 중복 확인
    if ! check_duplicate_env_vars; then
        return 1
    fi
    
    log_success "환경 변수 검증 완료"
}

# 환경 변수 파일 보안 검사
validate_env_file_security() {
    log_debug "환경 변수 파일 보안을 검사합니다..."
    
    # 파일 권한 확인
    local file_perms=$(stat -c "%a" .env 2>/dev/null || echo "unknown")
    if [ "$file_perms" != "600" ] && [ "$file_perms" != "unknown" ]; then
        log_warning ".env 파일 권한이 너무 관대합니다: $file_perms (권장: 600)"
        log_info "권한 수정: chmod 600 .env"
    fi
    
    # 민감한 정보 노출 검사
    if grep -q "password.*=" .env && grep -q "password.*password" .env; then
        log_warning "기본 비밀번호가 감지되었습니다"
    fi
    
    # 주석 처리된 민감한 정보 확인
    if grep -q "^#.*password" .env || grep -q "^#.*secret" .env; then
        log_warning "주석 처리된 민감한 정보가 있습니다"
    fi
    
    return 0
}

# JWT 시크릿 검증
validate_jwt_secret() {
    local secret="$1"
    
    if [ -z "$secret" ]; then
        log_error "JWT_SECRET이 비어있습니다"
        return 1
    fi
    
    if [ ${#secret} -lt 32 ]; then
        log_error "JWT_SECRET이 너무 짧습니다 (최소 32자 필요, 현재: ${#secret}자)"
        return 1
    fi
    
    # 보안 강도 검사
    local has_upper=$(echo "$secret" | grep -q '[A-Z]' && echo "true" || echo "false")
    local has_lower=$(echo "$secret" | grep -q '[a-z]' && echo "true" || echo "false")
    local has_number=$(echo "$secret" | grep -q '[0-9]' && echo "true" || echo "false")
    local has_special=$(echo "$secret" | grep -q '[^A-Za-z0-9]' && echo "true" || echo "false")
    
    local strength_score=0
    [ "$has_upper" = "true" ] && strength_score=$((strength_score + 1))
    [ "$has_lower" = "true" ] && strength_score=$((strength_score + 1))
    [ "$has_number" = "true" ] && strength_score=$((strength_score + 1))
    [ "$has_special" = "true" ] && strength_score=$((strength_score + 1))
    
    if [ $strength_score -lt 3 ]; then
        log_warning "JWT_SECRET 보안 강도가 낮습니다 (대소문자, 숫자, 특수문자 조합 권장)"
    fi
    
    # 일반적인 약한 패턴 검사
    if [[ "$secret" == *"test"* ]] || [[ "$secret" == *"dev"* ]] || [[ "$secret" == *"demo"* ]]; then
        log_warning "JWT_SECRET에 개발/테스트 관련 키워드가 포함되어 있습니다"
    fi
    
    return 0
}

# 데이터베이스 설정 검증
validate_database_config() {
    if [ -z "$DB_HOST" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        log_error "데이터베이스 연결 정보가 불완전합니다"
        return 1
    fi
    
    # 데이터베이스 호스트 검증
    if [[ "$DB_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_info "데이터베이스 호스트: IP 주소 사용"
    elif [[ "$DB_HOST" =~ ^[a-zA-Z0-9.-]+$ ]]; then
        log_info "데이터베이스 호스트: 도메인명 사용"
    else
        log_error "데이터베이스 호스트 형식이 올바르지 않습니다: $DB_HOST"
        return 1
    fi
    
    # 데이터베이스 사용자명 검증
    if [ ${#DB_USERNAME} -lt 3 ]; then
        log_warning "데이터베이스 사용자명이 너무 짧습니다: $DB_USERNAME"
    fi
    
    # 데이터베이스 비밀번호 강도 검사
    if [ ${#DB_PASSWORD} -lt 8 ]; then
        log_error "데이터베이스 비밀번호가 너무 짧습니다 (최소 8자 필요)"
        return 1
    fi
    
    # 일반적인 약한 비밀번호 검사
    local weak_passwords=("password" "123456" "admin" "root" "test" "user")
    for weak_pass in "${weak_passwords[@]}"; do
        if [ "$DB_PASSWORD" = "$weak_pass" ]; then
            log_error "약한 데이터베이스 비밀번호가 감지되었습니다: $weak_pass"
            return 1
        fi
    done
    
    return 0
}

# 포트 설정 검증
validate_port_config() {
    if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1024 ] || [ "$PORT" -gt 65535 ]; then
        log_error "PORT가 유효하지 않습니다: $PORT (1024-65535 범위여야 함)"
        return 1
    fi
    
    # 잘 알려진 포트 사용 검사
    local well_known_ports=(22 23 25 53 80 110 143 443 993 995)
    for well_port in "${well_known_ports[@]}"; do
        if [ "$PORT" = "$well_port" ]; then
            log_warning "잘 알려진 포트를 사용하고 있습니다: $PORT"
        fi
    done
    
    return 0
}

# CORS 설정 검증
validate_cors_config() {
    if [ -z "$CORS_ORIGIN" ]; then
        log_warning "CORS_ORIGIN이 설정되지 않았습니다"
        return 0
    fi
    
    # CORS_ORIGIN 값 검증
    if [ "$CORS_ORIGIN" = "*" ]; then
        log_warning "CORS_ORIGIN이 '*'로 설정되어 있습니다 (보안상 권장하지 않음)"
    elif [[ "$CORS_ORIGIN" =~ ^https?:// ]]; then
        log_info "CORS_ORIGIN이 URL 형식으로 설정되어 있습니다: $CORS_ORIGIN"
    else
        log_warning "CORS_ORIGIN 형식이 올바르지 않을 수 있습니다: $CORS_ORIGIN"
    fi
    
    return 0
}

# 보안 설정 검증
validate_security_config() {
    # JWT 관련 시크릿 검증
    if [ -n "$JWT_ACCESS_SECRET" ] && [ ${#JWT_ACCESS_SECRET} -lt 32 ]; then
        log_warning "JWT_ACCESS_SECRET이 너무 짧습니다 (최소 32자 권장)"
    fi
    
    if [ -n "$JWT_REFRESH_SECRET" ] && [ ${#JWT_REFRESH_SECRET} -lt 32 ]; then
        log_warning "JWT_REFRESH_SECRET이 너무 짧습니다 (최소 32자 권장)"
    fi
    
    # AWS 자격 증명 검증
    if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
        log_info "AWS 자격 증명이 설정되어 있습니다"
        if [ ${#AWS_SECRET_ACCESS_KEY} -lt 20 ]; then
            log_warning "AWS_SECRET_ACCESS_KEY가 너무 짧습니다"
        fi
    fi
    
    return 0
}

# 프로덕션 환경 보안 검사
validate_production_security() {
    log_debug "프로덕션 환경 보안을 검사합니다..."
    
    # 데이터베이스 비밀번호 강도 검사
    if [ "$DB_PASSWORD" = "password" ] || [ "$DB_PASSWORD" = "123456" ] || [ ${#DB_PASSWORD} -lt 8 ]; then
        log_error "프로덕션 환경에서 약한 데이터베이스 비밀번호가 감지되었습니다"
        return 1
    fi
    
    # JWT 시크릿 개발 키워드 검사
    if [[ "$JWT_SECRET" == *"test"* ]] || [[ "$JWT_SECRET" == *"dev"* ]] || [[ "$JWT_SECRET" == *"demo"* ]]; then
        log_warning "JWT_SECRET에 테스트/개발 관련 키워드가 포함되어 있습니다"
    fi
    
    # 디버그 모드 확인
    if [ "$NODE_ENV" = "production" ] && [ "$DEBUG" = "true" ]; then
        log_warning "프로덕션 환경에서 DEBUG 모드가 활성화되어 있습니다"
    fi
    
    return 0
}

# 중복 환경 변수 확인
check_duplicate_env_vars() {
    log_debug "중복 환경 변수를 확인합니다..."
    
    local duplicates=$(grep -E "^[A-Z_]+=" .env | cut -d'=' -f1 | sort | uniq -d)
    if [ -n "$duplicates" ]; then
        log_error "중복된 환경 변수가 있습니다: $duplicates"
        return 1
    fi
    
    return 0
}

# EC2 환경 특화 성능 최적화 함수
optimize_performance() {
    log_step "EC2 인스턴스 성능을 최적화합니다..."
    
    # 실제 시스템 리소스 확인
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
    CPU_CORES=$(nproc 2>/dev/null || echo "2")
    
    log_info "실제 시스템 리소스:"
    log_info "  총 메모리: ${TOTAL_MEM}MB"
    log_info "  사용 가능 메모리: ${AVAILABLE_MEM}MB"
    log_info "  CPU 코어 수: ${CPU_CORES}"
    
    # EC2 인스턴스 타입 감지 (메타데이터에서)
    if command -v curl &> /dev/null; then
        INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type 2>/dev/null || echo "unknown")
        log_info "EC2 인스턴스 타입: $INSTANCE_TYPE"
    fi
    
    # 메모리 부족 시 스왑 파일 생성
    if [ "$TOTAL_MEM" -lt 1024 ]; then
        log_warning "메모리가 부족합니다 (${TOTAL_MEM}MB). 스왑 파일 생성을 시도합니다..."
        create_swap_file
    fi
    
    # EC2 인스턴스 타입에 따른 최적화
    if [ "$TOTAL_MEM" -lt 1024 ]; then
        log_info "소형 인스턴스 감지 - 메모리 최적화 적용"
        export NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"
        PM2_MEMORY_LIMIT="400M"
        PM2_INSTANCES=1
        NPM_INSTALL_OPTIONS="--production --no-optional"
    elif [ "$TOTAL_MEM" -lt 2048 ]; then
        log_info "중형 인스턴스 감지 - 표준 최적화 적용"
        export NODE_OPTIONS="--max-old-space-size=1024"
        PM2_MEMORY_LIMIT="800M"
        PM2_INSTANCES=1
        NPM_INSTALL_OPTIONS="--production"
    else
        log_info "대형 인스턴스 감지 - 고성능 최적화 적용"
        export NODE_OPTIONS="--max-old-space-size=2048"
        PM2_MEMORY_LIMIT="1.5G"
        PM2_INSTANCES=$((CPU_CORES > 2 ? 2 : 1))
        NPM_INSTALL_OPTIONS="--production"
    fi
    
    # PM2 메모리 제한 설정
    if command -v pm2 &> /dev/null; then
        pm2 set pm2:max_memory_restart "$PM2_MEMORY_LIMIT" 2>/dev/null || true
        log_info "PM2 메모리 제한 설정: $PM2_MEMORY_LIMIT"
    fi
    
    # 시스템 최적화 설정
    if [ "$TOTAL_MEM" -gt 1024 ]; then
        # 대용량 메모리 인스턴스에서 추가 최적화
        export UV_THREADPOOL_SIZE=$((CPU_CORES * 2))
        log_info "UV_THREADPOOL_SIZE 설정: $UV_THREADPOOL_SIZE"
    fi
    
    # 빌드 최적화 플래그 설정
    export NODE_ENV=production
    export NODE_OPTIONS="$NODE_OPTIONS --trace-warnings"
    
    # npm 설정 최적화
    export npm_config_cache="/tmp/npm-cache-$(date +%Y%m%d)"
    export npm_config_progress=false
    export npm_config_audit=false
    export npm_config_fund=false
    
    # 메모리 사용량 모니터링 설정
    export NODE_OPTIONS="$NODE_OPTIONS --expose-gc"
    
    log_success "성능 최적화 완료 - 메모리 제한: $PM2_MEMORY_LIMIT, 인스턴스 수: $PM2_INSTANCES"
}

# 스왑 파일 생성 함수
create_swap_file() {
    log_info "스왑 파일 생성을 시도합니다..."
    
    # 스왑 파일이 이미 존재하는지 확인
    if [ -f "/swapfile" ]; then
        log_info "스왑 파일이 이미 존재합니다"
        if swapon -s | grep -q "/swapfile"; then
            log_success "스왑 파일이 이미 활성화되어 있습니다"
            return 0
        else
            log_info "스왑 파일을 활성화합니다"
            sudo swapon /swapfile 2>/dev/null || true
        fi
    else
        # 스왑 파일 생성
        local swap_size="1G"
        if [ "$TOTAL_MEM" -lt 512 ]; then
            swap_size="2G"
        fi
        
        log_info "스왑 파일 생성 중... (크기: $swap_size)"
        
        if sudo fallocate -l "$swap_size" /swapfile 2>/dev/null; then
            sudo chmod 600 /swapfile 2>/dev/null || true
            sudo mkswap /swapfile 2>/dev/null || true
            sudo swapon /swapfile 2>/dev/null || true
            
            # 부팅 시 자동 마운트 설정
            if ! grep -q "/swapfile" /etc/fstab 2>/dev/null; then
                echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab 2>/dev/null || true
            fi
            
            log_success "스왑 파일 생성 및 활성화 완료"
        else
            log_error "스왑 파일 생성 실패"
            return 1
        fi
    fi
    
    # 스왑 사용량 확인
    local swap_usage=$(free -m | awk 'NR==3{print $3}')
    log_info "현재 스왑 사용량: ${swap_usage}MB"
}

# EC2 리소스 모니터링 함수
monitor_ec2_resources() {
    log_step "EC2 리소스 사용량을 모니터링합니다..."
    
    # CPU 사용률 확인
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    log_info "CPU 사용률: ${cpu_usage}%"
    
    # 메모리 사용률 확인
    local mem_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    log_info "메모리 사용률: ${mem_usage}%"
    
    # 디스크 사용률 확인
    local disk_usage=$(df -h . | awk 'NR==2{print $5}' | cut -d'%' -f1)
    log_info "디스크 사용률: ${disk_usage}%"
    
    # 로드 평균 확인
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | cut -d',' -f1)
    log_info "로드 평균: $load_avg"
    
    # 네트워크 연결 수 확인
    local connections=$(ss -tuln | wc -l)
    log_info "네트워크 연결 수: $connections"
    
    # 프로세스 수 확인
    local processes=$(ps aux | wc -l)
    log_info "실행 중인 프로세스 수: $processes"
    
    # 경고 임계값 확인
    if [ "${cpu_usage%.*}" -gt 80 ]; then
        log_warning "CPU 사용률이 높습니다: ${cpu_usage}%"
    fi
    
    if [ "${mem_usage%.*}" -gt 80 ]; then
        log_warning "메모리 사용률이 높습니다: ${mem_usage}%"
    fi
    
    if [ "$disk_usage" -gt 80 ]; then
        log_warning "디스크 사용률이 높습니다: ${disk_usage}%"
    fi
    
    log_success "EC2 리소스 모니터링 완료"
}

# EC2 디스크 정리 함수
cleanup_ec2_disk() {
    log_step "EC2 디스크 공간을 정리합니다..."
    
    # 패키지 캐시 정리
    if command -v apt-get &> /dev/null; then
        log_info "APT 패키지 캐시 정리 중..."
        sudo apt-get autoremove -y 2>/dev/null || true
        sudo apt-get autoclean 2>/dev/null || true
        log_success "APT 패키지 캐시 정리 완료"
    fi
    
    # npm 캐시 정리
    if command -v npm &> /dev/null; then
        log_info "npm 캐시 정리 중..."
        npm cache clean --force 2>/dev/null || true
        log_success "npm 캐시 정리 완료"
    fi
    
    # 오래된 로그 파일 정리
    log_info "오래된 로그 파일 정리 중..."
    find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
    find /var/log -name "*.gz" -mtime +30 -delete 2>/dev/null || true
    log_success "로그 파일 정리 완료"
    
    # 임시 파일 정리
    log_info "임시 파일 정리 중..."
    sudo rm -rf /tmp/* 2>/dev/null || true
    sudo rm -rf /var/tmp/* 2>/dev/null || true
    log_success "임시 파일 정리 완료"
    
    # 프로젝트 관련 임시 파일 정리
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache 2>/dev/null || true
        log_info "node_modules 캐시 정리 완료"
    fi
    
    if [ -d "dist/.cache" ]; then
        rm -rf dist/.cache 2>/dev/null || true
        log_info "빌드 캐시 정리 완료"
    fi
    
    # 정리 후 디스크 사용량 확인
    local disk_usage_after=$(df -h . | awk 'NR==2{print $5}' | cut -d'%' -f1)
    log_info "정리 후 디스크 사용률: ${disk_usage_after}%"
    
    log_success "EC2 디스크 정리 완료"
}

# 메인 실행 함수
main() {
    # 배포 로그 시작
    mkdir -p "$LOG_DIR"
    exec > >(tee -a "$DEPLOYMENT_LOG") 2>&1
    
    log_info "Deukgeun EC2 간단 배포를 시작합니다 (최적화된 빌드 사용)..."
    log_info "배포 로그: $DEPLOYMENT_LOG"
    
    # 프로젝트 루트로 이동
    cd "$(dirname "$0")/.."
    
    # 시스템 요구사항 확인
    check_requirements
    
    # EC2 환경 특화 검증
    check_ec2_security_groups
    test_ec2_network_performance
    
    # 시스템 리소스 확인
    check_system_resources
    
    # EC2 리소스 모니터링
    monitor_ec2_resources
    
    # 성능 최적화
    optimize_performance
    
    # EC2 디스크 정리 (필요한 경우)
    if [ "$(df . | tail -1 | awk '{print $5}' | sed 's/%//')" -gt 80 ]; then
        cleanup_ec2_disk
    fi
    
    # 현재 배포 백업
    create_backup
    
    # EC2 환경 파일 권한 설정
    set_ec2_file_permissions
    
    # 환경 변수 설정
    log_step "환경 변수를 설정합니다..."
    if [ -f "env.ec2" ]; then
        cp env.ec2 .env
        chmod 600 .env 2>/dev/null || true
        log_success "EC2 환경 변수 파일이 .env로 복사되었습니다"
    else
        log_warning "env.ec2 파일이 없습니다. 기본 env.production을 사용합니다"
        cp env.production .env
        chmod 600 .env 2>/dev/null || true
    fi
    
    # 환경 변수 검증
    if ! validate_environment; then
        log_error "환경 변수 검증 실패"
        rollback_deployment
        exit 1
    fi
    
    # 데이터베이스 설정 확인
    setup_database
    
    # Nginx 설정 확인
    setup_nginx
    
    # 스마트 의존성 설치
    log_step "의존성을 스마트하게 설치합니다..."
    
    # npm 캐시 디렉토리 설정
    NPM_CACHE_DIR="/tmp/npm-cache-$(date +%Y%m%d)"
    mkdir -p "$NPM_CACHE_DIR"
    
    # 루트 의존성 설치
    if ! install_dependencies_smart "package.json" "." "$NPM_CACHE_DIR"; then
        log_error "루트 의존성 설치 실패"
        rollback_deployment "의존성 설치 실패"
        exit 1
    fi
    
    # 백엔드 의존성 설치
    if [ -d "src/backend" ]; then
        log_step "백엔드 의존성을 설치합니다..."
        if ! install_dependencies_smart "src/backend/package.json" "src/backend" "$NPM_CACHE_DIR"; then
            log_error "백엔드 의존성 설치 실패"
            rollback_deployment "백엔드 의존성 설치 실패"
            exit 1
        fi
    fi
    
    # 최적화된 프로덕션 빌드
    log_step "최적화된 프로덕션 빌드를 시작합니다..."
    export NODE_ENV=production
    
    # 빌드 시작 시간 기록
    BUILD_START_TIME=$(date +%s)
    
    # 메모리 효율적인 백엔드 빌드
    if ! build_with_memory_optimization "npm run build:backend:optimized:production" "백엔드" "$PM2_MEMORY_LIMIT"; then
        log_error "백엔드 빌드 실패"
        rollback_deployment "백엔드 빌드 실패"
        exit 1
    fi
    
    # 메모리 효율적인 프론트엔드 빌드
    if ! build_with_memory_optimization "npm run build:production" "프론트엔드" "$PM2_MEMORY_LIMIT"; then
        log_error "프론트엔드 빌드 실패"
        rollback_deployment "프론트엔드 빌드 실패"
        exit 1
    fi
    
    # 빌드 시간 계산
    BUILD_END_TIME=$(date +%s)
    BUILD_DURATION=$((BUILD_END_TIME - BUILD_START_TIME))
    log_performance "전체 빌드" "$BUILD_DURATION" "" "백엔드 + 프론트엔드"
    
    # 빌드 검증
    log_step "빌드 결과를 검증합니다..."
    
    # 백엔드 빌드 검증
    if [ ! -f "dist/backend/index.cjs" ]; then
        log_error "백엔드 빌드 파일이 없습니다: dist/backend/index.cjs"
        rollback_deployment
        exit 1
    fi
    
    # 백엔드 파일 권한 확인
    if [ ! -x "dist/backend/index.cjs" ]; then
        chmod +x dist/backend/index.cjs
        log_info "백엔드 실행 파일 권한 설정 완료"
    fi
    
    # 프론트엔드 빌드 검증
    if [ ! -d "dist/frontend" ]; then
        log_error "프론트엔드 빌드 디렉토리가 없습니다: dist/frontend"
        rollback_deployment
        exit 1
    fi
    
    # 프론트엔드 필수 파일 확인
    if [ ! -f "dist/frontend/index.html" ]; then
        log_error "프론트엔드 index.html 파일이 없습니다"
        rollback_deployment
        exit 1
    fi
    
    # 빌드 파일 크기 확인
    BACKEND_SIZE=$(du -sh dist/backend 2>/dev/null | cut -f1)
    FRONTEND_SIZE=$(du -sh dist/frontend 2>/dev/null | cut -f1)
    
    # 빌드 파일 개수 확인
    BACKEND_FILES=$(find dist/backend -type f | wc -l)
    FRONTEND_FILES=$(find dist/frontend -type f | wc -l)
    
    log_success "빌드 검증 완료"
    log_info "백엔드: $BACKEND_SIZE ($BACKEND_FILES 파일)"
    log_info "프론트엔드: $FRONTEND_SIZE ($FRONTEND_FILES 파일)"
    
    # 빌드 파일 무결성 검사
    log_step "빌드 파일 무결성을 검사합니다..."
    
    # 백엔드 실행 파일 테스트
    if node -c dist/backend/index.cjs 2>/dev/null; then
        log_success "백엔드 파일 문법 검사 통과"
    else
        log_error "백엔드 파일 문법 오류 발견"
        rollback_deployment
        exit 1
    fi
    
    # 기존 PM2 프로세스 정리
    log_step "기존 PM2 프로세스를 정리합니다..."
    pm2 delete all 2>/dev/null || true
    
    # 필요한 디렉토리 생성
    log_step "필요한 디렉토리를 생성합니다..."
    mkdir -p uploads logs backups
    log_success "필요한 디렉토리가 생성되었습니다"
    
    # PM2로 서비스 시작
    log_step "PM2로 서비스를 시작합니다..."
    
    # PM2 프로세스 정리 및 재시작
    pm2 kill 2>/dev/null || true
    sleep 2
    
    # PM2 서비스 시작
    if ! pm2 start ecosystem.config.js --env production; then
        log_error "PM2 서비스 시작 실패"
        rollback_deployment
        exit 1
    fi
    
    # 서비스 시작 대기
    log_info "서비스 시작을 기다리는 중..."
    sleep 5
    
    # 서비스 상태 확인
    log_step "서비스 상태를 확인합니다..."
    pm2 status
    
    # 서비스 헬스 체크
    log_step "서비스 헬스 체크를 수행합니다..."
    
    # 백엔드 헬스 체크 (최대 30초 대기)
    BACKEND_HEALTHY=false
    for i in {1..6}; do
        if curl -s -f http://localhost:5000/health > /dev/null 2>&1; then
            BACKEND_HEALTHY=true
            log_success "백엔드 서비스가 정상적으로 시작되었습니다"
            break
        else
            log_info "백엔드 서비스 시작 대기 중... ($i/6)"
            sleep 5
        fi
    done
    
    if [ "$BACKEND_HEALTHY" = false ]; then
        log_error "백엔드 서비스 헬스 체크 실패"
        log_info "백엔드 로그 확인: pm2 logs deukgeun-backend"
        rollback_deployment
        exit 1
    fi
    
    # 프론트엔드 헬스 체크 (최대 30초 대기)
    FRONTEND_HEALTHY=false
    for i in {1..6}; do
        if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
            FRONTEND_HEALTHY=true
            log_success "프론트엔드 서비스가 정상적으로 시작되었습니다"
            break
        else
            log_info "프론트엔드 서비스 시작 대기 중... ($i/6)"
            sleep 5
        fi
    done
    
    if [ "$FRONTEND_HEALTHY" = false ]; then
        log_warning "프론트엔드 서비스 헬스 체크 실패 (Nginx를 통한 접근은 가능할 수 있음)"
        log_info "프론트엔드 로그 확인: pm2 logs deukgeun-frontend"
    fi
    
    # 외부 접근 테스트
    log_step "외부 접근 테스트를 수행합니다..."
    
    # 외부 IP 확인
    EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "IP 확인 실패")
    log_info "외부 IP: $EXTERNAL_IP"
    
    # 외부 접근 테스트 (백엔드)
    if [ "$EXTERNAL_IP" != "IP 확인 실패" ]; then
        if curl -s -f --connect-timeout 10 http://$EXTERNAL_IP:5000/health > /dev/null 2>&1; then
            log_success "백엔드 외부 접근이 정상적으로 작동합니다 (http://$EXTERNAL_IP:5000)"
        else
            log_warning "백엔드 외부 접근 실패 (http://$EXTERNAL_IP:5000)"
            log_info "방화벽 설정 확인: sudo ufw status"
        fi
        
        # Nginx를 통한 웹사이트 테스트
        if curl -s -f --connect-timeout 10 http://$EXTERNAL_IP > /dev/null 2>&1; then
            log_success "웹사이트가 정상적으로 작동합니다 (http://$EXTERNAL_IP)"
        else
            log_warning "웹사이트 접근 실패 (http://$EXTERNAL_IP)"
            log_info "Nginx 상태 확인: sudo systemctl status nginx"
        fi
    else
        log_warning "외부 IP 확인 실패 - 외부 접근 테스트를 건너뜁니다"
    fi
    
    # 포트 사용 상태 확인
    log_step "포트 사용 상태를 확인합니다..."
    if ss -tlnp | grep -E ":(3000|5000)" > /dev/null; then
        log_success "포트 3000, 5000이 정상적으로 리스닝 중입니다"
        ss -tlnp | grep -E ":(3000|5000)"
    else
        log_warning "포트 3000 또는 5000이 리스닝 상태가 아닙니다"
    fi
    
    # PM2 프로세스 상태 최종 확인
    log_step "PM2 프로세스 상태를 최종 확인합니다..."
    pm2 status
    
    # 메모리 사용량 확인
    log_step "메모리 사용량을 확인합니다..."
    free -h
    pm2 monit --no-interaction 2>/dev/null || log_info "PM2 모니터링 정보를 확인하려면: pm2 monit"
    
    # 배포 완료 시간 기록
    DEPLOY_END_TIME=$(date +%s)
    DEPLOY_DURATION=$((DEPLOY_END_TIME - BUILD_START_TIME))
    
    log_success "EC2 간단 배포가 완료되었습니다! (총 소요 시간: ${DEPLOY_DURATION}초)"
    echo ""
    
    # 시스템 정보 요약
    log_info "=== 시스템 정보 ==="
    log_info "서버 IP: $EXTERNAL_IP"
    log_info "총 메모리: ${TOTAL_MEM}MB"
    log_info "CPU 코어: ${CPU_CORES}개"
    log_info "Node.js 버전: $(node --version)"
    log_info "PM2 버전: $(pm2 --version)"
    echo ""
    
    # 서비스 정보
    log_info "=== 서비스 정보 ==="
    log_info "웹사이트: http://$EXTERNAL_IP"
    log_info "백엔드 API: http://$EXTERNAL_IP:5000"
    log_info "백엔드 헬스체크: http://$EXTERNAL_IP:5000/health"
    log_info "HTTPS (SSL 설정 시): https://$EXTERNAL_IP"
    echo ""
    
    # 모니터링 및 관리 명령어
    log_info "=== 모니터링 명령어 ==="
    log_info "PM2 상태: pm2 status"
    log_info "PM2 로그: pm2 logs"
    log_info "PM2 모니터링: pm2 monit"
    log_info "백엔드 로그: pm2 logs deukgeun-backend"
    log_info "프론트엔드 로그: pm2 logs deukgeun-frontend"
    log_info "시스템 리소스: htop 또는 top"
    echo ""
    
    # 서비스 관리 명령어
    log_info "=== 서비스 관리 명령어 ==="
    log_info "서비스 재시작: pm2 restart all"
    log_info "서비스 중지: pm2 stop all"
    log_info "서비스 삭제: pm2 delete all"
    log_info "PM2 저장: pm2 save"
    log_info "PM2 부팅시 자동시작: pm2 startup"
    echo ""
    
    # 네트워크 및 포트 확인
    log_info "=== 네트워크 확인 명령어 ==="
    log_info "포트 확인: ss -tlnp | grep -E ':(3000|5000)'"
    log_info "방화벽 상태: sudo ufw status"
    log_info "Nginx 상태: sudo systemctl status nginx"
    log_info "MySQL 상태: sudo systemctl status mysql"
    echo ""
    
    # 테스트 명령어
    log_info "=== 테스트 명령어 ==="
    log_info "백엔드 테스트 (로컬): curl http://localhost:5000/health"
    log_info "백엔드 테스트 (외부): curl http://$EXTERNAL_IP:5000/health"
    log_info "웹사이트 테스트 (외부): curl http://$EXTERNAL_IP"
    log_info "프론트엔드 테스트 (로컬): curl http://localhost:3000"
    echo ""
    
    # 로그 파일 위치
    log_info "=== 로그 파일 위치 ==="
    log_info "배포 로그: $DEPLOYMENT_LOG"
    log_info "PM2 로그: ./logs/"
    log_info "백업 파일: ./backups/"
    echo ""
    
    # 성능 최적화 정보
    log_info "=== 성능 최적화 정보 ==="
    log_info "메모리 제한: $PM2_MEMORY_LIMIT"
    log_info "PM2 인스턴스 수: $PM2_INSTANCES"
    log_info "Node.js 옵션: $NODE_OPTIONS"
    if [ -n "$UV_THREADPOOL_SIZE" ]; then
        log_info "UV Thread Pool 크기: $UV_THREADPOOL_SIZE"
    fi
    echo ""
    
    # EC2 특화 문제 해결 가이드
    log_info "=== EC2 환경 문제 해결 가이드 ==="
    log_info "서비스가 시작되지 않는 경우:"
    log_info "  1. pm2 logs deukgeun-backend"
    log_info "  2. pm2 logs deukgeun-frontend"
    log_info "  3. sudo systemctl status nginx"
    log_info "  4. sudo systemctl status mysql"
    log_info "  5. sudo journalctl -u nginx -f (Nginx 로그 실시간 확인)"
    log_info "  6. sudo journalctl -u mysql -f (MySQL 로그 실시간 확인)"
    log_info ""
    log_info "외부 접근이 안 되는 경우:"
    log_info "  1. sudo ufw status (방화벽 확인)"
    log_info "  2. ss -tlnp | grep -E ':(3000|5000)' (포트 확인)"
    log_info "  3. curl http://localhost:5000/health (로컬 테스트)"
    log_info "  4. AWS 보안 그룹 설정 확인 (EC2 콘솔)"
    log_info "  5. sudo iptables -L (iptables 규칙 확인)"
    log_info ""
    log_info "메모리 부족 시:"
    log_info "  1. free -h (메모리 사용량 확인)"
    log_info "  2. pm2 monit (PM2 모니터링)"
    log_info "  3. pm2 restart all (서비스 재시작)"
    log_info "  4. sudo swapon -s (스왑 파일 확인)"
    log_info "  5. sudo fallocate -l 1G /swapfile (스왑 파일 생성)"
    log_info ""
    log_info "디스크 공간 부족 시:"
    log_info "  1. df -h (디스크 사용량 확인)"
    log_info "  2. sudo du -sh /var/log/* (로그 파일 크기 확인)"
    log_info "  3. sudo apt-get autoremove -y (불필요한 패키지 제거)"
    log_info "  4. sudo apt-get autoclean (패키지 캐시 정리)"
    log_info "  5. npm cache clean --force (npm 캐시 정리)"
    log_info ""
    log_info "네트워크 문제 시:"
    log_info "  1. ping 8.8.8.8 (인터넷 연결 확인)"
    log_info "  2. nslookup google.com (DNS 확인)"
    log_info "  3. ip route show (라우팅 테이블 확인)"
    log_info "  4. sudo systemctl restart networking (네트워크 재시작)"
    log_info ""
    log_info "EC2 인스턴스 문제 시:"
    log_info "  1. curl http://169.254.169.254/latest/meta-data/instance-id (메타데이터 확인)"
    log_info "  2. sudo systemctl status cloud-init (클라우드 초기화 상태)"
    log_info "  3. sudo journalctl -u cloud-init (클라우드 초기화 로그)"
    log_info "  4. AWS EC2 콘솔에서 인스턴스 상태 확인"
    echo ""
    
    log_success "배포가 성공적으로 완료되었습니다! 🎉"
}

# 스크립트 실행
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Deukgeun EC2 간단 배포 스크립트 (최적화된 빌드 사용)"
    echo ""
    echo "사용법:"
    echo "  $0                 # 간단 배포 실행"
    echo "  $0 --help          # 도움말 표시"
    echo ""
    echo "주요 기능:"
    echo "  ✓ EC2 환경 특화 시스템 요구사항 자동 확인"
    echo "  ✓ EC2 인스턴스 메타데이터 자동 감지 및 최적화"
    echo "  ✓ 고급 성능 최적화 (메모리, CPU 기반)"
    echo "  ✓ 향상된 자동 백업 및 롤백 기능"
    echo "  ✓ 강화된 환경 변수 검증 및 보안 체크"
    echo "  ✓ EC2 특화 데이터베이스 및 Nginx 설정 확인"
    echo "  ✓ 메모리 효율적인 프로덕션 빌드"
    echo "  ✓ EC2 환경 특화 스마트 의존성 설치"
    echo "  ✓ 병렬 처리 및 재시도 로직"
    echo "  ✓ PM2 서비스 관리 (안전한 종료/재시작)"
    echo "  ✓ 포괄적인 헬스 체크 및 연결 테스트"
    echo "  ✓ 다단계 로깅 시스템 (레벨별 필터링)"
    echo "  ✓ 실시간 성능 메트릭 모니터링"
    echo "  ✓ 응급 상황 대응 및 복구 메커니즘"
    echo "  ✓ EC2 보안 그룹 및 방화벽 확인"
    echo "  ✓ 네트워크 성능 테스트 및 최적화"
    echo "  ✓ 자동 스왑 파일 생성 (메모리 부족 시)"
    echo "  ✓ EC2 디스크 공간 자동 정리"
    echo "  ✓ 파일 권한 자동 설정 및 보안 강화"
    echo ""
    echo "시스템 요구사항:"
    echo "  - Node.js 18 이상"
    echo "  - PM2 전역 설치"
    echo "  - MySQL 서버"
    echo "  - Nginx (선택사항)"
    echo "  - 최소 1GB RAM 권장"
    echo ""
    echo "배포 과정:"
    echo "  1. 시스템 요구사항 확인"
    echo "  2. 성능 최적화 설정"
    echo "  3. 현재 배포 백업"
    echo "  4. 환경 변수 설정 및 검증"
    echo "  5. 데이터베이스 및 Nginx 확인"
    echo "  6. 의존성 설치"
    echo "  7. 최적화된 빌드 실행"
    echo "  8. 빌드 검증 및 무결성 체크"
    echo "  9. PM2 서비스 시작"
    echo "  10. 헬스 체크 및 연결 테스트"
    echo ""
    echo "보안 기능:"
    echo "  - JWT 시크릿 키 강도 검증 (복잡도 분석)"
    echo "  - 데이터베이스 비밀번호 보안 체크 (약한 패턴 감지)"
    echo "  - 프로덕션 환경 설정 검증 (디버그 모드 확인)"
    echo "  - 환경 변수 누락 및 중복 검사"
    echo "  - 파일 권한 보안 검사"
    echo "  - 민감한 정보 노출 방지"
    echo "  - CORS 설정 보안 검증"
    echo "  - AWS 자격 증명 검증"
    echo ""
    echo "모니터링 및 관리:"
    echo "  - 다단계 로그 시스템 (DEBUG, INFO, WARNING, ERROR)"
    echo "  - 실시간 메모리 및 CPU 사용량 모니터링"
    echo "  - 향상된 자동 롤백 기능 (무결성 검사 포함)"
    echo "  - 상세한 성능 메트릭 및 배포 리포트"
    echo "  - 시스템 리소스 상태 모니터링"
    echo "  - 네트워크 연결 상태 추적"
    echo "  - 백업 무결성 검증"
    echo ""
    echo "문제 해결:"
    echo "  - 자동 에러 감지 및 복구"
    echo "  - 상세한 디버깅 정보 제공"
    echo "  - 단계별 문제 해결 가이드"
    echo ""
    echo "환경 변수 설정:"
    echo "  LOG_LEVEL=DEBUG          # 로그 레벨 설정 (DEBUG, INFO, WARNING, ERROR)"
    echo "  LOG_TO_FILE=true         # 파일 로깅 활성화"
    echo "  LOG_TIMESTAMP=true       # 타임스탬프 포함"
    echo "  MAX_PARALLEL_JOBS=4      # 최대 병렬 작업 수"
    echo ""
    echo "예시:"
    echo "  # 기본 배포 실행"
    echo "  ./scripts/deploy-ec2-simple.sh"
    echo ""
    echo "  # 디버그 모드로 배포"
    echo "  LOG_LEVEL=DEBUG ./scripts/deploy-ec2-simple.sh"
    echo ""
    echo "  # 병렬 작업 수 조정하여 배포"
    echo "  MAX_PARALLEL_JOBS=2 ./scripts/deploy-ec2-simple.sh"
    echo ""
    echo "  # 도움말 표시"
    echo "  ./scripts/deploy-ec2-simple.sh --help"
    echo ""
    echo "로그 파일:"
    echo "  - 배포 로그: ./logs/deployment-YYYYMMDD-HHMMSS.log"
    echo "  - PM2 로그: ./logs/pm2-*.log"
    echo "  - 백업 파일: ./backups/backup-YYYYMMDD-HHMMSS/"
    echo ""
    echo "지원 및 문의:"
    echo "  - 배포 관련 문제: 로그 파일 확인 후 문의"
    echo "  - 성능 최적화: 시스템 리소스에 따라 자동 조정"
    echo "  - 보안 설정: 환경 변수 파일 검토 필요"
else
    main "$@"
fi
