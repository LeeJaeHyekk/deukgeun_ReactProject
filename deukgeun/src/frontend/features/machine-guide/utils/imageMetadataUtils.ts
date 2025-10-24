// ============================================================================
// Image Metadata Utilities
// ============================================================================

import type { ImageMetadata, ImageClassification, ImageUsage } from "../../../../shared/types/dto/machine.dto"

/**
 * 이미지 파일에서 메타데이터를 추출합니다.
 * @param imageUrl - 이미지 URL
 * @param fileName - 파일명
 * @returns Promise<ImageMetadata>
 */
export async function extractImageMetadata(
  imageUrl: string, 
  fileName: string
): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      // 파일 크기는 추정값 (실제로는 서버에서 가져와야 함)
      const estimatedFileSize = estimateFileSize(img.width, img.height)
      
      const metadata: ImageMetadata = {
        fileName,
        fileSize: estimatedFileSize,
        dimensions: {
          width: img.width,
          height: img.height
        },
        format: getImageFormat(fileName),
        lastModified: new Date(),
        checksum: generateChecksum(fileName)
      }
      
      resolve(metadata)
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`))
    }
    
    img.src = imageUrl
  })
}

/**
 * 이미지 분류 정보를 생성합니다.
 * @param fileName - 파일명
 * @param category - 머신 카테고리
 * @returns ImageClassification
 */
export function generateImageClassification(
  fileName: string,
  category: string
): ImageClassification {
  return {
    type: getImageType(fileName, category),
    angle: getImageAngle(fileName),
    lighting: getImageLighting(fileName),
    background: getImageBackground(fileName)
  }
}

/**
 * 이미지 사용 정보를 생성합니다.
 * @param fileName - 파일명
 * @param isMainImage - 메인 이미지 여부
 * @returns ImageUsage
 */
export function generateImageUsage(
  fileName: string,
  isMainImage: boolean = true
): ImageUsage {
  return {
    isThumbnail: fileName.includes('thumb') || fileName.includes('small'),
    isMainImage,
    displayOrder: getDisplayOrder(fileName),
    altText: generateAltText(fileName)
  }
}

/**
 * 파일 크기를 추정합니다.
 * @param width - 이미지 너비
 * @param height - 이미지 높이
 * @returns 추정 파일 크기 (bytes)
 */
function estimateFileSize(width: number, height: number): number {
  // PNG 기준으로 대략적인 파일 크기 추정
  const pixels = width * height
  const bytesPerPixel = 4 // RGBA
  const compressionRatio = 0.3 // PNG 압축률
  return Math.round(pixels * bytesPerPixel * compressionRatio)
}

/**
 * 파일명에서 이미지 형식을 추출합니다.
 * @param fileName - 파일명
 * @returns 이미지 형식
 */
function getImageFormat(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'png':
      return 'PNG'
    case 'jpg':
    case 'jpeg':
      return 'JPEG'
    case 'gif':
      return 'GIF'
    case 'webp':
      return 'WebP'
    case 'svg':
      return 'SVG'
    default:
      return 'Unknown'
  }
}

/**
 * 파일명에서 이미지 타입을 추정합니다.
 * @param fileName - 파일명
 * @param category - 카테고리
 * @returns 이미지 타입
 */
function getImageType(fileName: string, category: string): 'equipment' | 'exercise' | 'instruction' | 'diagram' {
  const lowerFileName = fileName.toLowerCase()
  
  if (lowerFileName.includes('instruction') || lowerFileName.includes('guide')) {
    return 'instruction'
  }
  
  if (lowerFileName.includes('diagram') || lowerFileName.includes('chart')) {
    return 'diagram'
  }
  
  if (lowerFileName.includes('exercise') || lowerFileName.includes('workout')) {
    return 'exercise'
  }
  
  return 'equipment'
}

/**
 * 파일명에서 이미지 각도를 추정합니다.
 * @param fileName - 파일명
 * @returns 이미지 각도
 */
function getImageAngle(fileName: string): 'front' | 'side' | 'back' | 'top' | 'diagonal' {
  const lowerFileName = fileName.toLowerCase()
  
  if (lowerFileName.includes('front')) return 'front'
  if (lowerFileName.includes('side')) return 'side'
  if (lowerFileName.includes('back')) return 'back'
  if (lowerFileName.includes('top')) return 'top'
  if (lowerFileName.includes('diagonal') || lowerFileName.includes('angle')) return 'diagonal'
  
  return 'front' // 기본값
}

/**
 * 파일명에서 조명 정보를 추정합니다.
 * @param fileName - 파일명
 * @returns 조명 정보
 */
function getImageLighting(fileName: string): 'natural' | 'studio' | 'gym' {
  const lowerFileName = fileName.toLowerCase()
  
  if (lowerFileName.includes('natural') || lowerFileName.includes('outdoor')) {
    return 'natural'
  }
  
  if (lowerFileName.includes('studio') || lowerFileName.includes('professional')) {
    return 'studio'
  }
  
  return 'gym' // 기본값
}

/**
 * 파일명에서 배경 정보를 추정합니다.
 * @param fileName - 파일명
 * @returns 배경 정보
 */
function getImageBackground(fileName: string): 'transparent' | 'white' | 'gym' | 'outdoor' {
  const lowerFileName = fileName.toLowerCase()
  
  if (lowerFileName.includes('transparent') || lowerFileName.includes('png')) {
    return 'transparent'
  }
  
  if (lowerFileName.includes('white') || lowerFileName.includes('clean')) {
    return 'white'
  }
  
  if (lowerFileName.includes('outdoor') || lowerFileName.includes('nature')) {
    return 'outdoor'
  }
  
  return 'gym' // 기본값
}

/**
 * 파일명에서 표시 순서를 추정합니다.
 * @param fileName - 파일명
 * @returns 표시 순서
 */
function getDisplayOrder(fileName: string): number {
  const lowerFileName = fileName.toLowerCase()
  
  if (lowerFileName.includes('main') || lowerFileName.includes('primary')) {
    return 1
  }
  
  if (lowerFileName.includes('secondary') || lowerFileName.includes('alt')) {
    return 2
  }
  
  if (lowerFileName.includes('detail') || lowerFileName.includes('close')) {
    return 3
  }
  
  return 1 // 기본값
}

/**
 * 파일명에서 대체 텍스트를 생성합니다.
 * @param fileName - 파일명
 * @returns 대체 텍스트
 */
function generateAltText(fileName: string): string {
  // 파일명을 읽기 쉬운 형태로 변환
  const cleanName = fileName
    .replace(/[-_]/g, ' ')
    .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
    .replace(/\b\w/g, l => l.toUpperCase())
  
  return `${cleanName} 운동기구 이미지`
}

/**
 * 파일명에서 체크섬을 생성합니다.
 * @param fileName - 파일명
 * @returns 체크섬
 */
function generateChecksum(fileName: string): string {
  // 간단한 해시 함수 (실제로는 파일 내용 기반 해시가 필요)
  let hash = 0
  for (let i = 0; i < fileName.length; i++) {
    const char = fileName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32bit 정수로 변환
  }
  return Math.abs(hash).toString(16)
}

/**
 * 이미지 메타데이터를 완전히 생성합니다.
 * @param imageUrl - 이미지 URL
 * @param fileName - 파일명
 * @param category - 카테고리
 * @param isMainImage - 메인 이미지 여부
 * @returns 완전한 이미지 메타데이터 객체
 */
export async function generateCompleteImageMetadata(
  imageUrl: string,
  fileName: string,
  category: string,
  isMainImage: boolean = true
) {
  const [metadata, classification, usage] = await Promise.all([
    extractImageMetadata(imageUrl, fileName),
    Promise.resolve(generateImageClassification(fileName, category)),
    Promise.resolve(generateImageUsage(fileName, isMainImage))
  ])
  
  return {
    imageMetadata: metadata,
    imageClassification: classification,
    imageUsage: usage
  }
}
