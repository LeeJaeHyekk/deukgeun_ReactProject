import { Repository } from "typeorm"
import { Gym } from "../entities/Gym"
import axios from "axios"
import { config } from "../config/env"
import * as cheerio from "cheerio"
import { BatchProcessingService } from "./batchProcessingService"
import { ErrorHandlingService, ErrorContext } from "./errorHandlingService"

interface SearchResult {
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  source: string
  confidence: number
  facilities?: string[]
  hasPT?: boolean
  hasGX?: boolean
  hasGroupPT?: boolean
  hasParking?: boolean
  hasShower?: boolean
  is24Hours?: boolean
  openHour?: string
  dataSource: "api" | "crawling" // 데이터 소스 구분
  lastUpdated: Date
}

// Analyze facility information from text data
function analyzeFacilities(
  placeName: string,
  address: string,
  phone?: string,
  facilities?: string[]
): {
  hasPT: boolean
  hasGX: boolean
  hasGroupPT: boolean
  hasParking: boolean
  hasShower: boolean
  is24Hours: boolean
  openHour: string
} {
  const text = `${placeName} ${address} ${phone || ""} ${
    facilities?.join(" ") || ""
  }`.toLowerCase()

  // PT keywords
  const ptKeywords = [
    "pt",
    "퍼스널",
    "트레이닝",
    "personal",
    "training",
    "1:1",
    "원투원",
    "개인",
    "트레이너",
    "trainer",
    "pt센터",
    "pt클럽",
    "pt스튜디오",
  ]

  // GX keywords
  const gxKeywords = [
    "gx",
    "그룹",
    "group",
    "에어로빅",
    "aerobic",
    "요가",
    "yoga",
    "필라테스",
    "pilates",
    "줌바",
    "zumba",
    "스피닝",
    "spinning",
    "댄스",
    "dance",
    "복싱",
    "boxing",
    "킥복싱",
    "kickboxing",
    "태보",
    "taebo",
    "바디컴뱃",
    "bodycombat",
    "바디펌프",
    "bodypump",
    "바디밸런스",
    "bodybalance",
    "바디스텝",
    "bodystep",
  ]

  // Group PT keywords
  const groupPtKeywords = [
    "그룹pt",
    "group pt",
    "그룹 퍼스널",
    "소그룹",
    "small group",
    "2:1",
    "3:1",
    "4:1",
    "투투원",
    "쓰리투원",
    "포투원",
  ]

  // Parking keywords
  const parkingKeywords = [
    "주차",
    "parking",
    "p",
    "주차가능",
    "주차장",
    "valet",
    "발렛",
  ]

  // Shower keywords
  const showerKeywords = [
    "샤워",
    "shower",
    "샤워실",
    "shower room",
    "탈의실",
    "locker room",
    "라커룸",
    "locker",
    "수건",
    "towel",
  ]

  // 24-hour keywords
  const hours24Keywords = [
    "24시간",
    "24시",
    "24h",
    "24 hour",
    "24hr",
    "24/7",
    "연중무휴",
    "24시간운영",
    "24시간영업",
    "24시간헬스",
  ]

  // Time patterns for operating hours
  const timePatterns = [
    /(\d{1,2}:\d{2})[~-](\d{1,2}:\d{2})/g,
    /(\d{1,2}시)[~-](\d{1,2}시)/g,
    /오전\s*(\d{1,2}):(\d{2})[~-]오후\s*(\d{1,2}):(\d{2})/g,
  ]

  let openHour = "운영시간 정보 없음"

  // Extract operating hours
  for (const pattern of timePatterns) {
    const match = text.match(pattern)
    if (match) {
      openHour = match[0]
      break
    }
  }

  return {
    hasPT: ptKeywords.some(keyword => text.includes(keyword)),
    hasGX: gxKeywords.some(keyword => text.includes(keyword)),
    hasGroupPT: groupPtKeywords.some(keyword => text.includes(keyword)),
    hasParking: parkingKeywords.some(keyword => text.includes(keyword)),
    hasShower: showerKeywords.some(keyword => text.includes(keyword)),
    is24Hours: hours24Keywords.some(keyword => text.includes(keyword)),
    openHour,
  }
}

