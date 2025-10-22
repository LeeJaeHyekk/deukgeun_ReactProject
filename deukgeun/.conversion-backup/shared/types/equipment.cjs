// ============================================================================
// 기구 관련 타입 정의
// ============================================================================

const EquipmentType = {
  CARDIO = "cardio", WEIGHT = "weight"
}
module.exports.EquipmentType = EquipmentType

const EquipmentCategory = {
  // 유산소 기구
  TREADMILL = "treadmill", BIKE = "bike", STEPPER = "stepper", ROWING_MACHINE = "rowing_machine", CROSS_TRAINER = "cross_trainer", STAIR_MASTER = "stair_master", SKI_MACHINE = "ski_machine", // 웨이트 기구
  DUMBBELL = "dumbbell", BARBELL = "barbell", WEIGHT_MACHINE = "weight_machine", SMITH_MACHINE = "smith_machine", POWER_RACK = "power_rack", CABLE = "cable", PULL_UP_BAR = "pull_up_bar"
}
module.exports.EquipmentCategory = EquipmentCategory

// 기구 기본 정보

// 기구 생성 DTO

// 기구 업데이트 DTO

// 기구 응답 DTO

// 기구 목록 응답 DTO

// 헬스장 기구 요약 정보

  weightEquipment: {
    total: number
    byCategory: Record<EquipmentCategory, number>
  }
  equipmentDetails: EquipmentDTO[]
}

// 크롤링된 기구 정보

// 기구 검색 필터

// 기구 통계 정보
[]
  brandDistribution: {
    brand: string
    count: number
  }[]
  equipmentByType: {
    type: EquipmentType
    count: number
    percentage: number
  }[]
}