// 좌표 변환 및 계산 유틸리티

// TM 좌표를 WGS84 좌표로 변환
export const convertTMToWGS84 = (x: number, y: number) => {
  // TM 좌표계 파라미터 (한국 중부원점)
  const a = 6377397.155 // 장반경
  const f = 1 / 299.1528128 // 편평률
  const e2 = 2 * f - f * f // 제1이심률의 제곱
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2)) // 제2이심률

  // 중부원점 좌표
  const lon0 = 127.0028902777778 // 경도
  const lat0 = 38.0 // 위도
  const k0 = 1.0 // 축척계수

  // TM 좌표를 미터 단위로 변환
  const x_m = x - 200000
  const y_m = y - 500000

  // 위도 계산
  const M = y_m / k0
  const mu =
    M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256))

  const e1_2 = e1 * e1
  const e1_3 = e1_2 * e1
  const e1_4 = e1_3 * e1

  const lat_rad =
    mu +
    ((3 * e1) / 2 - (27 * e1_3) / 32) * Math.sin(2 * mu) +
    ((21 * e1_2) / 16 - (55 * e1_4) / 32) * Math.sin(4 * mu) +
    ((151 * e1_3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1_4) / 512) * Math.sin(8 * mu)

  const lat = (lat_rad * 180) / Math.PI

  // 경도 계산
  const N = a / Math.sqrt(1 - e2 * Math.sin(lat_rad) * Math.sin(lat_rad))
  const rho =
    (a * (1 - e2)) /
    Math.pow(1 - e2 * Math.sin(lat_rad) * Math.sin(lat_rad), 1.5)
  const eta2 = N / rho - 1

  const t = Math.tan(lat_rad)
  const t2 = t * t
  const t4 = t2 * t2
  const t6 = t4 * t2

  const x_norm = x_m / (N * k0)
  const x_norm2 = x_norm * x_norm
  const x_norm3 = x_norm2 * x_norm
  const x_norm4 = x_norm3 * x_norm
  const x_norm5 = x_norm4 * x_norm
  const x_norm6 = x_norm5 * x_norm

  const lon_rad =
    (lon0 * Math.PI) / 180 +
    x_norm -
    ((1 + 2 * t2 + eta2) * x_norm3) / 6 +
    ((5 - 2 * eta2 + 28 * t2 - 3 * eta2 * eta2 + 8 * eta2 * t2 + 24 * t4) *
      x_norm5) /
      120

  const lon = (lon_rad * 180) / Math.PI

  return { lat, lon }
}

// 두 지점 간의 거리 계산 (Haversine 공식)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 좌표 유효성 검사
export const isValidCoordinate = (lat: number, lon: number) => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

// 한국 좌표 범위 검사
export const isKoreanCoordinate = (lat: number, lon: number) => {
  return lat >= 33 && lat <= 39 && lon >= 124 && lon <= 132
}

// 좌표를 도분초 형식으로 변환
export const decimalToDMS = (decimal: number, isLatitude: boolean) => {
  const abs = Math.abs(decimal)
  const degrees = Math.floor(abs)
  const minutes = Math.floor((abs - degrees) * 60)
  const seconds = ((abs - degrees) * 60 - minutes) * 60

  const direction = isLatitude
    ? decimal >= 0
      ? "N"
      : "S"
    : decimal >= 0
      ? "E"
      : "W"

  return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`
}

// 도분초를 십진도 형식으로 변환
export const dmsToDecimal = (
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
) => {
  let decimal = degrees + minutes / 60 + seconds / 3600
  if (direction === "S" || direction === "W") {
    decimal = -decimal
  }
  return decimal
}

// 로거 함수 (coordinateUtils에서 사용)
export const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => console.debug(`[DEBUG] ${message}`),
}
