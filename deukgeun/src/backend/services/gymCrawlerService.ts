import { Repository } from "typeorm"
import { Gym } from "../entities/Gym.js"
import axios from "axios"
import { appConfig } from "../config/env.js"

// Clean gym name by removing special characters and company prefixes
function cleanGymName(name: string): string {
  return name
    .replace(/[()（）]/g, "") // Remove parentheses
    .replace(/[㈜㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙]/g, "") // Remove special company symbols
    .replace(/(주식회사|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|\(주\)|\(유\))/g, "") // Remove company names
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim()
}

// Generate multiple search queries for better results
function generateSearchQueries(gymName: string): string[] {
  const cleanName = cleanGymName(gymName)
  const queries: string[] = []

  // Original name with "헬스" keyword
  queries.push(`${cleanName} 헬스`)

  // Original name only
  queries.push(cleanName)

  // First word only with "헬스"
  const firstWord = cleanName.split(" ")[0]
  if (firstWord && firstWord.length > 1) {
    queries.push(`${firstWord} 헬스`)
  }

  // Synonym conversion
  const synonyms = [
    { from: "짐", to: "GYM" },
    { from: "헬스", to: "피트니스" },
    { from: "피트니스", to: "헬스" },
    { from: "PT", to: "퍼스널트레이닝" },
    { from: "퍼스널트레이닝", to: "PT" },
    { from: "크로스핏", to: "CrossFit" },
    { from: "CrossFit", to: "크로스핏" },
  ]

  synonyms.forEach(synonym => {
    if (cleanName.includes(synonym.from)) {
      const synonymQuery = cleanName.replace(synonym.from, synonym.to)
      queries.push(synonymQuery)
      queries.push(`${synonymQuery} 헬스`)
    }
  })

  // Remove branch suffix
  if (cleanName.includes("점")) {
    const withoutBranch = cleanName.replace(/점$/, "")
    queries.push(withoutBranch)
    queries.push(`${withoutBranch} 헬스`)
  }

  // Remove duplicates and filter empty strings
  return [...new Set(queries.filter(q => q.trim().length > 0))]
}

// Search Kakao Map API
async function searchKakaoMap(query: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://dapi.kakao.com/v2/local/search/keyword.json`,
      {
        params: {
          query: query,
          size: 10, // Get more results
          page: 1,
        },
        headers: {
          Authorization: `KakaoAK ${appConfig.apiKeys.kakao}`,
        },
      }
    )

    if (!response.data.documents || response.data.documents.length === 0) {
      return null
    }

    // Filter fitness-related results
    const fitnessResults = response.data.documents.filter((doc: any) => {
      const category = (
        doc.category_group_name +
        " " +
        doc.category_name
      ).toLowerCase()
      return (
        category.includes("헬스") ||
        category.includes("피트니스") ||
        category.includes("체육") ||
        category.includes("운동") ||
        category.includes("스포츠") ||
        doc.place_name.toLowerCase().includes("헬스") ||
        doc.place_name.toLowerCase().includes("피트니스") ||
        doc.place_name.toLowerCase().includes("짐") ||
        doc.place_name.toLowerCase().includes("gym")
      )
    })

    if (fitnessResults.length === 0) {
      return null
    }

    return fitnessResults[0] // Return first fitness-related result
  } catch (error) {
    console.error("Kakao Map API error:", error)
    return null
  }
}

// Get detailed place information
async function getPlaceDetails(placeId: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://dapi.kakao.com/v2/local/search/keyword.json`,
      {
        params: {
          query: placeId,
          size: 1,
        },
        headers: {
          Authorization: `KakaoAK ${appConfig.apiKeys.kakao}`,
        },
      }
    )

    return response.data.documents?.[0] || null
  } catch (error) {
    console.error("Place details API error:", error)
    return null
  }
}

