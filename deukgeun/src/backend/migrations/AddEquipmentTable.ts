import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from "typeorm"

export class AddEquipmentTable1700000000000 implements MigrationInterface {
  name = 'AddEquipmentTable1700000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Equipment 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: "equipment",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment"
          },
          {
            name: "gymId",
            type: "int",
            isNullable: false
          },
          {
            name: "type",
            type: "enum",
            enum: ["cardio", "weight"],
            comment: "기구 타입 (유산소/웨이트)"
          },
          {
            name: "category",
            type: "enum",
            enum: [
              "treadmill",
              "bike", 
              "stepper",
              "rowing_machine",
              "cross_trainer",
              "stair_master",
              "ski_machine",
              "dumbbell",
              "barbell",
              "weight_machine",
              "smith_machine",
              "power_rack",
              "cable",
              "pull_up_bar"
            ],
            comment: "기구 카테고리"
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false
          },
          {
            name: "quantity",
            type: "int",
            default: 0,
            comment: "기구 개수"
          },
          {
            name: "brand",
            type: "varchar",
            length: "100",
            isNullable: true,
            comment: "브랜드명"
          },
          {
            name: "model",
            type: "varchar",
            length: "200",
            isNullable: true,
            comment: "모델명"
          },
          {
            name: "isLatestModel",
            type: "boolean",
            default: false,
            comment: "최신 모델 여부"
          },
          {
            name: "weightRange",
            type: "varchar",
            length: "50",
            isNullable: true,
            comment: "무게 범위 (예: 5kg~50kg)"
          },
          {
            name: "equipmentVariant",
            type: "varchar",
            length: "100",
            isNullable: true,
            comment: "기구 종류 (예: 올림픽 바, 스탠다드 바)"
          },
          {
            name: "additionalInfo",
            type: "text",
            isNullable: true,
            comment: "추가 정보"
          },
          {
            name: "confidence",
            type: "decimal",
            precision: 3,
            scale: 2,
            default: 0.8,
            comment: "데이터 신뢰도"
          },
          {
            name: "source",
            type: "varchar",
            length: "50",
            isNullable: true,
            comment: "데이터 소스"
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP"
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP"
          }
        ]
      }),
      true
    )

    // 외래키 제약조건 추가
    await queryRunner.createForeignKey(
      "equipment",
      new ForeignKey({
        columnNames: ["gymId"],
        referencedColumnNames: ["id"],
        referencedTableName: "gym",
        onDelete: "CASCADE"
      })
    )

    // 인덱스 생성
    await queryRunner.createIndex(
      "equipment",
      new Index("IDX_EQUIPMENT_GYM_ID", ["gymId"])
    )

    await queryRunner.createIndex(
      "equipment",
      new Index("IDX_EQUIPMENT_TYPE", ["type"])
    )

    await queryRunner.createIndex(
      "equipment",
      new Index("IDX_EQUIPMENT_CATEGORY", ["category"])
    )

    await queryRunner.createIndex(
      "equipment",
      new Index("IDX_EQUIPMENT_BRAND", ["brand"])
    )

    await queryRunner.createIndex(
      "equipment",
      new Index("IDX_EQUIPMENT_SOURCE", ["source"])
    )

    // 복합 인덱스
    await queryRunner.createIndex(
      "equipment",
      new Index("IDX_EQUIPMENT_GYM_TYPE", ["gymId", "type"])
    )

    await queryRunner.createIndex(
      "equipment",
      new Index("IDX_EQUIPMENT_GYM_CATEGORY", ["gymId", "category"])
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.dropIndex("equipment", "IDX_EQUIPMENT_GYM_CATEGORY")
    await queryRunner.dropIndex("equipment", "IDX_EQUIPMENT_GYM_TYPE")
    await queryRunner.dropIndex("equipment", "IDX_EQUIPMENT_SOURCE")
    await queryRunner.dropIndex("equipment", "IDX_EQUIPMENT_BRAND")
    await queryRunner.dropIndex("equipment", "IDX_EQUIPMENT_CATEGORY")
    await queryRunner.dropIndex("equipment", "IDX_EQUIPMENT_TYPE")
    await queryRunner.dropIndex("equipment", "IDX_EQUIPMENT_GYM_ID")

    // 외래키 제약조건 삭제
    const table = await queryRunner.getTable("equipment")
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("gymId") !== -1)
    if (foreignKey) {
      await queryRunner.dropForeignKey("equipment", foreignKey)
    }

    // 테이블 삭제
    await queryRunner.dropTable("equipment")
  }
}
