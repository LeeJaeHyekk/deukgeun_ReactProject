import { Gym } from "../entities/Gym";

/**
 * 조건에 맞는 헬스장만 필터링합니다.
 * - 위도, 경도 존재
 * - 전화번호 존재
 * - 이름이 비어있지 않음
 * - 기타 조건: 24시간, PT 가능 여부는 실제 API 데이터에 따라 추가 가능
 */
export const filterGyms = (gyms: Partial<Gym>[]): Partial<Gym>[] => {
  return gyms.filter((gym) => {
    const hasValidCoords = gym.latitude && gym.longitude;
    const hasPhone = gym.phone && gym.phone.trim() !== "";
    const hasName = gym.name && gym.name.trim() !== "";
    const hasAddress = gym.address && gym.address.trim() !== "";

    return hasValidCoords && hasPhone && hasName && hasAddress;
  });
};
