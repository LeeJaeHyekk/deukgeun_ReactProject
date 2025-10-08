// 파일 시스템 모듈 import (파일 쓰기 기능)
const { writeFileSync  } = require('fs')
// 경로 처리 유틸리티 import
const { resolve  } = require('path')

/**
 * 번들 청크 정보 인터페이스
 * 각 청크의 크기와 의존성 정보를 담음
 */
interface BundleInfo {
  name: string // 청크 이름
  size: number // 원본 크기 (바이트)
  gzippedSize: number // gzip 압축 후 크기 (바이트)
  dependencies: string[] // 의존하는 모듈 목록
}

/**
 * 번들 분석 결과 인터페이스
 * 전체 번들에 대한 분석 정보를 담음
 */
interface BundleAnalysis {
  totalSize: number // 전체 번들 크기
  totalGzippedSize: number // 전체 gzip 압축 후 크기
  chunks: BundleInfo[] // 청크별 상세 정보
  recommendations: string[] // 최적화 권장사항 목록
}

/**
 * 번들 통계를 분석하여 최적화 권장사항을 생성
 * @param bundleStats - Rollup/Vite에서 생성된 번들 통계 객체
 * @returns 분석된 번들 정보와 권장사항
 */
function analyzeBundle(bundleStats: any): BundleAnalysis {
  const chunks: BundleInfo[] = [] // 분석된 청크 정보를 저장할 배열
  let totalSize = 0 // 전체 번들 크기
  let totalGzippedSize = 0 // 전체 gzip 압축 후 크기

  // 번들 통계에서 청크 정보 추출 및 분석
  if (bundleStats.chunks) {
    bundleStats.chunks.forEach((chunk: any) => {
      const size = chunk.size || 0 // 청크 원본 크기
      const gzippedSize = Math.round(size * 0.3) // 대략적인 gzip 압축률 (30% 가정)

      // 청크 정보 객체 생성
      chunks.push({
        name: chunk.name || "unknown", // 청크 이름 (없으면 unknown)
        size, // 원본 크기
        gzippedSize, // 압축 후 크기
        dependencies: chunk.modules?.map((mod: any) => mod.name) || [], // 의존성 모듈 목록
      })

      // 전체 크기에 추가
      totalSize += size
      totalGzippedSize += gzippedSize
    })
  }

  // 최적화 권장사항 생성
  const recommendations: string[] = []

  // 번들 크기가 1MB를 초과하는 경우 권장사항 추가
  if (totalSize > 1024 * 1024) {
    recommendations.push(
      "번들 크기가 1MB를 초과합니다. 코드 분할을 고려하세요."
    )
  }

  // 500KB 이상의 큰 청크가 있는 경우 권장사항 추가
  const largeChunks = chunks.filter(chunk => chunk.size > 500 * 1024) // 500KB 이상
  if (largeChunks.length > 0) {
    recommendations.push(
      `큰 청크가 ${largeChunks.length}개 있습니다: ${largeChunks.map(c => c.name).join(", ")}`
    )
  }

  // 중복 의존성이 있는 경우 권장사항 추가
  const duplicateDeps = findDuplicateDependencies(chunks)
  if (duplicateDeps.length > 0) {
    recommendations.push(
      `중복 의존성이 발견되었습니다: ${duplicateDeps.join(", ")}`
    )
  }

  // 분석 결과 반환 (청크는 크기 순으로 정렬)
  return {
    totalSize,
    totalGzippedSize,
    chunks: chunks.sort((a, b) => b.size - a.size), // 크기 내림차순 정렬
    recommendations,
  }
}

/**
 * 청크들에서 중복되는 의존성을 찾아 반환
 * @param chunks - 분석할 청크 배열
 * @returns 중복되는 의존성 모듈 이름 배열
 */
function findDuplicateDependencies(chunks: BundleInfo[]): string[] {
  // 모든 청크의 의존성을 하나의 배열로 합침
  const allDeps = chunks.flatMap(chunk => chunk.dependencies)

  // 의존성별 출현 횟수를 카운트
  const depCount = allDeps.reduce(
    (acc, dep) => {
      acc[dep] = (acc[dep] || 0) + 1 // 출현 횟수 증가
      return acc
    },
    {} as Record<string, number>
  )

  // 2번 이상 출현하는 의존성만 필터링하여 반환
  return Object.entries(depCount)
    .filter(([_, count]) => count > 1) // 2번 이상 출현
    .map(([dep, _]) => dep) // 모듈 이름만 추출
}

/**
 * 번들 분석 결과를 JSON 파일로 저장
 * @param analysis - 분석된 번들 정보
 * @param outputPath - 출력 파일 경로 (기본값: bundle-analysis.json)
 * @returns 생성된 보고서 객체
 */
function generateBundleReport(
  analysis: BundleAnalysis,
  outputPath: string = "bundle-analysis.json"
) {
  // 보고서 객체 생성
  const report = {
    timestamp: new Date().toISOString(), // 생성 시간
    analysis, // 분석 결과
    summary: {
      totalChunks: analysis.chunks.length, // 총 청크 수
      averageChunkSize: Math.round(analysis.totalSize / analysis.chunks.length), // 평균 청크 크기
      largestChunk: analysis.chunks[0]?.name || "none", // 가장 큰 청크 이름
      largestChunkSize: analysis.chunks[0]?.size || 0, // 가장 큰 청크 크기
    },
  }

  // JSON 파일로 저장
  writeFileSync(resolve(outputPath), JSON.stringify(report, null, 2))
  console.log(`📊 번들 분석 보고서가 ${outputPath}에 저장되었습니다.`)

  return report
}

/**
 * 바이트 단위를 사람이 읽기 쉬운 형태로 변환
 * @param bytes - 변환할 바이트 수
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
function formatBytes(bytes: number): string {
  // 0바이트인 경우 즉시 반환
  if (bytes === 0) return "0 Bytes"

  const k = 1024 // 1KB = 1024바이트
  const sizes = ["Bytes", "KB", "MB", "GB"] // 단위 배열
  const i = Math.floor(Math.log(bytes) / Math.log(k)) // 적절한 단위 인덱스 계산

  // 소수점 2자리까지 반올림하여 반환
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
