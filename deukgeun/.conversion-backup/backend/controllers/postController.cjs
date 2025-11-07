"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const postService_1 = require('../services/postService.cjs');
const User_1 = require('../entities/User.cjs');
const levelService_1 = require('../services/levelService.cjs');
const databaseConfig_1 = require('../config/databaseConfig.cjs');
const index_1 = require('../transformers/index.cjs');
class PostController {
    constructor() {
        this.getAllPosts = async (req, res, next) => {
            try {
                const { category, q, sort, page, limit } = req.query;
                const result = await this.postService.getAllPosts({
                    category,
                    q,
                    sort,
                    page: page ? parseInt(page) : undefined,
                    limit: limit ? parseInt(limit) : undefined,
                });
                if (result.data && Array.isArray(result.data)) {
                    result.data = (0, index_1.toPostDTOList)(result.data);
                }
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMyPosts = async (req, res, next) => {
            try {
                if (!req.user?.userId) {
                    return res.status(401).json({ message: "인증이 필요합니다." });
                }
                const posts = await this.postService.getPostsByUserId(req.user.userId);
                const postDTOs = (0, index_1.toPostDTOList)(posts);
                res.json(postDTOs);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPostById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const post = await this.postService.getPostById(parseInt(id));
                if (!post) {
                    return res.status(404).json({ message: "Post not found" });
                }
                const postDTO = (0, index_1.toPostDTO)(post);
                res.json(postDTO);
            }
            catch (error) {
                next(error);
            }
        };
        this.createPost = async (req, res, next) => {
            try {
                if (!req.user?.userId) {
                    return res.status(401).json({ message: "인증이 필요합니다." });
                }
                const { title, content } = req.body || {};
                if (!title || !content) {
                    return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
                }
                const userRepo = databaseConfig_1.AppDataSource.getRepository(User_1.User);
                const authorUser = await userRepo.findOne({
                    where: { id: req.user.userId },
                });
                const safeAuthor = authorUser?.nickname || authorUser?.email || "user";
                const postData = {
                    ...req.body,
                    author: safeAuthor,
                    userId: req.user.userId,
                };
                if (!postData.category) {
                    delete postData.category;
                }
                const newPost = await this.postService.createPost(postData, req.user.userId);
                if (!newPost) {
                    return res.status(500).json({ message: "게시글 생성에 실패했습니다." });
                }
                try {
                    await this.levelService.grantExp(req.user.userId, "post", "post_creation", { postId: newPost.id, title: newPost.title });
                }
                catch (levelError) {
                    console.error("경험치 부여 실패:", levelError);
                }
                const postDTO = (0, index_1.toPostDTO)(newPost);
                res.status(201).json({
                    success: true,
                    message: "게시글이 성공적으로 생성되었습니다.",
                    data: postDTO
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePost = async (req, res, next) => {
            try {
                if (!req.user?.userId) {
                    return res.status(401).json({ message: "인증이 필요합니다." });
                }
                const { id } = req.params;
                const updateData = req.body;
                const post = await this.postService.getPostById(parseInt(id));
                if (!post) {
                    return res.status(404).json({ message: "Post not found" });
                }
                if (post.userId !== req.user.userId) {
                    return res.status(403).json({ message: "권한이 없습니다." });
                }
                const updatedPost = await this.postService.updatePost(parseInt(id), updateData, req.user.userId);
                res.json(updatedPost);
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePost = async (req, res, next) => {
            try {
                if (!req.user?.userId) {
                    return res.status(401).json({ message: "인증이 필요합니다." });
                }
                const { id } = req.params;
                const post = await this.postService.getPostById(parseInt(id));
                if (!post) {
                    return res.status(404).json({ message: "Post not found" });
                }
                if (post.userId !== req.user.userId) {
                    return res.status(403).json({ message: "권한이 없습니다." });
                }
                const deleted = await this.postService.deletePost(parseInt(id), req.user.userId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        };
        this.getCategories = async (_req, res) => {
            try {
                const categories = [
                    "general",
                    "workout",
                    "nutrition",
                    "motivation",
                    "tips",
                    "questions",
                    "achievements",
                    "challenges",
                ];
                const { Post } = await Promise.resolve().then(() => __importStar(require('./entities/Post.cjs')));
                const repo = databaseConfig_1.AppDataSource.getRepository(Post);
                const categoryCounts = await Promise.all(categories.map(async (category) => {
                    const count = await repo.count({ where: { category } });
                    return {
                        id: categories.indexOf(category) + 1,
                        name: category,
                        count,
                    };
                }));
                return res.status(200).json({
                    success: true,
                    message: "Categories retrieved successfully",
                    data: categoryCounts,
                });
            }
            catch (error) {
                console.error("카테고리 조회 실패:", error);
                return res.status(500).json({
                    success: false,
                    message: "카테고리 조회에 실패했습니다.",
                });
            }
        };
        this.getCategoriesLive = async (_req, res, next) => {
            try {
                const { Post } = await Promise.resolve().then(() => __importStar(require('./entities/Post.cjs')));
                const repo = databaseConfig_1.AppDataSource.getRepository(Post);
                const result = await repo.query("SHOW COLUMNS FROM posts LIKE 'category'");
                const type = result?.[0]?.Type;
                if (!type || !type.startsWith("enum")) {
                    return res.status(200).json(["기타"]);
                }
                const inner = type.substring(type.indexOf("(") + 1, type.lastIndexOf(")"));
                const values = inner
                    .split(",")
                    .map((s) => s.trim())
                    .map((s) => s.replace(/^'/, "").replace(/'$/, ""));
                return res.status(200).json(values);
            }
            catch (error) {
                next(error);
            }
        };
        this.postService = new postService_1.PostService();
        this.levelService = new levelService_1.LevelService();
    }
}
exports.PostController = PostController;
