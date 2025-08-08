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
import { Machine } from "./Machine"

@Entity("workout_progress")
export class WorkoutProgress {
  @PrimaryGeneratedColumn()
  progress_id!: number

  @Column({ type: "int" })
  @Index()
  user_id!: number

  @Column({ type: "int" })
  @Index()
  machine_id!: number

  @Column({ type: "date" })
  @Index()
  progress_date!: Date

  @Column({ type: "int" })
  set_number!: number

  @Column({ type: "int" })
  reps_completed!: number

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  weight_kg?: number

  @Column({ type: "int", nullable: true })
  duration_seconds?: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  distance_meters?: number

  @Column({ type: "int", nullable: true })
  rpe_rating?: number

  @Column({ type: "text", nullable: true })
  notes?: string

  @Column({ type: "boolean", default: false })
  is_personal_best!: boolean

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  improvement_percentage?: number

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User

  @ManyToOne(() => Machine, { onDelete: "CASCADE" })
  @JoinColumn({ name: "machine_id" })
  machine!: Machine
}
