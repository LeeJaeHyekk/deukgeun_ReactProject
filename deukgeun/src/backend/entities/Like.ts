import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Post } from "@backend/entities/Post"
import { User } from "@backend/entities/User"

@Entity("post_likes")
@Unique(["postId", "userId"]) // 한 사용자당 한 포스트에 1회만 좋아요
@Index(["postId"]) // 포스트별 좋아요 조회를 위한 인덱스
@Index(["userId"]) // 사용자별 좋아요 조회를 위한 인덱스
export class Like {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  postId!: number

  @Column({ type: "int" })
  userId!: number

  @CreateDateColumn()
  createdAt!: Date

  // 관계 설정
  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post!: Post

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
