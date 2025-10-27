/**
 * 텍스트 관련 유틸리티 함수들
 */

export function truncateText(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + "..."
}

export function getAuthorName(author: any): string {
  if (typeof author === 'string') return author
  return author?.nickname || '익명'
}

export function getCategoryName(category: any): string {
  return (category as any)?.name || category || ''
}