// Search Kakao Map API with enhanced facility analysis
async function searchKakaoMapEnhanced(query: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get(
      `https://dapi.kakao.com/v2/local/search/keyword.json`,
      {
        params: {
          query: query,
          size: 10,
          page: 1,
        },
        headers: {
          Authorization: `KakaoAK ${config.KAKAO_API_KEY}`,
        },
      }
    )

    if (!response.data.documents) return []

    return response.data.documents
      .filter((doc: any) => {
        const category = (
          doc.category_group_name +
          " " +
          doc.category_name
        ).toLowerCase()
        return (
          category.includes("헬스") ||
          category.includes("fitness") ||
          category.includes("운동") ||
          category.includes("스포츠")
        )
      })
      .map((doc: any) => {
        const facilities = analyzeFacilities(
          doc.place_name,
          doc.address_name,
          doc.phone,
          [doc.category_name]
        )

        return {
          name: doc.place_name,
          address: doc.address_name,
          phone: doc.phone,
          latitude: parseFloat(doc.y),
          longitude: parseFloat(doc.x),
          source: "kakao_map",
          confidence: 0.9,
          ...facilities,
          dataSource: "api",
          lastUpdated: new Date(),
        }
      })
  } catch (error) {
    console.error("Kakao Map API error:", error)
    return []
  }
}

// Search Google Places API with enhanced facility analysis
async function searchGooglePlacesEnhanced(
  query: string
): Promise<SearchResult[]> {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: query + " 헬스장",
          key: config.GOOGLE_PLACES_API_KEY,
          language: "ko",
          type: "gym",
        },
      }
    )

    if (!response.data.results) return []

    return response.data.results
      .filter((place: any) => {
        const types = place.types || []
        return (
          types.includes("gym") ||
          types.includes("health") ||
          types.includes("establishment")
        )
      })
      .map((place: any) => {
        const facilities = analyzeFacilities(
          place.name,
          place.formatted_address,
          place.formatted_phone_number,
          place.types
        )

        return {
          name: place.name,
          address: place.formatted_address,
          phone: place.formatted_phone_number,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          source: "google_places",
          confidence: 0.85,
          ...facilities,
          dataSource: "api",
          lastUpdated: new Date(),
        }
      })
  } catch (error) {
    console.error("Google Places API error:", error)
    return []
  }
}

// Search Seoul Open Data API with enhanced facility analysis
async function searchSeoulOpenDataEnhanced(
  query: string
): Promise<SearchResult[]> {
  try {
    const response = await axios.get(
      `http://openapi.seoul.go.kr:8088/${config.SEOUL_OPENAPI_KEY}/json/LOCALDATA_104201/1/1000/`
    )

    if (!response.data.LOCALDATA_104201?.row) return []

    const gyms = response.data.LOCALDATA_104201.row.filter((gym: any) =>
      gym.BPLCNM.toLowerCase().includes(query.toLowerCase())
    )

    return gyms.map((gym: any) => {
      const facilities = analyzeFacilities(
        gym.BPLCNM,
        gym.RDNWHLADDR || gym.SITEWHLADDR,
        undefined,
        [gym.BPLCNM]
      )

      return {
        name: gym.BPLCNM,
        address: gym.RDNWHLADDR || gym.SITEWHLADDR,
        latitude: parseFloat(gym.Y),
        longitude: parseFloat(gym.X),
        source: "seoul_open_data",
        confidence: 0.8,
        ...facilities,
        dataSource: "api",
        lastUpdated: new Date(),
      }
    })
  } catch (error) {
    console.error("Seoul Open Data API error:", error)
    return []
  }
}

