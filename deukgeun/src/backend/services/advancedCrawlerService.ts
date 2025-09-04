import { Repository } from "typeorm"
import { Gym } from "../entities/Gym.js"
import axios from "axios"
import { appConfig } from "../config/env.js"
import * as cheerio from "cheerio"

// 검색 결과 타입 정의
interface SearchResult {
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  source: string
  confidence: number
}

// 서울시 공공데이터 API 검색
async function searchSeoulOpenData(query: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get(
      `http://openapi.seoul.go.kr:8088/${appConfig.apiKeys.seoulOpenApi}/json/LOCALDATA_104201/1/1000/`
    )

    if (
      !response.data.LOCALDATA_104201 ||
      !response.data.LOCALDATA_104201.row
    ) {
      return []
    }

    const gyms = response.data.LOCALDATA_104201.row

    // 검색어와 매칭되는 헬스장 필터링
    const filteredGyms = gyms.filter((gym: any) => {
      const gymName = gym.BPLCNM.toLowerCase()
      const searchTerms = query.toLowerCase().split(" ")

      return searchTerms.some(
        term =>
          gymName.includes(term) ||
          gymName.includes(term.replace(/[()（）]/g, ""))
      )
    })

    return filteredGyms.map((gym: any) => ({
      name: gym.BPLCNM,
      address: gym.RDNWHLADDR || gym.SITEWHLADDR,
      phone: gym.SITETEL,
      latitude: parseFloat(gym.Y),
      longitude: parseFloat(gym.X),
      source: "seoul_opendata",
      confidence: 0.95, // 공공데이터는 매우 신뢰도가 높음
    }))
  } catch (error) {
    console.warn(
      `⚠️ 서울시 공공데이터 검색 실패: ${query} - ${(error as Error).message}`
    )
    return []
  }
}

// Search Naver Blog for gym information
// async function searchNaverBlog(query: string): Promise<SearchResult[]> {
//   try {
//     const response = await axios.get(
//       "https://openapi.naver.com/v1/search/blog.json",
//       {
//         params: {
//           query: query + " 헬스장 주소",
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

//     const results: SearchResult[] = [];

//     // Extract address information from blog content
//     response.data.items.forEach((item: any) => {
//       const content = item.description;

//       // Match Seoul address patterns
//       const addressMatch = content.match(/서울[^0-9]*[0-9-]+/);
//       if (addressMatch) {
//         results.push({
//           name: query,
//           address: addressMatch[0],
//           phone: "",
//           latitude: 0,
//           longitude: 0,
//           source: "naver_blog",
//           confidence: 0.6,
//         });
//       }
//     });

//     return results;
//   } catch (error) {
//     console.warn(
//       `⚠️ 네이버 블로그 검색 실패: ${query} - ${(error as Error).message}`
//     );
//     return [];
//   }
// }

// 인스타그램 해시태그 검색 (공개 정보만)
async function searchInstagramHashtag(query: string): Promise<SearchResult[]> {
  try {
    // 인스타그램 공개 API는 제한적이므로, 웹 크롤링 방식 사용
    const hashtag = query.replace(/\s+/g, "").toLowerCase()
    const searchUrl = `https://www.instagram.com/explore/tags/${hashtag}/`

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    const $ = cheerio.load(response.data)
    const results: SearchResult[] = []

    // 인스타그램에서 위치 정보 추출 (실제로는 매우 제한적)
    $('script[type="application/ld+json"]').each((index, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || "{}")
        if (jsonData.address) {
          results.push({
            name: query,
            address: jsonData.address,
            phone: "",
            latitude: 0,
            longitude: 0,
            source: "instagram",
            confidence: 0.3,
          })
        }
      } catch (e) {
        // JSON 파싱 실패 무시
      }
    })

    return results
  } catch (error) {
    console.warn(
      `⚠️ 인스타그램 검색 실패: ${query} - ${(error as Error).message}`
    )
    return []
  }
}

// 페이스북 페이지 검색
async function searchFacebookPage(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://www.facebook.com/search/pages/?q=${encodeURIComponent(
      query
    )}`

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    const $ = cheerio.load(response.data)
    const results: SearchResult[] = []

    // 페이스북 페이지에서 주소 정보 추출
    $('[data-testid="place-info"]').each((index, element) => {
      const address = $(element).find('[data-testid="address"]').text().trim()
      if (address) {
        results.push({
          name: query,
          address: address,
          phone: "",
          latitude: 0,
          longitude: 0,
          source: "facebook",
          confidence: 0.5,
        })
      }
    })

    return results
  } catch (error) {
    console.warn(
      `⚠️ 페이스북 검색 실패: ${query} - ${(error as Error).message}`
    )
    return []
  }
}

// 헬스장 전용 디렉토리 사이트 크롤링
async function searchGymDirectory(query: string): Promise<SearchResult[]> {
  try {
    // 헬스장 전용 디렉토리 사이트들
    const directorySites = [
      "https://www.healthclub.co.kr",
      "https://www.fitness.co.kr",
      "https://www.gymfinder.co.kr",
    ]

    const results: SearchResult[] = []

    for (const site of directorySites) {
      try {
        const response = await axios.get(
          `${site}/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 5000,
          }
        )

        const $ = cheerio.load(response.data)

        // 각 사이트별 파싱 로직 (실제 사이트 구조에 따라 수정 필요)
        $(".gym-item, .fitness-center, .health-club").each((index, element) => {
          const name = $(element).find(".name, .title").text().trim()
          const address = $(element).find(".address, .location").text().trim()
          const phone = $(element).find(".phone, .tel").text().trim()

          if (name && address) {
            results.push({
              name: name,
              address: address,
              phone: phone,
              latitude: 0,
              longitude: 0,
              source: `directory_${site.split("//")[1].split(".")[0]}`,
              confidence: 0.7,
            })
          }
        })
      } catch (siteError) {
        console.warn(
          `⚠️ 디렉토리 사이트 크롤링 실패: ${site} - ${
            (siteError as Error).message
          }`
        )
      }
    }

    return results
  } catch (error) {
    console.warn(
      `⚠️ 헬스장 디렉토리 검색 실패: ${query} - ${(error as Error).message}`
    )
    return []
  }
}

