// components/PostModal.tsx
import { useState } from "react";
import styles from "./PostModal.module.css";
import { Project } from "./PostCard";
import { Heart, MessageCircle, X } from "lucide-react";

interface PostModalProps {
  post: Project;
  onClose: () => void;
}

export const PostModal = ({ post, onClose }: PostModalProps) => {
  const [likes, setLikes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => setLikes((prev) => prev + 1);

  const toggleComments = () => setShowComments((prev) => !prev);

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    setComments((prev) => [...prev, newComment.trim()]);
    setNewComment("");
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        {/* 이미지 */}
        <img
          src={post.imageUrl}
          alt={post.title}
          className={styles.postImage}
        />

        {/* 본문 */}
        <div className={styles.postDetails}>
          <h2>{post.title}</h2>
          <p className={styles.category}>{post.category}</p>
        </div>

        {/* Footer (좋아요, 댓글) */}
        <div className={styles.postFooter}>
          <button className={styles.iconButton} onClick={handleLike}>
            <Heart />
            <span>{likes}</span>
          </button>

          <button className={styles.iconButton} onClick={toggleComments}>
            <MessageCircle />
            <span>{comments.length}</span>
          </button>
        </div>

        {/* 댓글 리스트 */}
        {showComments && (
          <div className={styles.commentSection}>
            <ul className={styles.commentList}>
              {comments.map((comment, index) => (
                <li key={index}>{comment}</li>
              ))}
            </ul>

            {/* 댓글 입력 */}
            <div className={styles.commentInputArea}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
              />
              <button onClick={handleAddComment}>게시</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