// Generate enhanced search queries
function generateEnhancedSearchQueries(gymName: string): string[] {
  const cleanName = gymName
    .replace(/[()（）]/g, "")
    .replace(/[㈜㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙]/g, "")
    .replace(/(주식회사|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|\(주\)|\(유\))/g, "")
    .replace(/\s+/g, " ")
    .trim()

  const queries = [
    `${cleanName} 헬스`,
    cleanName,
    `${cleanName.split(" ")[0]} 헬스`,
  ]

  // Add synonyms
  const synonyms: { [key: string]: string } = {
    헬스: "피트니스",
    피트니스: "헬스",
    짐: "헬스",
    헬스장: "피트니스",
  }

  for (const [key, value] of Object.entries(synonyms)) {
    if (cleanName.includes(key)) {
      queries.push(cleanName.replace(key, value))
    }
  }

  return [...new Set(queries)].filter(q => q.length > 0)
}

// Merge and deduplicate results with facility priority
function mergeAndDeduplicateEnhancedResults(
  allResults: SearchResult[]
): SearchResult[] {
  const uniqueResults = new Map<string, SearchResult>()

  for (const result of allResults) {
    const key = `${result.name}-${result.address}`
    const existing = uniqueResults.get(key)

    if (!existing || result.confidence > existing.confidence) {
      uniqueResults.set(key, result)
    } else if (result.confidence === existing.confidence) {
      // Prefer results with more facility information
      const existingFacilityCount = Object.values(existing).filter(
        v => typeof v === "boolean" && v
      ).length
      const newFacilityCount = Object.values(result).filter(
        v => typeof v === "boolean" && v
      ).length

      if (newFacilityCount > existingFacilityCount) {
        uniqueResults.set(key, result)
      }
    }
  }

  return Array.from(uniqueResults.values()).sort(
    (a, b) => b.confidence - a.confidence
  )
}

// Enhanced multi-source search
export async function searchWithEnhancedSources(
  gymName: string
): Promise<SearchResult | null> {
  const queries = generateEnhancedSearchQueries(gymName)
  const allResults: SearchResult[] = []

  for (const query of queries) {
    try {
      // Search in parallel
      const [kakaoResults, googleResults, seoulResults] = await Promise.all([
        searchKakaoMapEnhanced(query),
        searchGooglePlacesEnhanced(query),
        searchSeoulOpenDataEnhanced(query),
      ])

      allResults.push(...kakaoResults, ...googleResults, ...seoulResults)

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error(`Error searching for query "${query}":`, error)
    }
  }

  const mergedResults = mergeAndDeduplicateEnhancedResults(allResults)
  return mergedResults.length > 0 ? mergedResults[0] : null
}

// Enhanced gym details update function with data source tracking and batch processing
export const updateGymDetailsWithEnhancedSources = async (
  gymRepo: Repository<Gym>
) => {
  const gyms = await gymRepo.find()
  console.log(`🚀 향상된 크롤링 시작: ${gyms.length}개 헬스장`)

  // 배치 처리 설정
  const batchConfig = {
    batchSize: 10,
    concurrency: 3,
    delayBetweenBatches: 2000,
    maxRetries: 3,
    timeout: 30000,
  }

  // 배치 처리를 통한 업데이트
  const result = await BatchProcessingService.processGymsInBatches(
    gymRepo,
    async (gym: Gym) => {
      return await updateSingleGym(gym)
    },
    batchConfig
  )

  console.log(`\n📊 최종 결과:`)
  console.log(`✅ 성공: ${result.progress.success}개`)
  console.log(`❌ 실패: ${result.progress.failed}개`)
  console.log(
    `📈 성공률: ${((result.progress.success / gyms.length) * 100).toFixed(1)}%`
  )
  console.log(`⏱️ 소요 시간: ${result.duration}ms`)

  if (result.errors.length > 0) {
    console.log(`\n❌ 실패한 헬스장들:`)
    result.errors.forEach(error => {
      const gymName = (error as any).gymName || "unknown"
      console.log(`- ${gymName}: ${error.message}`)
    })
  }

  return result
}

