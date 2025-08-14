import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  postId!: number

  @Column({ type: "int" })
  userId!: number

  @Column({ type: "varchar", length: 100 })
  author!: string

  @Column({ type: "text" })
  content!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
