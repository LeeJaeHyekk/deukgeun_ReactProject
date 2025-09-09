-- ============================================================================
-- Deukgeun Database Initialization Script
-- 프로덕션 환경을 위한 데이터베이스 설정
-- ============================================================================

-- 데이터베이스 생성 (이미 존재하는 경우 무시)
CREATE DATABASE IF NOT EXISTS deukgeun_production_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 사용
USE deukgeun_production_db;

-- 사용자 권한 설정 (보안 강화)
-- 프로덕션에서는 제한된 권한을 가진 사용자 사용
CREATE USER IF NOT EXISTS 'deukgeun_user'@'%' IDENTIFIED BY 'your_secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, REFERENCES ON deukgeun_production_db.* TO 'deukgeun_user'@'%';
FLUSH PRIVILEGES;

-- 성능 최적화 설정
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL innodb_flush_method = 'O_DIRECT';
SET GLOBAL innodb_file_per_table = 1;

-- 연결 풀 설정
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;

-- 쿼리 캐시 설정 (MySQL 8.0에서는 제거됨)
-- 대신 InnoDB Buffer Pool 최적화 사용

-- 슬로우 쿼리 로그 설정
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 2;
SET GLOBAL log_queries_not_using_indexes = 1;

-- 바이너리 로그 설정 (백업 및 복제용)
SET GLOBAL log_bin = 1;
SET GLOBAL binlog_format = 'ROW';
SET GLOBAL expire_logs_days = 7;

-- 에러 로그 설정
SET GLOBAL log_error = '/var/log/mysql/error.log';

-- 일반 로그 설정 (프로덕션에서는 비활성화 권장)
SET GLOBAL general_log = 0;

-- 성능 스키마 설정
SET GLOBAL performance_schema = ON;

-- 보안 설정
SET GLOBAL local_infile = 0;
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- 인덱스 힌트 설정
SET GLOBAL optimizer_switch = 'index_merge=on,index_merge_union=on,index_merge_sort_union=on,index_merge_intersection=on';

-- 트랜잭션 격리 수준 설정
SET GLOBAL transaction_isolation = 'READ-COMMITTED';

-- 커밋 설정
SET GLOBAL autocommit = 1;

-- 외래키 체크 설정
SET GLOBAL foreign_key_checks = 1;

-- 유니크 체크 설정
SET GLOBAL unique_checks = 1;

-- SQL 모드 설정
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- 타임존 설정
SET GLOBAL time_zone = '+09:00';

-- 문자셋 설정
SET GLOBAL character_set_server = 'utf8mb4';
SET GLOBAL collation_server = 'utf8mb4_unicode_ci';

-- 성능 모니터링 뷰 생성
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    'Connections' as metric,
    VARIABLE_VALUE as value
FROM performance_schema.global_status 
WHERE VARIABLE_NAME = 'Threads_connected'
UNION ALL
SELECT 
    'Max Connections' as metric,
    VARIABLE_VALUE as value
FROM performance_schema.global_variables 
WHERE VARIABLE_NAME = 'max_connections'
UNION ALL
SELECT 
    'Buffer Pool Size (MB)' as metric,
    ROUND(VARIABLE_VALUE / 1024 / 1024, 2) as value
FROM performance_schema.global_variables 
WHERE VARIABLE_NAME = 'innodb_buffer_pool_size';

-- 권한 확인
SHOW GRANTS FOR 'deukgeun_user'@'%';

-- 설정 확인
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_connections';
SHOW VARIABLES LIKE 'character_set_server';
SHOW VARIABLES LIKE 'collation_server';

-- 상태 확인
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Uptime';
SHOW STATUS LIKE 'Questions';
SHOW STATUS LIKE 'Slow_queries';
