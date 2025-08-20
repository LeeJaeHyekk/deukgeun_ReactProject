import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  OneToMany,
} from "typeorm"
import type { UserRole, Gender } from "../../shared/types/auth"
import { UserLevel } from "./UserLevel"
import { ExpHistory } from "./ExpHistory"
import { UserReward } from "./UserReward"
import { Milestone } from "./Milestone"
import { UserStreak } from "./UserStreak"
import { Comment } from "./Comment"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", unique: true })
  email!: string

  @Column({ type: "varchar" })
  password!: string

  @Column({ type: "varchar", unique: true })
  nickname!: string

  @Column({ type: "varchar", nullable: true })
  phone?: string

  @Column({ type: "enum", enum: ["male", "female", "other"], nullable: true })
  gender?: Gender

  @Column({ type: "date", nullable: true })
  birthday?: Date

  @Column({ type: "varchar", nullable: true })
  profileImage?: string

  @Column({
    type: "enum",
    enum: ["user", "admin", "moderator"],
    default: "user",
  })
  role!: UserRole

  // 계정 상태
  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @Column({ type: "boolean", default: false })
  isEmailVerified!: boolean

  @Column({ type: "boolean", default: false })
  isPhoneVerified!: boolean

  // 계정 복구 관련 필드
  @Column({ type: "varchar", nullable: true })
  name?: string

  @Column({ type: "varchar", nullable: true })
  username?: string

  // 마지막 활동 시간
  @Column({ type: "datetime", nullable: true })
  lastLoginAt?: Date

  @Column({ type: "datetime", nullable: true })
  lastActivityAt?: Date

  // 로그인 시도 관련
  @Column({ type: "int", default: 0 })
  loginAttempts!: number

  @Column({ type: "datetime", nullable: true })
  lockedUntil?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @OneToOne(() => UserLevel, userLevel => userLevel.user, { cascade: true })
  userLevel!: UserLevel

  @OneToMany(() => ExpHistory, expHistory => expHistory.user, { cascade: true })
  expHistory!: ExpHistory[]

  @OneToMany(() => UserReward, userReward => userReward.user, { cascade: true })
  userRewards!: UserReward[]

  @OneToMany(() => Milestone, milestone => milestone.user, { cascade: true })
  milestones!: Milestone[]

  @OneToMany(() => UserStreak, userStreak => userStreak.user, { cascade: true })
  userStreaks!: UserStreak[]

  @OneToMany(() => Comment, comment => comment.user, { cascade: true })
  comments!: Comment[]
}
