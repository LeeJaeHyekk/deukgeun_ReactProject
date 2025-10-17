import { Gym } from '@frontend/pages/location/types'
import { KAKAO_CONFIG } from '@frontend/shared/lib/env'

const KAKAO_API_KEY = KAKAO_CONFIG.REST_API_KEY
// console.log("🧪 Kakao REST API Key:", KAKAO_API_KEY) // 로그 제거

// 테스트용 더미 데이터 생성
function generateDummyGyms(pos: { lat: number; lng: number }): Gym[] {
  const dummyGyms = [
    {
      id: '1',
      name: '강남 피트니스',
      type: '피트니스' as const,
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      latitude: pos.lat + 0.001,
      longitude: pos.lng + 0.001,
      rating: 4.5,
      reviewCount: 150,
      hasPT: true,
      hasGX: true,
      is24Hours: false,
      hasParking: true,
      hasShower: true,
      price: '15만원',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      name: '홍대 헬스장',
      type: '피트니스' as const,
      address: '서울특별시 마포구 홍대로 456',
      phone: '02-2345-6789',
      latitude: pos.lat + 0.002,
      longitude: pos.lng + 0.002,
      rating: 4.2,
      reviewCount: 89,
      hasPT: true,
      hasGX: false,
      is24Hours: true,
      hasParking: false,
      hasShower: true,
      price: '12만원',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    },
    {
      id: '3',
      name: '잠실 스포츠센터',
      type: '피트니스' as const,
      address: '서울특별시 송파구 올림픽로 789',
      phone: '02-3456-7890',
      latitude: pos.lat + 0.003,
      longitude: pos.lng + 0.003,
      rating: 4.8,
      reviewCount: 234,
      hasPT: true,
      hasGX: true,
      is24Hours: true,
      hasParking: true,
      hasShower: true,
      price: '18만원',
      imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    },
    {
      id: '4',
      name: '강서 피트니스클럽',
      type: '피트니스' as const,
      address: '서울특별시 강서구 화곡로 321',
      phone: '02-4567-8901',
      latitude: pos.lat + 0.004,
      longitude: pos.lng + 0.004,
      rating: 4.0,
      reviewCount: 67,
      hasPT: false,
      hasGX: true,
      is24Hours: false,
      hasParking: true,
      hasShower: false,
      price: '10만원',
      imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop',
    },
    {
      id: '5',
      name: '종로 헬스장',
      type: '피트니스' as const,
      address: '서울특별시 종로구 종로 654',
      phone: '02-5678-9012',
      latitude: pos.lat + 0.005,
      longitude: pos.lng + 0.005,
      rating: 4.3,
      reviewCount: 112,
      hasPT: true,
      hasGX: true,
      is24Hours: false,
      hasParking: false,
      hasShower: true,
      price: '13만원',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
  ]

  return dummyGyms
}

// 카카오 맵 서비스 객체
export const kakaoMapService = {
  fetchGymsByKeyword,
  // 추가적인 카카오 맵 관련 함수들을 여기에 추가할 수 있습니다
}

export async function fetchGymsByKeyword(
  query: string,
  pos: { lat: number; lng: number }
): Promise<Gym[]> {
  console.log('🧪 카카오 API 호출 시작:', { query, pos })

  if (!KAKAO_API_KEY) {
    console.warn(
      '🧪 Kakao API Key가 설정되지 않았습니다. 테스트용 더미 데이터를 반환합니다.'
    )
    // API 키가 없으면 테스트용 더미 데이터 반환
    const dummyGyms = generateDummyGyms(pos)
    console.log('🧪 더미 데이터 생성:', dummyGyms.length, '개')
    return dummyGyms
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      query
    )}&x=${pos.lng}&y=${pos.lat}&radius=5000`

    console.log('🧪 API URL:', url)

    const res = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    })

    console.log('🧪 API 응답 상태:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('🧪 API 오류:', res.status, errorText)
      throw new Error(`API 오류: ${res.status} - ${errorText}`)
    }

    const data = await res.json()
    console.log('🧪 API 응답 데이터:', data)

    if (!data.documents) {
      console.warn('🧪 documents 필드가 없습니다:', data)
      return []
    }

    console.log('🧪 검색 결과:', data.documents.length, '개')
    return data.documents
  } catch (error) {
    console.error('🧪 카카오 API 호출 실패:', error)
    console.warn('🧪 API 호출 실패로 인해 테스트용 더미 데이터를 반환합니다.')
    // API 호출 실패 시에도 더미 데이터 반환
    const dummyGyms = generateDummyGyms(pos)
    console.log('🧪 더미 데이터 생성:', dummyGyms.length, '개')
    return dummyGyms
  }
}
