// // components/PostModal.tsx
// import styles from "./PostModal.module.css";
// import { Project } from "./PostCard";

// interface PostModalProps {
//   post: Project;
//   onClose: () => void;
// }

// export const PostModal = ({ post, onClose }: PostModalProps) => {
//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div
//         className={styles.modalContent}
//         onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
//       >
//         <h2>{post.title}</h2>
//         <p>Category: {post.category}</p>
//         <img src={post.imageUrl} alt={post.title} />
//         <button onClick={onClose} className={styles.closeButton}>
//           닫기
//         </button>
//       </div>
//     </div>
//   );
// };

// components/PostModal.tsx
import styles from "./PostModal.module.css";
import { Project } from "./PostCard";
import { X, Heart, MessageCircle } from "lucide-react";

interface PostModalProps {
  post: Project;
  onClose: () => void;
}

export const PostModal = ({ post, onClose }: PostModalProps) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <div className={styles.imageSection}>
          <img src={post.imageUrl} alt={post.title} />
        </div>
        <div className={styles.contentSection}>
          <h2>{post.title}</h2>
          <p className={styles.category}>Category: {post.category}</p>
        </div>
        <div className={styles.footerSection}>
          <button className={styles.actionButton}>
            <Heart size={20} />
            <span>좋아요</span>
          </button>
          <button className={styles.actionButton}>
            <MessageCircle size={20} />
            <span>댓글</span>
          </button>
        </div>
      </div>
    </div>
  );
};
