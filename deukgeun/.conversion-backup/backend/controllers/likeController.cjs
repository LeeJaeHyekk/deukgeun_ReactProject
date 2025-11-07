"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeController = void 0;
const Like_1 = require('../entities/Like.cjs');
const Post_1 = require('../entities/Post.cjs');
const databaseConfig_1 = require('../config/databaseConfig.cjs');
const transformers_1 = require('../transformers/index.cjs.cjs');
class LikeController {
    constructor() {
        this.toggleLike = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user?.userId;
                console.log("좋아요 토글 요청:", { id, userId });
                console.log("사용자 정보:", req.user);
                if (!userId) {
                    console.log("사용자 ID가 없음");
                    return res.status(401).json({
                        success: false,
                        message: "인증이 필요합니다.",
                    });
                }
                if (!id || isNaN(parseInt(id))) {
                    console.log("유효하지 않은 포스트 ID:", id);
                    return res.status(400).json({
                        success: false,
                        message: "유효하지 않은 포스트 ID입니다.",
                    });
                }
                const postRepository = databaseConfig_1.AppDataSource.getRepository(Post_1.Post);
                const likeRepository = databaseConfig_1.AppDataSource.getRepository(Like_1.Like);
                const post = await postRepository.findOne({
                    where: { id: parseInt(id) },
                });
                if (!post) {
                    console.log("포스트를 찾을 수 없음:", id);
                    return res.status(404).json({
                        success: false,
                        message: "포스트를 찾을 수 없습니다.",
                    });
                }
                const existingLike = await likeRepository.findOne({
                    where: { postId: parseInt(id), userId },
                });
                let isLiked;
                let newLikeCount;
                let likeDTO;
                if (existingLike) {
                    console.log("기존 좋아요 제거");
                    await likeRepository.remove(existingLike);
                    await postRepository
                        .createQueryBuilder()
                        .update(Post_1.Post)
                        .set({ like_count: () => "like_count - 1" })
                        .where("id = :id", { id: parseInt(id) })
                        .execute();
                    isLiked = false;
                    newLikeCount = Math.max(0, post.like_count - 1);
                    console.log("좋아요 제거 성공:", { id, userId });
                }
                else {
                    console.log("새 좋아요 추가");
                    const like = likeRepository.create({
                        postId: parseInt(id),
                        userId,
                    });
                    const savedLike = await likeRepository.save(like);
                    likeDTO = (0, transformers_1.toLikeDTO)(savedLike);
                    await postRepository
                        .createQueryBuilder()
                        .update(Post_1.Post)
                        .set({ like_count: () => "like_count + 1" })
                        .where("id = :id", { id: parseInt(id) })
                        .execute();
                    isLiked = true;
                    newLikeCount = post.like_count + 1;
                    console.log("좋아요 추가 성공:", { id, userId });
                }
                res.json({
                    success: true,
                    message: isLiked
                        ? "좋아요가 성공적으로 추가되었습니다."
                        : "좋아요가 성공적으로 제거되었습니다.",
                    data: {
                        isLiked,
                        likeCount: newLikeCount,
                        like: likeDTO,
                    },
                });
            }
            catch (error) {
                console.error("좋아요 토글 오류:", error);
                res.status(500).json({
                    success: false,
                    message: "좋아요 처리 중 오류가 발생했습니다.",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        };
        this.addLike = async (req, res) => {
            return this.toggleLike(req, res);
        };
        this.removeLike = async (req, res) => {
            return this.toggleLike(req, res);
        };
    }
}
exports.LikeController = LikeController;
