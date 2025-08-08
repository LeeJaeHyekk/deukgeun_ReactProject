import { Router } from "express"
import { WorkoutJournalController } from "../controllers/workoutJournalController"
import { authenticateToken } from "../middlewares/auth"

const router = Router()

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken)

// 운동 세션 관련 라우트
router.post("/sessions", WorkoutJournalController.createWorkoutSession)
router.get("/sessions", WorkoutJournalController.getWorkoutSessions)
router.get("/sessions/:session_id", WorkoutJournalController.getWorkoutSession)
router.put(
  "/sessions/:session_id/complete",
  WorkoutJournalController.completeWorkoutSession
)

// 운동 세트 관련 라우트
router.post("/sets", WorkoutJournalController.addExerciseSet)

// 운동 목표 관련 라우트
router.post("/goals", WorkoutJournalController.createWorkoutGoal)
router.get("/goals", WorkoutJournalController.getWorkoutGoals)
router.put("/goals/:goal_id", WorkoutJournalController.updateWorkoutGoal)

// 운동 통계 관련 라우트
router.get("/stats", WorkoutJournalController.getWorkoutStats)
router.get("/progress", WorkoutJournalController.getWorkoutProgress)

// 운동 알림 관련 라우트
router.post("/reminders", WorkoutJournalController.createWorkoutReminder)
router.get("/reminders", WorkoutJournalController.getWorkoutReminders)
router.put(
  "/reminders/:reminder_id",
  WorkoutJournalController.updateWorkoutReminder
)
router.delete(
  "/reminders/:reminder_id",
  WorkoutJournalController.deleteWorkoutReminder
)

// 사용자 운동 요약 통계
router.get("/summary", WorkoutJournalController.getUserWorkoutSummary)

export default router
