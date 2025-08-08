import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { PostLike } from "../entities/Like";
import { PostService } from "../services/post.service";
import { LevelService } from "../services/levelService";

const postService = new PostService();
const levelService = new LevelService();

export const likePost = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "인증이 필요합니다." });
    const { id } = req.params;
    const postId = parseInt(id);

    const repo = getRepository(PostLike);
    const exists = await repo.findOne({
      where: { postId, userId: req.user.userId },
    });
    if (exists) return res.status(200).json({ liked: true });

    const like = repo.create({ postId, userId: req.user.userId });
    await repo.save(like);
    await postService.adjustLikeCount(postId, 1);
    
    // 좋아요 경험치 부여
    try {
      await levelService.grantExp(
        req.user.userId,
        "like",
        "post_like",
        { postId, action: "like" }
      );
    } catch (levelError) {
      // 경험치 부여 실패는 좋아요에 영향을 주지 않음
      console.error("경험치 부여 실패:", levelError);
    }
    
    return res.status(201).json({ liked: true });
  } catch (e) {
    return res.status(500).json({ message: "Failed to like post" });
  }
};

export const unlikePost = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "인증이 필요합니다." });
    const { id } = req.params;
    const postId = parseInt(id);

    const repo = getRepository(PostLike);
    const result = await repo.delete({ postId, userId: req.user.userId });
    if (result.affected && result.affected > 0) {
      await postService.adjustLikeCount(postId, -1);
    }
    return res.status(200).json({ liked: false });
  } catch (e) {
    return res.status(500).json({ message: "Failed to unlike post" });
  }
};
