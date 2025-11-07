"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomePageController = void 0;
const HomePageConfig_1 = require("../entities/HomePageConfig.cjs");
const LazyLoader_1 = require("../modules/server/LazyLoader.cjs");
class HomePageController {
    constructor() {
        this.getHomePageConfig = async (req, res) => {
            try {
                const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
                if (!dataSource.isInitialized) {
                    console.warn("⚠️ Database not initialized, returning default homepage config");
                    return res.json({
                        success: true,
                        message: "홈페이지 설정을 성공적으로 조회했습니다. (기본값)",
                        data: {
                            heroTitle: "득근득근",
                            heroSubtitle: "헬스장 찾기부터 운동 기록까지, 모든 것을 한 곳에서",
                            heroPrimaryButtonText: "시작하기",
                            heroSecondaryButtonText: "더 알아보기",
                            heroVideoUrl: "/video/serviceMovie.mp4",
                            serviceTitle: "서비스 소개",
                            serviceSubtitle: "득근득근과 함께 건강한 변화를 시작하세요",
                            services: [
                                { title: "헬스장 찾기", description: "내 주변 헬스장을 쉽게 찾아보세요", icon: "📍", link: "/location" },
                                { title: "머신 가이드", description: "운동 기구 사용법을 배워보세요", icon: "🏋️", link: "/machine-guide" },
                                { title: "커뮤니티", description: "함께 운동하는 동료들과 소통하세요", icon: "👥", link: "/community" }
                            ],
                            featuresTitle: "득근득근만의 특별한 기능",
                            featuresSubtitle: "다른 헬스 앱과 차별화된 혁신적인 기능들을 경험해보세요",
                            features: [
                                { title: "레벨 시스템", description: "운동과 활동을 통해 레벨업하며 성취감을 느껴보세요", icon: "📈" },
                                { title: "보안 중심", description: "JWT 토큰과 reCAPTCHA로 안전한 서비스를 제공합니다", icon: "🛡️" },
                                { title: "실시간 업데이트", description: "헬스장 정보가 실시간으로 업데이트되어 정확한 정보를 제공합니다", icon: "⚡" },
                                { title: "개인화된 경험", description: "나만의 운동 목표와 기록을 관리할 수 있습니다", icon: "🎯" }
                            ],
                            faqTitle: "자주 묻는 질문",
                            faqSubtitle: "득근득근에 대한 궁금한 점들을 확인해보세요",
                            faqs: [
                                { question: "헬스장 정보는 어떻게 업데이트되나요?", answer: "서울시 공공데이터 API와 다중 소스 크롤링을 통해 실시간으로 헬스장 정보를 업데이트합니다.", icon: "📍" },
                                { question: "레벨 시스템은 어떻게 작동하나요?", answer: "게시글 작성, 댓글, 좋아요 등 다양한 활동을 통해 경험치를 얻고 레벨업할 수 있습니다.", icon: "⭐" },
                                { question: "개인정보는 안전한가요?", answer: "JWT 토큰과 reCAPTCHA를 사용하여 보안을 강화하고, 모든 개인정보는 암호화되어 보관됩니다.", icon: "🛡️" },
                                { question: "커뮤니티 기능은 어떻게 사용하나요?", answer: "로그인 후 게시글을 작성하고, 다른 사용자들과 소통하며 운동 정보를 공유할 수 있습니다.", icon: "👥" }
                            ],
                            footerCompanyName: "득근득근",
                            footerDescription: "과거의 나를 뛰어넘는 것이 진정한 성장이다.\n당신의 건강한 변화를 응원합니다.",
                            footerCopyright: "© 2024 득근득근. All rights reserved.",
                            footerLinks: {
                                service: [
                                    { text: "헬스장 찾기", url: "/location" },
                                    { text: "머신 가이드", url: "/machine-guide" },
                                    { text: "커뮤니티", url: "/community" },
                                    { text: "운동 기록일지", url: "/workout-journal" }
                                ],
                                support: [
                                    { text: "자주 묻는 질문", url: "#" },
                                    { text: "문의하기", url: "#" },
                                    { text: "피드백", url: "#" },
                                    { text: "도움말", url: "#" }
                                ],
                                company: [
                                    { text: "회사소개", url: "#" },
                                    { text: "개인정보처리방침", url: "#" },
                                    { text: "이용약관", url: "#" },
                                    { text: "채용정보", url: "#" }
                                ]
                            },
                            socialLinks: [
                                { icon: "💬", url: "#" }
                            ]
                        },
                    });
                }
                const configRepo = dataSource.getRepository(HomePageConfig_1.HomePageConfig);
                const configs = await configRepo.find({
                    where: { isActive: true },
                    order: { key: "ASC" },
                });
                const configObject = {};
                configs.forEach(config => {
                    let value = config.value;
                    switch (config.type) {
                        case "number":
                            value = Number(value);
                            break;
                        case "boolean":
                            value = value === "true";
                            break;
                        case "json":
                            try {
                                value = JSON.parse(value);
                            }
                            catch {
                                value = config.value;
                            }
                            break;
                        default:
                            value = config.value;
                    }
                    configObject[config.key] = value;
                });
                res.json({
                    success: true,
                    message: "홈페이지 설정을 성공적으로 조회했습니다.",
                    data: configObject,
                });
            }
            catch (error) {
                console.error("홈페이지 설정 조회 오류:", error);
                return res.json({
                    success: true,
                    message: "홈페이지 설정을 성공적으로 조회했습니다. (기본값)",
                    data: {
                        heroTitle: "득근득근",
                        heroSubtitle: "헬스장 찾기부터 운동 기록까지, 모든 것을 한 곳에서",
                        heroPrimaryButtonText: "시작하기",
                        heroSecondaryButtonText: "더 알아보기",
                        heroVideoUrl: "/video/serviceMovie.mp4",
                        serviceTitle: "서비스 소개",
                        serviceSubtitle: "득근득근과 함께 건강한 변화를 시작하세요",
                        services: [],
                        featuresTitle: "득근득근만의 특별한 기능",
                        featuresSubtitle: "다른 헬스 앱과 차별화된 혁신적인 기능들을 경험해보세요",
                        features: [],
                        faqTitle: "자주 묻는 질문",
                        faqSubtitle: "득근득근에 대한 궁금한 점들을 확인해보세요",
                        faqs: [],
                        footerCompanyName: "득근득근",
                        footerDescription: "과거의 나를 뛰어넘는 것이 진정한 성장이다.\n당신의 건강한 변화를 응원합니다.",
                        footerCopyright: "© 2024 득근득근. All rights reserved.",
                        footerLinks: {
                            service: [],
                            support: [],
                            company: []
                        },
                        socialLinks: []
                    },
                });
            }
        };
        this.updateHomePageConfig = async (req, res) => {
            try {
                const { key, value, type, description } = req.body;
                const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
                const configRepo = dataSource.getRepository(HomePageConfig_1.HomePageConfig);
                if (!key || value === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: "필수 필드가 누락되었습니다.",
                        error: "잘못된 요청",
                    });
                }
                let config = await configRepo.findOne({ where: { key } });
                if (config) {
                    config.value = String(value);
                    config.type = type || "text";
                    config.description = description || config.description;
                    config.updatedAt = new Date();
                    await configRepo.save(config);
                }
                else {
                    config = configRepo.create({
                        key,
                        value: String(value),
                        type: type || "text",
                        description,
                        isActive: true,
                    });
                    await configRepo.save(config);
                }
                res.json({
                    success: true,
                    message: "홈페이지 설정이 성공적으로 업데이트되었습니다.",
                    data: config,
                });
            }
            catch (error) {
                console.error("홈페이지 설정 업데이트 오류:", error);
                res.status(500).json({
                    success: false,
                    message: "홈페이지 설정 업데이트 중 오류가 발생했습니다.",
                    error: "서버 오류",
                });
            }
        };
        this.updateMultipleConfigs = async (req, res) => {
            try {
                const { configs } = req.body;
                const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
                const configRepo = dataSource.getRepository(HomePageConfig_1.HomePageConfig);
                if (!Array.isArray(configs)) {
                    return res.status(400).json({
                        success: false,
                        message: "설정 데이터가 올바르지 않습니다.",
                        error: "잘못된 데이터 형식",
                    });
                }
                const results = [];
                for (const configData of configs) {
                    const { key, value, type, description } = configData;
                    if (!key || value === undefined) {
                        continue;
                    }
                    let config = await configRepo.findOne({ where: { key } });
                    if (config) {
                        config.value = String(value);
                        config.type = type || "text";
                        config.description = description || config.description;
                        config.updatedAt = new Date();
                        await configRepo.save(config);
                    }
                    else {
                        config = configRepo.create({
                            key,
                            value: String(value),
                            type: type || "text",
                            description,
                            isActive: true,
                        });
                        await configRepo.save(config);
                    }
                    results.push(config);
                }
                res.json({
                    success: true,
                    message: `${results.length}개의 홈페이지 설정이 성공적으로 업데이트되었습니다.`,
                    data: results,
                });
            }
            catch (error) {
                console.error("홈페이지 설정 일괄 업데이트 오류:", error);
                res.status(500).json({
                    success: false,
                    message: "홈페이지 설정 일괄 업데이트 중 오류가 발생했습니다.",
                    error: "서버 오류",
                });
            }
        };
    }
}
exports.HomePageController = HomePageController;
