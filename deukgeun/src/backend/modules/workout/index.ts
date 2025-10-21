// ============================================================================
// Workout 모듈 인덱스
// ============================================================================

// Workout 관련 라우트
export { default as workoutRoutes } from "@backend/routes/workout"

// Workout 컨트롤러
export { WorkoutController } from "@backend/controllers/workoutController"

// Workout 서비스
export { WorkoutService } from "@backend/services/workoutService"

// Workout 엔티티
export { WorkoutSession } from "@backend/entities/WorkoutSession"
export { WorkoutPlan } from "@backend/entities/WorkoutPlan"
export { WorkoutPlanExercise } from "@backend/entities/WorkoutPlanExercise"
export { WorkoutProgress } from "@backend/entities/WorkoutProgress"
export { WorkoutStats } from "@backend/entities/WorkoutStats"
export { WorkoutGoal } from "@backend/entities/WorkoutGoal"
export { WorkoutReminder } from "@backend/entities/WorkoutReminder"
export { ExerciseSet } from "@backend/entities/ExerciseSet"
