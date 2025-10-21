/**
 * 데이터 병합 로직 테스트
 * 개선된 데이터 병합 기능을 테스트합니다.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트용 데이터 생성
function createTestData() {
  // 원본 gyms_raw 데이터 (기존 데이터)
  const originalData = [
    {
      id: 1,
      name: "페이즈짐",
      address: "서울특별시 서초구 효령로55길 10, 더칸토서초 지하1층 (서초동)",
      phone: "507-1380-7156",
      type: "public",
      updatedAt: "2025-10-16T18:22:30.609Z",
      source: "cross_validated_5_sources",
      confidence: 0.9,
      serviceType: "gym",
      isCurrentlyOpen: true,
      crawledAt: "2025-10-16T18:22:30.609Z"
    },
    {
      id: 2,
      name: "아하피트니스 (AHA FITNESS)",
      address: "서울특별시 동작구 상도로 94, 수진세인트빌딩 5층 (상도동)",
      phone: "33010620250",
      type: "public",
      updatedAt: "2025-10-16T18:22:30.609Z",
      source: "cross_validated_5_sources",
      confidence: 0.9,
      serviceType: "gym",
      isCurrentlyOpen: true,
      crawledAt: "2025-10-16T18:22:30.609Z"
    }
  ];

  // 크롤링된 데이터 (새로 추가된 정보)
  const crawledData = [
    {
      id: 1,
      name: "페이즈짐",
      address: "서울특별시 서초구 효령로55길 10, 더칸토서초 지하1층 (서초동)",
      phone: "507-1380-7156",
      type: "public",
      is24Hours: false,
      hasParking: true,
      hasShower: true,
      createdAt: "2025-10-16T18:22:30.609Z",
      updatedAt: new Date().toISOString(),
      
      // 새로 크롤링된 정보
      rating: 4.5,
      reviewCount: 127,
      openHour: "06:30",
      closeHour: "22:00",
      price: "월 80,000원",
      membershipPrice: "월 80,000원",
      ptPrice: "회당 50,000원",
      gxPrice: "월 30,000원",
      dayPassPrice: "일일 5,000원",
      priceDetails: "신규회원 20% 할인",
      minimumPrice: "일일 5,000원",
      discountInfo: "신규회원 20% 할인, 3개월 결제시 10% 할인",
      facilities: ["샤워시설", "주차장", "락커룸", "운동복", "개인트레이너", "그룹레슨"],
      services: ["PT", "GX", "요가", "필라테스"],
      website: "https://phasegym.co.kr",
      instagram: "@phasegym",
      facebook: "페이즈짐",
      hasGX: true,
      hasPT: true,
      hasGroupPT: true,
      
      source: "naver_cafe + google_search",
      confidence: 0.85,
      serviceType: "gym",
      isCurrentlyOpen: true,
      crawledAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "아하피트니스 (AHA FITNESS)",
      address: "서울특별시 동작구 상도로 94, 수진세인트빌딩 5층 (상도동)",
      phone: "33010620250",
      type: "public",
      is24Hours: true,
      hasParking: false,
      hasShower: true,
      createdAt: "2025-10-16T18:22:30.609Z",
      updatedAt: new Date().toISOString(),
      
      // 새로 크롤링된 정보
      rating: 4.2,
      reviewCount: 89,
      openHour: "06:00",
      closeHour: "23:00",
      price: "월 60,000원",
      membershipPrice: "월 60,000원",
      ptPrice: "회당 40,000원",
      gxPrice: "월 25,000원",
      dayPassPrice: "일일 3,000원",
      priceDetails: "24시간 이용 가능",
      minimumPrice: "일일 3,000원",
      discountInfo: "학생할인 20%",
      facilities: ["24시간", "샤워시설", "락커룸", "운동복", "개인트레이너"],
      services: ["PT", "GX", "크로스핏"],
      website: "https://ahafitness.co.kr",
      instagram: "@ahafitness",
      facebook: "아하피트니스",
      hasGX: true,
      hasPT: true,
      hasGroupPT: false,
      
      source: "naver_cafe + daum_search",
      confidence: 0.82,
      serviceType: "gym",
      isCurrentlyOpen: true,
      crawledAt: new Date().toISOString()
    }
  ];

  return { originalData, crawledData };
}

// 데이터 병합 로직 시뮬레이션
function simulateDataMerging(originalData, crawledData) {
  console.log('🔄 데이터 병합 시뮬레이션 시작');
  console.log(`📊 원본 데이터: ${originalData.length}개, 크롤링 데이터: ${crawledData.length}개`);

  const mergedData = [];
  const conflicts = [];
  const statistics = {
    totalProcessed: 0,
    successfullyMerged: 0,
    fallbackUsed: 0,
    duplicatesRemoved: 0,
    qualityScore: 0
  };

  // 매칭 및 병합
  for (const original of originalData) {
    const crawled = crawledData.find(c => c.id === original.id);
    
    if (crawled) {
      // 데이터 병합
      const merged = mergeSingleGym(original, crawled, conflicts);
      mergedData.push(merged);
      statistics.successfullyMerged++;
    } else {
      // 매칭되지 않은 원본 데이터
      const fallbackData = convertToProcessedGymData(original);
      mergedData.push(fallbackData);
      statistics.fallbackUsed++;
    }
  }

  // 매칭되지 않은 크롤링 데이터 (새로운 헬스장)
  const unmatchedCrawled = crawledData.filter(crawled => 
    !originalData.some(original => original.id === crawled.id)
  );
  
  for (const crawled of unmatchedCrawled) {
    mergedData.push(crawled);
    statistics.successfullyMerged++;
  }

  statistics.totalProcessed = mergedData.length;
  statistics.qualityScore = calculateQualityScore(mergedData);

  return {
    mergedData,
    statistics,
    conflicts
  };
}

// 단일 헬스장 데이터 병합
function mergeSingleGym(original, crawled, conflicts) {
  const merged = {
    id: original.id,
    name: resolveFieldConflict('name', original.name, crawled.name, conflicts, original.name),
    address: resolveFieldConflict('address', original.address, crawled.address, conflicts, original.address),
    phone: resolveFieldConflict('phone', original.phone, crawled.phone, conflicts, crawled.phone),
    latitude: original.latitude || crawled.latitude,
    longitude: original.longitude || crawled.longitude,
    type: original.type || crawled.type,
    is24Hours: original.is24Hours || crawled.is24Hours,
    hasParking: original.hasParking || crawled.hasParking,
    hasShower: original.hasShower || crawled.hasShower,
    createdAt: original.createdAt,
    updatedAt: new Date().toISOString(),
    
    // 크롤링에서 추가된 정보 (중요한 필드들)
    rating: resolveFieldConflict('rating', original.rating, crawled.rating, conflicts, crawled.rating),
    reviewCount: resolveFieldConflict('reviewCount', original.reviewCount, crawled.reviewCount, conflicts, crawled.reviewCount),
    openHour: resolveFieldConflict('openHour', original.openHour, crawled.openHour, conflicts, crawled.openHour),
    closeHour: resolveFieldConflict('closeHour', original.closeHour, crawled.closeHour, conflicts, crawled.closeHour),
    
    // 가격 정보 (크롤링 데이터 우선)
    price: resolveFieldConflict('price', original.price, crawled.price, conflicts, crawled.price),
    membershipPrice: resolveFieldConflict('membershipPrice', original.membershipPrice, crawled.membershipPrice, conflicts, crawled.membershipPrice),
    ptPrice: resolveFieldConflict('ptPrice', original.ptPrice, crawled.ptPrice, conflicts, crawled.ptPrice),
    gxPrice: resolveFieldConflict('gxPrice', original.gxPrice, crawled.gxPrice, conflicts, crawled.gxPrice),
    dayPassPrice: resolveFieldConflict('dayPassPrice', original.dayPassPrice, crawled.dayPassPrice, conflicts, crawled.dayPassPrice),
    priceDetails: resolveFieldConflict('priceDetails', original.priceDetails, crawled.priceDetails, conflicts, crawled.priceDetails),
    minimumPrice: resolveFieldConflict('minimumPrice', original.minimumPrice, crawled.minimumPrice, conflicts, crawled.minimumPrice),
    discountInfo: resolveFieldConflict('discountInfo', original.discountInfo, crawled.discountInfo, conflicts, crawled.discountInfo),
    
    // 시설 및 서비스 정보
    facilities: mergeFacilities(original.facilities, crawled.facilities),
    services: mergeServices(original.services, crawled.services),
    
    // 소셜 미디어 및 웹사이트
    website: resolveFieldConflict('website', original.website, crawled.website, conflicts, crawled.website),
    instagram: resolveFieldConflict('instagram', original.instagram, crawled.instagram, conflicts, crawled.instagram),
    facebook: resolveFieldConflict('facebook', original.facebook, crawled.facebook, conflicts, crawled.facebook),
    
    // 서비스 타입 및 상태
    hasGX: original.hasGX || crawled.hasGX,
    hasPT: original.hasPT || crawled.hasPT,
    hasGroupPT: original.hasGroupPT || crawled.hasGroupPT,
    
    // 메타데이터
    source: mergeSources(original.source, crawled.source),
    confidence: Math.max(original.confidence || 0.5, crawled.confidence),
    serviceType: original.serviceType || crawled.serviceType,
    isCurrentlyOpen: true,
    crawledAt: new Date().toISOString()
  };

  return merged;
}

// 필드 충돌 해결
function resolveFieldConflict(fieldName, originalValue, crawledValue, conflicts, defaultValue) {
  if (!originalValue && !crawledValue) {
    return defaultValue;
  }
  
  if (!originalValue) {
    return crawledValue;
  }
  
  if (!crawledValue) {
    return originalValue;
  }

  // 값이 다른 경우 충돌 기록
  if (originalValue !== crawledValue) {
    conflicts.push({
      gymName: defaultValue || 'Unknown',
      field: fieldName,
      originalValue,
      crawledValue,
      resolution: getResolutionStrategy(fieldName, originalValue, crawledValue)
    });

    return getResolutionStrategy(fieldName, originalValue, crawledValue) === 'crawled' 
      ? crawledValue 
      : originalValue;
  }

  return originalValue;
}

// 충돌 해결 전략 결정
function getResolutionStrategy(fieldName, originalValue, crawledValue) {
  switch (fieldName) {
    case 'name':
      return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original';
    case 'address':
      return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original';
    case 'phone':
      return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original';
    case 'rating':
    case 'reviewCount':
    case 'openHour':
    case 'closeHour':
    case 'price':
    case 'membershipPrice':
    case 'ptPrice':
    case 'gxPrice':
    case 'dayPassPrice':
    case 'priceDetails':
    case 'minimumPrice':
    case 'discountInfo':
    case 'website':
    case 'instagram':
    case 'facebook':
      return crawledValue ? 'crawled' : 'original';
    default:
      return 'original';
  }
}

// 시설 정보 병합
function mergeFacilities(originalFacilities, crawledFacilities) {
  const facilities = [];
  
  if (originalFacilities) {
    if (Array.isArray(originalFacilities)) {
      facilities.push(...originalFacilities);
    } else if (typeof originalFacilities === 'string') {
      facilities.push(originalFacilities);
    }
  }
  
  if (crawledFacilities) {
    if (Array.isArray(crawledFacilities)) {
      facilities.push(...crawledFacilities);
    } else if (typeof crawledFacilities === 'string') {
      facilities.push(crawledFacilities);
    }
  }
  
  return [...new Set(facilities.filter(f => f && f.trim()))];
}

// 서비스 정보 병합
function mergeServices(originalServices, crawledServices) {
  const services = [];
  
  if (originalServices && Array.isArray(originalServices)) {
    services.push(...originalServices);
  }
  
  if (crawledServices && Array.isArray(crawledServices)) {
    services.push(...crawledServices);
  }
  
  return [...new Set(services.filter(s => s && s.trim()))];
}

// 소스 정보 병합
function mergeSources(originalSource, crawledSource) {
  const sources = [];
  
  if (originalSource) {
    sources.push(originalSource);
  }
  
  if (crawledSource && crawledSource !== originalSource) {
    sources.push(crawledSource);
  }
  
  return sources.join(' + ');
}

// 원본 데이터를 ProcessedGymData 형식으로 변환
function convertToProcessedGymData(original) {
  return {
    id: original.id,
    name: original.name,
    address: original.address,
    phone: original.phone,
    latitude: original.latitude,
    longitude: original.longitude,
    type: original.type,
    is24Hours: original.is24Hours,
    hasParking: original.hasParking,
    hasShower: original.hasShower,
    createdAt: original.createdAt,
    updatedAt: new Date().toISOString(),
    
    // 기존 크롤링 정보 보존
    rating: original.rating,
    reviewCount: original.reviewCount,
    openHour: original.openHour,
    closeHour: original.closeHour,
    price: original.price,
    membershipPrice: original.membershipPrice,
    ptPrice: original.ptPrice,
    gxPrice: original.gxPrice,
    dayPassPrice: original.dayPassPrice,
    priceDetails: original.priceDetails,
    minimumPrice: original.minimumPrice,
    discountInfo: original.discountInfo,
    facilities: original.facilities,
    services: original.services,
    website: original.website,
    instagram: original.instagram,
    facebook: original.facebook,
    hasGX: original.hasGX,
    hasPT: original.hasPT,
    hasGroupPT: original.hasGroupPT,
    
    // 메타데이터
    source: original.source || 'gyms_raw_fallback',
    confidence: original.confidence || 0.5,
    serviceType: original.serviceType || 'gym',
    isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
    crawledAt: original.crawledAt || new Date().toISOString()
  };
}

// 품질 점수 계산
function calculateQualityScore(data) {
  if (data.length === 0) return 0;

  const totalScore = data.reduce((sum, item) => {
    let score = 0;
    let factors = 0;

    // 기본 정보 완성도
    if (item.name) { score += 0.2; factors += 0.2; }
    if (item.address) { score += 0.2; factors += 0.2; }
    if (item.phone) { score += 0.15; factors += 0.15; }

    // 추가 정보
    if (item.rating) { score += 0.1; factors += 0.1; }
    if (item.reviewCount) { score += 0.1; factors += 0.1; }
    if (item.confidence) { score += item.confidence * 0.1; factors += 0.1; }

    return sum + (factors > 0 ? score / factors : 0);
  }, 0);

  return totalScore / data.length;
}

// 테스트 실행
async function testDataMerging() {
  console.log('🧪 데이터 병합 로직 테스트 시작');
  console.log('='.repeat(50));
  
  try {
    // 테스트 데이터 생성
    const { originalData, crawledData } = createTestData();
    
    console.log('📋 테스트 데이터 생성 완료');
    console.log(`📊 원본 데이터: ${originalData.length}개 헬스장`);
    console.log(`📊 크롤링 데이터: ${crawledData.length}개 헬스장`);
    
    // 원본 데이터 출력
    console.log('\n📄 원본 데이터 (gyms_raw.json):');
    originalData.forEach((gym, index) => {
      console.log(`  ${index + 1}. ${gym.name}`);
      console.log(`     📞 전화번호: ${gym.phone || '없음'}`);
      console.log(`     🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'}`);
      console.log(`     💰 가격: ${gym.price || '없음'}`);
      console.log(`     ⭐ 평점: ${gym.rating || '없음'}`);
      console.log(`     🎯 신뢰도: ${gym.confidence || '없음'}`);
    });
    
    // 크롤링 데이터 출력
    console.log('\n🔍 크롤링된 데이터:');
    crawledData.forEach((gym, index) => {
      console.log(`  ${index + 1}. ${gym.name}`);
      console.log(`     📞 전화번호: ${gym.phone || '없음'}`);
      console.log(`     🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'}`);
      console.log(`     💰 가격: ${gym.price || '없음'}`);
      console.log(`     ⭐ 평점: ${gym.rating || '없음'}`);
      console.log(`     🎯 신뢰도: ${gym.confidence || '없음'}`);
      console.log(`     🏢 시설: ${gym.facilities?.length || 0}개`);
      console.log(`     🔗 웹사이트: ${gym.website || '없음'}`);
    });
    
    // 데이터 병합 실행
    console.log('\n🔄 데이터 병합 실행 중...');
    const mergeResult = simulateDataMerging(originalData, crawledData);
    
    // 병합 결과 출력
    console.log('\n✅ 병합 완료!');
    console.log(`📊 병합된 데이터: ${mergeResult.mergedData.length}개 헬스장`);
    console.log(`📈 성공적 병합: ${mergeResult.statistics.successfullyMerged}개`);
    console.log(`📉 폴백 사용: ${mergeResult.statistics.fallbackUsed}개`);
    console.log(`⭐ 품질 점수: ${mergeResult.statistics.qualityScore.toFixed(2)}`);
    
    if (mergeResult.conflicts.length > 0) {
      console.log(`⚠️ 충돌 발생: ${mergeResult.conflicts.length}개 필드`);
      mergeResult.conflicts.forEach(conflict => {
        console.log(`  - ${conflict.gymName}: ${conflict.field} (${conflict.resolution})`);
        console.log(`    원본: ${conflict.originalValue}`);
        console.log(`    크롤링: ${conflict.crawledValue}`);
      });
    }
    
    // 병합된 데이터 상세 출력
    console.log('\n📋 병합된 최종 데이터:');
    mergeResult.mergedData.forEach((gym, index) => {
      console.log(`\n  ${index + 1}. ${gym.name}`);
      console.log(`     📞 전화번호: ${gym.phone || '없음'}`);
      console.log(`     🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'}`);
      console.log(`     💰 가격: ${gym.price || '없음'}`);
      console.log(`     💳 회원권: ${gym.membershipPrice || '없음'}`);
      console.log(`     🏋️ PT: ${gym.ptPrice || '없음'}`);
      console.log(`     🎵 GX: ${gym.gxPrice || '없음'}`);
      console.log(`     🎫 일일권: ${gym.dayPassPrice || '없음'}`);
      console.log(`     ⭐ 평점: ${gym.rating || '없음'} (리뷰 ${gym.reviewCount || 0}개)`);
      console.log(`     🏢 시설: ${gym.facilities?.length || 0}개`);
      console.log(`     🔗 웹사이트: ${gym.website || '없음'}`);
      console.log(`     📱 인스타그램: ${gym.instagram || '없음'}`);
      console.log(`     🎯 신뢰도: ${gym.confidence.toFixed(2)}`);
      console.log(`     📊 소스: ${gym.source}`);
    });
    
    // 결과를 파일로 저장
    const testResult = {
      timestamp: new Date().toISOString(),
      testType: 'data_merging',
      summary: {
        totalProcessed: mergeResult.statistics.totalProcessed,
        successfullyMerged: mergeResult.statistics.successfullyMerged,
        fallbackUsed: mergeResult.statistics.fallbackUsed,
        qualityScore: mergeResult.statistics.qualityScore,
        conflictsCount: mergeResult.conflicts.length
      },
      originalData,
      crawledData,
      mergedData: mergeResult.mergedData,
      conflicts: mergeResult.conflicts,
      statistics: mergeResult.statistics
    };
    
    await fs.writeFile(
      path.join(__dirname, '../../data/test_data_merging_result.json'),
      JSON.stringify(testResult, null, 2),
      'utf-8'
    );
    
    console.log(`\n💾 상세 결과가 'src/data/test_data_merging_result.json'에 저장되었습니다.`);
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  }
}

// 테스트 실행
testDataMerging()
  .then(() => {
    console.log('\n🎉 데이터 병합 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  });
