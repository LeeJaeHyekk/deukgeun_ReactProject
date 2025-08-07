import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Machine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  machine_key: string;

  @Column({ type: "varchar", length: 100 })
  name_ko: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  name_en: string;

  @Column({ type: "varchar", length: 255 })
  image_url: string;

  @Column({ type: "varchar", length: 255 })
  short_desc: string;

  @Column({ type: "text" })
  detail_desc: string;

  @Column({ type: "text", nullable: true })
  positive_effect: string;

  @Column({
    type: "enum",
    enum: ["상체", "하체", "전신", "기타"],
    default: "기타",
  })
  category: "상체" | "하체" | "전신" | "기타";

  @Column({ type: "json", nullable: true })
  target_muscle: string[];

  @Column({
    type: "enum",
    enum: ["초급", "중급", "고급"],
    default: "초급",
  })
  difficulty_level: "초급" | "중급" | "고급";

  @Column({ type: "varchar", length: 255, nullable: true })
  video_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
