import { Request, Response } from "express"
import { getRepository, MoreThanOrEqual } from "typeorm"
import { User } from "../entities/User"
import { Gym } from "../entities/Gym"
import { Post } from "../entities/Post"
import { UserLevel } from "../entities/UserLevel"

// 통계 데이터 타입 정의
interface PlatformStats {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
}

interface MonthlyUserStats {
  month: string
  count: number
}

interface GymDistributionStats {
  district: string
  count: number
}

interface LevelDistributionStats {
  level: number
  count: number
}

interface DetailedStats {
  monthlyUsers: MonthlyUserStats[]
  gymDistribution: GymDistributionStats[]
  levelDistribution: LevelDistributionStats[]
}

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // 사용자 통계 - 최근 30일 내 활동한 사용자
    const userRepo = getRepository(User)
    const activeUsers = await userRepo.count({
      where: {
        updatedAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    })

    // 헬스장 통계
    const gymRepo = getRepository(Gym)
    const totalGyms = await gymRepo.count()

    // 게시글 통계
    const postRepo = getRepository(Post)
    const totalPosts = await postRepo.count()

    // 레벨 시스템 통계 (업적 달성) - 레벨 5 이상
    const userLevelRepo = getRepository(UserLevel)
    const usersWithRewards = await userLevelRepo.count({
      where: {
        level: 5,
      },
    })

    const stats: PlatformStats = {
      activeUsers,
      totalGyms,
      totalPosts,
      achievements: usersWithRewards,
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("통계 조회 오류:", error)

    // 더 구체적인 에러 메시지
    let errorMessage = "통계 조회 중 오류가 발생했습니다."
    if (error instanceof Error) {
      errorMessage = `통계 조회 오류: ${error.message}`
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
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

    // 월별 가입자 통계 (최근 6개월)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyUsers = await userRepo
      .createQueryBuilder("user")
      .select("DATE_FORMAT(user.createdAt, '%Y-%m') as month")
      .addSelect("COUNT(*) as count")
      .where("user.createdAt >= :sixMonthsAgo", { sixMonthsAgo })
      .groupBy("month")
      .orderBy("month", "DESC")
      .getRawMany<MonthlyUserStats>()

    // 지역별 헬스장 분포 (주소의 첫 두 부분으로 구분)
    const gymDistribution = await gymRepo
      .createQueryBuilder("gym")
      .select("SUBSTRING_INDEX(gym.address, ' ', 2) as district")
      .addSelect("COUNT(*) as count")
      .where("gym.address IS NOT NULL AND gym.address != ''")
      .groupBy("district")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany<GymDistributionStats>()

    // 레벨 분포
    const levelDistribution = await userLevelRepo
      .createQueryBuilder("userLevel")
      .select("userLevel.level")
      .addSelect("COUNT(*) as count")
      .groupBy("userLevel.level")
      .orderBy("userLevel.level", "ASC")
      .getRawMany<LevelDistributionStats>()

    const detailedStats: DetailedStats = {
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

    // 더 구체적인 에러 메시지
    let errorMessage = "상세 통계 조회 중 오류가 발생했습니다."
    if (error instanceof Error) {
      errorMessage = `상세 통계 조회 오류: ${error.message}`
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    })
  }
}

// 사용자별 개인 통계 (인증된 사용자용)
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
      })
    }

    const userLevelRepo = getRepository(UserLevel)
    const postRepo = getRepository(Post)

    // 사용자 레벨 정보
    const userLevel = await userLevelRepo.findOne({
      where: { userId },
    })

    // 사용자 게시글 수
    const userPosts = await postRepo.count({
      where: { userId },
    })

    // 최근 활동 (최근 7일)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentPosts = await postRepo.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(sevenDaysAgo),
      },
    })

    const userStats = {
      level: userLevel?.level || 1,
      currentExp: userLevel?.currentExp || 0,
      totalExp: userLevel?.totalExp || 0,
      totalPosts: userPosts,
      recentPosts,
    }

    res.json({
      success: true,
      data: userStats,
    })
  } catch (error) {
    console.error("사용자 통계 조회 오류:", error)

    let errorMessage = "사용자 통계 조회 중 오류가 발생했습니다."
    if (error instanceof Error) {
      errorMessage = `사용자 통계 조회 오류: ${error.message}`
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    })
  }
}