// 개별 헬스장 업데이트 함수
async function updateSingleGym(gym: Gym): Promise<any> {
  const errorContext: ErrorContext = {
    gymName: gym.name,
    source: "enhanced_crawling",
    error: new Error("Initial error"),
    timestamp: new Date(),
    retryCount: 0,
  }

  try {
    // API 우선 시도, 실패 시 크롤링으로 대체
    let result = await searchWithAPISources(gym.name)
    let dataSource: "api" | "crawling" = "api"

    if (!result) {
      console.log(`📡 API 검색 실패, 크롤링으로 대체: ${gym.name}`)
      result = await searchWithCrawlingSources(gym.name)
      dataSource = "crawling"
    }

    if (result) {
      // Log facility information
      console.log(
        `✅ ${gym.name} - 시설: PT:${result.hasPT}, GX:${result.hasGX}, GroupPT:${result.hasGroupPT}, Parking:${result.hasParking}, Shower:${result.hasShower}, 24H:${result.is24Hours} (소스: ${dataSource})`
      )

      // Update gym data
      gym.address = result.address
      gym.phone = result.phone || gym.phone
      gym.latitude = result.latitude
      gym.longitude = result.longitude

      // Update facility information
      gym.hasPT = result.hasPT ?? false
      gym.hasGX = result.hasGX ?? false
      gym.hasGroupPT = result.hasGroupPT ?? false
      gym.hasParking = result.hasParking ?? false
      gym.hasShower = result.hasShower ?? false
      gym.is24Hours = result.is24Hours ?? false
      gym.openHour = result.openHour ?? ""

      // Add data source tracking
      gym.facilities = `${dataSource === "api" ? "API" : "크롤링"} 데이터 (${result.source}) - ${new Date().toISOString()}`
      gym.updatedAt = new Date()

      return {
        success: true,
        gym,
        dataSource,
        result,
      }
    } else {
      console.log(`❌ ${gym.name} - 검색 결과 없음`)
      return {
        success: false,
        gym,
        error: "No search results found",
      }
    }
  } catch (error) {
    console.error(`❌ ${gym.name} - 오류:`, error)

    // 에러 처리 서비스에 에러 등록
    errorContext.error = error as Error
    ErrorHandlingService.handleError(errorContext)

    return {
      success: false,
      gym,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// API 소스만 사용하는 검색 함수
async function searchWithAPISources(
  gymName: string
): Promise<SearchResult | null> {
  const queries = generateEnhancedSearchQueries(gymName)
  const allResults: SearchResult[] = []

  for (const query of queries) {
    try {
      // API 소스만 사용
      const [kakaoResults, googleResults, seoulResults] = await Promise.all([
        searchKakaoMapEnhanced(query),
        searchGooglePlacesEnhanced(query),
        searchSeoulOpenDataEnhanced(query),
      ])

      allResults.push(...kakaoResults, ...googleResults, ...seoulResults)

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error(`Error searching for query "${query}":`, error)
    }
  }

  const mergedResults = mergeAndDeduplicateEnhancedResults(allResults)
  return mergedResults.length > 0 ? mergedResults[0] : null
}

// 크롤링 소스만 사용하는 검색 함수
async function searchWithCrawlingSources(
  gymName: string
): Promise<SearchResult | null> {
  console.log(`🕷️ 크롤링 검색 시작: ${gymName}`)

  const allResults: SearchResult[] = []

  try {
    // 1. 네이버 블로그 검색
    const naverResults = await searchNaverBlogs(gymName)
    allResults.push(...naverResults)

    // 2. 네이버 지식인 검색
    const naverKinResults = await searchNaverKin(gymName)
    allResults.push(...naverKinResults)

    // 3. 헬스장 전용 사이트 크롤링
    const gymSiteResults = await searchGymSites(gymName)
    allResults.push(...gymSiteResults)

    // 4. 소셜 미디어 검색 (인스타그램, 페이스북 등)
    const socialResults = await searchSocialMedia(gymName)
    allResults.push(...socialResults)

    // 5. 지역 커뮤니티 검색
    const communityResults = await searchLocalCommunities(gymName)
    allResults.push(...communityResults)

    // 결과 병합 및 중복 제거
    const mergedResults = mergeAndDeduplicateEnhancedResults(allResults)

    if (mergedResults.length > 0) {
      const bestResult = mergedResults[0]
      console.log(
        `✅ 크롤링 성공: ${gymName} - 신뢰도: ${bestResult.confidence}`
      )
      return bestResult
    }

    console.log(`❌ 크롤링 실패: ${gymName} - 결과 없음`)
    return null
  } catch (error) {
    console.error(`❌ 크롤링 오류: ${gymName}`, error)
    return null
  }
}

// 네이버 블로그 검색
async function searchNaverBlogs(gymName: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    const searchQuery = encodeURIComponent(`${gymName} 헬스장`)
    const url = `https://search.naver.com/search.naver?where=blog&query=${searchQuery}`

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    // 블로그 포스트에서 헬스장 정보 추출
    $(".blog_post").each((index, element) => {
      const title = $(element).find(".title").text().trim()
      const content = $(element).find(".content").text().trim()

      // 헬스장 관련 키워드 확인
      if (containsGymKeywords(title + " " + content)) {
        const extractedInfo = extractGymInfoFromText(title + " " + content)
        if (extractedInfo) {
          results.push({
            name: gymName,
            address: extractedInfo.address || "네이버 블로그에서 수집된 주소",
            phone: extractedInfo.phone,
            latitude: extractedInfo.latitude || 37.5665,
            longitude: extractedInfo.longitude || 126.978,
            source: "naver_blog",
            confidence: 0.7,
            facilities: extractedInfo.facilities,
            hasPT: extractedInfo.hasPT,
            hasGX: extractedInfo.hasGX,
            hasGroupPT: extractedInfo.hasGroupPT,
            hasParking: extractedInfo.hasParking,
            hasShower: extractedInfo.hasShower,
            is24Hours: extractedInfo.is24Hours,
            openHour: extractedInfo.openHour,
            dataSource: "crawling",
            lastUpdated: new Date(),
          })
        }
      }
    })
  } catch (error) {
    console.error(`네이버 블로그 검색 실패: ${gymName}`, error)
  }

  return results
}

// 네이버 지식인 검색
async function searchNaverKin(gymName: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    const searchQuery = encodeURIComponent(`${gymName} 헬스장 추천`)
    const url = `https://search.naver.com/search.naver?where=kin&query=${searchQuery}`

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    $(".question").each((index, element) => {
      const title = $(element).find(".title").text().trim()
      const content = $(element).find(".content").text().trim()

      if (containsGymKeywords(title + " " + content)) {
        const extractedInfo = extractGymInfoFromText(title + " " + content)
        if (extractedInfo) {
          results.push({
            name: gymName,
            address: extractedInfo.address || "네이버 지식인에서 수집된 주소",
            phone: extractedInfo.phone,
            latitude: extractedInfo.latitude || 37.5665,
            longitude: extractedInfo.longitude || 126.978,
            source: "naver_kin",
            confidence: 0.65,
            facilities: extractedInfo.facilities,
            hasPT: extractedInfo.hasPT,
            hasGX: extractedInfo.hasGX,
            hasGroupPT: extractedInfo.hasGroupPT,
            hasParking: extractedInfo.hasParking,
            hasShower: extractedInfo.hasShower,
            is24Hours: extractedInfo.is24Hours,
            openHour: extractedInfo.openHour,
            dataSource: "crawling",
            lastUpdated: new Date(),
          })
        }
      }
    })
  } catch (error) {
    console.error(`네이버 지식인 검색 실패: ${gymName}`, error)
  }

  return results
}

// 헬스장 전용 사이트 크롤링
async function searchGymSites(gymName: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    // 헬스장 전용 사이트들
    const gymSites = [
      "https://www.healthcare.or.kr",
      "https://www.gym.co.kr",
      "https://www.fitness.co.kr",
    ]

    for (const site of gymSites) {
      try {
        const response = await axios.get(site, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 8000,
        })

        const $ = cheerio.load(response.data)

        // 사이트별 특화된 크롤링 로직
        if (site.includes("healthcare.or.kr")) {
          $(".gym-item").each((index, element) => {
            const name = $(element).find(".gym-name").text().trim()
            if (name.includes(gymName)) {
              const extractedInfo = extractGymInfoFromElement($, element)
              if (extractedInfo) {
                results.push({
                  name: gymName,
                  address: extractedInfo.address,
                  phone: extractedInfo.phone,
                  latitude: extractedInfo.latitude || 37.5665,
                  longitude: extractedInfo.longitude || 126.978,
                  source: "healthcare_site",
                  confidence: 0.8,
                  facilities: extractedInfo.facilities,
                  hasPT: extractedInfo.hasPT,
                  hasGX: extractedInfo.hasGX,
                  hasGroupPT: extractedInfo.hasGroupPT,
                  hasParking: extractedInfo.hasParking,
                  hasShower: extractedInfo.hasShower,
                  is24Hours: extractedInfo.is24Hours,
                  openHour: extractedInfo.openHour,
                  dataSource: "crawling",
                  lastUpdated: new Date(),
                })
              }
            }
          })
        }
      } catch (error) {
        console.error(`헬스장 사이트 크롤링 실패: ${site}`, error)
      }
    }
  } catch (error) {
    console.error(`헬스장 사이트 검색 실패: ${gymName}`, error)
  }

  return results
}

