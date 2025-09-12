// ============================================================================
// Machine Data Utilities
// ============================================================================

import type {
  EnhancedMachine,
  MachineGuide,
  MachineAnatomy,
  MachineTraining,
  MachineExtraInfo,
} from '@shared/types/machineGuide.types'

// 기본 가이드 데이터
const DEFAULT_GUIDE: MachineGuide = {
  setup: '기구를 안전하게 설정하고 적절한 무게를 선택하세요.',
  execution: [
    '올바른 자세로 시작 위치를 잡습니다.',
    '천천히 그리고 통제된 움직임으로 운동을 수행합니다.',
    '운동 범위를 끝까지 활용합니다.',
    '원래 위치로 돌아갑니다.',
  ],
  movementDirection: '운동의 주요 움직임 방향을 따라 천천히 수행하세요.',
  idealStimulus: '타겟 근육에 적절한 자극을 느끼면서 운동하세요.',
  commonMistakes: [
    '너무 빠른 속도로 운동하기',
    '부적절한 자세 유지',
    '과도한 무게 사용',
    '운동 범위를 제대로 활용하지 않기',
  ],
  breathing: '힘을 낼 때 숨을 내쉬고, 준비 자세로 돌아갈 때 숨을 들이마시세요.',
  safetyTips: [
    '운동 전 충분한 워밍업을 하세요.',
    '적절한 무게를 선택하세요.',
    '올바른 자세를 유지하세요.',
    '무리하지 말고 자신의 한계를 인정하세요.',
  ],
}

// 기본 해부학 데이터
const DEFAULT_ANATOMY: MachineAnatomy = {
  primaryMuscles: ['주요 근육'],
  secondaryMuscles: ['보조 근육'],
  antagonistMuscles: ['길항근'],
  easyExplanation: '이 운동은 주요 근육군을 타겟으로 하는 효과적인 운동입니다.',
}

// 기본 훈련 데이터
const DEFAULT_TRAINING: MachineTraining = {
  recommendedReps: '8-12회',
  recommendedSets: '3-4세트',
  restTime: '60-90초',
  variations: ['기본 변형', '난이도 조절 변형'],
  levelUpOptions: ['무게 증가', '횟수 증가', '세트 수 증가'],
  beginnerTips: [
    '가벼운 무게로 시작하세요.',
    '올바른 자세를 먼저 익히세요.',
    '점진적으로 강도를 높이세요.',
  ],
}

// 기본 추가 정보
const DEFAULT_EXTRA_INFO: MachineExtraInfo = {
  dailyUseCase: '일상생활에서의 활용도가 높은 운동입니다.',
  searchKeywords: ['운동', '헬스', '피트니스'],
}

// 카테고리별 기본 정보
const CATEGORY_DEFAULTS: Record<
  string,
  Partial<MachineGuide & MachineAnatomy & MachineTraining>
