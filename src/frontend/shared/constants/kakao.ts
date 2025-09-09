// 카카오 지도 관련 상수들

export const KAKAO_CONFIG = {
  // API 키
  API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "",
  
  // 기본 중심점 (서울시청)
  DEFAULT_CENTER: {
    lat: 37.5665,
    lng: 126.978,
  },
  
  // 기본 줌 레벨
  DEFAULT_ZOOM: 7,
  
  // 중심점 좌표 (별칭)
  CENTER_LAT: 37.5665,
  CENTER_LNG: 126.978,
  ZOOM_LEVEL: 7,
  
  // 마커 설정
  MARKER: {
    DEFAULT_IMAGE: "/img/marker-default.png",
    SELECTED_IMAGE: "/img/marker-selected.png",
    SIZE: {
      width: 30,
      height: 30,
    },
  },
  
  // 인포윈도우 설정
  INFO_WINDOW: {
    MAX_WIDTH: 300,
    PADDING: 10,
  },
  
  // 검색 설정
  SEARCH: {
    RADIUS: 5000, // 5km
    MAX_RESULTS: 15,
  },
  
  // 지도 스타일
  MAP_STYLES: {
    DEFAULT: "roadmap",
    SATELLITE: "satellite",
    HYBRID: "hybrid",
    TERRAIN: "terrain",
  },
  
  // 컨트롤 설정
  CONTROLS: {
    ZOOM: true,
    MAP_TYPE: true,
    SCALE: true,
    OVERVIEW_MAP: false,
  },
  
  // 이벤트 설정
  EVENTS: {
    CLICK: "click",
    DRAG_END: "dragend",
    ZOOM_CHANGED: "zoom_changed",
    BOUNDS_CHANGED: "bounds_changed",
  },
} as const

// 카카오 지도 타입
export type KakaoMapStyle = typeof KAKAO_CONFIG.MAP_STYLES[keyof typeof KAKAO_CONFIG.MAP_STYLES]

// 카카오 지도 이벤트 타입
export type KakaoMapEvent = typeof KAKAO_CONFIG.EVENTS[keyof typeof KAKAO_CONFIG.EVENTS]

// 카카오 지도 좌표 타입
export interface KakaoLatLng {
  lat: number
  lng: number
}

// 카카오 지도 마커 타입
export interface KakaoMarker {
  position: KakaoLatLng
  title?: string
  content?: string
  image?: string
  clickable?: boolean
}

// 카카오 지도 인포윈도우 타입
export interface KakaoInfoWindow {
  content: string
  position: KakaoLatLng
  removable?: boolean
  zIndex?: number
}

// 카카오 지도 검색 결과 타입
export interface KakaoSearchResult {
  id: string
  place_name: string
  category_name: string
  category_group_code: string
  phone: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  place_url: string
  distance: string
}

// 카카오 지도 검색 옵션 타입
export interface KakaoSearchOptions {
  query: string
  x?: number
  y?: number
  radius?: number
  rect?: string
  page?: number
  size?: number
  sort?: 'distance' | 'accuracy'
}

// 카카오 지도 유틸리티 함수들
export const kakaoUtils = {
  // 좌표 변환 (위도, 경도)
  createLatLng: (lat: number, lng: number): KakaoLatLng => ({
    lat,
    lng,
  }),
  
  // 거리 계산 (미터)
  calculateDistance: (pos1: KakaoLatLng, pos2: KakaoLatLng): number => {
    const R = 6371e3 // 지구 반지름 (미터)
    const φ1 = (pos1.lat * Math.PI) / 180
    const φ2 = (pos2.lat * Math.PI) / 180
    const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180
    const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  },
  
  // 좌표가 범위 내에 있는지 확인
  isInBounds: (pos: KakaoLatLng, bounds: { sw: KakaoLatLng; ne: KakaoLatLng }): boolean => {
    return (
      pos.lat >= bounds.sw.lat &&
      pos.lat <= bounds.ne.lat &&
      pos.lng >= bounds.sw.lng &&
      pos.lng <= bounds.ne.lng
    )
  },
  
  // 주소 포맷팅
  formatAddress: (address: string): string => {
    return address.replace(/^[가-힣]+특별시|[가-힣]+광역시|[가-힣]+도/, '').trim()
  },
  
  // 전화번호 포맷팅
  formatPhoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
    return phone
  },
}
