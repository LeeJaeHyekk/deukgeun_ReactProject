"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomePageController = void 0;
const HomePageConfig_1 = require('entities/HomePageConfig');
const LazyLoader_1 = require('modules/server/LazyLoader');
class HomePageController {
    constructor() {
        this.getHomePageConfig = async (req, res) => {
            try {
                const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
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
                res.status(500).json({
                    success: false,
                    message: "홈페이지 설정 조회 중 오류가 발생했습니다.",
                    error: "서버 오류",
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
