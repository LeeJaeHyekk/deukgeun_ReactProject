import { Request, Response } from "express"
import { MoreThanOrEqual } from "typeorm"
import { User } from "../entities/User"
import { Gym } from "../entities/Gym"
import { Post } from "../entities/Post"
import { UserLevel } from "../entities/UserLevel"
import { AppDataSource } from "../config/database"

export class StatsController {
  // 전체 통계 조회
  getOverallStats = async (req: Request, res: Response) => {
    try {
      const userRepo = AppDataSource.getRepository(User)
      const gymRepo = AppDataSource.getRepository(Gym)
      const postRepo = AppDataSource.getRepository(Post)
      const userLevelRepo = AppDataSource.getRepository(UserLevel)

      // 사용자 통계
      const totalUsers = await userRepo.count()
      const newUsersThisMonth = await userRepo.count({
        where: {
          createdAt: MoreThanOrEqual(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          ),
        },
      })

      // 체육관 통계
      const totalGyms = await gymRepo.count()
      // Gym 엔티티에 isActive 필드가 없으므로 전체 체육관 수로 대체
      const activeGyms = totalGyms

      // 포스트 통계
      const totalPosts = await postRepo.count()
      const postsThisMonth = await postRepo.count({
        where: {
          createdAt: MoreThanOrEqual(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          ),
        },
      })

      // 레벨 통계
      const levelStats = await userLevelRepo
        .createQueryBuilder("ul")
        .select("ul.level", "level")
        .addSelect("COUNT(*)", "count")
        .groupBy("ul.level")
        .orderBy("ul.level", "ASC")
        .getRawMany()

      const stats = {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
        },
        gyms: {
          total: totalGyms,
          active: activeGyms,
        },
        posts: {
          total: totalPosts,
          thisMonth: postsThisMonth,
        },
        levels: levelStats,
      }

      res.json(stats)
    } catch (error) {
      console.error("통계 조회 오류:", error)
      res.status(500).json({ message: "통계 조회 중 오류가 발생했습니다." })
    }
  }

  // 사용자별 통계 조회
  getUserStats = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.userId

      if (!userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const userRepo = AppDataSource.getRepository(User)
      const gymRepo = AppDataSource.getRepository(Gym)
      const postRepo = AppDataSource.getRepository(Post)
      const userLevelRepo = AppDataSource.getRepository(UserLevel)

      // 사용자 정보
      const user = await userRepo.findOne({ where: { id: userId } })
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." })
      }

      // 사용자 레벨 정보
      const userLevel = await userLevelRepo.findOne({ where: { userId } })

      // 사용자 포스트 수
      const userPosts = await postRepo.count({ where: { userId } })

      // 사용자 포스트 좋아요 수
      const userPostLikes = await postRepo
        .createQueryBuilder("post")
        .select("SUM(post.like_count)", "totalLikes")
        .where("post.userId = :userId", { userId })
        .getRawOne()

      const stats = {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          createdAt: user.createdAt,
        },
        level: userLevel
          ? {
              level: userLevel.level,
              currentExp: userLevel.currentExp,
              totalExp: userLevel.totalExp,
            }
          : null,
        posts: {
          count: userPosts,
          totalLikes: parseInt(userPostLikes?.totalLikes || "0"),
        },
      }

      res.json(stats)
    } catch (error) {
      console.error("사용자 통계 조회 오류:", error)
      res
        .status(500)
        .json({ message: "사용자 통계 조회 중 오류가 발생했습니다." })
    }
  }

  // 레벨별 사용자 분포
  getLevelDistribution = async (req: Request, res: Response) => {
    try {
      const userLevelRepo = AppDataSource.getRepository(UserLevel)
      const postRepo = AppDataSource.getRepository(Post)

      // 레벨별 사용자 수
      const levelDistribution = await userLevelRepo
        .createQueryBuilder("ul")
        .select("ul.level", "level")
        .addSelect("COUNT(*)", "userCount")
        .groupBy("ul.level")
        .orderBy("ul.level", "ASC")
        .getRawMany()

      // 평균 레벨
      const avgLevel = await userLevelRepo
        .createQueryBuilder("ul")
        .select("AVG(ul.level)", "averageLevel")
        .getRawOne()

      // 최고 레벨 사용자
      const topUsers = await userLevelRepo
        .createQueryBuilder("ul")
        .leftJoin("ul.user", "user")
        .select(["ul.level", "ul.exp", "user.nickname"])
        .orderBy("ul.level", "DESC")
        .addOrderBy("ul.exp", "DESC")
        .limit(10)
        .getMany()

      const stats = {
        distribution: levelDistribution,
        averageLevel: parseFloat(avgLevel?.averageLevel || "0"),
        topUsers: topUsers.map(user => ({
          nickname: user.user?.nickname,
          level: user.level,
          currentExp: user.currentExp,
        })),
      }

      res.json(stats)
    } catch (error) {
      console.error("레벨 분포 조회 오류:", error)
      res
        .status(500)
        .json({ message: "레벨 분포 조회 중 오류가 발생했습니다." })
    }
  }
}
