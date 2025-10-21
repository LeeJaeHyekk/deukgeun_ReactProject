/**
 * 간단한 크롤링 테스트 (JavaScript 버전)
 */

import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 네이버 카페 검색 테스트 함수
async function testNaverCafeSearch() {
  console.log('🧪 네이버 카페 검색 로직 테스트 시작');
  console.log('='.repeat(50));
  
  try {
    // 테스트용 헬스장 데이터
    const testGyms = [
      { name: '페이즈짐', address: '서울특별시 서초구 효령로55길 10' },
      { name: '아하피트니스', address: '서울특별시 동작구 상도로 94' }
    ];
    
    console.log(`📋 테스트 대상: ${testGyms.length}개 헬스장`);
    
    const results = [];
    
    for (let i = 0; i < testGyms.length; i++) {
      const gym = testGyms[i];
      console.log(`\n🔍 테스트 ${i + 1}/${testGyms.length}: ${gym.name}`);
      console.log(`📍 주소: ${gym.address}`);
      
      try {
        const startTime = Date.now();
        
        // 네이버 카페 검색 URL 생성
        const searchQuery = encodeURIComponent(`${gym.name} 헬스장`);
        const searchUrl = `https://search.naver.com/search.naver?where=cafe&query=${searchQuery}`;
        
        console.log(`🔗 검색 URL: ${searchUrl}`);
        
        // HTTP 요청
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 30000
        });
        
        const endTime = Date.now();
        
        if (response.status === 200) {
          console.log(`✅ HTTP 요청 성공 (${endTime - startTime}ms)`);
          
          // HTML 파싱
          const $ = cheerio.load(response.data);
          const pageText = $('body').text();
          
          // 정보 추출 테스트
          const extractedInfo = extractGymInfo(pageText, gym.name);
          
          if (extractedInfo.hasInfo) {
            console.log(`✅ 정보 추출 성공`);
            console.log(`📞 전화번호: ${extractedInfo.phone || '없음'}`);
            console.log(`🕐 운영시간: ${extractedInfo.openHour || '없음'} - ${extractedInfo.closeHour || '없음'}`);
            console.log(`💰 가격: ${extractedInfo.price || '없음'}`);
            console.log(`⭐ 평점: ${extractedInfo.rating || '없음'}`);
            console.log(`🏢 시설 키워드: ${extractedInfo.facilities.length}개`);
            console.log(`🎯 신뢰도: ${extractedInfo.confidence.toFixed(2)}`);
            
            results.push({
              gymName: gym.name,
              success: true,
              data: extractedInfo,
              duration: endTime - startTime
            });
          } else {
            console.log(`❌ 정보 추출 실패 - 관련 정보를 찾을 수 없음`);
            results.push({
              gymName: gym.name,
              success: false,
              data: null,
              duration: endTime - startTime
            });
          }
        } else {
          console.log(`❌ HTTP 요청 실패: ${response.status}`);
          results.push({
            gymName: gym.name,
            success: false,
            error: `HTTP ${response.status}`,
            duration: endTime - startTime
          });
        }
      } catch (error) {
        console.error(`❌ 검색 오류:`, error.message);
        results.push({
          gymName: gym.name,
          success: false,
          error: error.message,
          duration: 0
        });
      }
      
      // 다음 테스트 전 지연
      if (i < testGyms.length - 1) {
        console.log('⏳ 다음 테스트를 위해 3초 대기...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(50));
    
    const successfulSearches = results.filter(r => r.success);
    const failedSearches = results.filter(r => !r.success);
    
    console.log(`✅ 성공: ${successfulSearches.length}개`);
    console.log(`❌ 실패: ${failedSearches.length}개`);
    console.log(`📈 성공률: ${((successfulSearches.length / results.length) * 100).toFixed(1)}%`);
    
    if (successfulSearches.length > 0) {
      const avgDuration = successfulSearches.reduce((sum, r) => sum + r.duration, 0) / successfulSearches.length;
      console.log(`⏱️ 평균 응답 시간: ${avgDuration.toFixed(0)}ms`);
      
      const avgConfidence = successfulSearches.reduce((sum, r) => sum + (r.data?.confidence || 0), 0) / successfulSearches.length;
      console.log(`🎯 평균 신뢰도: ${avgConfidence.toFixed(2)}`);
      
      // 추출된 정보 통계
      const withPhone = successfulSearches.filter(r => r.data?.phone).length;
      const withPrice = successfulSearches.filter(r => r.data?.price).length;
      const withRating = successfulSearches.filter(r => r.data?.rating).length;
      const withHours = successfulSearches.filter(r => r.data?.openHour).length;
      
      console.log(`📞 전화번호 추출: ${withPhone}개`);
      console.log(`💰 가격 정보 추출: ${withPrice}개`);
      console.log(`⭐ 평점 추출: ${withRating}개`);
      console.log(`🕐 운영시간 추출: ${withHours}개`);
    }
    
    // 결과를 파일로 저장
    const testResult = {
      timestamp: new Date().toISOString(),
      testType: 'naver_cafe_search_simple',
      summary: {
        total: results.length,
        successful: successfulSearches.length,
        failed: failedSearches.length,
        successRate: (successfulSearches.length / results.length) * 100
      },
      results: results
    };
    
    await fs.writeFile(
      path.join(__dirname, '../../data/test_naver_cafe_search_simple.json'),
      JSON.stringify(testResult, null, 2),
      'utf-8'
    );
    
    console.log(`\n💾 상세 결과가 'src/data/test_naver_cafe_search_simple.json'에 저장되었습니다.`);
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  }
}

// 헬스장 정보 추출 함수
function extractGymInfo(pageText, gymName) {
  const info = {
    hasInfo: false,
    phone: null,
    openHour: null,
    closeHour: null,
    price: null,
    rating: null,
    facilities: [],
    confidence: 0
  };
  
  // 전화번호 추출
  const phonePatterns = [
    /(\d{2,3}-\d{3,4}-\d{4})/g,
    /(\d{2,3}\s\d{3,4}\s\d{4})/g,
    /(\d{10,11})/g
  ];
  
  for (const pattern of phonePatterns) {
    const match = pageText.match(pattern);
    if (match && match[1]) {
      info.phone = match[1].replace(/\s+/g, '-');
      break;
    }
  }
  
  // 운영시간 추출
  const timePatterns = [
    /(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/g,
    /(\d{1,2}시)\s*[-~]\s*(\d{1,2}시)/g,
    /오픈\s*(\d{1,2}:\d{2})/g,
    /마감\s*(\d{1,2}:\d{2})/g
  ];
  
  for (const pattern of timePatterns) {
    const match = pattern.exec(pageText);
    if (match) {
      if (match[2]) {
        info.openHour = match[1];
        info.closeHour = match[2];
      } else if (match[1]) {
        info.openHour = match[1];
      }
      break;
    }
  }
  
  // 가격 정보 추출
  const pricePatterns = [
    /(\d{1,3}(?:,\d{3})*)\s*원/g,
    /(\d{1,3}(?:,\d{3})*)\s*만원/g,
    /월\s*(\d{1,3}(?:,\d{3})*)\s*원/g
  ];
  
  for (const pattern of pricePatterns) {
    const matches = pageText.match(pattern);
    if (matches && matches.length > 0) {
      info.price = matches[0];
      break;
    }
  }
  
  // 평점 추출
  const ratingPatterns = [
    /평점\s*(\d+\.?\d*)/g,
    /별점\s*(\d+\.?\d*)/g,
    /(\d+\.?\d*)\s*점/g,
    /(\d+\.?\d*)\s*\/\s*5/g
  ];
  
  for (const pattern of ratingPatterns) {
    const match = pageText.match(pattern);
    if (match && match[1]) {
      const rating = parseFloat(match[1]);
      if (rating >= 0 && rating <= 5) {
        info.rating = rating;
        break;
      }
    }
  }
  
  // 시설 키워드 추출
  const facilityKeywords = [
    '헬스장', '피트니스', '운동', 'PT', 'GX', '요가', '필라테스',
    '크로스핏', '웨이트', '유산소', '근력운동', '다이어트',
    '24시간', '샤워시설', '주차장', '락커룸', '운동복',
    '개인트레이너', '그룹레슨', '회원권', '일일권', '리뷰',
    '후기', '추천', '시설', '환경', '트레이너', '회원'
  ];
  
  info.facilities = facilityKeywords.filter(keyword => 
    pageText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 신뢰도 계산
  let confidence = 0;
  if (info.phone) confidence += 0.3;
  if (info.openHour) confidence += 0.2;
  if (info.price) confidence += 0.2;
  if (info.rating) confidence += 0.1;
  if (info.facilities.length > 0) confidence += 0.1;
  
  info.confidence = Math.min(confidence, 1.0);
  info.hasInfo = confidence > 0.3;
  
  return info;
}

// 테스트 실행
testNaverCafeSearch()
  .then(() => {
    console.log('\n🎉 네이버 카페 검색 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  });
