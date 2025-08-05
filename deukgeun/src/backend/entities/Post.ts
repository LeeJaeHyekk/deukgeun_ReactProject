import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

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
  id!: number;

  /**
   * 포스트 제목
   * 최대 255자까지 저장 가능한 문자열입니다.
   */
  @Column({ type: "varchar", length: 255 })
  title!: string;

  /**
   * 포스트 내용
   * 긴 텍스트를 저장할 수 있는 text 타입입니다.
   */
  @Column({ type: "text" })
  content!: string;

  /**
   * 포스트 작성자
   * 최대 100자까지 저장 가능한 문자열입니다.
   */
  @Column({ type: "varchar", length: 100 })
  author!: string;

  /**
   * 포스트 작성자 ID
   * 사용자 테이블과의 외래키 관계를 위한 필드입니다.
   */
  @Column({ type: "int" })
  userId!: number;

  /**
   * 포스트 생성 시간
   * 엔티티가 처음 저장될 때 자동으로 설정됩니다.
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * 포스트 수정 시간
   * 엔티티가 업데이트될 때마다 자동으로 갱신됩니다.
   */
  @UpdateDateColumn()
  updatedAt!: Date;
}
