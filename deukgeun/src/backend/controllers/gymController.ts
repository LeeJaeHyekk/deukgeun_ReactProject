import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Gym } from "../entities/Gym";

/**
 * 모든 헬스장 조회
 */
export const getAllGyms = async (req: Request, res: Response) => {
  try {
    const gymRepository = getRepository(Gym);
    const gyms = await gymRepository.find();

    res.json({
      success: true,
      data: gyms,
      count: gyms.length,
    });
  } catch (error) {
    console.error("헬스장 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "헬스장 조회 중 오류가 발생했습니다.",
    });
  }
};

/**
 * ID로 헬스장 조회
 */
export const getGymById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gymRepository = getRepository(Gym);
    const gym = await gymRepository.findOne({ where: { id } });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "헬스장을 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: gym,
    });
  } catch (error) {
    console.error("헬스장 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "헬스장 조회 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 위치 기반 헬스장 검색
 */
export const searchGymsByLocation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "위도와 경도가 필요합니다.",
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const searchRadius = parseFloat(radius as string);

    const gymRepository = getRepository(Gym);

    // Haversine 공식을 사용한 거리 계산
    const gyms = await gymRepository
      .createQueryBuilder("gym")
      .select([
        "gym.*",
        `(
          6371 * acos(
            cos(radians(${lat})) * cos(radians(gym.latitude)) * 
            cos(radians(gym.longitude) - radians(${lng})) + 
            sin(radians(${lat})) * sin(radians(gym.latitude))
          )
        ) AS distance`,
      ])
      .having("distance <= :radius", { radius: searchRadius })
      .orderBy("distance", "ASC")
      .getRawMany();

    res.json({
      success: true,
      data: gyms,
      count: gyms.length,
      searchParams: { latitude: lat, longitude: lng, radius: searchRadius },
    });
  } catch (error) {
    console.error("위치 기반 헬스장 검색 실패:", error);
    res.status(500).json({
      success: false,
      message: "헬스장 검색 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 대량 헬스장 데이터 업데이트
 */
export const bulkUpdateGyms = async (req: Request, res: Response) => {
  try {
    const { gyms } = req.body;

    if (!gyms || !Array.isArray(gyms)) {
      return res.status(400).json({
        success: false,
        message: "헬스장 데이터 배열이 필요합니다.",
      });
    }

    const gymRepository = getRepository(Gym);
    let savedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const gymData of gyms) {
      try {
        // 기존 헬스장이 있는지 확인
        const existingGym = await gymRepository.findOne({
          where: { id: gymData.id },
        });

        if (existingGym) {
          // 기존 데이터 업데이트
          await gymRepository.update(gymData.id, {
            name: gymData.name,
            phone: gymData.phone,
            address: gymData.address,
            latitude: gymData.latitude,
            longitude: gymData.longitude,
            updatedAt: new Date(),
          });
          updatedCount++;
        } else {
          // 새 데이터 저장
          const newGym = gymRepository.create({
            id: gymData.id,
            name: gymData.name,
            phone: gymData.phone,
            address: gymData.address,
            latitude: gymData.latitude,
            longitude: gymData.longitude,
            hasParking: false,
            hasShower: false,
            is24Hours: false,
            hasGX: false,
            hasPT: false,
            hasGroupPT: false,
          });
          await gymRepository.save(newGym);
          savedCount++;
        }
      } catch (error) {
        console.error(`헬스장 ${gymData.id} 처리 실패:`, error);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: "헬스장 데이터 대량 업데이트 완료",
      stats: {
        totalProcessed: gyms.length,
        saved: savedCount,
        updated: updatedCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("대량 헬스장 업데이트 실패:", error);
    res.status(500).json({
      success: false,
      message: "헬스장 데이터 업데이트 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 데이터베이스 상태 확인
 */
export const getDatabaseStatus = async (req: Request, res: Response) => {
  try {
    const gymRepository = getRepository(Gym);
    const totalCount = await gymRepository.count();
    const latestGym = await gymRepository.findOne({
      order: { updatedAt: "DESC" },
    });

    res.json({
      success: true,
      data: {
        totalGyms: totalCount,
        lastUpdated: latestGym?.updatedAt || null,
        databaseStatus: "healthy",
      },
    });
  } catch (error) {
    console.error("데이터베이스 상태 확인 실패:", error);
    res.status(500).json({
      success: false,
      message: "데이터베이스 상태 확인 중 오류가 발생했습니다.",
    });
  }
};
