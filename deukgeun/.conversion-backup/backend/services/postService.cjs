"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const databaseConfig_1 = require('../config/databaseConfig.cjs');
const Post_1 = require('../entities/Post.cjs');
const User_1 = require('../entities/User.cjs');
class PostService {
    async getAllPosts(params) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            const userRepository = databaseConfig_1.AppDataSource.getRepository(User_1.User);
            let queryBuilder = postRepository
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.user", "user");
            if (params.category && params.category !== "all") {
                queryBuilder = queryBuilder.where("post.category = :category", {
                    category: params.category,
                });
            }
            if (params.q) {
                queryBuilder = queryBuilder.andWhere("(post.title LIKE :search OR post.content LIKE :search)", { search: `%${params.q}%` });
            }
            switch (params.sort) {
                case "latest":
                    queryBuilder = queryBuilder.orderBy("post.createdAt", "DESC");
                    break;
                case "popular":
                    queryBuilder = queryBuilder.orderBy("post.like_count", "DESC");
                    break;
                case "oldest":
                    queryBuilder = queryBuilder.orderBy("post.createdAt", "ASC");
                    break;
                case "likes":
                    queryBuilder = queryBuilder.orderBy("post.like_count", "DESC");
                    break;
                case "comments":
                    queryBuilder = queryBuilder.orderBy("post.comment_count", "DESC");
                    break;
                default:
                    queryBuilder = queryBuilder.orderBy("post.createdAt", "DESC");
            }
            const page = params.page || 1;
            const limit = params.limit || 10;
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
            const [posts, total] = await queryBuilder.getManyAndCount();
            return {
                success: true,
                message: "포스트 조회 성공",
                data: {
                    posts,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        }
        catch (error) {
            console.error("포스트 조회 오류:", error);
            return {
                success: false,
                message: "포스트 조회 중 오류가 발생했습니다.",
                data: null
            };
        }
    }
    async getPostById(id) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            return await postRepository.findOne({
                where: { id },
                relations: ["user"],
            });
        }
        catch (error) {
            console.error("포스트 조회 오류:", error);
            return null;
        }
    }
    async getPostsByUserId(userId) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            return await postRepository.find({
                where: { userId },
                order: { createdAt: "DESC" },
            });
        }
        catch (error) {
            console.error("사용자 포스트 조회 오류:", error);
            return [];
        }
    }
    async createPost(postData, userId) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            const userRepository = databaseConfig_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error("사용자를 찾을 수 없습니다.");
            }
            const post = postRepository.create({
                ...postData,
                userId,
                author: user.nickname,
            });
            return await postRepository.save(post);
        }
        catch (error) {
            console.error("포스트 생성 오류:", error);
            return null;
        }
    }
    async updatePost(id, updateData, userId) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = await postRepository.findOne({
                where: { id, userId },
            });
            if (!post) {
                return null;
            }
            Object.assign(post, updateData);
            return await postRepository.save(post);
        }
        catch (error) {
            console.error("포스트 수정 오류:", error);
            return null;
        }
    }
    async deletePost(id, userId) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = await postRepository.findOne({
                where: { id, userId },
            });
            if (!post) {
                return false;
            }
            await postRepository.remove(post);
            return true;
        }
        catch (error) {
            console.error("포스트 삭제 오류:", error);
            return false;
        }
    }
    async adjustLikeCount(postId, adjustment) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            await postRepository
                .createQueryBuilder()
                .update(Post_1.Post)
                .set({ like_count: () => `like_count + ${adjustment}` })
                .where("id = :id", { id: postId })
                .execute();
        }
        catch (error) {
            console.error("좋아요 수 조정 오류:", error);
        }
    }
    async adjustCommentCount(postId, adjustment) {
        try {
            const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
            await postRepository
                .createQueryBuilder()
                .update(Post_1.Post)
                .set({ comment_count: () => `comment_count + ${adjustment}` })
                .where("id = :id", { id: postId })
                .execute();
        }
        catch (error) {
            console.error("댓글 수 조정 오류:", error);
        }
    }
}
exports.PostService = PostService;
