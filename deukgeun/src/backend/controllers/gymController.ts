import { Request, Response } from 'express'
import { Gym } from '../entities/Gym'
import { AppDataSource } from '../config/database'
import { ApiResponse, ErrorResponse } from '../types'
import { toGymDTO, toGymDTOList } from '../transformers/index'
import {
  optimizedGymSearchService,
  SearchFilters,
} from '../services/optimizedGymSearchService'

export async function getAllGyms(
  req: Request,
  res: Response<ApiResponse<any[]> | ErrorResponse>
) {
  try {
    const gymRepository = AppDataSource.getRepository(Gym)
    const gyms = await gymRepository.find({
      order: {
        name: 'ASC',
      },
    })

    // DTO 변환 적용
    const gymDTOs = toGymDTOList(gyms)

    res.json({
      success: true,
      message: '헬스장 목록을 성공적으로 가져왔습니다.',
      data: gymDTOs,
    })
  } catch (error) {
    console.error('헬스장 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      message: '헬스장 목록을 가져오는데 실패했습니다.',
      error: '서버 오류',
    })
  }
}

export async function getGymById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<any> | ErrorResponse>
) {
  try {
    const { id } = req.params
    const gymRepository = AppDataSource.getRepository(Gym)
    const gym = await gymRepository.findOne({ where: { id: parseInt(id) } })

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: '헬스장을 찾을 수 없습니다.',
        error: '헬스장 없음',
      })
    }

    // DTO 변환 적용
    const gymDTO = toGymDTO(gym)

    return res.json({
      success: true,
      message: '헬스장 정보를 성공적으로 가져왔습니다.',
      data: gymDTO,
    })
  } catch (error) {
    console.error('헬스장 조회 오류:', error)
    return res.status(500).json({
      success: false,
      message: '헬스장 정보를 가져오는데 실패했습니다.',
      error: '서버 오류',
    })
  }
}

export async function searchGyms(
  req: Request,
  res: Response<ApiResponse<any[]> | ErrorResponse>
) {
  try {
    const {
      query,
      latitude,
      longitude,
      radius = 10,
      is24Hours,
      hasPT,
      hasGX,
      hasParking,
      hasShower,
      limit = 50,
      offset = 0,
    } = req.query

    // 검색 필터 구성
    const searchFilters: SearchFilters = {
      name: query as string,
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined,
      radius: parseFloat(radius as string),
      is24Hours: is24Hours ? is24Hours === 'true' : undefined,
      hasPT: hasPT ? hasPT === 'true' : undefined,
      hasGX: hasGX ? hasGX === 'true' : undefined,
      hasParking: hasParking ? hasParking === 'true' : undefined,
      hasShower: hasShower ? hasShower === 'true' : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    }

    // 최적화된 검색 서비스 사용
    const searchResult =
      await optimizedGymSearchService.searchGyms(searchFilters)

    // DTO 변환 적용
    const gymDTOs = toGymDTOList(searchResult.gyms)

    return res.json({
      success: true,
      message: '헬스장 검색을 성공적으로 완료했습니다.',
      data: gymDTOs,
      pagination: {
        total: searchResult.totalCount,
        limit: searchFilters.limit || 50,
        offset: searchFilters.offset || 0,
        hasMore: searchResult.hasMore,
      },
    } as any)
  } catch (error) {
    console.error('헬스장 검색 오류:', error)
    return res.status(500).json({
      success: false,
      message: '헬스장 검색에 실패했습니다.',
      error: '서버 오류',
    })
  }
}

export async function getGymsByLocation(
  req: Request,
  res: Response<ApiResponse<Gym[]> | ErrorResponse>
) {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '위도와 경도가 필요합니다.',
        error: '위치 정보 누락',
      })
    }

    const lat = parseFloat(latitude as string)
    const lng = parseFloat(longitude as string)
    const rad = parseFloat(radius as string)
    const limitNum = parseInt(limit as string)

    // 최적화된 위치 기반 검색 사용
    const gyms = await optimizedGymSearchService.getNearbyGyms(
      lat,
      lng,
      rad,
      limitNum
    )

    return res.json({
      success: true,
      message: '주변 헬스장을 성공적으로 가져왔습니다.',
      data: gyms,
    })
  } catch (error) {
    console.error('주변 헬스장 조회 오류:', error)
    return res.status(500).json({
      success: false,
      message: '주변 헬스장을 가져오는데 실패했습니다.',
      error: '서버 오류',
    })
  }
}

