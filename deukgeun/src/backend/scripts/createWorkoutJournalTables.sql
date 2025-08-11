-- WorkoutJournal 관련 테이블 생성

-- WorkoutPlan 테이블 생성
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WorkoutSession 테이블 생성
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id) ON DELETE SET NULL,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ExerciseSet 테이블 생성
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
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WorkoutGoal 테이블 생성
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WorkoutStats 테이블 생성
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WorkoutProgress 테이블 생성
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WorkoutPlanExercise 테이블 생성 (운동 계획에 포함된 운동들)
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
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 생성 완료 메시지
SELECT 'WorkoutJournal 테이블들이 성공적으로 생성되었습니다!' as message;
