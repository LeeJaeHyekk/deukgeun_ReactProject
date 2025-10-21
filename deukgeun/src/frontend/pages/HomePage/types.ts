// 통계 데이터 타입
export type Stats = {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
}

// 아이콘 이름 타입
export type IconName = keyof typeof import('./constants').ICON_MAP

// 에러 상태 타입
export type ErrorState = {
  videoError: boolean
  dataError: string | null
  retryCount: number
  isRetrying: boolean
}

// 서비스 아이템 타입
export type ServiceItem = {
  icon: string
  title: string
  description: string
  link: string
}

// FAQ 아이템 타입
export type FAQItem = {
  icon: string
  question: string
  answer: string
}

// 홈페이지 설정 타입
export type HomePageConfig = {
  heroTitle: string
  heroSubtitle: string
  heroVideoUrl: string
  heroPrimaryButtonText: string
  heroSecondaryButtonText: string
  serviceTitle: string
  serviceSubtitle: string
  services: ServiceItem[]
  faqTitle: string
  faqSubtitle: string
  faqs: FAQItem[]
  footerCompanyName: string
  footerDescription: string
  footerLinks: Array<{
    title: string
    url: string
  }>
}
