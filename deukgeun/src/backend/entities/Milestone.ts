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

@Entity("milestones")
export class Milestone {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  @Index()
  userId!: number;

  @Column({ type: "varchar", length: 50 })
  @Index()
  milestoneType!: string;

  @Column({ type: "varchar", length: 100 })
  milestoneId!: string;

  @CreateDateColumn()
  @Index()
  achievedAt!: Date;

  @Column({ type: "json", nullable: true })
  metadata?: any;

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;
}
