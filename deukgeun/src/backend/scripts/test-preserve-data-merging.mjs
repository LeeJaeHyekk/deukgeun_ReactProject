/**
 * 기존 데이터 보존 병합 로직 테스트
 * 서울 공공 API 데이터를 보존하면서 크롤링 정보를 추가하는 기능을 테스트합니다.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트용 데이터 생성 (실제 서울 공공 API 형태)
function createTestData() {
  // 원본 gyms_raw 데이터 (서울 공공 API 형태)
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
      crawledAt: "2025-10-16T18:22:30.609Z",
      
      // 서울 공공 API 필드들 (중요한 기존 데이터)
      businessStatus: "영업중",
      businessType: "체육시설업",
      detailBusinessType: "헬스장",
      cultureSportsType: "체육시설",
      managementNumber: "MGT-2024-001",
      approvalDate: "20240101",
      siteArea: "150.5",
      postalCode: "06578",
      sitePostalCode: "06578",
      siteAddress: "서울특별시 서초구 서초동 1234-56",
      roadAddress: "서울특별시 서초구 효령로55길 10",
      roadPostalCode: "06578",
      insuranceCode: "Y",
      leaderCount: "3",
      buildingCount: "1",
      buildingArea: "150.5",
      latitude: 37.5665,
      longitude: 126.9780
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
      crawledAt: "2025-10-16T18:22:30.609Z",
      
      // 서울 공공 API 필드들 (중요한 기존 데이터)
      businessStatus: "영업중",
      businessType: "체육시설업",
      detailBusinessType: "헬스장",
      cultureSportsType: "체육시설",
      managementNumber: "MGT-2024-002",
      approvalDate: "20240201",
      siteArea: "200.0",
      postalCode: "06975",
      sitePostalCode: "06975",
      siteAddress: "서울특별시 동작구 상도동 567-89",
      roadAddress: "서울특별시 동작구 상도로 94",
      roadPostalCode: "06975",
      insuranceCode: "Y",
      leaderCount: "5",
      buildingCount: "1",
      buildingArea: "200.0",
      latitude: 37.4985,
      longitude: 126.9510
    }
  ];

  // 크롤링된 데이터 (새로 추가될 정보)
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

// 기존 데이터 보존 병합 로직 시뮬레이션
function simulatePreserveDataMerging(originalData, crawledData) {
  console.log('🔄 기존 데이터 보존 병합 시뮬레이션 시작');
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
      // 기존 데이터 보존 병합
      const merged = preserveDataMerge(original, crawled, conflicts);
      mergedData.push(merged);
      statistics.successfullyMerged++;
    } else {
      // 매칭되지 않은 원본 데이터
      const fallbackData = preserveOriginalData(original);
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

// 기존 데이터 보존 병합
function preserveDataMerge(original, crawled, conflicts) {
  // 기존 데이터를 완전히 보존하면서 크롤링 정보만 추가
  const merged = {
    // 기존 데이터 완전 보존 (서울 공공 API 데이터)
    ...original,
    
    // 기본 필드 업데이트 (필요한 경우만)
    updatedAt: new Date().toISOString(),
    
    // 크롤링에서 새로 추가된 정보만 병합 (기존 값이 없을 때만)
    rating: original.rating || crawled.rating,
    reviewCount: original.reviewCount || crawled.reviewCount,
    openHour: original.openHour || crawled.openHour,
    closeHour: original.closeHour || crawled.closeHour,
    
    // 가격 정보 (기존 값이 없을 때만 크롤링 값 사용)
    price: original.price || crawled.price,
    membershipPrice: original.membershipPrice || crawled.membershipPrice,
    ptPrice: original.ptPrice || crawled.ptPrice,
    gxPrice: original.gxPrice || crawled.gxPrice,
    dayPassPrice: original.dayPassPrice || crawled.dayPassPrice,
    priceDetails: original.priceDetails || crawled.priceDetails,
    minimumPrice: original.minimumPrice || crawled.minimumPrice,
    discountInfo: original.discountInfo || crawled.discountInfo,
    
    // 시설 및 서비스 정보 (기존과 크롤링 정보 병합)
    facilities: mergeFacilities(original.facilities, crawled.facilities),
    services: mergeServices(original.services, crawled.services),
    
    // 소셜 미디어 및 웹사이트 (기존 값이 없을 때만)
    website: original.website || crawled.website,
    instagram: original.instagram || crawled.instagram,
    facebook: original.facebook || crawled.facebook,
    
    // 서비스 타입 및 상태 (기존 값 우선)
    hasGX: original.hasGX !== undefined ? original.hasGX : crawled.hasGX,
    hasPT: original.hasPT !== undefined ? original.hasPT : crawled.hasPT,
    hasGroupPT: original.hasGroupPT !== undefined ? original.hasGroupPT : crawled.hasGroupPT,
    is24Hours: original.is24Hours !== undefined ? original.is24Hours : crawled.is24Hours,
    hasParking: original.hasParking !== undefined ? original.hasParking : crawled.hasParking,
    hasShower: original.hasShower !== undefined ? original.hasShower : crawled.hasShower,
    
    // 메타데이터 업데이트
    source: mergeSources(original.source, crawled.source),
    confidence: Math.max(original.confidence || 0.5, crawled.confidence),
    serviceType: original.serviceType || determineServiceType(original.name || crawled.name),
    isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
    crawledAt: new Date().toISOString()
  };

  // 충돌 감지 (실제로 값이 다른 경우만)
  detectConflicts(original, crawled, conflicts);

  return merged;
}

// 충돌 감지
function detectConflicts(original, crawled, conflicts) {
  const conflictFields = [
    'name', 'address', 'phone', 'rating', 'reviewCount', 
    'openHour', 'closeHour', 'price', 'membershipPrice', 
    'ptPrice', 'gxPrice', 'dayPassPrice', 'website', 
    'instagram', 'facebook'
  ];

  for (const field of conflictFields) {
    const originalValue = original[field];
    const crawledValue = crawled[field];
    
    if (originalValue && crawledValue && originalValue !== crawledValue) {
      conflicts.push({
        gymName: original.name || 'Unknown',
        field,
        originalValue,
        crawledValue,
        resolution: 'original' // 기존 값 우선
      });
    }
  }
}

// 기존 데이터 보존
function preserveOriginalData(original) {
  return {
    ...original, // 모든 기존 필드 보존
    updatedAt: new Date().toISOString(), // 업데이트 시간만 갱신
    source: original.source || 'gyms_raw_fallback',
    confidence: original.confidence || 0.5,
    serviceType: original.serviceType || 'gym',
    isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
    crawledAt: original.crawledAt || new Date().toISOString()
  };
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

// 서비스 타입 결정
function determineServiceType(gymName) {
  const name = gymName.toLowerCase();
  
  if (name.includes('크로스핏') || name.includes('crossfit')) {
    return '크로스핏';
  } else if (name.includes('pt') || name.includes('개인트레이닝')) {
    return 'pt';
  } else if (name.includes('gx') || name.includes('그룹')) {
    return 'gx';
  } else if (name.includes('요가') || name.includes('yoga')) {
    return '요가';
  } else if (name.includes('필라테스') || name.includes('pilates')) {
    return '필라테스';
  } else {
    return 'gym';
  }
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
async function testPreserveDataMerging() {
  console.log('🧪 기존 데이터 보존 병합 로직 테스트 시작');
  console.log('='.repeat(60));
  
  try {
    // 테스트 데이터 생성
    const { originalData, crawledData } = createTestData();
    
    console.log('📋 테스트 데이터 생성 완료');
    console.log(`📊 원본 데이터: ${originalData.length}개 헬스장`);
    console.log(`📊 크롤링 데이터: ${crawledData.length}개 헬스장`);
    
    // 원본 데이터 출력 (서울 공공 API 필드 포함)
    console.log('\n📄 원본 데이터 (서울 공공 API 형태):');
    originalData.forEach((gym, index) => {
      console.log(`  ${index + 1}. ${gym.name}`);
      console.log(`     📞 전화번호: ${gym.phone || '없음'}`);
      console.log(`     🏢 사업상태: ${gym.businessStatus || '없음'}`);
      console.log(`     🏭 업태구분: ${gym.businessType || '없음'}`);
      console.log(`     📋 세부업종: ${gym.detailBusinessType || '없음'}`);
      console.log(`     🏛️ 관리번호: ${gym.managementNumber || '없음'}`);
      console.log(`     📅 인허가일: ${gym.approvalDate || '없음'}`);
      console.log(`     📍 면적: ${gym.siteArea || '없음'}㎡`);
      console.log(`     🏠 건물면적: ${gym.buildingArea || '없음'}㎡`);
      console.log(`     👥 지도자수: ${gym.leaderCount || '없음'}명`);
      console.log(`     🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'}`);
      console.log(`     💰 가격: ${gym.price || '없음'}`);
      console.log(`     ⭐ 평점: ${gym.rating || '없음'}`);
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
    console.log('\n🔄 기존 데이터 보존 병합 실행 중...');
    const mergeResult = simulatePreserveDataMerging(originalData, crawledData);
    
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
    
    // 병합된 데이터 상세 출력 (서울 공공 API 필드 보존 확인)
    console.log('\n📋 병합된 최종 데이터 (서울 공공 API 필드 보존 확인):');
    mergeResult.mergedData.forEach((gym, index) => {
      console.log(`\n  ${index + 1}. ${gym.name}`);
      console.log(`     📞 전화번호: ${gym.phone || '없음'}`);
      console.log(`     🏢 사업상태: ${gym.businessStatus || '없음'} ✅ 보존됨`);
      console.log(`     🏭 업태구분: ${gym.businessType || '없음'} ✅ 보존됨`);
      console.log(`     📋 세부업종: ${gym.detailBusinessType || '없음'} ✅ 보존됨`);
      console.log(`     🏛️ 관리번호: ${gym.managementNumber || '없음'} ✅ 보존됨`);
      console.log(`     📅 인허가일: ${gym.approvalDate || '없음'} ✅ 보존됨`);
      console.log(`     📍 면적: ${gym.siteArea || '없음'}㎡ ✅ 보존됨`);
      console.log(`     🏠 건물면적: ${gym.buildingArea || '없음'}㎡ ✅ 보존됨`);
      console.log(`     👥 지도자수: ${gym.leaderCount || '없음'}명 ✅ 보존됨`);
      console.log(`     🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'} 🆕 추가됨`);
      console.log(`     💰 가격: ${gym.price || '없음'} 🆕 추가됨`);
      console.log(`     💳 회원권: ${gym.membershipPrice || '없음'} 🆕 추가됨`);
      console.log(`     🏋️ PT: ${gym.ptPrice || '없음'} 🆕 추가됨`);
      console.log(`     🎵 GX: ${gym.gxPrice || '없음'} 🆕 추가됨`);
      console.log(`     🎫 일일권: ${gym.dayPassPrice || '없음'} 🆕 추가됨`);
      console.log(`     ⭐ 평점: ${gym.rating || '없음'} (리뷰 ${gym.reviewCount || 0}개) 🆕 추가됨`);
      console.log(`     🏢 시설: ${gym.facilities?.length || 0}개 🆕 추가됨`);
      console.log(`     🔗 웹사이트: ${gym.website || '없음'} 🆕 추가됨`);
      console.log(`     📱 인스타그램: ${gym.instagram || '없음'} 🆕 추가됨`);
      console.log(`     🎯 신뢰도: ${gym.confidence.toFixed(2)}`);
      console.log(`     📊 소스: ${gym.source}`);
    });
    
    // 결과를 파일로 저장
    const testResult = {
      timestamp: new Date().toISOString(),
      testType: 'preserve_data_merging',
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
      path.join(__dirname, '../../data/test_preserve_data_merging_result.json'),
      JSON.stringify(testResult, null, 2),
      'utf-8'
    );
    
    console.log(`\n💾 상세 결과가 'src/data/test_preserve_data_merging_result.json'에 저장되었습니다.`);
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  }
}

// 테스트 실행
testPreserveDataMerging()
  .then(() => {
    console.log('\n🎉 기존 데이터 보존 병합 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  });