export async function updateGymData(
  req: Request,
  res: Response<ApiResponse<{ updated: number }> | ErrorResponse>
) {
  try {
    const gymRepository = AppDataSource.getRepository(Gym)
    const { gyms } = req.body

    if (!Array.isArray(gyms)) {
      return res.status(400).json({
        success: false,
        message: '헬스장 데이터가 올바르지 않습니다.',
        error: '잘못된 데이터 형식',
      })
    }

    let updatedCount = 0
    for (const gymData of gyms) {
      const existingGym = await gymRepository.findOne({
        where: { name: gymData.name },
      })

      if (existingGym) {
        await gymRepository.update(existingGym.id, gymData)
        updatedCount++
      } else {
        await gymRepository.save(gymData)
        updatedCount++
      }
    }

    return res.json({
      success: true,
      message: `${updatedCount}개의 헬스장 데이터를 업데이트했습니다.`,
      data: { updated: updatedCount },
    })
  } catch (error) {
    console.error('헬스장 데이터 업데이트 오류:', error)
    return res.status(500).json({
      success: false,
      message: '헬스장 데이터 업데이트에 실패했습니다.',
      error: '서버 오류',
    })
  }
}

/**
 * 검색어 전처리 함수 - 접미사 제거 및 구/동 분리
 */
