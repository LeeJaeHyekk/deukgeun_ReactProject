import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "./User"

@Entity("user_levels")
export class UserLevel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "int", default: 1 })
  level!: number

  @Column({ type: "int", default: 0 })
  currentExp!: number

  @Column({ type: "int", default: 0 })
  totalExp!: number

  @Column({ type: "int", default: 0 })
  seasonExp!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
