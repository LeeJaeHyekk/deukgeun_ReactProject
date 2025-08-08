import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm"
import { User } from "./User"
import { WorkoutPlan } from "./WorkoutPlan"
import { Gym } from "./Gym"
import { ExerciseSet } from "./ExerciseSet"

@Entity("workout_sessions")
export class WorkoutSession {
  @PrimaryGeneratedColumn()
  session_id!: number

  @Column({ type: "int" })
  @Index()
  user_id!: number

  @Column({ type: "int", nullable: true })
  @Index()
  plan_id?: number

  @Column({ type: "int", nullable: true })
  @Index()
  gym_id?: number

  @Column({ type: "varchar", length: 100 })
  session_name!: string

  @Column({ type: "datetime" })
  start_time!: Date

  @Column({ type: "datetime", nullable: true })
  end_time?: Date

  @Column({ type: "int", nullable: true })
  total_duration_minutes?: number

  @Column({ type: "int", nullable: true })
  mood_rating?: number // 1-5 scale

  @Column({ type: "int", nullable: true })
  energy_level?: number // 1-5 scale

  @Column({ type: "text", nullable: true })
  notes?: string

  @Column({
    type: "enum",
    enum: ["in_progress", "completed", "paused", "cancelled"],
    default: "in_progress",
  })
  status!: "in_progress" | "completed" | "paused" | "cancelled"

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User

  @ManyToOne(() => WorkoutPlan, { onDelete: "SET NULL" })
  @JoinColumn({ name: "plan_id" })
  workout_plan?: WorkoutPlan

  @ManyToOne(() => Gym, { onDelete: "SET NULL" })
  @JoinColumn({ name: "gym_id" })
  gym?: Gym

  @OneToMany(() => ExerciseSet, set => set.workout_session)
  exercise_sets!: ExerciseSet[]
}
