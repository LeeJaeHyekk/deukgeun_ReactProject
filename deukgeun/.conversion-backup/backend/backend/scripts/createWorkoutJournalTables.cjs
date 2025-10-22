"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkoutJournalTables = createWorkoutJournalTables;
const typeorm_1 = require("typeorm");
const environmentConfig_1 = require('config/environmentConfig');
const WorkoutSession_1 = require('entities/WorkoutSession');
const ExerciseSet_1 = require('entities/ExerciseSet');
const WorkoutGoal_1 = require('entities/WorkoutGoal');
const WorkoutPlan_1 = require('entities/WorkoutPlan');
const WorkoutPlanExercise_1 = require('entities/WorkoutPlanExercise');
const WorkoutStats_1 = require('entities/WorkoutStats');
const WorkoutProgress_1 = require('entities/WorkoutProgress');
const WorkoutReminder_1 = require('entities/WorkoutReminder');
const Machine_1 = require('entities/Machine');
const User_1 = require('entities/User');
const Gym_1 = require('entities/Gym');
async function createWorkoutJournalTables() {
    try {
        console.log("데이터베이스 연결 중...");
        const connection = await (0, typeorm_1.createConnection)({
            type: "mysql",
            host: environmentConfig_1.config.database.host,
            port: environmentConfig_1.config.database.port,
            username: environmentConfig_1.config.database.username,
            password: environmentConfig_1.config.database.password,
            database: environmentConfig_1.config.database.database,
            synchronize: false,
            logging: true,
            entities: [
                User_1.User,
                Gym_1.Gym,
                Machine_1.Machine,
                WorkoutSession_1.WorkoutSession,
                ExerciseSet_1.ExerciseSet,
                WorkoutGoal_1.WorkoutGoal,
                WorkoutPlan_1.WorkoutPlan,
                WorkoutPlanExercise_1.WorkoutPlanExercise,
                WorkoutStats_1.WorkoutStats,
                WorkoutProgress_1.WorkoutProgress,
                WorkoutReminder_1.WorkoutReminder,
            ],
        });
        console.log("데이터베이스 연결 성공!");
        console.log("운동 일지 관련 테이블 생성 중...");
        await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        session_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NULL,
        gym_id INT NULL,
        session_name VARCHAR(100) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NULL,
        total_duration_minutes INT NULL,
        mood_rating INT NULL,
        energy_level INT NULL,
        notes TEXT NULL,
        status ENUM('in_progress', 'completed', 'paused', 'cancelled') DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_plan_id (plan_id),
        INDEX idx_gym_id (gym_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id) ON DELETE SET NULL,
        FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS exercise_sets (
        set_id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        machine_id INT NOT NULL,
        set_number INT NOT NULL,
        reps_completed INT NOT NULL,
        weight_kg DECIMAL(5,2) NULL,
        duration_seconds INT NULL,
        distance_meters DECIMAL(8,2) NULL,
        rpe_rating INT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_id (session_id),
        INDEX idx_machine_id (machine_id),
        FOREIGN KEY (session_id) REFERENCES workout_sessions(session_id) ON DELETE CASCADE,
        FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_goals (
        goal_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        goal_type ENUM('weight_lift', 'endurance', 'weight_loss', 'muscle_gain', 'strength', 'flexibility') NOT NULL,
        target_value DECIMAL(10,2) NOT NULL,
        current_value DECIMAL(10,2) DEFAULT 0,
        unit VARCHAR(50) NOT NULL,
        target_date DATE NOT NULL,
        start_date DATE NOT NULL,
        status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        plan_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        estimated_duration_minutes INT NOT NULL,
        target_muscle_groups JSON NULL,
        is_template BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_plan_exercises (
        plan_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
        plan_id INT NOT NULL,
        machine_id INT NOT NULL,
        exercise_order INT NOT NULL,
        sets INT NOT NULL,
        reps_range JSON NOT NULL,
        weight_range JSON NULL,
        rest_seconds INT DEFAULT 90,
        notes TEXT NULL,
        INDEX idx_plan_id (plan_id),
        INDEX idx_machine_id (machine_id),
        FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id) ON DELETE CASCADE,
        FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_stats (
        stat_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        machine_id INT NULL,
        workout_date DATE NOT NULL,
        total_sessions INT DEFAULT 0,
        total_duration_minutes INT DEFAULT 0,
        total_sets INT DEFAULT 0,
        total_reps INT DEFAULT 0,
        total_weight_kg DECIMAL(10,2) DEFAULT 0,
        total_distance_meters DECIMAL(8,2) DEFAULT 0,
        average_mood DECIMAL(5,2) DEFAULT 0,
        average_energy DECIMAL(5,2) DEFAULT 0,
        average_rpe DECIMAL(5,2) DEFAULT 0,
        calories_burned INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_machine_id (machine_id),
        INDEX idx_workout_date (workout_date),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_progress (
        progress_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        machine_id INT NOT NULL,
        progress_date DATE NOT NULL,
        set_number INT NOT NULL,
        reps_completed INT NOT NULL,
        weight_kg DECIMAL(5,2) NULL,
        duration_seconds INT NULL,
        distance_meters DECIMAL(8,2) NULL,
        rpe_rating INT NULL,
        notes TEXT NULL,
        is_personal_best BOOLEAN DEFAULT FALSE,
        improvement_percentage DECIMAL(5,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_machine_id (machine_id),
        INDEX idx_progress_date (progress_date),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_reminders (
        reminder_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT NULL,
        reminder_time TIME NOT NULL,
        repeat_days JSON NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_sent BOOLEAN DEFAULT FALSE,
        last_sent_at DATETIME NULL,
        next_send_at DATETIME NULL,
        notification_type ENUM('push', 'email', 'sms') DEFAULT 'push',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("운동 일지 관련 테이블 생성 완료!");
        await connection.close();
        console.log("데이터베이스 연결 종료");
    }
    catch (error) {
        console.error("테이블 생성 중 오류 발생:", error);
        process.exit(1);
    }
}
if (require.main === module) {
    createWorkoutJournalTables()
        .then(() => {
        console.log("운동 일지 테이블 생성이 완료되었습니다.");
        process.exit(0);
    })
        .catch(error => {
        console.error("스크립트 실행 중 오류 발생:", error);
        process.exit(1);
    });
}
