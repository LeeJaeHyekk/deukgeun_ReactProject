import { Gym } from '../types'
import { KAKAO_CONFIG } from '@frontend/shared/lib/env'

const KAKAO_API_KEY = KAKAO_CONFIG.REST_API_KEY
// console.log("🧪 Kakao REST API Key:", KAKAO_API_KEY) // 로그 제거

// 서울시 구별 중심 좌표
const SEOUL_GU_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  강남구: { lat: 37.5172, lng: 127.0473 },
  강동구: { lat: 37.5301, lng: 127.1238 },
  강북구: { lat: 37.6396, lng: 127.0257 },
  강서구: { lat: 37.5509, lng: 126.8495 },
  관악구: { lat: 37.4747, lng: 126.951 },
  광진구: { lat: 37.5385, lng: 127.0823 },
  구로구: { lat: 37.4954, lng: 126.8874 },
  금천구: { lat: 37.4602, lng: 126.9006 },
  노원구: { lat: 37.6542, lng: 127.0568 },
  도봉구: { lat: 37.6688, lng: 127.0471 },
  동대문구: { lat: 37.5838, lng: 127.0507 },
  동작구: { lat: 37.5124, lng: 126.9393 },
  마포구: { lat: 37.5663, lng: 126.9019 },
  서대문구: { lat: 37.5791, lng: 126.9368 },
  서초구: { lat: 37.4837, lng: 127.0324 },
  성동구: { lat: 37.5633, lng: 127.0366 },
  성북구: { lat: 37.5894, lng: 127.0167 },
  송파구: { lat: 37.5145, lng: 127.1058 },
  양천구: { lat: 37.517, lng: 126.8663 },
  영등포구: { lat: 37.5264, lng: 126.8962 },
  용산구: { lat: 37.5384, lng: 126.9654 },
  은평구: { lat: 37.6028, lng: 126.9291 },
  종로구: { lat: 37.5735, lng: 126.9788 },
  중구: { lat: 37.5636, lng: 126.9979 },
  중랑구: { lat: 37.6066, lng: 127.0926 },
}

// 임시 데이터 제거 - 실제 데이터베이스 데이터만 사용

// 카카오 맵 서비스 객체
export const kakaoMapService = {
  fetchGymsByKeyword,
  // 추가적인 카카오 맵 관련 함수들을 여기에 추가할 수 있습니다
}

export async function fetchGymsByKeyword(
  query: string,
  pos: { lat: number; lng: number }
): Promise<Gym[]> {
  if (!KAKAO_API_KEY) {
    console.warn('Kakao API Key가 설정되지 않았습니다. 빈 배열을 반환합니다.')
    return []
  }

  try {
    // 검색어에 "헬스장" 또는 "피트니스"가 포함되어 있지 않으면 추가
    let searchQuery = query
    if (
      !query.includes('헬스장') &&
      !query.includes('피트니스') &&
      !query.includes('gym')
    ) {
      searchQuery = `${query} 헬스장`
    }

    // 지역명이 포함된 검색어인지 확인하고 해당 지역의 중심 좌표 사용
    let searchPos = pos
    for (const [guName, coordinates] of Object.entries(SEOUL_GU_COORDINATES)) {
      if (searchQuery.includes(guName)) {
        searchPos = coordinates
        console.log(
          `🔍 지역 기반 검색: ${guName} (${coordinates.lat}, ${coordinates.lng})`
        )
        break
      }
    }

    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      searchQuery
    )}&x=${searchPos.lng}&y=${searchPos.lat}&radius=10000&size=15`

    const res = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('카카오 API 오류:', res.status, errorText)
      throw new Error(`API 오류: ${res.status} - ${errorText}`)
    }

    const data = await res.json()

    if (!data.documents) {
      console.warn('documents 필드가 없습니다:', data)
      return []
    }

    // 헬스장/피트니스 관련 장소만 필터링
    const filteredResults = data.documents.filter((item: any) => {
      const category = item.category_name || ''
      const placeName = item.place_name || ''
      return (
        category.includes('스포츠') ||
        category.includes('헬스') ||
        category.includes('피트니스') ||
        placeName.includes('헬스') ||
        placeName.includes('피트니스') ||
        placeName.includes('gym') ||
        placeName.includes('GYM')
      )
    })

    return filteredResults
  } catch (error) {
    console.error('카카오 API 호출 실패:', error)
    return []
  }
}
