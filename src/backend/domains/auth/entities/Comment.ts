// ============================================================================
// Comment Entity
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "./User"

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  postId!: number

  @Column({ type: "int" })
  userId!: number

  @Column({ type: "text" })
  content!: string

  @Column({ type: "int", nullable: true })
  parentId?: number

  @Column({ type: "int", default: 0 })
  likesCount!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User
}
