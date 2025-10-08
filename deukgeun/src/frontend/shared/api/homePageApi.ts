const apiClient = require('./index').default

// 홈페이지 설정 타입 정의
export interface HomePageConfig {
  // Hero 섹션
  heroTitle: string
  heroSubtitle: string
  heroPrimaryButtonText: string
  heroSecondaryButtonText: string
  heroVideoUrl: string

  // 서비스 섹션
  serviceTitle: string
  serviceSubtitle: string
  services: Array<{
    title: string
    description: string
    icon: string
    link: string
  }>

  // 기능 섹션
  featuresTitle: string
  featuresSubtitle: string
  features: Array<{
    title: string
    description: string
    icon: string
  }>

  // FAQ 섹션
  faqTitle: string
  faqSubtitle: string
  faqs: Array<{
    question: string
    answer: string
    icon: string
  }>

  // Footer 섹션
  footerCompanyName: string
  footerDescription: string
  footerCopyright: string
  footerLinks: {
    service: Array<{ text: string; url: string }>
    support: Array<{ text: string; url: string }>
    company: Array<{ text: string; url: string }>
  }
  socialLinks: Array<{ icon: string; url: string }>
}

// 기본 홈페이지 설정
const DEFAULT_HOME_PAGE_CONFIG: HomePageConfig = {
  heroTitle: "득근득근",
  heroSubtitle: "과거의 나를 뛰어넘는 것이 진정한 성장이다.",
  heroPrimaryButtonText: "헬스장 찾기",
  heroSecondaryButtonText: "머신 가이드",
  heroVideoUrl: "/video/serviceMovie.mp4",

  serviceTitle: "서비스 소개",
  serviceSubtitle: "득근득근과 함께 건강한 변화를 시작하세요",
  services: [
    {
      title: "헬스장 찾기",
      description: "내 주변 헬스장을 쉽게 찾아보세요",
      icon: "MapPin",
      link: "/location",
    },
    {
      title: "머신 가이드",
      description: "운동 기구 사용법을 배워보세요",
      icon: "Dumbbell",
      link: "/machine-guide",
    },
    {
      title: "커뮤니티",
      description: "함께 운동하는 동료들과 소통하세요",
      icon: "Users",
      link: "/community",
    },
    {
      title: "운동 기록일지",
      description: "나의 운동 기록을 체계적으로 관리하세요",
      icon: "BarChart3",
      link: "/workout-journal",
    },
  ],

  featuresTitle: "득근득근만의 특별한 기능",
  featuresSubtitle: "다른 헬스 앱과 차별화된 혁신적인 기능들을 경험해보세요",
  features: [
    {
      title: "레벨 시스템",
      description: "운동과 활동을 통해 레벨업하며 성취감을 느껴보세요",
      icon: "TrendingUp",
    },
    {
      title: "보안 중심",
      description: "JWT 토큰과 reCAPTCHA로 안전한 서비스를 제공합니다",
      icon: "Shield",
    },
    {
      title: "실시간 업데이트",
      description: "헬스장 정보가 실시간으로 업데이트되어 정확한 정보를 제공합니다",
      icon: "Zap",
    },
    {
      title: "개인화된 경험",
      description: "나만의 운동 목표와 기록을 관리할 수 있습니다",
      icon: "Target",
    },
  ],

  faqTitle: "자주 묻는 질문",
  faqSubtitle: "득근득근에 대한 궁금한 점들을 확인해보세요",
  faqs: [
    {
      question: "헬스장 정보는 어떻게 업데이트되나요?",
      answer: "서울시 공공데이터 API와 다중 소스 크롤링을 통해 실시간으로 헬스장 정보를 업데이트합니다.",
      icon: "MapPin",
    },
    {
      question: "레벨 시스템은 어떻게 작동하나요?",
      answer: "게시글 작성, 댓글, 좋아요 등 다양한 활동을 통해 경험치를 얻고 레벨업할 수 있습니다.",
      icon: "Star",
    },
    {
      question: "개인정보는 안전한가요?",
      answer: "JWT 토큰과 reCAPTCHA를 사용하여 보안을 강화하고, 모든 개인정보는 암호화되어 보관됩니다.",
      icon: "Shield",
    },
    {
      question: "커뮤니티 기능은 어떻게 사용하나요?",
      answer: "로그인 후 게시글을 작성하고, 다른 사용자들과 소통하며 운동 정보를 공유할 수 있습니다.",
      icon: "Users",
    },
  ],

  footerCompanyName: "득근득근",
  footerDescription: "과거의 나를 뛰어넘는 것이 진정한 성장이다.\n당신의 건강한 변화를 응원합니다.",
  footerCopyright: "© 2024 득근득근. All rights reserved.",
  footerLinks: {
    service: [
      { text: "헬스장 찾기", url: "/location" },
      { text: "머신 가이드", url: "/machine-guide" },
      { text: "커뮤니티", url: "/community" },
      { text: "운동 기록일지", url: "/workout-journal" },
    ],
    support: [
      { text: "자주 묻는 질문", url: "/faq" },
      { text: "문의하기", url: "/contact" },
      { text: "피드백", url: "/feedback" },
      { text: "도움말", url: "/help" },
    ],
    company: [
      { text: "회사소개", url: "/about" },
      { text: "개인정보처리방침", url: "/privacy" },
      { text: "이용약관", url: "/terms" },
      { text: "채용정보", url: "/careers" },
    ],
  },
  socialLinks: [
    { icon: "📱", url: "#" },
    { icon: "📧", url: "#" },
    { icon: "💬", url: "#" },
  ],
}

const homePageApi = {
  // 홈페이지 설정 조회
  getHomePageConfig: async (): Promise<HomePageConfig> => {
    try {
      const response = await apiClient.get("/api/homepage/config")
      return response.data.data
    } catch (error) {
      console.warn("홈페이지 설정 조회 실패, 기본값 사용:", error)
      return DEFAULT_HOME_PAGE_CONFIG
    }
  },

  // 홈페이지 설정 업데이트 (관리자용)
  updateHomePageConfig: async (config: Partial<HomePageConfig>): Promise<void> => {
    try {
      await apiClient.put("/api/homepage/config", config)
    } catch (error) {
      console.error("홈페이지 설정 업데이트 실패:", error)
      throw error
    }
  },

  // 홈페이지 설정 일괄 업데이트 (관리자용)
  updateMultipleConfigs: async (configs: Array<{ key: string; value: any; type?: string; description?: string }>): Promise<void> => {
    try {
      await apiClient.put("/api/homepage/config/batch", { configs })
    } catch (error) {
      console.error("홈페이지 설정 일괄 업데이트 실패:", error)
      throw error
    }
  },
}
