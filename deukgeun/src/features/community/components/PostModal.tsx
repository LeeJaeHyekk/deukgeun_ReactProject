// import { motion, AnimatePresence } from "framer-motion";
// import styles from "./PostModal.module.css";

// interface Post {
//   id: number;
//   title: string;
//   content: string;
//   author: string;
//   createdAt: string;
// }

// interface PostModalProps {
//   post: Post;
//   onClose: () => void;
// }

// export const PostModal = ({ post, onClose }: PostModalProps) => {
//   return (
//     <AnimatePresence>
//       <motion.div
//         className={styles.backdrop}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         onClick={onClose}
//       >
//         <motion.div
//           className={styles.modal}
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <h2 className={styles.title}>{post.title}</h2>
//           <p className={styles.content}>{post.content}</p>
//           <button className={styles.closeBtn} onClick={onClose}>
//             Close
//           </button>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// components/PostModal.tsx
import styles from "./PostModal.module.css";
import { Project } from "./PostCard";

interface PostModalProps {
  post: Project;
  onClose: () => void;
}

export const PostModal = ({ post, onClose }: PostModalProps) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
      >
        <h2>{post.title}</h2>
        <p>Category: {post.category}</p>
        <img src={post.imageUrl} alt={post.title} />
        <button onClick={onClose} className={styles.closeButton}>
          닫기
        </button>
      </div>
    </div>
  );
};
