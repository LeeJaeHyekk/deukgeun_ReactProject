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
import { User } from "@backend/entities/User"
import { WorkoutPlanExercise } from "@backend/entities/WorkoutPlanExercise"

@Entity("workout_plans")
export class WorkoutPlan {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "varchar", length: 100 })
  name!: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({
    type: "enum",
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  })
  difficulty!: "beginner" | "intermediate" | "advanced"

  @Column({ type: "int" })
  estimatedDurationMinutes!: number

  @Column({ type: "json", nullable: true })
  targetMuscleGroups?: string[]

  @Column({ type: "boolean", default: false })
  isTemplate!: boolean

  @Column({ type: "boolean", default: false })
  isPublic!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  @OneToMany(() => WorkoutPlanExercise, exercise => exercise.workoutPlan)
  exercises!: WorkoutPlanExercise[]
}
