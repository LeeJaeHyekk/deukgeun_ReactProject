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
  goal_id!: number

  @Column({ type: "int" })
  @Index()
  user_id!: number

  @Column({
    type: "enum",
    enum: [
      "weight_lift",
      "endurance",
      "weight_loss",
      "muscle_gain",
      "strength",
      "flexibility",
    ],
  })
  goal_type!:
    | "weight_lift"
    | "endurance"
    | "weight_loss"
    | "muscle_gain"
    | "strength"
    | "flexibility"

  @Column({ type: "decimal", precision: 10, scale: 2 })
  target_value!: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  current_value!: number

  @Column({ type: "varchar", length: 50 })
  unit!: string

  @Column({ type: "date" })
  target_date!: Date

  @Column({ type: "date" })
  start_date!: Date

  @Column({
    type: "enum",
    enum: ["active", "completed", "paused", "cancelled"],
    default: "active",
  })
  status!: "active" | "completed" | "paused" | "cancelled"

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  progress_percentage!: number

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User
}
