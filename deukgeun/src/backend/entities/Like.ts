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
// 순환 import 방지를 위해 문자열 기반 관계 정의 사용
// import { Post } from "./Post"
// import { User } from "./User"

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

  // 관계 설정 - 순환 import 방지를 위해 문자열 기반 관계 정의 사용
  @ManyToOne("Post", { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post!: any

  @ManyToOne("User", { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: any
}
