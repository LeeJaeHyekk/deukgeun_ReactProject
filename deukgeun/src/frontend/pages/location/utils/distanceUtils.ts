/**
 * 거리 계산 유틸리티 함수들
 */

// Haversine 공식을 사용한 두 지점 간 거리 계산 (km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // 소수점 2자리까지 반올림
}

// 도를 라디안으로 변환
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// 거리를 사람이 읽기 쉬운 형태로 포맷팅
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
}

// 현재 위치에서 헬스장까지의 거리 계산
export function calculateDistanceFromCurrent(
  currentPos: { lat: number; lng: number },
  gym: { latitude: number; longitude: number }
): number {
  return calculateDistance(
    currentPos.lat,
    currentPos.lng,
    gym.latitude,
    gym.longitude
  );
} 