// 소셜 미디어 검색
async function searchSocialMedia(gymName: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    // 인스타그램 해시태그 검색 (실제로는 Instagram API 필요)
    const instagramResults = await searchInstagram(gymName)
    results.push(...instagramResults)

    // 페이스북 페이지 검색 (실제로는 Facebook API 필요)
    const facebookResults = await searchFacebook(gymName)
    results.push(...facebookResults)
  } catch (error) {
    console.error(`소셜 미디어 검색 실패: ${gymName}`, error)
  }

  return results
}

// 지역 커뮤니티 검색
async function searchLocalCommunities(
  gymName: string
): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    // 지역별 커뮤니티 사이트들
    const communitySites = [
      "https://cafe.naver.com",
      "https://www.clien.net",
      "https://www.dcinside.com",
    ]

    for (const site of communitySites) {
      try {
        const searchQuery = encodeURIComponent(`${gymName} 헬스장`)
        const url = `${site}/search?q=${searchQuery}`

        const response = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 8000,
        })

        const $ = cheerio.load(response.data)

        // 커뮤니티별 특화된 크롤링 로직
        $(".post-item, .article-item").each((index, element) => {
          const title = $(element).find(".title").text().trim()
          const content = $(element).find(".content").text().trim()

          if (containsGymKeywords(title + " " + content)) {
            const extractedInfo = extractGymInfoFromText(title + " " + content)
            if (extractedInfo) {
              results.push({
                name: gymName,
                address: extractedInfo.address || "커뮤니티에서 수집된 주소",
                phone: extractedInfo.phone,
                latitude: extractedInfo.latitude || 37.5665,
                longitude: extractedInfo.longitude || 126.978,
                source: "community",
                confidence: 0.6,
                facilities: extractedInfo.facilities,
                hasPT: extractedInfo.hasPT,
                hasGX: extractedInfo.hasGX,
                hasGroupPT: extractedInfo.hasGroupPT,
                hasParking: extractedInfo.hasParking,
                hasShower: extractedInfo.hasShower,
                is24Hours: extractedInfo.is24Hours,
                openHour: extractedInfo.openHour,
                dataSource: "crawling",
                lastUpdated: new Date(),
              })
            }
          }
        })
      } catch (error) {
        console.error(`커뮤니티 사이트 크롤링 실패: ${site}`, error)
      }
    }
  } catch (error) {
    console.error(`지역 커뮤니티 검색 실패: ${gymName}`, error)
  }

  return results
}

