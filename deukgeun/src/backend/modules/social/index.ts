// ============================================================================
// Social 모듈 인덱스
// ============================================================================

// Social 관련 라우트
export { default as postRoutes } from "@backend/routes/post"
export { default as commentRoutes } from "@backend/routes/comment"
export { default as likeRoutes } from "@backend/routes/like"

// Social 컨트롤러
export { PostController } from "@backend/controllers/postController"
export { CommentController } from "@backend/controllers/commentController"
export { LikeController } from "@backend/controllers/likeController"

// Social 서비스
export { PostService } from "@backend/services/post.service"

// Social 엔티티
export { Post } from "@backend/entities/Post"
export { Comment } from "@backend/entities/Comment"
export { Like } from "@backend/entities/Like"