function preprocessSearchQuery(query: string): {
  locationFilter: string | null
  gymFilter: string | null
  originalQuery: string
} {
  // 원본 쿼리 보존
  const originalQuery = query.trim()

  // 지역명이 포함된 경우 욕설 필터링을 우회
  const locationKeywords = [
    '구',
    '동',
    '강남',
    '홍대',
    '잠실',
    '강서',
    '서초',
    '송파',
    '마포',
    '영등포',
    '용산',
    '성동',
    '광진',
    '동대문',
    '중랑',
    '성북',
    '노원',
    '도봉',
    '양천',
    '구로',
    '금천',
    '동작',
    '관악',
    '서대문',
    '종로',
    '중구',
    '은평',
    '강동',
    '강북',
    '군자',
    '상봉',
    '망우',
    '중화',
    '신내',
    '면목',
    '묵동',
    '태릉',
    '공릉',
    '월계',
    '하계',
    '중계',
    '상계',
    '수유',
    '번동',
    '우이',
    '미아',
    '삼양',
    '송천',
    '방학',
    '창동',
    '쌍문',
  ]

  const hasLocationKeyword = locationKeywords.some(keyword =>
    query.toLowerCase().includes(keyword.toLowerCase())
  )

  let filteredQuery: string | null = null

  // 임시로 욕설 필터링 비활성화 (디버깅용)
  filteredQuery = query.trim()
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 욕설 필터링 비활성화: "${filteredQuery}"`)
  }

  if (!filteredQuery) {
    // 욕설만 있거나 유효하지 않은 검색어인 경우
    return {
      locationFilter: null,
      gymFilter: null,
      originalQuery,
    }
  }

  // 검색어 정규화 (공백 제거, 소문자 변환)
  let processedQuery = filteredQuery.trim().toLowerCase()

  // 접미사 패턴 정의
  const suffixes = [
    '검색',
    '검색해',
    '검색해줘',
    '검색해주세요',
    '찾아',
    '찾아줘',
    '찾아주세요',
    '찾기',
    '알려줘',
    '알려주세요',
    '알려줘요',
    '보여줘',
    '보여주세요',
    '보여줘요',
    '추천',
    '추천해',
    '추천해줘',
    '추천해주세요',
    '어디',
    '어디에',
    '어디에있어',
    '어디있어',
    '가까운',
    '근처',
    '주변',
    '해줘',
    '해주세요',
    '해줘요',
    '해',
    '해요',
    '해주세요',
  ]

  // 접미사 제거
  for (const suffix of suffixes) {
    if (processedQuery.endsWith(suffix)) {
      processedQuery = processedQuery.slice(0, -suffix.length).trim()
      break // 첫 번째 매칭되는 접미사만 제거
    }
  }

  // 구/동 정보와 헬스장 정보 분리 - 최적화된 검색 유틸리티 사용
  const { SeoulSearchUtils } = require('./seoulGuDong')

  let locationFilter: string | null = null
  let gymFilter: string | null = null

  // 지역명 매핑 (일반적인 지역명을 구/동으로 매핑)
  // 복합 지역명을 먼저 처리 (더 구체적인 매핑을 우선)
  const locationMapping: { [key: string]: string } = {
    // 복합 지역명 (우선순위 높음)
    상봉역: '중랑구',
    망우역: '중랑구',
    중화역: '중랑구',
    신내역: '중랑구',
    면목역: '중랑구',
    묵동역: '중랑구',
    태릉입구역: '노원구',
    공릉역: '노원구',
    월계역: '노원구',
    하계역: '노원구',
    중계역: '노원구',
    상계역: '노원구',
    수유역: '강북구',
    번동역: '강북구',
    우이역: '강북구',
    미아역: '강북구',
    삼양역: '강북구',
    송천역: '강북구',
    방학역: '도봉구',
    창동역: '도봉구',
    쌍문역: '도봉구',

    // 기본 지역명
    강남: '강남구',
    홍대: '마포구',
    잠실: '송파구',
    강서: '강서구',
    서초: '서초구',
    송파: '송파구',
    마포: '마포구',
    영등포: '영등포구',
    용산: '용산구',
    성동: '성동구',
    광진: '광진구',
    동대문: '동대문구',
    중랑: '중랑구',
    성북: '성북구',
    노원: '노원구',
    도봉: '도봉구',
    양천: '양천구',
    구로: '구로구',
    금천: '금천구',
    동작: '동작구',
    관악: '관악구',
    서대문: '서대문구',
    종로: '종로구',
    중구: '중구',
    은평: '은평구',
    강동: '강동구',
    강북: '강북구',
    군자: '광진구',
    상봉: '중랑구',
    망우: '중랑구',
    중화: '중랑구',
    신내: '중랑구',
    면목: '중랑구',
    묵동: '중랑구',
    태릉: '노원구',
    공릉: '노원구',
    월계: '노원구',
    하계: '노원구',
    중계: '노원구',
    상계: '노원구',
    수유: '강북구',
    번동: '강북구',
    우이: '강북구',
    미아: '강북구',
    삼양: '강북구',
    송천: '강북구',
    방학: '도봉구',
    창동: '도봉구',
    쌍문: '도봉구',
  }

  // 지역명 매핑으로 구 정보 추출 (긴 매칭을 우선)
  const sortedMappings = Object.entries(locationMapping).sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [regionName, guName] of sortedMappings) {
    if (processedQuery.includes(regionName.toLowerCase())) {
      locationFilter = guName
      processedQuery = processedQuery
        .replace(regionName.toLowerCase(), '')
        .trim()
      // "구" 단어도 제거
      processedQuery = processedQuery.replace(/구\s*/, '').trim()
      break
    }
  }

  // 구 정보 추출 (매핑에서 찾지 못한 경우) - 최적화된 검색 사용
  if (!locationFilter) {
    // 역명으로 구 찾기 시도
    const stationGu = SeoulSearchUtils.findGuByStation(processedQuery)
    if (stationGu) {
      locationFilter = stationGu
      processedQuery = processedQuery.replace(processedQuery, '').trim()
    } else {
      // 동명으로 구 찾기 시도
      const dongGu = SeoulSearchUtils.findGuByDong(processedQuery)
      if (dongGu) {
        locationFilter = dongGu
        processedQuery = processedQuery.replace(processedQuery, '').trim()
      } else {
        // 구명 직접 검색
        const allGus = SeoulSearchUtils.getAllGus()
        for (const gu of allGus) {
          if (processedQuery.includes(gu.toLowerCase())) {
            locationFilter = gu
            processedQuery = processedQuery.replace(gu.toLowerCase(), '').trim()
            // "구" 단어도 제거
            processedQuery = processedQuery.replace(/구\s*/, '').trim()
            break
          }
        }
      }
    }
  }

  // 남은 텍스트를 헬스장 필터로 사용
  if (processedQuery) {
    gymFilter = processedQuery
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `🔍 검색어 전처리: "${originalQuery}" → location: "${locationFilter}", gym: "${gymFilter}", original: "${originalQuery}"`
    )
  }

  return {
    locationFilter,
    gymFilter,
    originalQuery: query.trim(),
  }
}

/**
 * 스마트 검색 API - 지역/헬스장명 구분하여 검색
 */
export async function smartSearchGyms(
  req: Request,
  res: Response<
    | ApiResponse<{
        searchType: 'location' | 'gym' | 'mixed' | 'profanity_filtered'
        exactMatch?: any
        nearbyGyms: any[]
        totalCount: number
        originalQuery: string
        locationFilter: string | null
        gymFilter: string | null
        isProfanityFiltered: boolean
      }>
    | ErrorResponse
  >
) {
  try {
    const { query, latitude, longitude, radius = 5 } = req.body
    const gymRepository = AppDataSource.getRepository(Gym)

    if (!query) {
      return res.status(400).json({
        success: false,
        message: '검색어가 필요합니다.',
        error: '검색어 누락',
      })
    }

    // 검색어 전처리 (욕설 필터링 및 구/동 분리)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 원본 검색어: "${query}"`)
    }
    const { locationFilter, gymFilter, originalQuery } =
      preprocessSearchQuery(query)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔍 검색어 전처리: "${query}" → location: "${locationFilter}", gym: "${gymFilter}", original: "${originalQuery}"`
      )
    }

    // 욕설만 있는 경우 현재 위치 기반 검색으로 대체
    if (!locationFilter && !gymFilter) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 욕설 감지됨, 현재 위치 기반 검색으로 대체')
      }

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message:
            '부적절한 검색어가 감지되었습니다. 현재 위치 기반 검색을 위해 위치 정보가 필요합니다.',
          error: '욕설 필터링 및 위치 정보 필요',
        })
      }

      // 현재 위치 기반 검색
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      const rad = parseFloat(radius)

      const nearbyGyms = await gymRepository
        .createQueryBuilder('gym')
        .where(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude)))) <= :radius`,
          { lat, lng, radius: rad }
        )
        .orderBy('gym.name', 'ASC')
        .limit(50)
        .getMany()

      const gymDTOs = toGymDTOList(nearbyGyms)

      return res.json({
        success: true,
        message:
          '부적절한 검색어가 감지되어 현재 위치 기반 검색 결과를 제공합니다.',
        data: {
          searchType: 'profanity_filtered',
          exactMatch: null,
          nearbyGyms: gymDTOs,
          totalCount: nearbyGyms.length,
          originalQuery,
          locationFilter: null,
          gymFilter: null,
          isProfanityFiltered: true,
        },
      })
    }

    let searchType: 'location' | 'gym' | 'mixed' = 'location'
    let nearbyGyms: any[] = []

    // 1. 원본 검색어로 정확한 헬스장명 매칭 검색
    const exactMatch = await gymRepository.findOne({
      where: { name: query },
    })

    // 2. 헬스장 필터로 정확한 매칭 시도
    const gymExactMatch = gymFilter
      ? await gymRepository.findOne({
          where: { name: gymFilter },
        })
      : null

    const finalExactMatch = exactMatch || gymExactMatch

    if (finalExactMatch) {
      // 정확한 헬스장명 매칭이 있는 경우
      searchType = 'gym'
      nearbyGyms = [finalExactMatch]
    } else {
      // 지역 기반 검색 또는 혼합 검색
      const queryBuilder = gymRepository.createQueryBuilder('gym')

      // 위치 기반 검색 조건 - 거리 제한 없이 모든 결과 검색
      if (latitude && longitude) {
        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)

        // 거리 계산을 위해 SELECT에 거리 컬럼 추가 (정렬용)
        queryBuilder.addSelect(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude))))`,
          'distance'
        )
        queryBuilder.setParameter('lat', lat)
        queryBuilder.setParameter('lng', lng)
      }

      // 지역 필터 적용
      if (locationFilter) {
        queryBuilder.andWhere('gym.address LIKE :location', {
          location: `%${locationFilter}%`,
        })
      }

      // 헬스장명 필터 적용
      if (gymFilter) {
        queryBuilder.andWhere('gym.name LIKE :name', {
          name: `%${gymFilter}%`,
        })
      }

      // 정렬 조건 설정 - 모든 검색에서 거리순으로 정렬
      if (latitude && longitude) {
        // 위치 정보가 있는 경우 거리순으로 정렬
        nearbyGyms = await queryBuilder
          .orderBy('distance', 'ASC')
          .limit(50)
          .getMany()
      } else {
        // 위치 정보가 없는 경우 이름순으로 정렬
        nearbyGyms = await queryBuilder
          .orderBy('gym.name', 'ASC')
          .limit(50)
          .getMany()
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 검색 결과: ${nearbyGyms.length}개 발견`)
        console.log(
          `🔍 검색 조건: locationFilter="${locationFilter}", gymFilter="${gymFilter}"`
        )
        console.log(`🔍 위치 조건: lat=${latitude}, lng=${longitude}`)
        console.log(
          `🔍 검색 타입: ${locationFilter ? '지역 기반' : '일반'} 검색 (거리 제한 없음)`
        )
        if (nearbyGyms.length > 0) {
          console.log(
            '🔍 첫 번째 결과:',
            nearbyGyms[0].name,
            nearbyGyms[0].address
          )
        } else {
          // 전체 헬스장 개수 확인
          const totalCount = await gymRepository.count()
          console.log(`🔍 데이터베이스 전체 헬스장 개수: ${totalCount}개`)

          // 샘플 헬스장 몇 개 확인
          const sampleGyms = await gymRepository.find({ take: 3 })
          console.log('🔍 샘플 헬스장:')
          sampleGyms.forEach(gym => {
            console.log(`  - ${gym.name} (${gym.address})`)
          })
        }
      }

      // 검색 타입 결정
      if (locationFilter && gymFilter) {
        searchType = 'mixed'
      } else if (locationFilter) {
        searchType = 'location'
      } else if (gymFilter) {
        searchType = 'gym'
      }
    }

    // DTO 변환 적용
    const gymDTOs = toGymDTOList(nearbyGyms)

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔍 최종 검색 결과: ${gymDTOs.length}개, 검색 타입: ${searchType}`
      )
    }

    return res.json({
      success: true,
      message: '헬스장 검색을 성공적으로 완료했습니다.',
      data: {
        searchType,
        exactMatch: nearbyGyms.length === 1 ? nearbyGyms[0] : null,
        nearbyGyms: gymDTOs,
        totalCount: nearbyGyms.length,
        originalQuery,
        locationFilter,
        gymFilter,
        isProfanityFiltered: false,
      },
    })
  } catch (error) {
    console.error('스마트 검색 오류:', error)
    return res.status(500).json({
      success: false,
      message: '헬스장 검색에 실패했습니다.',
      error: '서버 오류',
    })
  }
}

/**
 * 위치 기반 주변 헬스장 검색 (기본 검색)
 */
export async function getNearbyGyms(
  req: Request,
  res: Response<ApiResponse<any[]> | ErrorResponse>
) {
  try {
    const { latitude, longitude, radius = 5 } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '위도와 경도가 필요합니다.',
        error: '위치 정보 누락',
      })
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const rad = parseFloat(radius)

    // 최적화된 위치 기반 검색 사용
    const gyms = await optimizedGymSearchService.getNearbyGyms(
      lat,
      lng,
      rad,
      20
    )

    const gymDTOs = toGymDTOList(gyms)

    return res.json({
      success: true,
      message: '주변 헬스장을 성공적으로 가져왔습니다.',
      data: gymDTOs,
    })
  } catch (error) {
    console.error('주변 헬스장 조회 오류:', error)
    return res.status(500).json({
      success: false,
      message: '주변 헬스장을 가져오는데 실패했습니다.',
      error: '서버 오류',
    })
  }
}

/**
 * 헬스장명 자동완성 API
 */
export async function getGymNameSuggestions(
  req: Request,
  res: Response<ApiResponse<string[]> | ErrorResponse>
) {
  try {
    const { query, limit = 10 } = req.query

    if (!query || (query as string).length < 2) {
      return res.status(400).json({
        success: false,
        message: '검색어는 최소 2글자 이상이어야 합니다.',
        error: '검색어 너무 짧음',
      })
    }

    const suggestions = await optimizedGymSearchService.searchGymNames(
      query as string,
      parseInt(limit as string)
    )

    return res.json({
      success: true,
      message: '헬스장명 자동완성을 성공적으로 가져왔습니다.',
      data: suggestions,
    })
  } catch (error) {
    console.error('헬스장명 자동완성 오류:', error)
    return res.status(500).json({
      success: false,
      message: '헬스장명 자동완성에 실패했습니다.',
      error: '서버 오류',
    })
  }
}

/**
 * 헬스장 통계 API
 */
export async function getGymStats(
  req: Request,
  res: Response<ApiResponse<any> | ErrorResponse>
) {
  try {
    const [regionStats, facilityStats] = await Promise.all([
      optimizedGymSearchService.getGymStatsByRegion(),
      optimizedGymSearchService.getGymStatsByFacilities(),
    ])

    return res.json({
      success: true,
      message: '헬스장 통계를 성공적으로 가져왔습니다.',
      data: {
        regionStats,
        facilityStats,
      },
    })
  } catch (error) {
    console.error('헬스장 통계 조회 오류:', error)
    return res.status(500).json({
      success: false,
      message: '헬스장 통계를 가져오는데 실패했습니다.',
      error: '서버 오류',
    })
  }
}
