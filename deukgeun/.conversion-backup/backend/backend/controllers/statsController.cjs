const { MoreThanOrEqual  } = require('typeorm');
const { User  } = require('../entities/User');
const { Gym  } = require('../entities/Gym');
const { Post  } = require('../entities/Post');
const { UserLevel  } = require('../entities/UserLevel');
const { AppDataSource  } = require('../config/database');
class StatsController
module.exports.StatsController = StatsController {
    constructor() {
        // 전체 통계 조회
        this.getOverallStats = async (req, res) => {
            try {
                const userRepo = AppDataSource.getRepository(User);
                const gymRepo = AppDataSource.getRepository(Gym);
                const postRepo = AppDataSource.getRepository(Post);
                const userLevelRepo = AppDataSource.getRepository(UserLevel);
                // 사용자 통계
                const totalUsers = await userRepo.count();
                const newUsersThisMonth = await userRepo.count({
                    where: {
                        createdAt: MoreThanOrEqual(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                    },
                });
                // 체육관 통계
                const totalGyms = await gymRepo.count();
                // Gym 엔티티에 isActive 필드가 없으므로 전체 체육관 수로 대체
                const activeGyms = totalGyms;
                // 포스트 통계
                const totalPosts = await postRepo.count();
                const postsThisMonth = await postRepo.count({
                    where: {
                        createdAt: MoreThanOrEqual(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                    },
                });
                // 레벨 통계
                const levelStats = await userLevelRepo
                    .createQueryBuilder("ul")
                    .select("ul.level", "level")
                    .addSelect("COUNT(*)", "count")
                    .groupBy("ul.level")
                    .orderBy("ul.level", "ASC")
                    .getRawMany();
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
                };
                res.json(stats);
            }
            catch (error) {
                console.error("통계 조회 오류:", error);
                res.status(500).json({ message: "통계 조회 중 오류가 발생했습니다." });
            }
        };
        // 사용자별 통계 조회
        this.getUserStats = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({ message: "인증이 필요합니다." });
                }
                const userRepo = AppDataSource.getRepository(User);
                const gymRepo = AppDataSource.getRepository(Gym);
                const postRepo = AppDataSource.getRepository(Post);
                const userLevelRepo = AppDataSource.getRepository(UserLevel);
                // 사용자 정보
                const user = await userRepo.findOne({ where: { id: userId } });
                if (!user) {
                    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
                }
                // 사용자 레벨 정보
                const userLevel = await userLevelRepo.findOne({ where: { userId } });
                // 사용자 포스트 수
                const userPosts = await postRepo.count({ where: { userId } });
                // 사용자 포스트 좋아요 수
                const userPostLikes = await postRepo
                    .createQueryBuilder("post")
                    .select("SUM(post.like_count)", "totalLikes")
                    .where("post.userId = :userId", { userId })
                    .getRawOne();
                // 사용자 운동 통계 (최근 30일)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const workoutStats = await postRepo
                    .createQueryBuilder("post")
                    .select("COUNT(DISTINCT DATE(post.createdAt))", "workoutDays")
                    .addSelect("COUNT(post.id)", "totalPosts")
                    .where("post.userId = :userId", { userId })
                    .andWhere("post.createdAt >= :thirtyDaysAgo", { thirtyDaysAgo })
                    .getRawOne();
                // 연속 운동일 계산 (최근 7일)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentPosts = await postRepo
                    .createQueryBuilder("post")
                    .select("DATE(post.createdAt)", "postDate")
                    .where("post.userId = :userId", { userId })
                    .andWhere("post.createdAt >= :sevenDaysAgo", { sevenDaysAgo })
                    .groupBy("DATE(post.createdAt)")
                    .orderBy("DATE(post.createdAt)", "DESC")
                    .getRawMany();
                // 연속 운동일 계산
                let consecutiveDays = 0;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                for (let i = 0; i < 7; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(checkDate.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];
                    const hasPostOnDate = recentPosts.some(post => post.postDate === dateStr);
                    if (hasPostOnDate) {
                        consecutiveDays++;
                    }
                    else {
                        break;
                    }
                }
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
                    workout: {
                        totalDays: parseInt(workoutStats?.workoutDays || "0"),
                        consecutiveDays: consecutiveDays,
                        totalPosts: parseInt(workoutStats?.totalPosts || "0"),
                    },
                    achievements: [],
                };
                res.json({
                    success: true,
                    message: "사용자 통계를 성공적으로 조회했습니다.",
                    data: stats,
                });
            }
            catch (error) {
                console.error("사용자 통계 조회 오류:", error);
                res
                    .status(500)
                    .json({ message: "사용자 통계 조회 중 오류가 발생했습니다." });
            }
        };
        // 레벨별 사용자 분포
        this.getLevelDistribution = async (req, res) => {
            try {
                const userLevelRepo = AppDataSource.getRepository(UserLevel);
                const postRepo = AppDataSource.getRepository(Post);
                // 레벨별 사용자 수
                const levelDistribution = await userLevelRepo
                    .createQueryBuilder("ul")
                    .select("ul.level", "level")
                    .addSelect("COUNT(*)", "userCount")
                    .groupBy("ul.level")
                    .orderBy("ul.level", "ASC")
                    .getRawMany();
                // 평균 레벨
                const avgLevel = await userLevelRepo
                    .createQueryBuilder("ul")
                    .select("AVG(ul.level)", "averageLevel")
                    .getRawOne();
                // 최고 레벨 사용자
                const topUsers = await userLevelRepo
                    .createQueryBuilder("ul")
                    .leftJoin("ul.user", "user")
                    .select(["ul.level", "ul.exp", "user.nickname"])
                    .orderBy("ul.level", "DESC")
                    .addOrderBy("ul.exp", "DESC")
                    .limit(10)
                    .getMany();
                const stats = {
                    distribution: levelDistribution,
                    averageLevel: parseFloat(avgLevel?.averageLevel || "0"),
                    topUsers: topUsers.map(user => ({
                        nickname: user.user?.nickname,
                        level: user.level,
                        currentExp: user.currentExp,
                    })),
                };
                res.json(stats);
            }
            catch (error) {
                console.error("레벨 분포 조회 오류:", error);
                res
                    .status(500)
                    .json({ message: "레벨 분포 조회 중 오류가 발생했습니다." });
            }
        };
    }
}
