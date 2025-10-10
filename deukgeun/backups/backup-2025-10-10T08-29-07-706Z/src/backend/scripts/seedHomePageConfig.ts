import { AppDataSource } from "../config/database"
import { HomePageConfig } from "../entities/HomePageConfig"

/**
 * 홈페이지 설정 초기 데이터 삽입
 */
export async function seedHomePageConfig() {
  try {
    console.log("🌱 홈페이지 설정 초기 데이터 삽입 시작...")

    const configRepo = AppDataSource.getRepository(HomePageConfig)

    // 기존 설정 삭제
    await configRepo.delete({})

    // 기본 홈페이지 설정 데이터
    const defaultConfigs = [
      // Hero 섹션
      {
        key: "heroTitle",
        value: "득근득근",
        type: "text",
        description: "메인 타이틀",
      },
      {
        key: "heroSubtitle",
        value: "과거의 나를 뛰어넘는 것이 진정한 성장이다.",
        type: "text",
        description: "메인 부제목",
      },
      {
        key: "heroPrimaryButtonText",
        value: "헬스장 찾기",
        type: "text",
        description: "주요 버튼 텍스트",
      },
      {
        key: "heroSecondaryButtonText",
        value: "머신 가이드",
        type: "text",
        description: "보조 버튼 텍스트",
      },
      {
        key: "heroVideoUrl",
        value: "/video/serviceMovie.mp4",
        type: "text",
        description: "히어로 비디오 URL",
      },

      // 서비스 섹션
      {
        key: "serviceTitle",
        value: "서비스 소개",
        type: "text",
        description: "서비스 섹션 제목",
      },
      {
        key: "serviceSubtitle",
        value: "득근득근과 함께 건강한 변화를 시작하세요",
        type: "text",
        description: "서비스 섹션 부제목",
      },
      {
        key: "services",
        value: JSON.stringify([
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
        ]),
        type: "json",
        description: "서비스 목록",
      },

      // 기능 섹션
      {
        key: "featuresTitle",
        value: "득근득근만의 특별한 기능",
        type: "text",
        description: "기능 섹션 제목",
      },
      {
        key: "featuresSubtitle",
        value: "다른 헬스 앱과 차별화된 혁신적인 기능들을 경험해보세요",
        type: "text",
        description: "기능 섹션 부제목",
      },
      {
        key: "features",
        value: JSON.stringify([
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
        ]),
        type: "json",
        description: "기능 목록",
      },

      // FAQ 섹션
      {
        key: "faqTitle",
        value: "자주 묻는 질문",
        type: "text",
        description: "FAQ 섹션 제목",
      },
      {
        key: "faqSubtitle",
        value: "득근득근에 대한 궁금한 점들을 확인해보세요",
        type: "text",
        description: "FAQ 섹션 부제목",
      },
      {
        key: "faqs",
        value: JSON.stringify([
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
        ]),
        type: "json",
        description: "FAQ 목록",
      },

      // Footer 섹션
      {
        key: "footerCompanyName",
        value: "득근득근",
        type: "text",
        description: "회사명",
      },
      {
        key: "footerDescription",
        value: "과거의 나를 뛰어넘는 것이 진정한 성장이다.\n당신의 건강한 변화를 응원합니다.",
        type: "text",
        description: "회사 설명",
      },
      {
        key: "footerCopyright",
        value: "© 2024 득근득근. All rights reserved.",
        type: "text",
        description: "저작권 정보",
      },
      {
        key: "footerLinks",
        value: JSON.stringify({
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
        }),
        type: "json",
        description: "Footer 링크 목록",
      },
      {
        key: "socialLinks",
        value: JSON.stringify([
          { icon: "📱", url: "#" },
          { icon: "📧", url: "#" },
          { icon: "💬", url: "#" },
        ]),
        type: "json",
        description: "소셜 링크 목록",
      },
    ]

    // 설정 데이터 삽입
    for (const configData of defaultConfigs) {
      const config = configRepo.create({
        key: configData.key,
        value: configData.value,
        type: configData.type as "text" | "number" | "boolean" | "json",
        description: configData.description,
        isActive: true,
      })
      await configRepo.save(config)
    }

    console.log("✅ 홈페이지 설정 초기 데이터 삽입 완료!")
    console.log(`📊 총 ${defaultConfigs.length}개의 설정이 생성되었습니다.`)
  } catch (error) {
    console.error("❌ 홈페이지 설정 초기 데이터 삽입 실패:", error)
    throw error
  }
}

// 스크립트로 직접 실행될 때
if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      await seedHomePageConfig()
      process.exit(0)
    })
    .catch((error) => {
      console.error("데이터베이스 연결 실패:", error)
      process.exit(1)
    })
}
