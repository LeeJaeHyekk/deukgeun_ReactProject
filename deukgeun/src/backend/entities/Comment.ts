import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm"

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  postId!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "varchar", length: 100 })
  author!: string

  @Column({ type: "text" })
  content!: string

  @CreateDateColumn()
  @Index()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
