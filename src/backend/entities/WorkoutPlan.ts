import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm"
import { User } from "../domains/auth/entities/User"
import { WorkoutPlanExercise } from "./WorkoutPlanExercise"

@Entity("workout_plans")
export class WorkoutPlan {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  userId!: number

  @Column({ length: 255 })
  name!: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({ default: false })
  isPublic!: boolean

  @Column({
    type: "enum",
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  })
  difficulty!: "beginner" | "intermediate" | "advanced"

  @Column({ type: "int", default: 0 })
  estimatedDuration!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // Relations
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user?: User

  @OneToMany(() => WorkoutPlanExercise, (exercise) => exercise.workoutPlan, {
    cascade: true,
  })
  exercises?: WorkoutPlanExercise[]
}
