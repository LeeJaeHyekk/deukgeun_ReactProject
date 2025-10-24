// ============================================================================
// Machine Data Database Insert Script
// ============================================================================

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// JSON 파일 읽기
const machineDataPath = join(__dirname, '../machine_cards_data.json')
const machineData = JSON.parse(readFileSync(machineDataPath, 'utf8'))

console.log('🚀 기구 데이터베이스 삽입 스크립트 시작...')
console.log(`📊 총 ${machineData.length}개의 기구 데이터를 처리합니다.`)

// 각 기구 데이터를 SQL INSERT 문으로 변환
const insertStatements = machineData.map((machine: any) => {
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

  return `INSERT INTO machine (id, machineKey, name, nameKo, nameEn, imageUrl, shortDesc, detailDesc, description, instructions, positiveEffect, category, targetMuscles, difficulty, videoUrl, isActive, createdAt, updatedAt) VALUES (${values});`
})

// SQL 파일 생성
const sqlContent = `-- 기구 데이터 삽입 SQL
-- 생성일: ${new Date().toISOString()}
-- 총 ${machineData.length}개의 기구 데이터

${insertStatements.join('\n\n')}

-- 삽입 완료
SELECT COUNT(*) as total_machines FROM machine;
`

const sqlFilePath = join(__dirname, '../machine_data_insert.sql')
writeFileSync(sqlFilePath, sqlContent, 'utf8')

console.log('\n✅ SQL 파일 생성 완료!')
console.log(`📁 파일 위치: ${sqlFilePath}`)
console.log('\n📋 다음 단계:')
console.log('1. 데이터베이스에 연결')
console.log('2. 생성된 SQL 파일 실행')
console.log('3. 프론트엔드에서 데이터 확인')

// 각 기구별 요약 정보 출력
console.log('\n📊 기구 데이터 요약:')
machineData.forEach((machine: any, index: number) => {
  console.log(`${index + 1}. ${machine.nameKo} (${machine.name})`)
  console.log(`   - 카테고리: ${machine.category}`)
  console.log(`   - 난이도: ${machine.difficulty}`)
  console.log(`   - 타겟 근육: ${machine.targetMuscles?.length || 0}개`)
  console.log(`   - 사용법: ${machine.instructions?.length || 0}단계`)
  console.log(`   - 이미지: ${machine.imageUrl}`)
  console.log('')
})

console.log('🎉 스크립트 실행 완료!')