> = {
  chest: {
    setup: '벤치에 등을 대고 누워 적절한 그립을 잡으세요.',
    execution: [
      '바를 가슴 중앙 위로 천천히 내립니다.',
      '가슴 근육의 수축을 느끼며 바를 밀어 올립니다.',
      '완전히 수축된 상태에서 잠시 멈춥니다.',
      '통제된 움직임으로 원래 위치로 돌아갑니다.',
    ],
    movementDirection: '수직으로 위아래 움직임',
    idealStimulus: '가슴 근육의 수축과 이완을 명확히 느끼세요.',
    primaryMuscles: ['대흉근', '전면 삼각근'],
    secondaryMuscles: ['삼두근', '전거근'],
    antagonistMuscles: ['가슴 ↔ 등', '이두 ↔ 삼두'],
    recommendedReps: '8-12회',
    recommendedSets: '3-4세트',
    restTime: '60-90초',
    variations: ['인클라인 벤치프레스', '디클라인 벤치프레스', '덤벨 프레스'],
    levelUpOptions: ['무게 증가', '횟수 증가', '세트 수 증가'],
    beginnerTips: [
      '가벼운 무게로 시작하세요.',
      '올바른 자세를 먼저 익히세요.',
      '점진적으로 강도를 높이세요.',
    ],
  },
  back: {
    setup: '앉아서 발을 안정적으로 고정하고 적절한 그립을 잡으세요.',
    execution: [
      '어깨를 뒤로 당기며 바를 가슴 쪽으로 당깁니다.',
      '등 근육의 수축을 느끼며 천천히 당깁니다.',
      '견갑골을 모으는 느낌으로 수축합니다.',
      '통제된 움직임으로 원래 위치로 돌아갑니다.',
    ],
    movementDirection: '수평으로 당기는 움직임',
    idealStimulus: '등 근육의 수축과 이완을 명확히 느끼세요.',
    primaryMuscles: ['광배근', '중간 승모근'],
    secondaryMuscles: ['후면 삼각근', '이두근'],
    antagonistMuscles: ['등 ↔ 가슴', '이두 ↔ 삼두'],
    recommendedReps: '10-15회',
    recommendedSets: '3-4세트',
    restTime: '60-90초',
    variations: ['와이드 그립 풀다운', '클로즈 그립 풀다운', '케이블 로우'],
    levelUpOptions: ['무게 증가', '횟수 증가', '세트 수 증가'],
    beginnerTips: [
      '가벼운 무게로 시작하세요.',
      '올바른 자세를 먼저 익히세요.',
      '점진적으로 강도를 높이세요.',
    ],
  },
  legs: {
    setup: '발을 어깨 너비로 벌리고 발끝이 약간 바깥쪽을 향하도록 하세요.',
    execution: [
      '허벅지가 바닥과 평행이 될 때까지 천천히 앉습니다.',
      '무릎이 발끝을 넘지 않도록 주의하세요.',
      '허벅지 근육의 수축을 느끼며 일어섭니다.',
      '완전히 펴지지 않도록 주의하세요.',
    ],
    movementDirection: '수직으로 위아래 움직임',
    idealStimulus: '허벅지와 둔부 근육의 수축을 느끼세요.',
    primaryMuscles: ['대퇴사두근', '둔근'],
    secondaryMuscles: ['햄스트링', '종아리근육'],
    antagonistMuscles: ['대퇴사두근 ↔ 햄스트링', '둔근 ↔ 복근'],
    recommendedReps: '12-15회',
    recommendedSets: '3-4세트',
    restTime: '60-90초',
    variations: ['스쿼트', '런지', '레그 프레스'],
    levelUpOptions: ['무게 증가', '횟수 증가', '세트 수 증가'],
    beginnerTips: [
      '가벼운 무게로 시작하세요.',
      '올바른 자세를 먼저 익히세요.',
      '점진적으로 강도를 높이세요.',
    ],
  },
  shoulders: {
    setup: '앉아서 등을 곧게 펴고 적절한 무게를 선택하세요.',
    execution: [
      '어깨 높이에서 시작하여 위로 밀어 올립니다.',
      '어깨 근육의 수축을 느끼며 천천히 올립니다.',
      '완전히 수축된 상태에서 잠시 멈춥니다.',
      '통제된 움직임으로 원래 위치로 돌아갑니다.',
    ],
    movementDirection: '수직으로 위아래 움직임',
    idealStimulus: '어깨 근육의 수축과 이완을 명확히 느끼세요.',
    primaryMuscles: ['전면 삼각근', '중간 삼각근'],
    secondaryMuscles: ['후면 삼각근', '삼두근'],
    antagonistMuscles: ['전면 삼각근 ↔ 후면 삼각근', '승모근 ↔ 삼각근'],
    recommendedReps: '10-12회',
    recommendedSets: '3-4세트',
    restTime: '60-90초',
    variations: ['숄더 프레스', '사이드 레이즈', '프론트 레이즈'],
    levelUpOptions: ['무게 증가', '횟수 증가', '세트 수 증가'],
    beginnerTips: [
      '가벼운 무게로 시작하세요.',
      '올바른 자세를 먼저 익히세요.',
      '점진적으로 강도를 높이세요.',
    ],
  },
  arms: {
    setup: '앉아서 등을 곧게 펴고 적절한 무게를 선택하세요.',
    execution: [
      '팔꿈치를 고정하고 천천히 구부립니다.',
      '이두근의 수축을 느끼며 구부립니다.',
      '완전히 수축된 상태에서 잠시 멈춥니다.',
      '통제된 움직임으로 원래 위치로 돌아갑니다.',
    ],
    movementDirection: '팔꿈치 관절의 굴곡과 신전',
    idealStimulus: '이두근의 수축과 이완을 명확히 느끼세요.',
    primaryMuscles: ['이두근'],
    secondaryMuscles: ['전완근', '삼두근'],
    antagonistMuscles: ['이두근 ↔ 삼두근', '전완근 ↔ 후완근'],
    recommendedReps: '12-15회',
    recommendedSets: '3-4세트',
    restTime: '60-90초',
    variations: ['바이셉 컬', '해머 컬', '프리처 컬'],
    levelUpOptions: ['무게 증가', '횟수 증가', '세트 수 증가'],
    beginnerTips: [
      '가벼운 무게로 시작하세요.',
      '올바른 자세를 먼저 익히세요.',
      '점진적으로 강도를 높이세요.',
    ],
  },
}

