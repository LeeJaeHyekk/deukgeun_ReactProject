import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddGymSearchIndexes1735000000000 implements MigrationInterface {
  name = 'AddGymSearchIndexes1735000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 헬스장명 검색을 위한 인덱스 (LIKE 검색 최적화)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_name_search 
      ON gym (name) 
      USING BTREE
    `)

    // 2. 주소 검색을 위한 인덱스 (지역 필터링 최적화)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_address_search 
      ON gym (address) 
      USING BTREE
    `)

    // 3. 위치 기반 검색을 위한 복합 인덱스 (위도, 경도)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_location 
      ON gym (latitude, longitude) 
      USING BTREE
    `)

    // 4. 시설 정보 검색을 위한 인덱스들
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_24hours 
      ON gym (is24Hours) 
      USING BTREE
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_pt 
      ON gym (hasPT) 
      USING BTREE
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_gx 
      ON gym (hasGX) 
      USING BTREE
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_parking 
      ON gym (hasParking) 
      USING BTREE
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_shower 
      ON gym (hasShower) 
      USING BTREE
    `)

    // 5. 복합 검색을 위한 인덱스 (이름 + 위치)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_name_location 
      ON gym (name, latitude, longitude) 
      USING BTREE
    `)

    // 6. 시설 복합 검색을 위한 인덱스
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gym_facilities 
      ON gym (is24Hours, hasPT, hasGX, hasParking, hasShower) 
      USING BTREE
    `)

    console.log('✅ 헬스장 검색 최적화 인덱스가 성공적으로 생성되었습니다.')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 제거
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_name_search`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_address_search`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_location`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_24hours`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_pt`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_gx`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_parking`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_shower`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_name_location`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gym_facilities`)

    console.log('✅ 헬스장 검색 최적화 인덱스가 제거되었습니다.')
  }
}
