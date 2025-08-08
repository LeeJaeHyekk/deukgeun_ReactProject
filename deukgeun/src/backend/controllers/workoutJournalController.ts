import { Request, Response } from "express"
import { WorkoutJournalService } from "../services/workoutJournalService"

export class WorkoutJournalController {
  // 운동 세션 생성
  static async createWorkoutSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const sessionData = {
        user_id: userId,
        plan_id: req.body.plan_id,
        gym_id: req.body.gym_id,
        session_name: req.body.session_name,
        start_time: new Date(req.body.start_time),
        mood_rating: req.body.mood_rating,
        energy_level: req.body.energy_level,
        notes: req.body.notes,
      }

      const session =
        await WorkoutJournalService.createWorkoutSession(sessionData)
      res.status(201).json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 생성 오류:", error)
      res.status(500).json({ error: "운동 세션 생성에 실패했습니다." })
    }
  }

  // 운동 세션 완료
  static async completeWorkoutSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const { session_id } = req.params
      const { end_time } = req.body

      const session = await WorkoutJournalService.completeWorkoutSession(
        parseInt(session_id),
        new Date(end_time)
      )

      res.json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 완료 오류:", error)
      res.status(500).json({ error: "운동 세션 완료에 실패했습니다." })
    }
  }

  // 운동 세션 목록 조회
  static async getWorkoutSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await WorkoutJournalService.getWorkoutSessions(
        userId,
        page,
        limit
      )
      res.json({ success: true, data: result })
    } catch (error) {
      console.error("운동 세션 목록 조회 오류:", error)
      res.status(500).json({ error: "운동 세션 목록 조회에 실패했습니다." })
    }
  }

  // 운동 세션 상세 조회
  static async getWorkoutSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const { session_id } = req.params
      const session = await WorkoutJournalService.getWorkoutSession(
        parseInt(session_id),
        userId
      )
      res.json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 상세 조회 오류:", error)
      res.status(500).json({ error: "운동 세션 상세 조회에 실패했습니다." })
    }
  }

  // 운동 세트 추가
  static async addExerciseSet(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const setData = {
        session_id: req.body.session_id,
        machine_id: req.body.machine_id,
        set_number: req.body.set_number,
        reps_completed: req.body.reps_completed,
        weight_kg: req.body.weight_kg,
        duration_seconds: req.body.duration_seconds,
        distance_meters: req.body.distance_meters,
        rpe_rating: req.body.rpe_rating,
        notes: req.body.notes,
      }

      const exerciseSet = await WorkoutJournalService.addExerciseSet(setData)
      res.status(201).json({ success: true, data: exerciseSet })
    } catch (error) {
      console.error("운동 세트 추가 오류:", error)
      res.status(500).json({ error: "운동 세트 추가에 실패했습니다." })
    }
  }

  // 운동 목표 생성
  static async createWorkoutGoal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const goalData = {
        user_id: userId,
        goal_type: req.body.goal_type,
        target_value: req.body.target_value,
        unit: req.body.unit,
        target_date: new Date(req.body.target_date),
        start_date: new Date(req.body.start_date),
      }

      const goal = await WorkoutJournalService.createWorkoutGoal(goalData)
      res.status(201).json({ success: true, data: goal })
    } catch (error) {
      console.error("운동 목표 생성 오류:", error)
      res.status(500).json({ error: "운동 목표 생성에 실패했습니다." })
    }
  }

  // 운동 목표 목록 조회
  static async getWorkoutGoals(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const goals = await WorkoutJournalService.getWorkoutGoals(userId)
      res.json({ success: true, data: goals })
    } catch (error) {
      console.error("운동 목표 목록 조회 오류:", error)
      res.status(500).json({ error: "운동 목표 목록 조회에 실패했습니다." })
    }
  }

  // 운동 목표 업데이트
  static async updateWorkoutGoal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const { goal_id } = req.params
      const { current_value } = req.body

      const goal = await WorkoutJournalService.updateWorkoutGoal(
        parseInt(goal_id),
        userId,
        current_value
      )

      res.json({ success: true, data: goal })
    } catch (error) {
      console.error("운동 목표 업데이트 오류:", error)
      res.status(500).json({ error: "운동 목표 업데이트에 실패했습니다." })
    }
  }

  // 운동 통계 조회
  static async getWorkoutStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const startDate = req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined
      const endDate = req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined

      const stats = await WorkoutJournalService.getWorkoutStats(
        userId,
        startDate,
        endDate
      )
      res.json({ success: true, data: stats })
    } catch (error) {
      console.error("운동 통계 조회 오류:", error)
      res.status(500).json({ error: "운동 통계 조회에 실패했습니다." })
    }
  }

  // 운동 진행 상황 조회
  static async getWorkoutProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const machineId = req.query.machine_id
        ? parseInt(req.query.machine_id as string)
        : undefined
      const limit = parseInt(req.query.limit as string) || 10

      const progress = await WorkoutJournalService.getWorkoutProgress(
        userId,
        machineId,
        limit
      )
      res.json({ success: true, data: progress })
    } catch (error) {
      console.error("운동 진행 상황 조회 오류:", error)
      res.status(500).json({ error: "운동 진행 상황 조회에 실패했습니다." })
    }
  }

  // 운동 알림 생성
  static async createWorkoutReminder(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const reminderData = {
        user_id: userId,
        title: req.body.title,
        description: req.body.description,
        reminder_time: req.body.reminder_time,
        repeat_days: req.body.repeat_days,
        notification_type: req.body.notification_type,
      }

      const reminder =
        await WorkoutJournalService.createWorkoutReminder(reminderData)
      res.status(201).json({ success: true, data: reminder })
    } catch (error) {
      console.error("운동 알림 생성 오류:", error)
      res.status(500).json({ error: "운동 알림 생성에 실패했습니다." })
    }
  }

  // 운동 알림 목록 조회
  static async getWorkoutReminders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const reminders = await WorkoutJournalService.getWorkoutReminders(userId)
      res.json({ success: true, data: reminders })
    } catch (error) {
      console.error("운동 알림 목록 조회 오류:", error)
      res.status(500).json({ error: "운동 알림 목록 조회에 실패했습니다." })
    }
  }

  // 운동 알림 업데이트
  static async updateWorkoutReminder(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const { reminder_id } = req.params
      const updateData = req.body

      const reminder = await WorkoutJournalService.updateWorkoutReminder(
        parseInt(reminder_id),
        userId,
        updateData
      )

      res.json({ success: true, data: reminder })
    } catch (error) {
      console.error("운동 알림 업데이트 오류:", error)
      res.status(500).json({ error: "운동 알림 업데이트에 실패했습니다." })
    }
  }

  // 운동 알림 삭제
  static async deleteWorkoutReminder(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const { reminder_id } = req.params
      const result = await WorkoutJournalService.deleteWorkoutReminder(
        parseInt(reminder_id),
        userId
      )
      res.json({ success: true, data: result })
    } catch (error) {
      console.error("운동 알림 삭제 오류:", error)
      res.status(500).json({ error: "운동 알림 삭제에 실패했습니다." })
    }
  }

  // 사용자 운동 요약 통계
  static async getUserWorkoutSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id
      if (!userId) {
        return res.status(401).json({ error: "인증이 필요합니다." })
      }

      const summary = await WorkoutJournalService.getUserWorkoutSummary(userId)
      res.json({ success: true, data: summary })
    } catch (error) {
      console.error("운동 요약 통계 조회 오류:", error)
      res.status(500).json({ error: "운동 요약 통계 조회에 실패했습니다." })
    }
  }
}
