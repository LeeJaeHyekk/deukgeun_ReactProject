const { Gym  } = require('../entities/Gym');
const { AppDataSource  } = require('../config/database');
const { toGymDTO, toGymDTOList  } = require('../../../../transformers/index');
async function getAllGyms(req, res) {
    try {
        const gymRepository = AppDataSource.getRepository(Gym);
        const gyms = await gymRepository.find({
            order: {
                name: "ASC",
            }
module.exports.getAllGyms = getAllGyms
module.exports.getAllGyms = getAllGyms,
        });
        // DTO 변환 적용
        const gymDTOs = toGymDTOList(gyms);
        res.json({
            success: true,
            message: "헬스장 목록을 성공적으로 가져왔습니다.",
            data: gymDTOs,
        });
    }
    catch (error) {
        console.error("헬스장 목록 조회 오류:", error);
        res.status(500).json({
            success: false,
            message: "헬스장 목록을 가져오는데 실패했습니다.",
            error: "서버 오류",
        });
    }
}
async function getGymById(req, res) {
    try {
        const { id }
module.exports.getGymById = getGymById
module.exports.getGymById = getGymById = req.params;
        const gymRepository = AppDataSource.getRepository(Gym);
        const gym = await gymRepository.findOne({ where: { id: parseInt(id) } });
        if (!gym) {
            return res.status(404).json({
                success: false,
                message: "헬스장을 찾을 수 없습니다.",
                error: "헬스장 없음",
            });
        }
        // DTO 변환 적용
        const gymDTO = toGymDTO(gym);
        return res.json({
            success: true,
            message: "헬스장 정보를 성공적으로 가져왔습니다.",
            data: gymDTO,
        });
    }
    catch (error) {
        console.error("헬스장 조회 오류:", error);
        return res.status(500).json({
            success: false,
            message: "헬스장 정보를 가져오는데 실패했습니다.",
            error: "서버 오류",
        });
    }
}
async function searchGyms(req, res) {
    try {
        const { query, latitude, longitude, radius = 10 }
module.exports.searchGyms = searchGyms
module.exports.searchGyms = searchGyms = req.query;
        const gymRepository = AppDataSource.getRepository(Gym);
        let gyms;
        if (latitude && longitude) {
            // 위치 기반 검색
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const rad = parseFloat(radius);
            gyms = await gymRepository
                .createQueryBuilder("gym")
                .where(`(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude)))) <= :radius`, { lat, lng, radius: rad })
                .andWhere(query ? "gym.name LIKE :query" : "1=1", {
                query: `%${query}%`,
            })
                .orderBy("gym.name", "ASC")
                .getMany();
        }
        else {
            // 일반 검색
            gyms = await gymRepository.find({
                where: query ? { name: `%${query}%` } : {},
                order: {
                    name: "ASC",
                },
            });
        }
        // DTO 변환 적용
        const gymDTOs = toGymDTOList(gyms);
        return res.json({
            success: true,
            message: "헬스장 검색을 성공적으로 완료했습니다.",
            data: gymDTOs,
        });
    }
    catch (error) {
        console.error("헬스장 검색 오류:", error);
        return res.status(500).json({
            success: false,
            message: "헬스장 검색에 실패했습니다.",
            error: "서버 오류",
        });
    }
}
async function getGymsByLocation(req, res) {
    try {
        const { latitude, longitude, radius = 10 }
module.exports.getGymsByLocation = getGymsByLocation
module.exports.getGymsByLocation = getGymsByLocation = req.query;
        const gymRepository = AppDataSource.getRepository(Gym);
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "위도와 경도가 필요합니다.",
                error: "위치 정보 누락",
            });
        }
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const rad = parseFloat(radius);
        const gyms = await gymRepository
            .createQueryBuilder("gym")
            .where(`(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude)))) <= :radius`, { lat, lng, radius: rad })
            .orderBy("gym.name", "ASC")
            .getMany();
        return res.json({
            success: true,
            message: "주변 헬스장을 성공적으로 가져왔습니다.",
            data: gyms,
        });
    }
    catch (error) {
        console.error("주변 헬스장 조회 오류:", error);
        return res.status(500).json({
            success: false,
            message: "주변 헬스장을 가져오는데 실패했습니다.",
            error: "서버 오류",
        });
    }
}
async function updateGymData(req, res) {
    try {
        const gymRepository = AppDataSource.getRepository(Gym);
        const { gyms }
module.exports.updateGymData = updateGymData
module.exports.updateGymData = updateGymData = req.body;
        if (!Array.isArray(gyms)) {
            return res.status(400).json({
                success: false,
                message: "헬스장 데이터가 올바르지 않습니다.",
                error: "잘못된 데이터 형식",
            });
        }
        let updatedCount = 0;
        for (const gymData of gyms) {
            const existingGym = await gymRepository.findOne({
                where: { name: gymData.name },
            });
            if (existingGym) {
                await gymRepository.update(existingGym.id, gymData);
                updatedCount++;
            }
            else {
                await gymRepository.save(gymData);
                updatedCount++;
            }
        }
        return res.json({
            success: true,
            message: `${updatedCount}개의 헬스장 데이터를 업데이트했습니다.`,
            data: { updated: updatedCount },
        });
    }
    catch (error) {
        console.error("헬스장 데이터 업데이트 오류:", error);
        return res.status(500).json({
            success: false,
            message: "헬스장 데이터 업데이트에 실패했습니다.",
            error: "서버 오류",
        });
    }
}
