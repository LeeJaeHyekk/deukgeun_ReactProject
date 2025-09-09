import { Request, Response } from "express"
import { Gym } from "../entities/Gym"
import { AppDataSource } from "../../../shared/env"
import { ApiResponse, ErrorResponse } from "../../../shared/types/backend.types"
import { GymTransformer } from "../transformers/gym.transformer"

export async function getGyms(
  req: Request,
  res: Response<ApiResponse<any[]> | ErrorResponse>
) {
  try {
    const gymRepository = AppDataSource.getRepository(Gym)
    const gyms = await gymRepository.find({
      order: {
        name: "ASC",
      },
    })

    // DTO 변환 적용
    const gymDTOs = GymTransformer.toDTOList(gyms)

    res.json({
      success: true,
      message: "헬스장 목록을 성공적으로 가져왔습니다.",
      data: gymDTOs,
    })
  } catch (error) {
    console.error("헬스장 목록 조회 오류:", error)
    res.status(500).json({
      success: false,
      message: "헬스장 목록을 가져오는데 실패했습니다.",
      error: "서버 오류",
    })
  }
}

export async function getGymById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<any> | ErrorResponse>
) {
  try {
    const { id } = req.params
    const gymRepository = AppDataSource.getRepository(Gym)
    const gym = await gymRepository.findOne({ where: { id: parseInt(id) } })

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "헬스장을 찾을 수 없습니다.",
        error: "헬스장 없음",
      })
    }

    // DTO 변환 적용
    const gymDTO = GymTransformer.toDTO(gym)

    return res.json({
      success: true,
      message: "헬스장 정보를 성공적으로 가져왔습니다.",
      data: gymDTO,
    })
  } catch (error) {
    console.error("헬스장 조회 오류:", error)
    return res.status(500).json({
      success: false,
      message: "헬스장 정보를 가져오는데 실패했습니다.",
      error: "서버 오류",
    })
  }
}

export async function searchGyms(
  req: Request,
  res: Response<ApiResponse<any[]> | ErrorResponse>
) {
  try {
    const { query, latitude, longitude, radius = 10 } = req.query
    const gymRepository = AppDataSource.getRepository(Gym)

    let gyms: Gym[]

    if (latitude && longitude) {
      // 위치 기반 검색
      const lat = parseFloat(latitude as string)
      const lng = parseFloat(longitude as string)
      const rad = parseFloat(radius as string)

      gyms = await gymRepository
        .createQueryBuilder("gym")
        .where(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude)))) <= :radius`,
          { lat, lng, radius: rad }
        )
        .andWhere(query ? "gym.name LIKE :query" : "1=1", {
          query: `%${query}%`,
        })
        .orderBy("gym.name", "ASC")
        .getMany()
    } else {
      // 일반 검색
      gyms = await gymRepository.find({
        where: query ? { name: `%${query}%` } : {},
        order: {
          name: "ASC",
        },
      })
    }

    // DTO 변환 적용
    const gymDTOs = GymTransformer.toDTOList(gyms)

    return res.json({
      success: true,
      message: "헬스장 검색을 성공적으로 완료했습니다.",
      data: gymDTOs,
    })
  } catch (error) {
    console.error("헬스장 검색 오류:", error)
    return res.status(500).json({
      success: false,
      message: "헬스장 검색에 실패했습니다.",
      error: "서버 오류",
    })
  }
}

export async function getGymsByLocation(
  req: Request,
  res: Response<ApiResponse<Gym[]> | ErrorResponse>
) {
  try {
    const { latitude, longitude, radius = 10 } = req.query
    const gymRepository = AppDataSource.getRepository(Gym)

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "위도와 경도가 필요합니다.",
        error: "위치 정보 누락",
      })
    }

    const lat = parseFloat(latitude as string)
    const lng = parseFloat(longitude as string)
    const rad = parseFloat(radius as string)

    const gyms = await gymRepository
      .createQueryBuilder("gym")
      .where(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(gym.latitude)) * cos(radians(gym.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gym.latitude)))) <= :radius`,
        { lat, lng, radius: rad }
      )
      .orderBy("gym.name", "ASC")
      .getMany()

    return res.json({
      success: true,
      message: "주변 헬스장을 성공적으로 가져왔습니다.",
      data: gyms,
    })
  } catch (error) {
    console.error("주변 헬스장 조회 오류:", error)
    return res.status(500).json({
      success: false,
      message: "주변 헬스장을 가져오는데 실패했습니다.",
      error: "서버 오류",
    })
  }
}

