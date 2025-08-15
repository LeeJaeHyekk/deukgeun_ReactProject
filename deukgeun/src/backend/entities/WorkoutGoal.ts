import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "./User"

@Entity("workout_goals")
export class WorkoutGoal {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "varchar", length: 255 })
  title!: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({
    type: "enum",
    enum: ["weight", "reps", "duration", "frequency", "streak"],
  })
  type!: "weight" | "reps" | "duration" | "frequency" | "streak"

  @Column({ type: "decimal", precision: 10, scale: 2 })
  targetValue!: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  currentValue!: number

  @Column({ type: "varchar", length: 50 })
  unit!: string

  @Column({ type: "date", nullable: true })
  deadline?: Date

  @Column({ type: "boolean", default: false })
  isCompleted!: boolean

  @Column({ type: "datetime", nullable: true })
  completedAt?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
