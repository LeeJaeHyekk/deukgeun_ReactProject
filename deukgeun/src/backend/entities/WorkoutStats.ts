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

@Entity("workout_stats")
export class WorkoutStats {
  @PrimaryGeneratedColumn()
  stat_id!: number

  @Column({ type: "int" })
  @Index()
  user_id!: number

  @Column({ type: "int", nullable: true })
  @Index()
  machine_id?: number

  @Column({ type: "date" })
  @Index()
  workout_date!: Date

  @Column({ type: "int", default: 0 })
  total_sessions!: number

  @Column({ type: "int", default: 0 })
  total_duration_minutes!: number

  @Column({ type: "int", default: 0 })
  total_sets!: number

  @Column({ type: "int", default: 0 })
  total_reps!: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total_weight_kg!: number

  @Column({ type: "decimal", precision: 8, scale: 2, default: 0 })
  total_distance_meters!: number

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  average_mood!: number

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  average_energy!: number

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  average_rpe!: number

  @Column({ type: "int", default: 0 })
  calories_burned!: number

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
  machine?: Machine
}