export async function updateGymData(
  req: Request,
  res: Response<ApiResponse<{ updated: number }> | ErrorResponse>
) {
  try {
    const gymRepository = AppDataSource.getRepository(Gym)
    const { gyms } = req.body

    if (!Array.isArray(gyms)) {
      return res.status(400).json({
        success: false,
        message: "헬스장 데이터가 올바르지 않습니다.",
        error: "잘못된 데이터 형식",
      })
    }

    let updatedCount = 0
    for (const gymData of gyms) {
      const existingGym = await gymRepository.findOne({
        where: { name: gymData.name },
      })

      if (existingGym) {
        await gymRepository.update(existingGym.id, gymData)
        updatedCount++
      } else {
        await gymRepository.save(gymData)
        updatedCount++
      }
    }

    return res.json({
      success: true,
      message: `${updatedCount}개의 헬스장 데이터를 업데이트했습니다.`,
      data: { updated: updatedCount },
    })
  } catch (error) {
    console.error("헬스장 데이터 업데이트 오류:", error)
    return res.status(500).json({
      success: false,
      message: "헬스장 데이터 업데이트에 실패했습니다.",
      error: "서버 오류",
    })
  }
}

export async function createGym(
  req: Request,
  res: Response<ApiResponse<any> | ErrorResponse>
) {
  try {
    const gymRepository = AppDataSource.getRepository(Gym)
    const gym = gymRepository.create(req.body)
    const savedGym = await gymRepository.save(gym)
    // save 메서드가 배열을 반환할 수 있으므로 첫 번째 요소를 가져옴
    const gymEntity = Array.isArray(savedGym) ? savedGym[0] : savedGym
    const gymDTO = GymTransformer.toDTO(gymEntity)

    res.status(201).json({
      success: true,
      message: "헬스장이 성공적으로 생성되었습니다.",
      data: gymDTO,
    })
  } catch (error) {
    console.error("헬스장 생성 오류:", error)
    res.status(500).json({
      success: false,
      message: "헬스장 생성 중 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function updateGym(
  req: Request,
  res: Response<ApiResponse<any> | ErrorResponse>
) {
  try {
    const { id } = req.params
    const gymRepository = AppDataSource.getRepository(Gym)
    const gym = await gymRepository.findOne({ where: { id: parseInt(id) } })

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "헬스장을 찾을 수 없습니다.",
        error: "헬스장 없음",
      })
    }

    Object.assign(gym, req.body)
    const updatedGym = await gymRepository.save(gym)
    const gymDTO = GymTransformer.toDTO(updatedGym)

    res.json({
      success: true,
      message: "헬스장이 성공적으로 업데이트되었습니다.",
      data: gymDTO,
    })
  } catch (error) {
    console.error("헬스장 업데이트 오류:", error)
    res.status(500).json({
      success: false,
      message: "헬스장 업데이트 중 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function deleteGym(
  req: Request,
  res: Response<ApiResponse<any> | ErrorResponse>
) {
  try {
    const { id } = req.params
    const gymRepository = AppDataSource.getRepository(Gym)
    const gym = await gymRepository.findOne({ where: { id: parseInt(id) } })

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "헬스장을 찾을 수 없습니다.",
        error: "헬스장 없음",
      })
    }

    await gymRepository.remove(gym)

    res.json({
      success: true,
      message: "헬스장이 성공적으로 삭제되었습니다.",
    })
  } catch (error) {
    console.error("헬스장 삭제 오류:", error)
    res.status(500).json({
      success: false,
      message: "헬스장 삭제 중 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}
