/**
 * 경로 유틸리티
 * 프로젝트 전반에서 사용하는 경로 관련 유틸리티 함수
 */

import * as path from 'path'
import { getFilename } from '@backend/utils/pathUtils'

/**
 * 프로젝트 루트 디렉토리 경로를 반환
 * 실행 위치에 관계없이 일관된 경로를 제공
 */
export function getProjectRoot(): string {
  const __filename = getFilename()
  return path.resolve(__filename, '..', '..', '..', '..', '..', '..')
}

/**
 * gyms_raw.json 파일의 절대 경로를 반환
 */
export function getGymsRawPath(): string {
  return path.join(getProjectRoot(), 'src', 'data', 'gyms_raw.json')
}

/**
 * 데이터 디렉토리 경로를 반환
 */
export function getDataDir(): string {
  return path.join(getProjectRoot(), 'src', 'data')
}

/**
 * 크롤링 히스토리 디렉토리 경로를 반환
 */
export function getCrawlingHistoryDir(): string {
  return path.join(getProjectRoot(), 'logs')
}

/**
 * 크롤링 히스토리 JSON 파일 경로를 반환
 */
export function getCrawlingHistoryPath(): string {
  return path.join(getCrawlingHistoryDir(), 'crawling-history.json')
}

