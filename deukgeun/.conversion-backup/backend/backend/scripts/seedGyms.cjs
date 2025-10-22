"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pathUtils_1 = require('utils/pathUtils');
const typeorm_1 = require("typeorm");
const Gym_1 = require('entities/Gym');
const coordinateUtils_1 = require('utils/coordinateUtils');
const environmentConfig_1 = require('config/environmentConfig');
const __dirname = (0, pathUtils_1.getDirname)();
const API_KEY = process.env.VITE_GYM_API_KEY;
const SERVICE_NAME = "LOCALDATA_104201";
const DATA_TYPE = "json";
const START_INDEX = 1;
const END_INDEX = 999;
const createDummyGyms = () => {
    return [
        {
            name: "강남 피트니스",
            address: "서울특별시 강남구 테헤란로 123",
            phone: "02-1234-5678",
            latitude: 37.5665,
            longitude: 126.978,
            is24Hours: true,
            hasParking: true,
            hasShower: true,
        },
        {
            name: "홍대 헬스장",
            address: "서울특별시 마포구 홍대로 456",
            phone: "02-2345-6789",
            latitude: 37.5575,
            longitude: 126.925,
            is24Hours: false,
            hasParking: false,
            hasShower: true,
        },
        {
            name: "잠실 스포츠센터",
            address: "서울특별시 송파구 올림픽로 789",
            phone: "02-3456-7890",
            latitude: 37.5139,
            longitude: 127.1006,
            is24Hours: true,
            hasParking: true,
            hasShower: true,
        },
    ];
};
const fetchGymsFromAPI = async () => {
    if (!API_KEY || API_KEY === "your_seoul_openapi_key_here") {
        console.log("⚠️ API 키가 설정되지 않아 더미 데이터를 사용합니다.");
        return createDummyGyms();
    }
    const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/${DATA_TYPE}/${SERVICE_NAME}/${START_INDEX}/${END_INDEX}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch gym list from Seoul OpenAPI");
    }
    const jsonData = await response.json();
    const gymsRaw = jsonData?.LOCALDATA_104201?.row;
    if (!gymsRaw || !Array.isArray(gymsRaw)) {
        throw new Error("Invalid data format from Seoul OpenAPI");
    }
    return gymsRaw.map((item) => {
        const { lat, lon } = (0, coordinateUtils_1.convertTMToWGS84)(Number(item.X), Number(item.Y));
        return {
            id: item.MGTNO,
            name: item.BPLCNM,
            type: "짐",
            address: item.RDNWHLADDR || item.SITEWHLADDR,
            phone: item.SITETEL,
            openTime: undefined,
            closeTime: undefined,
            latitude: lat,
            longitude: lon,
            is24Hours: false,
            hasParking: false,
            hasShower: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
async function seedGyms() {
    let connection;
    try {
        connection = await (0, typeorm_1.createConnection)({
            type: "mysql",
            host: environmentConfig_1.config.database.host,
            port: environmentConfig_1.config.database.port,
            username: environmentConfig_1.config.database.username,
            password: environmentConfig_1.config.database.password,
            database: environmentConfig_1.config.database.database,
            synchronize: environmentConfig_1.config.environment === "development",
            logging: environmentConfig_1.config.environment === "development",
            entities: [Gym_1.Gym],
            subscribers: [],
            migrations: [],
        });
        console.log("📦 DB 연결 성공");
        const rawGyms = await fetchGymsFromAPI();
        const rawPath = path_1.default.join(__dirname, "../../data/gyms_raw.json");
        fs_1.default.writeFileSync(rawPath, JSON.stringify(rawGyms, null, 2));
        console.log(`📝 Raw 데이터 저장됨 → ${rawPath}`);
        for (const gym of rawGyms) {
            await connection.getRepository(Gym_1.Gym).save(gym);
        }
        console.log("✅ 필터링된 헬스장 DB 저장 완료");
    }
    catch (err) {
        console.error("❌ 헬스장 시드 실패", err);
    }
    finally {
        if (connection)
            await connection.close();
    }
}
seedGyms();
