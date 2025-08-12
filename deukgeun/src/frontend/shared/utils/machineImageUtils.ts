import { Machine } from "../types/machine"

// 이미지 매칭 결과 캐시
const imageCache = new Map<string, string>()

// 이미지 로딩 실패 추적 (무한 루프 방지)
const failedImages = new Set<string>()

// 머신 이름과 이미지 파일명 매핑 함수
export function findMatchingImage(machine: Machine): string {
  // 디버깅을 위한 로그 추가
  console.log("🔍 findMatchingImage 호출:", {
    id: machine.id,
    name_ko: machine.name_ko,
    name_en: machine.name_en,
    image_url: machine.image_url,
  })

  // 캐시 키 생성
  const cacheKey = `${machine.id}-${machine.name_ko}-${machine.name_en || ""}-${machine.image_url || ""}`

  // 캐시된 결과가 있으면 반환
  if (imageCache.has(cacheKey)) {
    console.log("✅ 캐시된 결과 사용:", imageCache.get(cacheKey))
    return imageCache.get(cacheKey)!
  }

  let result: string

  // 1. DB에 이미지 URL이 있고 기본값이 아닌 경우 우선 사용
  if (
    machine.image_url &&
    machine.image_url !== "/img/machine/chest-press.png"
  ) {
    console.log("📸 DB 이미지 URL 사용:", machine.image_url)
    result = machine.image_url
  } else {
    const machineName = machine.name_ko.toLowerCase().trim()
    const machineNameEn = machine.name_en?.toLowerCase().trim() || ""

    console.log("🔍 로컬 이미지 매칭 시도:", { machineName, machineNameEn })

    // 2. img/machine 폴더에서 기구 이름이 포함된 이미지 찾기
    const matchedImage = findImageByMachineName(machineName, machineNameEn)
    if (matchedImage) {
      console.log("✅ 로컬 이미지 매칭 성공:", matchedImage)
      result = matchedImage
    } else {
      console.log("❌ 매칭 실패, 기본 이미지 사용")
      // 3. 기본 이미지 반환
      result = "/img/machine/chest-press.png"
    }
  }

  console.log("🎯 최종 이미지 경로:", result)

  // 결과를 캐시에 저장
  imageCache.set(cacheKey, result)

  // 캐시 크기 제한 (메모리 누수 방지)
  if (imageCache.size > 1000) {
    const firstKey = imageCache.keys().next().value
    if (firstKey) {
      imageCache.delete(firstKey)
    }
  }

  return result
}

// 기구 이름으로 이미지 파일 찾기 (개선된 버전)
function findImageByMachineName(
  machineName: string,
  machineNameEn: string
): string | null {
  // 실제 데이터베이스에 있는 이미지 파일들 (테스트 결과 기반)
  const availableImages = [
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
  ]

  // 정확한 매칭을 위한 키워드 매핑 (우선순위 순서)
  const exactMatches: Record<string, string> = {
    // 그라운드 베이스 콤보 인클라인 (실제 데이터에 있는 머신)
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
  }

  // 1. 정확한 매칭 시도
  for (const [key, imageFile] of Object.entries(exactMatches)) {
    if (machineName.includes(key) || machineNameEn.includes(key)) {
      return `/img/machine/${imageFile}`
    }
  }

  // 2. 부분 매칭 시도 (더 구체적인 키워드부터)
  const partialMatches: Record<string, string> = {
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
  }

  // 부분 매칭 시도 (긴 키워드부터)
  const sortedKeys = Object.keys(partialMatches).sort(
    (a, b) => b.length - a.length
  )
  for (const key of sortedKeys) {
    if (machineName.includes(key) || machineNameEn.includes(key)) {
      return `/img/machine/${partialMatches[key]}`
    }
  }

  return null
}

// 전체 이미지 URL 생성 함수
export function getFullImageUrl(imagePath: string): string {
  return imagePath.startsWith("http")
    ? imagePath
    : `http://localhost:5000${imagePath}`
}

// 이미지 로드 실패 시 기본 이미지로 대체하는 핸들러 (무한 루프 방지)
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>
): void {
  const target = e.target as HTMLImageElement
  const currentSrc = target.src

  // 이미 실패한 이미지인지 확인 (무한 루프 방지)
  if (failedImages.has(currentSrc)) {
    console.log("🚫 이미 실패한 이미지, 더 이상 시도하지 않음:", currentSrc)
    return
  }

  // 실패한 이미지로 기록
  failedImages.add(currentSrc)

  // 기본 이미지 URL
  const defaultImageUrl = "http://localhost:5000/img/machine/chest-press.png"

  // 이미 기본 이미지인 경우 무한 루프 방지
  if (currentSrc === defaultImageUrl) {
    console.log("🚫 기본 이미지도 로드 실패, 더 이상 시도하지 않음")
    return
  }

  console.log("❌ 이미지 로드 실패, 기본 이미지로 대체:", currentSrc)
  target.src = defaultImageUrl
}

// 캐시 초기화 함수 (필요시 사용)
export function clearImageCache(): void {
  imageCache.clear()
  failedImages.clear()
}