// 머신 데이터 보완 함수 - 실제 데이터 우선, 기본값은 보조적으로만 사용
export function fillMachineData(machine: EnhancedMachine): EnhancedMachine {
  const category = machine.category.toLowerCase()
  const categoryDefaults = CATEGORY_DEFAULTS[category] || {}

  console.log('🔍 fillMachineData 호출:', {
    machineName: machine.name,
    category: category,
    hasGuideData: !!machine.guide,
    hasAnatomyData: !!machine.anatomy,
    hasTrainingData: !!machine.training,
    originalAntagonistMuscles: machine.anatomy?.antagonistMuscles,
    categoryDefaults: categoryDefaults,
  })

  const result = {
    ...machine,
    guide: {
      // 실제 데이터를 우선하고, 없을 때만 기본값 사용
      setup:
        getSafeText(machine.guide?.setup) ||
        categoryDefaults.setup ||
        DEFAULT_GUIDE.setup,
      execution:
        getSafeArray(machine.guide?.execution) ||
        categoryDefaults.execution ||
        DEFAULT_GUIDE.execution,
      movementDirection:
        getSafeText(machine.guide?.movementDirection) ||
        categoryDefaults.movementDirection ||
        DEFAULT_GUIDE.movementDirection,
      idealStimulus:
        getSafeText(machine.guide?.idealStimulus) ||
        categoryDefaults.idealStimulus ||
        DEFAULT_GUIDE.idealStimulus,
      commonMistakes:
        getSafeArray(machine.guide?.commonMistakes) ||
        categoryDefaults.commonMistakes ||
        DEFAULT_GUIDE.commonMistakes,
      breathing:
        getSafeText(machine.guide?.breathing) ||
        categoryDefaults.breathing ||
        DEFAULT_GUIDE.breathing,
      safetyTips:
        getSafeArray(machine.guide?.safetyTips) ||
        categoryDefaults.safetyTips ||
        DEFAULT_GUIDE.safetyTips,
    },
    anatomy: {
      // 실제 데이터를 우선하고, 없을 때만 기본값 사용
      primaryMuscles:
        getSafeArray(machine.anatomy?.primaryMuscles) ||
        categoryDefaults.primaryMuscles ||
        DEFAULT_ANATOMY.primaryMuscles,
      secondaryMuscles:
        getSafeArray(machine.anatomy?.secondaryMuscles) ||
        categoryDefaults.secondaryMuscles ||
        DEFAULT_ANATOMY.secondaryMuscles,
      antagonistMuscles:
        categoryDefaults.antagonistMuscles ||
        getSafeArray(machine.anatomy?.antagonistMuscles) ||
        DEFAULT_ANATOMY.antagonistMuscles,
      easyExplanation:
        getSafeText(machine.anatomy?.easyExplanation) ||
        categoryDefaults.easyExplanation ||
        DEFAULT_ANATOMY.easyExplanation,
    },
    training: {
      // 실제 데이터를 우선하고, 없을 때만 기본값 사용
      recommendedReps:
        getSafeText(machine.training?.recommendedReps) ||
        categoryDefaults.recommendedReps ||
        DEFAULT_TRAINING.recommendedReps,
      recommendedSets:
        getSafeText(machine.training?.recommendedSets) ||
        categoryDefaults.recommendedSets ||
        DEFAULT_TRAINING.recommendedSets,
      restTime:
        getSafeText(machine.training?.restTime) ||
        categoryDefaults.restTime ||
        DEFAULT_TRAINING.restTime,
      variations:
        getSafeArray(machine.training?.variations) ||
        categoryDefaults.variations ||
        DEFAULT_TRAINING.variations,
      levelUpOptions:
        getSafeArray(machine.training?.levelUpOptions) ||
        categoryDefaults.levelUpOptions ||
        DEFAULT_TRAINING.levelUpOptions,
      beginnerTips:
        getSafeArray(machine.training?.beginnerTips) ||
        categoryDefaults.beginnerTips ||
        DEFAULT_TRAINING.beginnerTips,
    },
    extraInfo: {
      // 실제 데이터를 우선하고, 없을 때만 기본값 사용
      dailyUseCase:
        getSafeText(machine.extraInfo?.dailyUseCase) ||
        DEFAULT_EXTRA_INFO.dailyUseCase,
      searchKeywords:
        getSafeArray(machine.extraInfo?.searchKeywords) ||
        DEFAULT_EXTRA_INFO.searchKeywords,
    },
  }

  console.log('🔍 fillMachineData 결과:', {
    machineName: result.name,
    finalAntagonistMuscles: result.anatomy.antagonistMuscles,
  })

  return result
}

