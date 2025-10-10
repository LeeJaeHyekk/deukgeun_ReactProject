var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,  } = require('typeorm');
const { User  } = require('./User');
const { Like  } = require('./Like');
/**
 * 포스트 엔티티 클래스
 * TypeORM을 사용하여 데이터베이스의 posts 테이블과 매핑됩니다.
 * 커뮤니티 게시판의 포스트 정보를 저장합니다.
 */
let Post = class Post {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Post.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    Column({ type: "text" }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Post.prototype, "author", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], Post.prototype, "userId", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["general", "workout", "nutrition", "motivation", "tips", "questions", "achievements", "challenges"],
        default: "general",
    }),
    Index(),
    __metadata("design:type", String)
], Post.prototype, "category", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    Column({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "thumbnail_url", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Array)
], Post.prototype, "images", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    Index(),
    __metadata("design:type", Number)
], Post.prototype, "like_count", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "comment_count", void 0);
__decorate([
    CreateDateColumn(),
    Index(),
    __metadata("design:type", Date
    /**
     * 포스트 수정 시간
     * 엔티티가 업데이트될 때마다 자동으로 갱신됩니다.
     */
    )
], Post.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User
    // 좋아요 관계
    )
], Post.prototype, "user", void 0);
__decorate([
    OneToMany(() => Like, like => like.post),
    __metadata("design:type", Array)
], Post.prototype, "likes", void 0);
Post = __decorate([
    Entity("posts")
], Post);
module.exports.Post = Post;
