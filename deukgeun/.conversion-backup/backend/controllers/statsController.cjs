"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User.cjs");
const Gym_1 = require("../entities/Gym.cjs");
const Post_1 = require("../entities/Post.cjs");
const UserLevel_1 = require("../entities/UserLevel.cjs");
const LazyLoader_1 = require("../modules/server/LazyLoader.cjs");
class StatsController {
    constructor() {
        this.getOverallStats = async (req, res) => {
            try {
                const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
                const userRepo = dataSource.getRepository(User_1.User);
                const gymRepo = dataSource.getRepository(Gym_1.Gym);
                const postRepo = dataSource.getRepository(Post_1.Post);
                const userLevelRepo = dataSource.getRepository(UserLevel_1.UserLevel);
                const totalUsers = await userRepo.count();
                const newUsersThisMonth = await userRepo.count({
                    where: {
                        createdAt: (0, typeorm_1.MoreThanOrEqual)(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                    },
                });
                const totalGyms = await gymRepo.count();
                const activeGyms = totalGyms;
                const totalPosts = await postRepo.count();
                const postsThisMonth = await postRepo.count({
                    where: {
                        createdAt: (0, typeorm_1.MoreThanOrEqual)(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                    },
                });
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
        this.getUserStats = async (req, res) => {
            try {
                const userId = Number(req.user?.userId);
                if (!userId || isNaN(userId)) {
                    return res.status(401).json({ message: "인증이 필요합니다." });
                }
                const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
                const userRepo = dataSource.getRepository(User_1.User);
                const gymRepo = dataSource.getRepository(Gym_1.Gym);
                const postRepo = dataSource.getRepository(Post_1.Post);
                const userLevelRepo = dataSource.getRepository(UserLevel_1.UserLevel);
                const user = await userRepo.findOne({ where: { id: userId } });
                if (!user) {
                    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
                }
                const userLevel = await userLevelRepo.findOne({ where: { userId } });
                const userPosts = await postRepo.count({ where: { userId } });
                const userPostLikes = await postRepo
                    .createQueryBuilder("post")
                    .select("SUM(post.like_count)", "totalLikes")
                    .where("post.userId = :userId", { userId })
                    .getRawOne();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const workoutStats = await postRepo
                    .createQueryBuilder("post")
                    .select("COUNT(DISTINCT DATE(post.createdAt))", "workoutDays")
                    .addSelect("COUNT(post.id)", "totalPosts")
                    .where("post.userId = :userId", { userId })
                    .andWhere("post.createdAt >= :thirtyDaysAgo", { thirtyDaysAgo })
                    .getRawOne();
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
                res.set({
                    'Cache-Control': 'private, max-age=300',
                    'ETag': `"user-stats-${userId}-${Date.now()}"`,
                    'Last-Modified': new Date().toUTCString()
                });
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
        this.getLevelDistribution = async (req, res) => {
            try {
                const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
                const userLevelRepo = dataSource.getRepository(UserLevel_1.UserLevel);
                const postRepo = dataSource.getRepository(Post_1.Post);
                const levelDistribution = await userLevelRepo
                    .createQueryBuilder("ul")
                    .select("ul.level", "level")
                    .addSelect("COUNT(*)", "userCount")
                    .groupBy("ul.level")
                    .orderBy("ul.level", "ASC")
                    .getRawMany();
                const avgLevel = await userLevelRepo
                    .createQueryBuilder("ul")
                    .select("AVG(ul.level)", "averageLevel")
                    .getRawOne();
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
exports.StatsController = StatsController;
