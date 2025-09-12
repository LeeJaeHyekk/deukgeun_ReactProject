#!/usr/bin/env node

/**
 * 머신 데이터 관리 스크립트
 *
 * 사용법:
 * node scripts/manage-machines.js add chest "새로운 머신"
 * node scripts/manage-machines.js list chest
 * node scripts/manage-machines.js validate
 * node scripts/manage-machines.js stats
 */

const fs = require('fs')
const path = require('path')

const MACHINES_DIR = path.join(__dirname, '../src/shared/data/machines')

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * 머신 데이터 파일 경로를 반환합니다.
 */
function getMachineFilePath(category) {
  return path.join(MACHINES_DIR, `${category}-machines.json`)
}

/**
 * 머신 데이터를 로드합니다.
 */
function loadMachineData(category) {
  const filePath = getMachineFilePath(category)

  if (!fs.existsSync(filePath)) {
    log(`❌ ${category} 카테고리 파일이 존재하지 않습니다: ${filePath}`, 'red')
    return null
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    log(
      `❌ ${category} 카테고리 파일을 읽는 중 오류 발생: ${error.message}`,
      'red'
    )
    return null
  }
}

/**
 * 머신 데이터를 저장합니다.
 */
function saveMachineData(category, data) {
  const filePath = getMachineFilePath(category)

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    log(`✅ ${category} 카테고리 데이터가 저장되었습니다.`, 'green')
    return true
  } catch (error) {
    log(
      `❌ ${category} 카테고리 데이터 저장 중 오류 발생: ${error.message}`,
      'red'
    )
    return false
  }
}

/**
 * 새로운 머신을 추가합니다.
 */
function addMachine(category, machineName) {
  const data = loadMachineData(category)
  if (!data) return false

  // 새로운 ID 생성
  const newId = Math.max(...data.machines.map(m => m.id), 0) + 1

  // 새로운 머신 템플릿
  const newMachine = {
    id: newId,
    machineKey: `${category}_${machineName.toLowerCase().replace(/\s+/g, '_')}_${String(newId).padStart(3, '0')}`,
    name: machineName,
    nameKo: machineName,
    nameEn: machineName,
    imageUrl: `/img/machine/${machineName.toLowerCase().replace(/\s+/g, '-')}.png`,
    shortDesc: `${machineName}에 대한 설명을 입력하세요.`,
    category: category,
    difficulty: 'beginner',
    isActive: true,

    anatomy: {
      primaryMuscles: ['주요 근육을 입력하세요'],
      secondaryMuscles: ['보조 근육을 입력하세요'],
      antagonistMuscles: ['길항 근육을 입력하세요'],
      easyExplanation: '쉬운 설명을 입력하세요.',
    },

    guide: {
      setup: '설정 방법을 입력하세요.',
      execution: ['실행 방법 1', '실행 방법 2'],
      movementDirection: '움직임 방향을 입력하세요.',
      idealStimulus: '이상적인 자극을 입력하세요.',
      commonMistakes: ['흔한 실수 1', '흔한 실수 2'],
      breathing: '호흡법을 입력하세요.',
      safetyTips: ['안전 팁 1', '안전 팁 2'],
    },

    training: {
      recommendedReps: '8~12회',
      recommendedSets: '3세트',
      restTime: '60~90초',
      variations: ['변형 운동 1', '변형 운동 2'],
      levelUpOptions: ['난이도 상승 옵션 1', '난이도 상승 옵션 2'],
      beginnerTips: ['초보자 팁 1', '초보자 팁 2'],
    },

    extraInfo: {
      dailyUseCase: '일상생활에서의 활용을 입력하세요.',
      searchKeywords: [machineName, '관련 키워드'],
    },
  }

  data.machines.push(newMachine)

  if (saveMachineData(category, data)) {
    log(
      `✅ 새로운 머신이 추가되었습니다: ${machineName} (ID: ${newId})`,
      'green'
    )
    log(
      `📝 ${getMachineFilePath(category)} 파일을 편집하여 상세 정보를 입력하세요.`,
      'yellow'
    )
    return true
  }

  return false
}

/**
 * 카테고리별 머신 목록을 출력합니다.
 */
function listMachines(category) {
  const data = loadMachineData(category)
  if (!data) return

  log(`\n📋 ${category.toUpperCase()} 카테고리 머신 목록:`, 'cyan')
  log('=' * 50, 'cyan')

  data.machines.forEach(machine => {
    const status = machine.isActive ? '✅' : '❌'
    log(
      `${status} [${machine.id}] ${machine.nameKo} (${machine.difficulty})`,
      'bright'
    )
    log(`   Key: ${machine.machineKey}`, 'blue')
    log(`   설명: ${machine.shortDesc}`, 'reset')
    log('')
  })
}

/**
 * 모든 머신 데이터를 검증합니다.
 */
