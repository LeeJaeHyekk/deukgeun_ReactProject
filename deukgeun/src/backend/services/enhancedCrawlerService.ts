import { Repository } from "typeorm"
import { Gym } from "../entities/Gym"
import axios from "axios"
import { config } from "../config/env"
import * as cheerio from "cheerio"

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

// Enhanced gym details update function
export const updateGymDetailsWithEnhancedSources = async (
  gymRepo: Repository<Gym>
) => {
  const gyms = await gymRepo.find()
  let successCount = 0
  let failureCount = 0
  const failedGyms: string[] = []

  console.log(`🚀 향상된 크롤링 시작: ${gyms.length}개 헬스장`)

  for (let i = 0; i < gyms.length; i++) {
    const gym = gyms[i]
    console.log(`\n📊 진행률: ${i + 1}/${gyms.length} (${gym.name})`)

    try {
      const result = await searchWithEnhancedSources(gym.name)

      if (result) {
        // Log facility information
        console.log(
          `✅ ${gym.name} - 시설: PT:${result.hasPT}, GX:${result.hasGX}, GroupPT:${result.hasGroupPT}, Parking:${result.hasParking}, Shower:${result.hasShower}, 24H:${result.is24Hours}`
        )

        // Update database
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

        await gymRepo.save(gym)
        successCount++
      } else {
        console.log(`❌ ${gym.name} - 검색 결과 없음`)
        failedGyms.push(gym.name)
        failureCount++
      }
    } catch (error) {
      console.error(`❌ ${gym.name} - 오류:`, error)
      failedGyms.push(gym.name)
      failureCount++
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`\n📊 최종 결과:`)
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failureCount}개`)
  console.log(`📈 성공률: ${((successCount / gyms.length) * 100).toFixed(1)}%`)

  if (failedGyms.length > 0) {
    console.log(`\n❌ 실패한 헬스장들:`)
    failedGyms.forEach(name => console.log(`- ${name}`))
  }
}
