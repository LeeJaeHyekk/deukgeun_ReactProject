import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "./User"
import { Like } from "./Like"
import type { PostCategory } from "../types/dto"

/**
 * 포스트 엔티티 클래스
 * TypeORM을 사용하여 데이터베이스의 posts 테이블과 매핑됩니다.
 * 커뮤니티 게시판의 포스트 정보를 저장합니다.
 */
@Entity("posts")
export class Post {
  /**
   * 포스트의 고유 식별자 (Primary Key)
   * 자동으로 증가하는 정수값으로 설정됩니다.
   */
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * 포스트 제목
   * 최대 255자까지 저장 가능한 문자열입니다.
   */
  @Column({ type: "varchar", length: 255 })
  title!: string

  /**
   * 포스트 내용
   * 긴 텍스트를 저장할 수 있는 text 타입입니다.
   */
  @Column({ type: "text" })
  content!: string

  /**
   * 포스트 작성자
   * 최대 100자까지 저장 가능한 문자열입니다.
   */
  @Column({ type: "varchar", length: 100 })
  author!: string

  /**
   * 포스트 작성자 ID
   * 사용자 테이블과의 외래키 관계를 위한 필드입니다.
   */
  @Column({ type: "int" })
  userId!: number

  // 추가 필드들
  @Column({
    type: "enum",
    enum: [
      "general",
      "workout",
      "nutrition",
      "motivation",
      "tips",
      "questions",
      "achievements",
      "challenges",
    ],
    default: "general",
  })
  @Index()
  category!: PostCategory

  @Column({ type: "json", nullable: true })
  tags?: string[]

  @Column({ type: "varchar", length: 255, nullable: true })
  thumbnail_url?: string

  @Column({ type: "json", nullable: true })
  images?: string[]

  @Column({ type: "int", default: 0 })
  @Index()
  like_count!: number

  @Column({ type: "int", default: 0 })
  comment_count!: number

  /**
   * 포스트 생성 시간
   * 엔티티가 처음 저장될 때 자동으로 설정됩니다.
   */
  @CreateDateColumn()
  @Index()
  createdAt!: Date

  /**
   * 포스트 수정 시간
   * 엔티티가 업데이트될 때마다 자동으로 갱신됩니다.
   */
  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  // 좋아요 관계
  @OneToMany(() => Like, like => like.post)
  likes!: Like[]
}
