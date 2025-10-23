export interface Coordinates {
  lat: number
  lng: number
}

/**
 * 두 좌표 간의 거리를 km 단위로 계산합니다.
 * Haversine 공식을 사용하여 지구의 곡률을 고려한 정확한 거리 계산
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371 // 지구 반지름 (km)
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180
  const lat1 = (coord1.lat * Math.PI) / 180
  const lat2 = (coord2.lat * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * 숫자 거리값을 보기 좋게 포맷 (예: "500m" / "2.3km")
 */
export function formatDistance(distanceKm: number): string {
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)}m`
    : `${distanceKm.toFixed(1)}km`
}

/**
 * 좌표 유효성 검사 (서울 지역 기준)
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= 37.4 && lat <= 37.7 && lng >= 126.7 && lng <= 127.2
}

/**
 * 거리 기반 정렬을 위한 헬퍼 함수
 */
export function sortByDistance<T extends { distance?: number }>(
  items: T[],
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const distanceA = a.distance ?? Infinity
    const distanceB = b.distance ?? Infinity
    return direction === 'asc' ? distanceA - distanceB : distanceB - distanceA
  })
}

/**
 * 현재 위치에서 헬스장까지의 거리 계산 (기존 코드 호환성)
 */
export function calculateDistanceFromCurrent(
  currentPosition: { lat: number; lng: number },
  gym: { latitude: number; longitude: number }
): number {
  return calculateDistance(
    { lat: currentPosition.lat, lng: currentPosition.lng },
    { lat: gym.latitude, lng: gym.longitude }
  )
}