import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { WorkoutPlan } from "./WorkoutPlan"
import { Machine } from "./Machine"

@Entity("workout_plan_exercises")
export class WorkoutPlanExercise {
  @PrimaryGeneratedColumn()
  plan_exercise_id!: number

  @Column({ type: "int" })
  @Index()
  plan_id!: number

  @Column({ type: "int" })
  @Index()
  machine_id!: number

  @Column({ type: "int" })
  exercise_order!: number

  @Column({ type: "int" })
  sets!: number

  @Column({ type: "json" })
  reps_range!: { min: number; max: number }

  @Column({ type: "json", nullable: true })
  weight_range?: { min: number; max: number }

  @Column({ type: "int", default: 90 })
  rest_seconds!: number

  @Column({ type: "text", nullable: true })
  notes?: string

  // 관계 설정
  @ManyToOne(() => WorkoutPlan, { onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_id" })
  workout_plan!: WorkoutPlan

  @ManyToOne(() => Machine, { onDelete: "CASCADE" })
  @JoinColumn({ name: "machine_id" })
  machine!: Machine
}
