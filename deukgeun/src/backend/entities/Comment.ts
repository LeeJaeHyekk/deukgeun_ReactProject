import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "@backend/entities/User"

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  postId!: number

  @Column({ type: "int" })
  userId!: number

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  @Column({ type: "varchar", length: 100 })
  author!: string

  @Column({ type: "text" })
  content!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
