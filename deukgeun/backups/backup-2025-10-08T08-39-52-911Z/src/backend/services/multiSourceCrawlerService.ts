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
  confidence: number // Confidence score (0-1)
}

// Search Kakao Map API
async function searchKakaoMap(query: string): Promise<SearchResult[]> {
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
          Authorization: `KakaoAK ${config.apiKeys.kakao}`,
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
          category.includes("피트니스") ||
          category.includes("체육") ||
          category.includes("운동") ||
          category.includes("스포츠")
        )
      })
      .map((doc: any) => ({
        name: doc.place_name,
        address: doc.address_name,
        phone: doc.phone,
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
        source: "kakao_map",
        confidence: 0.9,
      }))
  } catch (error) {
    console.error("Kakao Map API error:", error)
    return []
  }
}

// Search Naver Map API (requires Naver Developer Center API key)
// async function searchNaverMap(query: string): Promise<SearchResult[]> {
//   try {
//     const response = await axios.get(
//       "https://openapi.naver.com/v1/search/local.json",
//       {
//         params: {
//           query: query,
//           display: 10,
//         },
//         headers: {
//           "X-Naver-Client-Id": config.NAVER_CLIENT_ID,
//           "X-Naver-Client-Secret": config.NAVER_CLIENT_SECRET,
//         },
//       }
//     );

//     if (!response.data.items || response.data.items.length === 0) {
//       return [];
//     }

//     return response.data.items.map((item: any) => ({
//       name: item.title.replace(/<[^>]*>/g, ""),
//       address: item.address,
//       phone: item.telephone,
//       latitude: parseFloat(item.mapx) || 0,
//       longitude: parseFloat(item.mapy) || 0,
//       source: "naver_map",
//       confidence: 0.85,
//     }));
//   } catch (error) {
//     console.warn(`⚠️ Naver Map API error: ${error}`);
//     return [];
//   }
// }

// Search Google Places API (requires Google Places API key)
async function searchGooglePlaces(query: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: query + " 헬스장",
          key: config.apiKeys.googlePlaces,
          language: "ko",
          region: "kr",
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
          types.includes("establishment") ||
          place.name.toLowerCase().includes("헬스") ||
          place.name.toLowerCase().includes("피트니스") ||
          place.name.toLowerCase().includes("gym")
        )
      })
      .map((place: any) => ({
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        source: "google_places",
        confidence: 0.85,
      }))
  } catch (error) {
    console.error("Google Places API error:", error)
    return []
  }
}

// Direct crawling of Kakao Map website
async function crawlKakaoMapWeb(query: string): Promise<SearchResult[]> {
  try {
    // Kakao Map search URL
    const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(
      query
    )}`

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    const $ = cheerio.load(response.data)

    // Parse Kakao Map search results (modify based on actual structure)
    const results: SearchResult[] = []

    $(".search_item").each((index, element) => {
      const name = $(element).find(".item_name").text().trim()
      const address = $(element).find(".item_address").text().trim()

      if (name && address) {
        results.push({
          name,
          address,
          latitude: 0, // Web crawling doesn't easily provide coordinates
          longitude: 0,
          source: "kakao_web",
          confidence: 0.6,
        })
      }
    })

    return results
  } catch (error) {
    console.error("Kakao Map web crawling error:", error)
    return []
  }
}

// Direct crawling of Naver Map website
async function crawlNaverMapWeb(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://map.naver.com/p/search/${encodeURIComponent(
      query
    )}`

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    const $ = cheerio.load(response.data)

    // Parse Naver Map search results (modify based on actual structure)
    const results: SearchResult[] = []

    $(".search_result_item").each((index, element) => {
      const name = $(element).find(".item_title").text().trim()
      const address = $(element).find(".item_address").text().trim()

      if (name && address) {
        results.push({
          name,
          address,
          latitude: 0,
          longitude: 0,
          source: "naver_web",
          confidence: 0.5,
        })
      }
    })

    return results
  } catch (error) {
    console.error("Naver Map web crawling error:", error)
    return []
  }
}

// Generate search queries
function generateSearchQueries(gymName: string): string[] {
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
  const synonyms = [
    { from: "짐", to: "GYM" },
    { from: "헬스", to: "피트니스" },
    { from: "피트니스", to: "헬스" },
  ]

  synonyms.forEach(synonym => {
    if (cleanName.includes(synonym.from)) {
      queries.push(cleanName.replace(synonym.from, synonym.to))
    }
  })

  // Remove branch suffix
  if (cleanName.includes("점")) {
    queries.push(cleanName.replace(/점$/, ""))
  }

  return [...new Set(queries)].filter(q => q.length > 0)
}

// Merge and deduplicate results
function mergeAndDeduplicateResults(
  allResults: SearchResult[]
): SearchResult[] {
  const uniqueResults = new Map<string, SearchResult>()

  for (const result of allResults) {
    const key = `${result.name}-${result.address}`
    const existing = uniqueResults.get(key)

    if (!existing || result.confidence > existing.confidence) {
      uniqueResults.set(key, result)
    }
  }

  return Array.from(uniqueResults.values()).sort(
    (a, b) => b.confidence - a.confidence
  )
}

// Multi-source search main function
export async function searchWithMultipleSources(
  gymName: string
): Promise<SearchResult | null> {
  const queries = generateSearchQueries(gymName)
  const allResults: SearchResult[] = []

  for (const query of queries) {
    try {
      // Search in parallel across multiple sources
      const [
        kakaoResults,
        // naverResults, // Commented out
        googleResults,
        kakaoWebResults,
        naverWebResults,
      ] = await Promise.all([
        searchKakaoMap(query),
        // searchNaverMap(query), // Commented out
        searchGooglePlaces(query),
        crawlKakaoMapWeb(query),
        crawlNaverMapWeb(query),
      ])

      allResults.push(
        ...kakaoResults,
        // ...naverResults, // Commented out
        ...googleResults,
        ...kakaoWebResults,
        ...naverWebResults
      )

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error searching for query "${query}":`, error)
    }
  }

  // Merge and deduplicate results
  const mergedResults = mergeAndDeduplicateResults(allResults)

  // Return highest confidence result
  return mergedResults.length > 0 ? mergedResults[0] : null
}

// Gym information update function
export const updateGymDetailsWithMultipleSources = async (
  gymRepo: Repository<Gym>
) => {
  const gyms = await gymRepo.find()
  let successCount = 0
  let failureCount = 0
  const failedGyms: string[] = []

  console.log(`🚀 멀티소스 크롤링 시작: ${gyms.length}개 헬스장`)

  for (let i = 0; i < gyms.length; i++) {
    const gym = gyms[i]
    console.log(`\n📊 진행률: ${i + 1}/${gyms.length} (${gym.name})`)

    try {
      const result = await searchWithMultipleSources(gym.name)

      if (result) {
        // Update database
        gym.address = result.address
        gym.phone = result.phone || gym.phone
        gym.latitude = result.latitude
        gym.longitude = result.longitude

        // Update facility information (default values)
        gym.facilities = `멀티소스 검색 결과 (${result.source})`
        gym.openHour = "운영시간 정보 없음"
        gym.is24Hours = false
        gym.hasGX = true // Most gyms provide GX
        gym.hasPT = true // Most gyms provide PT
        gym.hasGroupPT = false
        gym.hasParking = false
        gym.hasShower = false

        await gymRepo.save(gym)
        successCount++
        console.log(`✅ ${gym.name} - 업데이트 완료 (${result.source})`)
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
    await new Promise(resolve => setTimeout(resolve, 500))
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
