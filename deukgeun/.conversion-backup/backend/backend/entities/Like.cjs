var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, Index, ManyToOne, JoinColumn,  } = require('typeorm');
const { Post  } = require('./Post');
const { User  } = require('./User');
let Like = class Like {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Like.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], Like.prototype, "postId", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], Like.prototype, "userId", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], Like.prototype, "createdAt", void 0);
__decorate([
    ManyToOne(() => Post, { onDelete: "CASCADE" }),
    JoinColumn({ name: "postId" }),
    __metadata("design:type", Post)
], Like.prototype, "post", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], Like.prototype, "user", void 0);
Like = __decorate([
    Entity("post_likes"),
    Unique(["postId", "userId"]) // 한 사용자당 한 포스트에 1회만 좋아요
    ,
    Index(["postId"]) // 포스트별 좋아요 조회를 위한 인덱스
    ,
    Index(["userId"]) // 사용자별 좋아요 조회를 위한 인덱스
], Like);
module.exports.Like = Like;
