import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { WorkoutPlan } from "./WorkoutPlan.js"
import { Machine } from "./Machine.js"

@Entity("workout_plan_exercises")
export class WorkoutPlanExercise {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  planId!: number

  @Column({ type: "int", nullable: true })
  machineId?: number

  @Column({ type: "int", nullable: true })
  exerciseId?: number

  @Column({ type: "varchar", length: 255 })
  exerciseName!: string

  @Column({ type: "int" })
  exerciseOrder!: number

  @Column({ type: "int" })
  sets!: number

  @Column({ type: "json" })
  repsRange!: { min: number; max: number }

  @Column({ type: "json", nullable: true })
  weightRange?: { min: number; max: number }

  @Column({ type: "int", default: 90 })
  restSeconds!: number

  @Column({ type: "text", nullable: true })
  notes?: string

  // 관계 설정
  @ManyToOne(() => WorkoutPlan, { onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_id" })
  workoutPlan!: WorkoutPlan

  @ManyToOne(() => Machine, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "machine_id" })
  machine?: Machine
}