// 좌표 기반 역검색 (주소로 좌표 찾기)
async function reverseGeocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // 카카오맵 좌표-주소 변환 API 사용
    const response = await axios.get(
      `https://dapi.kakao.com/v2/local/search/address.json`,
      {
        params: {
          query: address,
        },
        headers: {
          Authorization: `KakaoAK ${appConfig.apiKeys.kakao}`,
        },
      }
    )

    if (response.data.documents && response.data.documents.length > 0) {
      const doc = response.data.documents[0]
      return {
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
      }
    }
  } catch (error) {
    console.warn(`⚠️ 좌표 변환 실패: ${address} - ${(error as Error).message}`)
  }
  return null
}

// 고급 검색어 생성 (더 정교한 변환)
function generateAdvancedSearchQueries(gymName: string): string[] {
  const cleanName = gymName
    .replace(/[()（）]/g, "")
    .replace(/[㈜㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙]/g, "")
    .replace(/(주식회사|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|\(주\)|\(유\))/g, "")
    .replace(/\s+/g, " ")
    .trim()

  const queries: string[] = []

  // 기본 검색어들
  queries.push(`${cleanName} 헬스`)
  queries.push(cleanName)

  // 브랜드명 추출
  const brandPatterns = [
    /^([가-힣a-zA-Z]+)/, // 첫 번째 단어
    /([가-힣a-zA-Z]+)(?:헬스|피트니스|짐|gym)/i, // 브랜드 + 키워드
  ]

  brandPatterns.forEach(pattern => {
    const match = cleanName.match(pattern)
    if (match && match[1]) {
      const brand = match[1]
      if (brand.length > 1) {
        queries.push(`${brand} 헬스`)
        queries.push(`${brand} 피트니스`)
        queries.push(`${brand} GYM`)
      }
    }
  })

  // 지역명 추출
  const regionPatterns = [
    /(강남|강북|강서|강동|서초|송파|마포|영등포|용산|성동|광진|동대문|중랑|성북|노원|도봉|양천|구로|금천|동작|관악|서대문|종로|중구|용인|수원|성남|부천|안산|안양|평택|시흥|김포|광주|여주|이천|안성|양평|고양|의정부|동두천|구리|남양주|파주|양주|포천|연천|가평|철원|화성|오산|하남|광명|군포|의왕|과천|부평|계양|서구|미추홀|연수|남동|강화|옹진|중구|동구|서구|유성|대덕|중구|동구|서구|남구|북구|수성구|달서구|달성군|중구|동구|서구|남구|북구|해운대구|사하구|금정구|강서구|연제구|수영구|기장군|중구|동구|서구|남구|북구|울주군|중구|동구|서구|남구|북구|광산구|중구|동구|서구|남구|북구|울산|부산|대구|인천|광주|대전|울산|세종|제주)/,
  ]

  regionPatterns.forEach(pattern => {
    const match = cleanName.match(pattern)
    if (match && match[1]) {
      const region = match[1]
      queries.push(`${region} ${cleanName.replace(region, "").trim()}`)
    }
  })

  // 동의어 변환 (더 확장)
  const synonyms = [
    { from: "짐", to: "GYM" },
    { from: "헬스", to: "피트니스" },
    { from: "피트니스", to: "헬스" },
    { from: "PT", to: "퍼스널트레이닝" },
    { from: "퍼스널트레이닝", to: "PT" },
    { from: "크로스핏", to: "CrossFit" },
    { from: "CrossFit", to: "크로스핏" },
    { from: "요가", to: "Yoga" },
    { from: "Yoga", to: "요가" },
    { from: "필라테스", to: "Pilates" },
    { from: "Pilates", to: "필라테스" },
  ]

  synonyms.forEach(synonym => {
    if (cleanName.includes(synonym.from)) {
      const synonymQuery = cleanName.replace(synonym.from, synonym.to)
      queries.push(synonymQuery)
      queries.push(`${synonymQuery} 헬스`)
    }
  })

  return [...new Set(queries.filter(q => q.trim().length > 0))]
}

