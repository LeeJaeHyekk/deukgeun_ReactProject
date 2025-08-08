import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("user_rewards")
export class UserReward {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  @Index()
  userId!: number;

  @Column({ type: "varchar", length: 50 })
  rewardType!: string;

  @Column({ type: "varchar", length: 100 })
  rewardId!: string;

  @CreateDateColumn()
  @Index()
  claimedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date;

  @Column({ type: "json", nullable: true })
  metadata?: any;

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;
}
