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
import { WorkoutPlanExercise } from "./WorkoutPlanExercise"

@Entity("workout_plans")
export class WorkoutPlan {
  @PrimaryGeneratedColumn()
  plan_id!: number

  @Column({ type: "int" })
  @Index()
  user_id!: number

  @Column({ type: "varchar", length: 100 })
  name!: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({
    type: "enum",
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  })
  difficulty_level!: "beginner" | "intermediate" | "advanced"

  @Column({ type: "int" })
  estimated_duration_minutes!: number

  @Column({ type: "json", nullable: true })
  target_muscle_groups?: string[]

  @Column({ type: "boolean", default: false })
  is_template!: boolean

  @Column({ type: "boolean", default: false })
  is_public!: boolean

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User

  @OneToMany(() => WorkoutPlanExercise, exercise => exercise.workout_plan)
  exercises!: WorkoutPlanExercise[]
}