// Analyze facility information from text
function analyzeFacilities(text: string): {
  hasPT: boolean
  hasGX: boolean
  hasGroupPT: boolean
  hasParking: boolean
  hasShower: boolean
  is24Hours: boolean
} {
  const lowerText = text.toLowerCase()

  // PT keywords
  const ptKeywords = ["pt", "퍼스널", "트레이닝", "personal", "training"]
  const hasPT = ptKeywords.some(keyword => lowerText.includes(keyword))

  // GX keywords
  const gxKeywords = [
    "gx",
    "그룹",
    "group",
    "에어로빅",
    "aerobic",
    "요가",
    "yoga",
  ]
  const hasGX = gxKeywords.some(keyword => lowerText.includes(keyword))

  // Group PT keywords
  const groupPtKeywords = ["그룹pt", "group pt", "소그룹", "small group"]
  const hasGroupPT = groupPtKeywords.some(keyword =>
    lowerText.includes(keyword)
  )

  // Parking keywords
  const parkingKeywords = ["주차", "parking", "p"]
  const hasParking = parkingKeywords.some(keyword =>
    lowerText.includes(keyword)
  )

  // Shower keywords
  const showerKeywords = ["샤워", "shower", "샤워실", "탈의실"]
  const hasShower = showerKeywords.some(keyword => lowerText.includes(keyword))

  // 24-hour keywords
  const hours24Keywords = ["24시간", "24시", "24h", "24 hour", "24/7"]
  const is24Hours = hours24Keywords.some(keyword => lowerText.includes(keyword))

  return {
    hasPT,
    hasGX,
    hasGroupPT,
    hasParking,
    hasShower,
    is24Hours,
  }
}

// Search with multiple strategies
export async function searchWithMultipleStrategies(
  gymName: string
): Promise<any> {
  const queries = generateSearchQueries(gymName)

  for (const query of queries) {
    try {
      const result = await searchKakaoMap(query)
      if (result) {
        return result
      }
    } catch (error) {
      console.error(`Search failed for query "${query}":`, error)
    }
  }

  return null
}

// Update gym details using improved search strategy
export const updateGymDetails = async (gymRepo: Repository<Gym>) => {
  const gyms = await gymRepo.find()
  let successCount = 0
  let failureCount = 0
  const failedGyms: string[] = []

  console.log(`🚀 크롤링 시작: ${gyms.length}개 헬스장`)

  for (let i = 0; i < gyms.length; i++) {
    const gym = gyms[i]
    console.log(`\n📊 진행률: ${i + 1}/${gyms.length} (${gym.name})`)

    try {
      // Use improved multi-stage search strategy
      const searchResult = await searchWithMultipleStrategies(gym.name)

      if (!searchResult) {
        console.log(`❌ ${gym.name} - 검색 결과 없음`)
        failedGyms.push(gym.name)
        failureCount++
        continue
      }

      // Get detailed place information
      const details = await getPlaceDetails(searchResult.place_name)

      if (details) {
        // Extract operating hours and facility info (limited from API)
        const facilityText = `${details.place_name} ${details.address_name} ${details.category_name}`
        const facilities = analyzeFacilities(facilityText)

        // Set basic facility info (limited by API)
        gym.facilities = `카카오맵 API 결과 (${details.category_name})`
        gym.openHour = "운영시간 정보 없음"
        gym.is24Hours = false // API doesn't provide 24-hour operation info directly

        // Update facility information
        gym.hasPT = facilities.hasPT
        gym.hasGX = facilities.hasGX
        gym.hasGroupPT = facilities.hasGroupPT
        gym.hasParking = facilities.hasParking
        gym.hasShower = facilities.hasShower
        gym.is24Hours = facilities.is24Hours

        // Update database
        gym.address = details.address_name
        gym.phone = details.phone || gym.phone

        // Update coordinates (use coordinates from API)
        if (details.x && details.y) {
          gym.latitude = parseFloat(details.y)
          gym.longitude = parseFloat(details.x)
        }

        await gymRepo.save(gym)
        successCount++
        console.log(`✅ ${gym.name} - 업데이트 완료`)
      } else {
        console.log(`❌ ${gym.name} - 상세 정보 없음`)
        failedGyms.push(gym.name)
        failureCount++
      }
    } catch (error) {
      console.error(`❌ ${gym.name} - 오류:`, error)
      failedGyms.push(gym.name)
      failureCount++
    }

    // Rate limiting (3 requests per second)
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  // Progress display
  console.log(`\n📊 최종 결과:`)
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failureCount}개`)
  console.log(`📈 성공률: ${((successCount / gyms.length) * 100).toFixed(1)}%`)

  if (failedGyms.length > 0) {
    console.log(`\n❌ 실패한 헬스장들:`)
    failedGyms.forEach(name => console.log(`- ${name}`))
  }
}
