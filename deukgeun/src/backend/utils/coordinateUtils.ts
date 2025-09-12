// Earth radius (km)
const RE = 6371.00877
// Grid spacing (km)
const GRID = 5.0
// Projection latitude1 (degree)
const SLAT1 = 30.0
// Projection latitude2 (degree)
const SLAT2 = 60.0
// Origin longitude (degree)
const OLON = 126.0
// Origin latitude (degree)
const OLAT = 38.0
// Origin X coordinate (GRID)
const XO = 43
// Origin Y coordinate (GRID)
const YO = 136

// Convert WGS84 coordinates to TM coordinates
export function convertWGS84ToTM(
  lat: number,
  lon: number
): { x: number; y: number } {
  const DEGRAD = Math.PI / 180.0
  const re = RE / GRID
  const slat1 = SLAT1 * DEGRAD
  const slat2 = SLAT2 * DEGRAD
  const olon = OLON * DEGRAD
  const olat = OLAT * DEGRAD

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
  ro = (re * sf) / Math.pow(ro, sn)

  let rs: number
  let theta: number
  if (lat !== 0) {
    rs = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5)
    rs = (re * sf) / Math.pow(rs, sn)
  } else {
    rs = 0
  }

  theta = lon * DEGRAD - olon
  if (theta > Math.PI) theta -= 2.0 * Math.PI
  if (theta < -Math.PI) theta += 2.0 * Math.PI
  theta *= sn

  const x = Math.floor(rs * Math.sin(theta) + XO + 0.5)
  const y = Math.floor(ro - rs * Math.cos(theta) + YO + 0.5)

  return { x, y }
}

// Convert TM coordinates to WGS84 coordinates
export function convertTMToWGS84(
  x: number,
  y: number
): { lat: number; lon: number } {
  // 서울시 공공데이터 API의 좌표는 이미 WGS84 좌표계를 사용하는 것으로 보임
  // TM 좌표가 아닌 경우를 대비해 검증 로직 추가

  // 좌표 값이 유효한 범위인지 확인
  if (x < 100000 || x > 1000000 || y < 100000 || y > 1000000) {
    console.warn(`⚠️ 좌표 값이 범위를 벗어남: X=${x}, Y=${y}`)
    // 기본값 반환 (서울시청 좌표)
    return { lat: 37.5665, lon: 126.978 }
  }

  // 서울시 공공데이터 API의 좌표는 이미 WGS84 좌표계를 사용하는 것으로 보임
  // 직접 변환하지 않고 좌표 값을 그대로 사용
  // 단, 좌표 값이 너무 큰 경우에만 변환 시도

  if (x > 200000 || y > 500000) {
    // TM 좌표로 보이므로 변환 시도
    const DEGRAD = Math.PI / 180.0
    const re = RE / GRID
    const slat1 = SLAT1 * DEGRAD
    const slat2 = SLAT2 * DEGRAD
    const olon = OLON * DEGRAD
    const olat = OLAT * DEGRAD

    let sn =
      Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
      Math.tan(Math.PI * 0.25 + slat1 * 0.5)
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
    ro = (re * sf) / Math.pow(ro, sn)

    const rs = ro - (y - YO)
    const theta = Math.atan((x - XO) / rs)
    const lon = theta / sn + olon
    const lat = Math.atan(Math.pow((re * sf) / rs, 1 / sn)) * 2 - Math.PI * 0.5

    const result = { lat: lat / DEGRAD, lon: lon / DEGRAD }

    // 변환된 좌표가 서울 지역 범위에 있는지 확인
    if (
      result.lat < 37.4 ||
      result.lat > 37.7 ||
      result.lon < 126.7 ||
      result.lon > 127.2
    ) {
      console.warn(
        `⚠️ 변환된 좌표가 서울 지역 범위를 벗어남: lat=${result.lat}, lon=${result.lon}`
      )
      // 기본값 반환 (서울시청 좌표)
      return { lat: 37.5665, lon: 126.978 }
    }

    // 디버깅 로그 추가
    console.log(
      `🔍 좌표 변환: TM(${x}, ${y}) → WGS84(${result.lat.toFixed(7)}, ${result.lon.toFixed(7)})`
    )

    return result
  } else {
    // 이미 WGS84 좌표계로 보이므로 그대로 사용
    const result = { lat: y / 1000000, lon: x / 1000000 }

    // 좌표가 서울 지역 범위에 있는지 확인
    if (
      result.lat < 37.4 ||
      result.lat > 37.7 ||
      result.lon < 126.7 ||
      result.lon > 127.2
    ) {
      console.warn(
        `⚠️ 좌표가 서울 지역 범위를 벗어남: lat=${result.lat}, lon=${result.lon}`
      )
      // 기본값 반환 (서울시청 좌표)
      return { lat: 37.5665, lon: 126.978 }
    }

    console.log(
      `🔍 좌표 직접 사용: (${x}, ${y}) → WGS84(${result.lat.toFixed(7)}, ${result.lon.toFixed(7)})`
    )

    return result
  }
}