// 텍스트가 비어있는지 확인하는 헬퍼 함수
export function isEmptyText(text: string | undefined | null): boolean {
  return (
    !text ||
    text.trim() === '' ||
    text.trim() === 'undefined' ||
    text.trim() === 'null'
  )
}

// 배열이 비어있는지 확인하는 헬퍼 함수
export function isEmptyArray(arr: any[] | undefined | null): boolean {
  if (!arr || arr.length === 0) {
    return true
  }
  // 모든 항목이 유효하지 않은 경우에만 true 반환
  return arr.every(
    item =>
      !item ||
      (typeof item === 'string' &&
        (item.trim() === '' || item === 'undefined' || item === 'null'))
  )
}

// 안전한 텍스트 표시 함수
export function getSafeText(
  text: string | undefined | null,
  fallback: string = '정보 없음'
): string {
  if (isEmptyText(text)) {
    return fallback
  }
  return text!.trim()
}

// 안전한 배열 표시 함수
export function getSafeArray(
  arr: any[] | undefined | null,
  fallback: string[] = ['정보 없음']
): string[] {
  if (isEmptyArray(arr)) {
    return fallback
  }
  // 빈 문자열이나 null/undefined가 아닌 유효한 값들만 필터링하고 trim 적용
  const filtered = arr!
    .filter(
      item =>
        item &&
        typeof item === 'string' &&
        item.trim() !== '' &&
        item !== 'undefined' &&
        item !== 'null'
    )
    .map(item => item.trim())

  // 필터링 후에도 빈 배열이면 fallback 반환
  return filtered.length > 0 ? filtered : fallback
}
