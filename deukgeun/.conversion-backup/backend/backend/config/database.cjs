require('reflect-metadata');
// TypeORM DataSource 클래스 import
const { DataSource  } = require('typeorm');
// 환경 변수 로드 라이브러리 import
const { config  } = require('dotenv');
// 엔티티 클래스들 import - 데이터베이스 테이블과 매핑되는 클래스들
const { Post  } = require('../entities/Post'); // 게시글 엔티티
const { Gym  } = require('../entities/Gym'); // 헬스장 엔티티
const { User  } = require('../entities/User'); // 사용자 엔티티
const { Machine  } = require('../entities/Machine'); // 운동 머신 엔티티
const { Comment  } = require('../entities/Comment'); // 댓글 엔티티
const { Like  } = require('../entities/Like'); // 게시글 좋아요 엔티티
const { UserLevel  } = require('../entities/UserLevel'); // 사용자 레벨 엔티티
const { ExpHistory  } = require('../entities/ExpHistory'); // 경험치 이력 엔티티
const { UserReward  } = require('../entities/UserReward'); // 사용자 보상 엔티티
const { Milestone  } = require('../entities/Milestone'); // 마일스톤 엔티티
const { UserStreak  } = require('../entities/UserStreak'); // 사용자 연속 활동 엔티티
const { WorkoutSession  } = require('../entities/WorkoutSession'); // 운동 세션 엔티티
const { ExerciseSet  } = require('../entities/ExerciseSet'); // 운동 세트 엔티티
const { WorkoutGoal  } = require('../entities/WorkoutGoal'); // 운동 목표 엔티티
const { WorkoutPlan  } = require('../entities/WorkoutPlan'); // 운동 계획 엔티티
const { WorkoutPlanExercise  } = require('../entities/WorkoutPlanExercise'); // 운동 계획 운동 엔티티
const { WorkoutStats  } = require('../entities/WorkoutStats'); // 운동 통계 엔티티
const { WorkoutProgress  } = require('../entities/WorkoutProgress'); // 운동 진행 상황 엔티티
const { WorkoutReminder  } = require('../entities/WorkoutReminder'); // 운동 알림 엔티티
const { VerificationToken  } = require('../entities/VerificationToken'); // 이메일 인증 토큰 엔티티
const { PasswordResetToken  } = require('../entities/PasswordResetToken'); // 비밀번호 재설정 토큰 엔티티
const { HomePageConfig  } = require('../entities/HomePageConfig'); // 홈페이지 설정 엔티티
// 환경 변수 로드 (.env 파일에서 환경 변수 읽기)
config();
// 현재 환경 설정 (기본값: development)
const environment = process.env.NODE_ENV || "development";
/**
 * TypeORM DataSource 설정
 * 데이터베이스 연결 및 ORM 설정을 담당
 */
const AppDataSource
module.exports.AppDataSource = AppDataSource = new DataSource({
    // 데이터베이스 타입 설정
    type: "mysql", // MySQL 데이터베이스 사용
    // 데이터베이스 연결 설정
    host: process.env.DB_HOST || "localhost", // 데이터베이스 호스트
    port: parseInt(process.env.DB_PORT || "3306"), // 데이터베이스 포트
    username: process.env.DB_USERNAME || "root", // 데이터베이스 사용자명
    password: process.env.DB_PASSWORD || "", // 데이터베이스 비밀번호
    database: process.env.DB_NAME || "deukgeun_db", // 데이터베이스 이름
    // 스키마 자동 동기화 설정 (외래키 제약조건 문제로 인해 비활성화)
    synchronize: false,
    // SQL 쿼리 로깅 설정 (개발 환경에서만 활성화)
    logging: environment === "development",
    // 엔티티 클래스 목록 - 데이터베이스 테이블과 매핑될 클래스들
    entities: [
        Post, // 게시글 테이블
        Gym, // 헬스장 테이블
        User, // 사용자 테이블
        Machine, // 운동 머신 테이블
        Comment, // 댓글 테이블
        Like, // 게시글 좋아요 테이블
        UserLevel, // 사용자 레벨 테이블
        ExpHistory, // 경험치 이력 테이블
        UserReward, // 사용자 보상 테이블
        Milestone, // 마일스톤 테이블
        UserStreak, // 사용자 연속 활동 테이블
        WorkoutSession, // 운동 세션 테이블
        ExerciseSet, // 운동 세트 테이블
        WorkoutGoal, // 운동 목표 테이블
        WorkoutPlan, // 운동 계획 테이블
        WorkoutPlanExercise, // 운동 계획 운동 테이블
        WorkoutStats, // 운동 통계 테이블
        WorkoutProgress, // 운동 진행 상황 테이블
        WorkoutReminder, // 운동 알림 테이블
        VerificationToken, // 이메일 인증 토큰 테이블
        PasswordResetToken, // 비밀번호 재설정 토큰 테이블
        HomePageConfig, // 홈페이지 설정 테이블
    ],
    // 구독자 목록 (현재 사용하지 않음)
    subscribers: [],
    // 마이그레이션 목록 (현재 사용하지 않음)
    migrations: [],
});
/**
 * 데이터베이스 연결 함수
 * TypeORM DataSource를 초기화하고 연결을 설정
 * @returns 초기화된 DataSource 인스턴스
 */
const connectDatabase
module.exports.connectDatabase = connectDatabase = async () => {
    try {
        // DataSource 초기화
        await AppDataSource.initialize();
        console.log("✅ Database connection established successfully");
        console.log(`📊 Database: ${process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`);
        return AppDataSource;
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        throw error;
    }
};
/**
 * 현재 데이터베이스 연결 가져오기
 * @returns 현재 활성화된 DataSource 인스턴스
 * @throws Error 연결이 초기화되지 않은 경우
 */
const getConnection
module.exports.getConnection = getConnection = () => {
    if (!AppDataSource.isInitialized) {
        throw new Error("Database connection is not initialized");
    }
    return AppDataSource;
};
/**
 * 데이터베이스 상태 확인 함수
 * 데이터베이스 연결 상태와 응답성을 확인
 * @returns 데이터베이스 상태 정보 객체
 */
const checkDatabaseHealth
module.exports.checkDatabaseHealth = checkDatabaseHealth = async () => {
    try {
        const connection = getConnection();
        // 간단한 쿼리로 데이터베이스 응답성 확인
        await connection.query("SELECT 1");
        return {
            status: "healthy", // 정상 상태
            message: "Database is connected and responsive", // 연결됨 및 응답 가능
        };
    }
    catch (error) {
        return {
            status: "unhealthy", // 비정상 상태
            message: "Database connection failed", // 연결 실패
            error, // 에러 정보
        };
    }
};
