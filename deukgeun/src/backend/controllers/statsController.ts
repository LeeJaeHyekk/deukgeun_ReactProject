import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { User } from "../entities/User"
import { Gym } from "../entities/Gym"
import { Post } from "../entities/Post"
import { UserLevel } from "../entities/UserLevel"

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    // 사용자 통계
    const userRepo = getRepository(User)
    const activeUsers = await userRepo.count({
      where: {
        // 최근 30일 내 활동한 사용자
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    })

    // 헬스장 통계
    const gymRepo = getRepository(Gym)
    const totalGyms = await gymRepo.count()

    // 게시글 통계
    const postRepo = getRepository(Post)
    const totalPosts = await postRepo.count()

    // 레벨 시스템 통계 (업적 달성)
    const userLevelRepo = getRepository(UserLevel)
    const usersWithRewards = await userLevelRepo.count({
      where: {
        level: 5, // 레벨 5 이상 (업적 달성 기준)
      },
    })

    // 응답 데이터
    const stats = {
      activeUsers: activeUsers,
      totalGyms: totalGyms,
      totalPosts: totalPosts,
      achievements: usersWithRewards,
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("통계 조회 오류:", error)
    res.status(500).json({
      success: false,
      message: "통계 조회 중 오류가 발생했습니다.",
    })
  }
}

// 더 상세한 통계 (관리자용)
export const getDetailedStats = async (req: Request, res: Response) => {
  try {
    const userRepo = getRepository(User)
    const gymRepo = getRepository(Gym)
    const postRepo = getRepository(Post)
    const userLevelRepo = getRepository(UserLevel)

    // 월별 가입자 통계
    const monthlyUsers = await userRepo
      .createQueryBuilder("user")
      .select("DATE_FORMAT(user.createdAt, '%Y-%m') as month")
      .addSelect("COUNT(*) as count")
      .where("user.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)")
      .groupBy("month")
      .orderBy("month", "DESC")
      .getRawMany()

    // 지역별 헬스장 분포
    const gymDistribution = await gymRepo
      .createQueryBuilder("gym")
      .select("SUBSTRING_INDEX(gym.address, ' ', 2) as district")
      .addSelect("COUNT(*) as count")
      .groupBy("district")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany()

    // 레벨 분포
    const levelDistribution = await userLevelRepo
      .createQueryBuilder("userLevel")
      .select("userLevel.level")
      .addSelect("COUNT(*) as count")
      .groupBy("userLevel.level")
      .orderBy("userLevel.level", "ASC")
      .getRawMany()

    const detailedStats = {
      monthlyUsers,
      gymDistribution,
      levelDistribution,
    }

    res.json({
      success: true,
      data: detailedStats,
    })
  } catch (error) {
    console.error("상세 통계 조회 오류:", error)
    res.status(500).json({
      success: false,
      message: "상세 통계 조회 중 오류가 발생했습니다.",
    })
  }
}
