import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Comment } from "../entities/Comment";
import { PostService } from "../services/post.service";

const postService = new PostService();

export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.max(
      1,
      Math.min(50, parseInt((req.query.limit as string) || "10"))
    );
    const repo = getRepository(Comment);
    const [data, total] = await repo.findAndCount({
      where: { postId: parseInt(id) },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return res.status(200).json({ data, total, page, limit });
  } catch (e) {
    return res.status(500).json({ message: "Failed to get comments" });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "인증이 필요합니다." });
    const { id } = req.params;
    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "content is required" });
    }
    const repo = getRepository(Comment);
    const comment = repo.create({
      postId: parseInt(id),
      userId: req.user.userId,
      author: req.user.nickname || "익명",
      content,
    });
    const saved = await repo.save(comment);
    await postService.adjustCommentCount(parseInt(id), 1);
    return res.status(201).json(saved);
  } catch (e) {
    return res.status(500).json({ message: "Failed to create comment" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "인증이 필요합니다." });
    const { commentId } = req.params as any;
    const repo = getRepository(Comment);
    const comment = await repo.findOne({ where: { id: parseInt(commentId) } });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }
    await repo.delete(comment.id);
    await postService.adjustCommentCount(comment.postId, -1);
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};