function validateMachines() {
  const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'cardio']
  let totalMachines = 0
  let validMachines = 0
  let errors = []

  log('\n🔍 머신 데이터 검증 중...', 'cyan')
  log('=' * 50, 'cyan')

  categories.forEach(category => {
    const data = loadMachineData(category)
    if (!data) {
      errors.push(`${category}: 파일을 읽을 수 없음`)
      return
    }

    data.machines.forEach(machine => {
      totalMachines++

      // 필수 필드 검증
      const requiredFields = [
        'id',
        'machineKey',
        'name',
        'nameKo',
        'nameEn',
        'category',
        'difficulty',
      ]
      const missingFields = requiredFields.filter(field => !machine[field])

      if (missingFields.length > 0) {
        errors.push(
          `${category}/${machine.name}: 필수 필드 누락 - ${missingFields.join(', ')}`
        )
        return
      }

      // 구조 검증
      if (
        !machine.anatomy ||
        !machine.guide ||
        !machine.training ||
        !machine.extraInfo
      ) {
        errors.push(`${category}/${machine.name}: 구조 정보 누락`)
        return
      }

      validMachines++
    })
  })

  log(`\n📊 검증 결과:`, 'bright')
  log(`   전체 머신: ${totalMachines}개`, 'blue')
  log(`   유효한 머신: ${validMachines}개`, 'green')
  log(`   오류: ${errors.length}개`, errors.length > 0 ? 'red' : 'green')

  if (errors.length > 0) {
    log('\n❌ 발견된 오류:', 'red')
    errors.forEach(error => log(`   - ${error}`, 'red'))
  } else {
    log('\n✅ 모든 머신 데이터가 유효합니다!', 'green')
  }
}

/**
 * 머신 통계를 출력합니다.
 */
function showStats() {
  const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'cardio']
  let totalMachines = 0
  let activeMachines = 0
  const categoryStats = {}
  const difficultyStats = {}

  log('\n📊 머신 통계:', 'cyan')
  log('=' * 50, 'cyan')

  categories.forEach(category => {
    const data = loadMachineData(category)
    if (!data) return

    const categoryCount = data.machines.length
    const activeCount = data.machines.filter(m => m.isActive).length

    categoryStats[category] = categoryCount
    totalMachines += categoryCount
    activeMachines += activeCount

    data.machines.forEach(machine => {
      difficultyStats[machine.difficulty] =
        (difficultyStats[machine.difficulty] || 0) + 1
    })

    log(
      `${category.toUpperCase()}: ${categoryCount}개 (활성: ${activeCount}개)`,
      'blue'
    )
  })

  log(`\n📈 전체 통계:`, 'bright')
  log(`   전체 머신: ${totalMachines}개`, 'blue')
  log(`   활성 머신: ${activeMachines}개`, 'green')
  log(`   비활성 머신: ${totalMachines - activeMachines}개`, 'yellow')

  log(`\n🎯 난이도별 분포:`, 'bright')
  Object.entries(difficultyStats).forEach(([difficulty, count]) => {
    log(`   ${difficulty}: ${count}개`, 'blue')
  })
}

/**
 * 도움말을 출력합니다.
 */
function showHelp() {
  log('\n🛠️  머신 데이터 관리 도구', 'cyan')
  log('=' * 50, 'cyan')
  log('사용법:', 'bright')
  log('  node scripts/manage-machines.js <명령어> [옵션]', 'blue')
  log('')
  log('명령어:', 'bright')
  log('  add <카테고리> <머신이름>  - 새로운 머신 추가', 'green')
  log('  list <카테고리>           - 카테고리별 머신 목록', 'green')
  log('  validate                  - 모든 머신 데이터 검증', 'green')
  log('  stats                     - 머신 통계 출력', 'green')
  log('  help                      - 도움말 출력', 'green')
  log('')
  log('카테고리:', 'bright')
  log('  chest, back, legs, shoulders, arms, cardio', 'blue')
  log('')
  log('예시:', 'bright')
  log(
    '  node scripts/manage-machines.js add chest "인클라인 벤치프레스"',
    'yellow'
  )
  log('  node scripts/manage-machines.js list chest', 'yellow')
  log('  node scripts/manage-machines.js validate', 'yellow')
}

// 메인 실행 부분
const command = process.argv[2]

switch (command) {
  case 'add':
    const category = process.argv[3]
    const machineName = process.argv[4]

    if (!category || !machineName) {
      log(
        '❌ 사용법: node scripts/manage-machines.js add <카테고리> <머신이름>',
        'red'
      )
      process.exit(1)
    }

    addMachine(category, machineName)
    break

  case 'list':
    const listCategory = process.argv[3]

    if (!listCategory) {
      log('❌ 사용법: node scripts/manage-machines.js list <카테고리>', 'red')
      process.exit(1)
    }

    listMachines(listCategory)
    break

  case 'validate':
    validateMachines()
    break

  case 'stats':
    showStats()
    break

  case 'help':
  case '--help':
  case '-h':
    showHelp()
    break

  default:
    log('❌ 알 수 없는 명령어입니다.', 'red')
    showHelp()
    process.exit(1)
}
