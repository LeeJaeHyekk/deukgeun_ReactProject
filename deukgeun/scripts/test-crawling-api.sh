#!/bin/bash

# 통합 크롤링 API 테스트 스크립트 (Bash 버전)
# 
# 이 스크립트는 다음 기능들을 테스트합니다:
# 1. 서버 상태 확인
# 2. 통합 크롤링 상태 조회
# 3. 특정 헬스장 크롤링 테스트
# 4. 데이터 검증 테스트
# 5. 통합 크롤링 실행 테스트
# 6. 스케줄러 제어 테스트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 설정
BASE_URL="http://localhost:3000"
TEST_TIMEOUT=30

# 로깅 함수들
log() {
    echo -e "${WHITE}$1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_test() {
    echo -e "${CYAN}🧪 $1${NC}"
}

# HTTP 요청 헬퍼
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local timeout=${4:-$TEST_TIMEOUT}
    
    local url="${BASE_URL}${endpoint}"
    local curl_cmd="curl -s -w '%{http_code}' -X ${method} -H 'Content-Type: application/json' -H 'User-Agent: CrawlingTestScript/1.0'"
    
    if [ -n "$data" ]; then
        curl_cmd="${curl_cmd} -d '${data}'"
    fi
    
    curl_cmd="${curl_cmd} --max-time ${timeout} '${url}'"
    
    eval $curl_cmd
}

# 테스트 결과 추적
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)

# 테스트 시작
test_start() {
    local test_name=$1
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "테스트 시작: $test_name"
}

# 테스트 완료
test_end() {
    local test_name=$1
    local success=$2
    local error_msg=$3
    
    if [ "$success" = "true" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log_success "테스트 완료: $test_name"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        log_error "테스트 실패: $test_name - $error_msg"
    fi
}

# 1. 서버 상태 확인
test_server_health() {
    test_start "서버 상태 확인"
    
    local response=$(make_request "GET" "/api/health")
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        test_end "서버 상태 확인" "true"
        log_success "서버가 정상적으로 실행 중입니다. (상태: $http_code)"
        log_info "응답: $body"
    else
        test_end "서버 상태 확인" "false" "예상치 못한 상태 코드: $http_code"
        log_error "서버 상태가 비정상입니다. (상태: $http_code)"
    fi
}

# 2. 통합 크롤링 상태 조회
test_integrated_crawling_status() {
    test_start "통합 크롤링 상태 조회"
    
    local response=$(make_request "GET" "/api/enhanced-gym/integrated-crawling/status")
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        test_end "통합 크롤링 상태 조회" "true"
        log_success "통합 크롤링 상태 조회 성공"
        log_info "상태 데이터: $body"
    else
        test_end "통합 크롤링 상태 조회" "false" "예상치 못한 상태 코드: $http_code"
        log_error "통합 크롤링 상태 조회 실패 (상태: $http_code)"
    fi
}

# 3. 특정 헬스장 크롤링 테스트
test_crawl_bypass() {
    test_start "특정 헬스장 크롤링 테스트"
    
    local test_gym_names=("스포츠몬스터" "헬스장" "피트니스")
    local success_count=0
    
    for gym_name in "${test_gym_names[@]}"; do
        log_test "헬스장 크롤링 테스트: \"$gym_name\""
        
        local encoded_gym_name=$(printf '%s\n' "$gym_name" | jq -sRr @uri)
        local response=$(make_request "GET" "/api/enhanced-gym/crawl-bypass/$encoded_gym_name")
        local http_code="${response: -3}"
        local body="${response%???}"
        
        if [ "$http_code" = "200" ]; then
            log_success "\"$gym_name\" 크롤링 성공"
            log_info "크롤링 결과: $body"
            success_count=$((success_count + 1))
        else
            log_warning "\"$gym_name\" 크롤링 실패 (상태: $http_code)"
        fi
        
        # 요청 간 간격 (Rate limit 방지)
        sleep 1
    done
    
    if [ $success_count -gt 0 ]; then
        test_end "특정 헬스장 크롤링 테스트" "true"
    else
        test_end "특정 헬스장 크롤링 테스트" "false" "모든 크롤링 테스트 실패"
    fi
}

# 4. 데이터 검증 테스트
test_type_guard_validation() {
    test_start "데이터 검증 테스트"
    
    local test_data='{
        "publicApiData": {
            "id": "test-001",
            "name": "테스트 헬스장",
            "address": "서울시 강남구 테스트로 123",
            "phone": "02-1234-5678",
            "latitude": 37.5665,
            "longitude": 126.9780,
            "source": "kakao_local_api"
        },
        "crawlingData": {
            "name": "테스트 헬스장",
            "address": "서울시 강남구 테스트로 123",
            "phone": "02-1234-5678",
            "latitude": "37.5665",
            "longitude": "126.9780",
            "source": "naver_place"
        }
    }'
    
    local response=$(make_request "POST" "/api/enhanced-gym/validate-type-guard" "$test_data")
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        test_end "데이터 검증 테스트" "true"
        log_success "데이터 검증 테스트 성공"
        log_info "검증 결과: $body"
    else
        test_end "데이터 검증 테스트" "false" "예상치 못한 상태 코드: $http_code"
        log_error "데이터 검증 테스트 실패 (상태: $http_code)"
    fi
}

