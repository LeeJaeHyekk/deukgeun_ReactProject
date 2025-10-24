// ============================================================================
// Database Reset Script
// ============================================================================

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 데이터베이스 초기화 스크립트 시작...')

// JSON 파일 읽기
const machineDataPath = join(__dirname, '../machine_cards_data.json')
const machineData = JSON.parse(readFileSync(machineDataPath, 'utf8'))

console.log(`📊 총 ${machineData.length}개의 기구 데이터를 처리합니다.`)

// 데이터베이스 초기화 SQL 생성
const resetSQL = `-- 데이터베이스 초기화 SQL
-- 생성일: ${new Date().toISOString()}

-- 1. 기존 데이터 삭제
DELETE FROM machines;
DELETE FROM workout_plan_exercises;
DELETE FROM workout_plans;
DELETE FROM user_levels;
DELETE FROM user_rewards;
DELETE FROM user_streaks;
DELETE FROM exp_history;
DELETE FROM posts;
DELETE FROM comments;
DELETE FROM gyms;
DELETE FROM users;

-- 2. AUTO_INCREMENT 리셋
ALTER TABLE machines AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE gyms AUTO_INCREMENT = 1;
ALTER TABLE workout_plans AUTO_INCREMENT = 1;
ALTER TABLE posts AUTO_INCREMENT = 1;

-- 3. 새로운 기구 데이터 삽입
${machineData.map((machine: any) => {
  const values = [
    machine.id,
    `'${machine.machineKey}'`,
    `'${machine.name}'`,
    machine.nameKo ? `'${machine.nameKo}'` : 'NULL',
    machine.nameEn ? `'${machine.nameEn}'` : 'NULL',
    `'${machine.imageUrl}'`,
    `'${machine.shortDesc}'`,
    `'${machine.detailDesc}'`,
    machine.description ? `'${machine.description}'` : 'NULL',
    machine.instructions ? `'${JSON.stringify(machine.instructions)}'` : 'NULL',
    machine.positiveEffect ? `'${machine.positiveEffect}'` : 'NULL',
    `'${machine.category}'`,
    machine.targetMuscles ? `'${JSON.stringify(machine.targetMuscles)}'` : 'NULL',
    `'${machine.difficulty}'`,
    machine.videoUrl ? `'${machine.videoUrl}'` : 'NULL',
    machine.isActive ? '1' : '0',
    `'${machine.createdAt}'`,
    `'${machine.updatedAt}'`
  ].join(', ')

  return `INSERT INTO machines (id, machineKey, name, nameKo, nameEn, imageUrl, shortDesc, detailDesc, description, instructions, positiveEffect, category, targetMuscles, difficulty, videoUrl, isActive, createdAt, updatedAt) VALUES (${values});`
}).join('\n\n')}

-- 4. 삽입 완료 확인
SELECT COUNT(*) as total_machines FROM machines;
SELECT '데이터베이스 초기화 완료!' as status;
`

// SQL 파일 생성
const sqlFilePath = join(__dirname, '../database_reset.sql')
import { writeFileSync } from 'fs'
writeFileSync(sqlFilePath, resetSQL, 'utf8')

console.log('\n✅ 데이터베이스 초기화 SQL 파일 생성 완료!')
console.log(`📁 파일 위치: ${sqlFilePath}`)
console.log('\n📋 다음 단계:')
console.log('1. 서버 중지 (Ctrl+C)')
console.log('2. 데이터베이스에서 SQL 파일 실행')
console.log('3. 서버 재시작 (npm start)')
console.log('4. 프론트엔드에서 28개 카드 확인')

// 각 기구별 요약 정보 출력
console.log('\n📊 기구 데이터 요약:')
machineData.forEach((machine: any, index: number) => {
  console.log(`${index + 1}. ${machine.nameKo} (${machine.name})`)
  console.log(`   - 카테고리: ${machine.category}`)
  console.log(`   - 난이도: ${machine.difficulty}`)
  console.log(`   - 이미지: ${machine.imageUrl}`)
  console.log('')
})

console.log('🎉 스크립트 실행 완료!')
