// ============================================================================
// Machine Data Update Script (Final Version with Date Fix)
// ============================================================================

const { readFileSync, writeFileSync } = require('fs')
const { join, dirname } = require('path')

// JSON 파일 읽기
const machineDataPath = join(__dirname, '../machine_cards_data.json')
const machineData = JSON.parse(readFileSync(machineDataPath, 'utf8'))

console.log('🚀 기구 데이터 업데이트 스크립트 시작...')
console.log(`📊 총 ${machineData.length}개의 기구 데이터를 처리합니다.`)

// 카테고리 매핑 함수
function mapCategory(category) {
  const categoryMap = {
    'strength': 'fullbody',
    'cardio': 'cardio'
  }
  return categoryMap[category] || 'fullbody'
}

// 날짜 형식 변환 함수
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

// 각 기구 데이터를 SQL UPDATE/INSERT 문으로 변환
const sqlStatements = []

// 먼저 기존 데이터 삭제
sqlStatements.push('-- 기존 기구 데이터 삭제')
sqlStatements.push('DELETE FROM machines;')
sqlStatements.push('')

// 새 데이터 삽입
sqlStatements.push('-- 새로운 기구 데이터 삽입')
machineData.forEach((machine) => {
  const values = [
    machine.id,
    `'${machine.machineKey}'`,
    `'${machine.name.replace(/'/g, "''")}'`,
    machine.nameKo ? `'${machine.nameKo.replace(/'/g, "''")}'` : 'NULL',
    machine.nameEn ? `'${machine.nameEn.replace(/'/g, "''")}'` : 'NULL',
    `'${machine.imageUrl}'`,
    `'${machine.shortDesc.replace(/'/g, "''")}'`,
    `'${machine.detailDesc.replace(/'/g, "''")}'`,
    machine.positiveEffect ? `'${machine.positiveEffect.replace(/'/g, "''")}'` : 'NULL',
    `'${mapCategory(machine.category)}'`,
    machine.targetMuscles ? `'${JSON.stringify(machine.targetMuscles).replace(/'/g, "''")}'` : 'NULL',
    `'${machine.difficulty}'`,
    machine.videoUrl ? `'${machine.videoUrl}'` : 'NULL',
    machine.isActive ? '1' : '0',
    `'${formatDate(machine.createdAt)}'`,
    `'${formatDate(machine.updatedAt)}'`
  ].join(', ')

  sqlStatements.push(`INSERT INTO machines (id, machineKey, name, nameKo, nameEn, imageUrl, shortDesc, detailDesc, positiveEffect, category, targetMuscles, difficulty, videoUrl, isActive, createdAt, updatedAt) VALUES (${values});`)
})

// SQL 파일 생성
const sqlContent = `-- 기구 데이터 업데이트 SQL (최종 수정됨)
-- 생성일: ${new Date().toISOString()}
-- 총 ${machineData.length}개의 기구 데이터

${sqlStatements.join('\n\n')}

-- 업데이트 완료
SELECT COUNT(*) as total_machines FROM machines;
`

const sqlFilePath = join(__dirname, '../machine_data_update_final.sql')
writeFileSync(sqlFilePath, sqlContent, 'utf8')

console.log('\n✅ SQL 파일 생성 완료!')
console.log(`📁 파일 위치: ${sqlFilePath}`)
console.log('\n📋 다음 단계:')
console.log('1. 데이터베이스에 연결')
console.log('2. 생성된 SQL 파일 실행')
console.log('3. 프론트엔드에서 28개 카드 확인')

console.log('🎉 스크립트 실행 완료!')