// 헬스장 관련 키워드 확인
function containsGymKeywords(text: string): boolean {
  const gymKeywords = [
    "헬스장",
    "피트니스",
    "운동",
    "PT",
    "퍼스널트레이닝",
    "GX",
    "요가",
    "필라테스",
    "웨이트",
    "유산소",
    "스트레칭",
    "단백질",
    "보충제",
    "운동복",
    "운동화",
    "샤워",
    "주차",
    "24시간",
    "오픈",
    "마감",
    "회원권",
    "수업",
    "강사",
  ]

  return gymKeywords.some(keyword => text.includes(keyword))
}

// 텍스트에서 헬스장 정보 추출
function extractGymInfoFromText(text: string): any {
  const info: any = {}

  // 주소 추출 (서울, 경기, 인천 등 지역명 포함)
  const addressRegex =
    /(서울|경기|인천|부산|대구|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[\s\S]*?(시|군|구)[\s\S]*?(동|읍|면|로|길|번지)/
  const addressMatch = text.match(addressRegex)
  if (addressMatch) {
    info.address = addressMatch[0]
  }

  // 전화번호 추출
  const phoneRegex =
    /(02|031|032|033|041|042|043|044|051|052|053|054|055|061|062|063|064|070|080|010|011|016|017|018|019)-\d{3,4}-\d{4}/
  const phoneMatch = text.match(phoneRegex)
  if (phoneMatch) {
    info.phone = phoneMatch[0]
  }

  // 시설 정보 추출
  info.hasPT = /PT|퍼스널|트레이닝|개인/.test(text)
  info.hasGX = /GX|그룹|수업|요가|필라테스|줌바/.test(text)
  info.hasGroupPT = /그룹|단체|수업/.test(text)
  info.hasParking = /주차|파킹/.test(text)
  info.hasShower = /샤워|목욕|수건/.test(text)
  info.is24Hours = /24시간|24시|야간|새벽/.test(text)

  // 영업시간 추출
  const timeRegex =
    /(오전|오후|AM|PM)?\s*(\d{1,2}):(\d{2})\s*[-~]\s*(오전|오후|AM|PM)?\s*(\d{1,2}):(\d{2})/
  const timeMatch = text.match(timeRegex)
  if (timeMatch) {
    info.openHour = timeMatch[0]
  }

  return info
}

// HTML 요소에서 헬스장 정보 추출
function extractGymInfoFromElement($: cheerio.CheerioAPI, element: any): any {
  const info: any = {}

  info.address = $(element).find(".address, .location").text().trim()
  info.phone = $(element).find(".phone, .tel").text().trim()
  info.openHour = $(element).find(".hours, .time").text().trim()

  const facilitiesText = $(element).find(".facilities, .services").text().trim()
  info.hasPT = /PT|퍼스널|트레이닝/.test(facilitiesText)
  info.hasGX = /GX|그룹|수업/.test(facilitiesText)
  info.hasGroupPT = /그룹|단체/.test(facilitiesText)
  info.hasParking = /주차|파킹/.test(facilitiesText)
  info.hasShower = /샤워|목욕/.test(facilitiesText)
  info.is24Hours = /24시간|24시/.test(facilitiesText)

  return info
}

// 인스타그램 검색 (실제 구현 시 Instagram API 필요)
async function searchInstagram(gymName: string): Promise<SearchResult[]> {
  // Instagram API 구현 필요
  console.log(`📸 Instagram 검색: ${gymName} (API 구현 필요)`)
  return []
}

// 페이스북 검색 (실제 구현 시 Facebook API 필요)
async function searchFacebook(gymName: string): Promise<SearchResult[]> {
  // Facebook API 구현 필요
  console.log(`📘 Facebook 검색: ${gymName} (API 구현 필요)`)
  return []
}