// 고급 멀티 소스 검색
export async function searchWithAdvancedSources(
  gymName: string
): Promise<SearchResult | null> {
  const searchQueries = generateAdvancedSearchQueries(gymName)
  const allResults: SearchResult[] = []

  console.log(
    `🔍 [고급멀티소스] ${gymName} 검색 시작 (${searchQueries.length}개 검색어)`
  )

  for (let i = 0; i < searchQueries.length; i++) {
    const query = searchQueries[i]
    console.log(`🔍 [${i + 1}/${searchQueries.length}] 검색어: "${query}"`)

    // 병렬로 여러 소스에서 검색
    const searchPromises = [
      searchSeoulOpenData(query),
      // searchNaverBlog(query), // 네이버 블로그 검색 주석 처리
      searchGymDirectory(query),
      searchFacebookPage(query),
      searchInstagramHashtag(query),
    ]

    try {
      const results = await Promise.allSettled(searchPromises)

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          allResults.push(...result.value)
        }
      })

      // API 요청 간격 조절
      if (i < searchQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800))
      }
    } catch (error) {
      console.warn(`⚠️ 검색 실패: "${query}" - ${(error as Error).message}`)
    }
  }

  // 결과 통합 및 중복 제거
  const merged: { [key: string]: SearchResult } = {}

  allResults.forEach(result => {
    const key = `${result.name}_${result.address}`

    if (!merged[key] || merged[key].confidence < result.confidence) {
      merged[key] = result
    }
  })

  const mergedResults = Object.values(merged).sort(
    (a, b) => b.confidence - a.confidence
  )

  console.log(
    `📊 [고급멀티소스] 총 ${allResults.length}개 결과 → ${mergedResults.length}개 중복제거`
  )

  // 가장 신뢰도가 높은 결과 반환
  if (mergedResults.length > 0) {
    const bestResult = mergedResults[0]

    // 주소만 있고 좌표가 없는 경우 좌표 변환 시도
    if (bestResult.address && (!bestResult.latitude || !bestResult.longitude)) {
      const coordinates = await reverseGeocodeAddress(bestResult.address)
      if (coordinates) {
        bestResult.latitude = coordinates.latitude
        bestResult.longitude = coordinates.longitude
      }
    }

    return bestResult
  }

  return null
}

// 고급 헬스장 정보 업데이트 함수
export const updateGymDetailsWithAdvancedSources = async (
  gymRepo: Repository<Gym>
) => {
  const gyms = await gymRepo.find()
  console.log(
    `📊 총 ${gyms.length}개의 헬스장 데이터를 고급 멀티소스로 크롤링합니다.`
  )

  let successCount = 0
  let errorCount = 0
  const failedGyms: string[] = []

  for (let i = 0; i < gyms.length; i++) {
    const gym = gyms[i]

    try {
      console.log(
        `📡 [${i + 1}/${gyms.length}] 고급 멀티소스 크롤링 시작: ${gym.name}`
      )

      const result = await searchWithAdvancedSources(gym.name)

      if (!result) {
        console.warn(`⚠️ 모든 고급 소스에서 검색 실패: ${gym.name}`)
        failedGyms.push(gym.name)
        errorCount++
        continue
      }

      console.log(
        `📍 선택된 장소: ${result.name} (${result.address}) [${result.source}] (신뢰도: ${result.confidence})`
      )

      // DB 업데이트
      gym.address = result.address
      gym.phone = result.phone || gym.phone

      if (result.latitude && result.longitude) {
        gym.latitude = result.latitude
        gym.longitude = result.longitude
      }

      // 시설 정보 업데이트
      gym.facilities = `고급 멀티소스 검색 결과 (${result.source})`
      gym.is24Hours = false
      gym.hasGX = true
      gym.hasPT = true
      gym.hasGroupPT = false
      gym.hasParking = false
      gym.hasShower = true

      await gymRepo.save(gym)

      console.log(
        `✅ 완료: ${gym.name} | 소스: ${result.source} | 신뢰도: ${result.confidence}`
      )
      successCount++

      // API 요청 간격 조절
      await new Promise(resolve => setTimeout(resolve, 1200))
    } catch (error) {
      console.warn(
        `⚠️ [오류] ${gym.name} 처리 중 문제 발생: ${(error as Error).message}`
      )
      failedGyms.push(gym.name)
      errorCount++
    }

    // 진행률 표시
    if ((i + 1) % 10 === 0) {
      console.log(
        `📈 진행률: ${i + 1}/${gyms.length} (${Math.round(
          ((i + 1) / gyms.length) * 100
        )}%)`
      )
    }
  }

  console.log("🔚 고급 멀티소스 크롤링 전체 완료")
  console.log(`📊 결과: 성공 ${successCount}개, 실패 ${errorCount}개`)

  if (failedGyms.length > 0) {
    console.log("\n❌ 실패한 헬스장 목록:")
    failedGyms.forEach((gymName, index) => {
      console.log(`${index + 1}. ${gymName}`)
    })
  }
}
