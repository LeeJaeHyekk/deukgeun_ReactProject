import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateMachineEntityForEnhancedData1703123456790
  implements MigrationInterface
{
  name = 'UpdateMachineEntityForEnhancedData1703123456790'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 불필요한 컬럼들 제거
    await queryRunner.dropColumn('machines', 'nameKo')
    await queryRunner.dropColumn('machines', 'detailDesc')
    await queryRunner.dropColumn('machines', 'positiveEffect')
    await queryRunner.dropColumn('machines', 'targetMuscles')

    // nameEn을 nullable에서 not null로 변경
    await queryRunner.changeColumn(
      'machines',
      'nameEn',
      new TableColumn({
        name: 'nameEn',
        type: 'varchar',
        length: '100',
        isNullable: false,
      })
    )

    // 새로운 JSON 컬럼들 추가
    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'anatomy',
        type: 'json',
        isNullable: false,
      })
    )

    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'guide',
        type: 'json',
        isNullable: false,
      })
    )

    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'training',
        type: 'json',
        isNullable: false,
      })
    )

    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'extraInfo',
        type: 'json',
        isNullable: false,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 새로운 JSON 컬럼들 제거
    await queryRunner.dropColumn('machines', 'extraInfo')
    await queryRunner.dropColumn('machines', 'training')
    await queryRunner.dropColumn('machines', 'guide')
    await queryRunner.dropColumn('machines', 'anatomy')

    // nameEn을 nullable로 되돌리기
    await queryRunner.changeColumn(
      'machines',
      'nameEn',
      new TableColumn({
        name: 'nameEn',
        type: 'varchar',
        length: '100',
        isNullable: true,
      })
    )

    // 기존 컬럼들 복원
    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'nameKo',
        type: 'varchar',
        length: '100',
        isNullable: true,
      })
    )

    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'detailDesc',
        type: 'text',
        isNullable: false,
      })
    )

    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'positiveEffect',
        type: 'text',
        isNullable: true,
      })
    )

    await queryRunner.addColumn(
      'machines',
      new TableColumn({
        name: 'targetMuscles',
        type: 'json',
        isNullable: true,
      })
    )
  }
}
