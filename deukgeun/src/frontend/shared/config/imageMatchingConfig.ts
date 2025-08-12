// 이미지 매칭 설정 파일
// 새로운 머신과 이미지를 추가할 때 이 파일을 수정하면 됩니다.

export interface ImageMatchingConfig {
  defaultImage: string
  availableImages: string[]
  exactMatches: Record<string, string>
  partialMatches: Record<string, string>
}

export const IMAGE_MATCHING_CONFIG: ImageMatchingConfig = {
  // 기본 이미지 경로
  defaultImage: "/img/machine/chest-press.png",

  // 사용 가능한 이미지 파일 목록 (동적으로 확장 가능)
  availableImages: [
    "bicep-curl.png",
    "chest-press.png",
    "chin-up-and-dip-station.png",
    "chin-up.png",
    "kneeling-leg-curl.png",
    "leg-extension.png",
    "leg-press.png",
    "lat-pulldown.png",
    "plate-loaded-leg-press.png",
    "plate-loaded-squat.png",
    "shoulder-press.png",
    "squat-rack.png",
    "treadmill-running.gif",
    "plate-loaded-wide-pulldown.png",
    "Selectorized Lat Pulldown.png",
    "Selectorized leg curl.png",
    "Ground-Base-Combo-Incline.png",
  ],

  // 정확한 매칭 규칙 (우선순위 높음)
  exactMatches: {
    // 그라운드 베이스 콤보 인클라인
    "그라운드 베이스 콤보 인클라인": "Ground-Base-Combo-Incline.png",
    "ground base combo incline": "Ground-Base-Combo-Incline.png",
    "ground-base combo incline": "Ground-Base-Combo-Incline.png",

    // 랫 풀다운
    "랫 풀다운": "lat-pulldown.png",
    "lat pulldown": "lat-pulldown.png",

    // 러닝머신
    러닝머신: "treadmill-running.gif",
    treadmill: "treadmill-running.gif",

    // 레그 익스텐션
    "레그 익스텐션": "leg-extension.png",
    "leg extension": "leg-extension.png",

    // 레그 프레스
    "레그 프레스": "leg-press.png",
    "leg press": "leg-press.png",

    // 바이셉 컬
    "바이셉 컬": "bicep-curl.png",
    "bicep curl": "bicep-curl.png",

    // 니링 레그 컬
    "니링 레그 컬": "kneeling-leg-curl.png",
    "kneeling leg curl": "kneeling-leg-curl.png",

    // 숄더 프레스
    "숄더 프레스": "shoulder-press.png",
    "shoulder press": "shoulder-press.png",

    // 스쿼트 랙
    "스쿼트 랙": "squat-rack.png",
    "squat rack": "squat-rack.png",

    // 친업 앤 딥 스테이션
    "친업 앤 딥 스테이션": "chin-up-and-dip-station.png",
    "chin up and dip station": "chin-up-and-dip-station.png",

    // 플레이트 와이드 풀다운
    "플레이트 와이드 풀다운": "plate-loaded-wide-pulldown.png",
    "plate loaded wide pulldown": "plate-loaded-wide-pulldown.png",

    // 플레이트 로드 스쿼트
    "플레이트 로드 스쿼트": "plate-loaded-squat.png",
    "plate loaded squat": "plate-loaded-squat.png",

    // 체스트 프레스
    "체스트 프레스": "chest-press.png",
    "chest press": "chest-press.png",
  },

  // 부분 매칭 규칙 (우선순위 낮음)
  partialMatches: {
    // 그라운드 베이스 관련
    그라운드: "Ground-Base-Combo-Incline.png",
    ground: "Ground-Base-Combo-Incline.png",
    combo: "Ground-Base-Combo-Incline.png",
    incline: "Ground-Base-Combo-Incline.png",

    // 랫/풀다운 관련
    랫: "lat-pulldown.png",
    lat: "lat-pulldown.png",
    풀다운: "lat-pulldown.png",
    pulldown: "lat-pulldown.png",

    // 러닝머신 관련
    러닝: "treadmill-running.gif",
    running: "treadmill-running.gif",

    // 레그 관련
    레그: "leg-press.png",
    leg: "leg-press.png",
    익스텐션: "leg-extension.png",
    extension: "leg-extension.png",
    니링: "kneeling-leg-curl.png",
    kneeling: "kneeling-leg-curl.png",

    // 바이셉 관련
    바이셉: "bicep-curl.png",
    bicep: "bicep-curl.png",
    컬: "bicep-curl.png",
    curl: "bicep-curl.png",

    // 숄더 관련
    숄더: "shoulder-press.png",
    shoulder: "shoulder-press.png",

    // 스쿼트 관련
    스쿼트: "squat-rack.png",
    squat: "squat-rack.png",
    랙: "squat-rack.png",
    rack: "squat-rack.png",

    // 친업/딥 관련
    친업: "chin-up-and-dip-station.png",
    chin: "chin-up-and-dip-station.png",
    딥: "chin-up-and-dip-station.png",
    dip: "chin-up-and-dip-station.png",

    // 플레이트 관련
    플레이트: "plate-loaded-leg-press.png",
    plate: "plate-loaded-leg-press.png",
    와이드: "plate-loaded-wide-pulldown.png",
    wide: "plate-loaded-wide-pulldown.png",

    // 체스트 관련
    체스트: "chest-press.png",
    chest: "chest-press.png",
    프레스: "chest-press.png",
    press: "chest-press.png",
  },
}

// 확장성을 위한 유틸리티 함수들
export class ImageMatchingManager {
  private static instance: ImageMatchingManager
  private config: ImageMatchingConfig

  private constructor() {
    this.config = { ...IMAGE_MATCHING_CONFIG }
  }

  static getInstance(): ImageMatchingManager {
    if (!ImageMatchingManager.instance) {
      ImageMatchingManager.instance = new ImageMatchingManager()
    }
    return ImageMatchingManager.instance
  }

  // 새로운 이미지 파일 추가
  addAvailableImage(imageFileName: string): void {
    if (!this.config.availableImages.includes(imageFileName)) {
      this.config.availableImages.push(imageFileName)
    }
  }

  // 새로운 정확한 매칭 규칙 추가
  addExactMatch(keyword: string, imageFileName: string): void {
    this.config.exactMatches[keyword] = imageFileName
  }

  // 새로운 부분 매칭 규칙 추가
  addPartialMatch(keyword: string, imageFileName: string): void {
    this.config.partialMatches[keyword] = imageFileName
  }

  // 매칭 규칙 제거
  removeMatch(keyword: string, isExact: boolean = false): void {
    if (isExact) {
      delete this.config.exactMatches[keyword]
    } else {
      delete this.config.partialMatches[keyword]
    }
  }

  // 현재 설정 조회
  getConfig(): ImageMatchingConfig {
    return { ...this.config }
  }

  // 설정 초기화
  resetConfig(): void {
    this.config = { ...IMAGE_MATCHING_CONFIG }
  }

  // 배치로 매칭 규칙 추가
  addBatchMatches(
    matches: Array<{
      keyword: string
      imageFileName: string
      isExact?: boolean
    }>
  ): void {
    matches.forEach(({ keyword, imageFileName, isExact = false }) => {
      if (isExact) {
        this.addExactMatch(keyword, imageFileName)
      } else {
        this.addPartialMatch(keyword, imageFileName)
      }
    })
  }
}