# 5. 통합 크롤링 실행 테스트
test_integrated_crawling_execution() {
    test_start "통합 크롤링 실행 테스트"
    
    log_warning "통합 크롤링 실행은 시간이 오래 걸릴 수 있습니다..."
    
    local test_data='{
        "testMode": true,
        "maxGyms": 5
    }'
    
    local response=$(make_request "POST" "/api/enhanced-gym/integrated-crawling" "$test_data" 60)
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        test_end "통합 크롤링 실행 테스트" "true"
        log_success "통합 크롤링 실행 테스트 성공"
        log_info "실행 결과: $body"
    else
        test_end "통합 크롤링 실행 테스트" "false" "예상치 못한 상태 코드: $http_code"
        log_error "통합 크롤링 실행 테스트 실패 (상태: $http_code)"
    fi
}

# 6. 스케줄러 제어 테스트
test_scheduler_control() {
    test_start "스케줄러 제어 테스트"
    
    # 스케줄러 상태 조회
    local status_response=$(make_request "GET" "/api/enhanced-gym/public-api-scheduler/status")
    local status_http_code="${status_response: -3}"
    local status_body="${status_response%???}"
    
    if [ "$status_http_code" = "200" ]; then
        log_success "스케줄러 상태 조회 성공"
        log_info "스케줄러 상태: $status_body"
    fi
    
    # 스케줄러 제어 (시작)
    local control_data='{"action": "start"}'
    local control_response=$(make_request "POST" "/api/enhanced-gym/public-api-scheduler/control" "$control_data")
    local control_http_code="${control_response: -3}"
    local control_body="${control_response%???}"
    
    if [ "$control_http_code" = "200" ]; then
        test_end "스케줄러 제어 테스트" "true"
        log_success "스케줄러 제어 테스트 성공"
        log_info "제어 결과: $control_body"
    else
        test_end "스케줄러 제어 테스트" "false" "예상치 못한 상태 코드: $control_http_code"
        log_error "스케줄러 제어 테스트 실패 (상태: $control_http_code)"
    fi
}

# 테스트 결과 요약
print_test_summary() {
    local end_time=$(date +%s)
    local total_duration=$((end_time - START_TIME))
    
    log "────────────────────────────────────────────────────────────"
    log "📊 테스트 결과 요약"
    log "────────────────────────────────────────────────────────────"
    
    log_info "총 테스트: ${TOTAL_TESTS}개"
    log_success "성공: ${PASSED_TESTS}개"
    
    if [ $FAILED_TESTS -gt 0 ]; then
        log_error "실패: ${FAILED_TESTS}개"
    fi
    
    log_info "총 소요 시간: ${total_duration}초"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "🎉 모든 테스트가 성공했습니다!"
    else
        log_error "❌ 일부 테스트가 실패했습니다."
    fi
    
    log "🎯 테스트 완료!"
}

# 메인 실행 함수
main() {
    log "🚀 통합 크롤링 API 테스트 시작"
    log "📍 테스트 대상: $BASE_URL"
    log "────────────────────────────────────────────────────────────"
    
    # 필수 도구 확인
    if ! command -v curl &> /dev/null; then
        log_error "curl이 설치되어 있지 않습니다."
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warning "jq가 설치되어 있지 않습니다. URL 인코딩이 제대로 작동하지 않을 수 있습니다."
    fi
    
    # 테스트 실행
    test_server_health
    test_integrated_crawling_status
    test_crawl_bypass
    test_type_guard_validation
    test_integrated_crawling_execution
    test_scheduler_control
    
    # 결과 요약
    print_test_summary
}

# 스크립트 실행
main "$@"
