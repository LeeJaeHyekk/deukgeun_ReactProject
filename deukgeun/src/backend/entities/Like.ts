import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  Index,
} from "typeorm";

@Entity("post_likes")
@Unique(["postId", "userId"]) // 한 사용자당 한 포스트에 1회만 좋아요
export class PostLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  @Index()
  postId!: number;

  @Column({ type: "int" })
  @Index()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
