import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("user_streaks")
export class UserStreak {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  @Index()
  userId!: number;

  @Column({ type: "varchar", length: 50 })
  @Index()
  streakType!: string;

  @Column({ type: "int", default: 0 })
  currentCount!: number;

  @Column({ type: "timestamp" })
  lastActivity!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;
}
