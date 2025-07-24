// import { motion, AnimatePresence } from 'framer-motion'

// interface Post {
//     id: number;
//     title: string;
//     content: string;
//     author: string;
//     createdAt: string;
//   }
  
//   interface PostModalProps {
//     post: Post;
//     onClose: () => void;
//   }

// export const PostModal = ({ post, onClose }: PostModalProps) => {
//   return (  
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
//         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//         onClick={onClose}
//       >
//         <motion.div
//           className="bg-white text-black p-6 rounded-xl max-w-md w-full"
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <h2 className="text-xl font-bold mb-2">{post.title}</h2>
//           <p className="text-sm">{post.content}</p>
//           <button className="mt-4 text-blue-500" onClick={onClose}>Close</button>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   )
// }
import { motion, AnimatePresence } from 'framer-motion'
import './PostModal.module.css'

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface PostModalProps {
  post: Post;
  onClose: () => void;
}

export const PostModal = ({ post, onClose }: PostModalProps) => {
  return (
    <AnimatePresence>
      <motion.div
        className="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="title">{post.title}</h2>
          <p className="content">{post.content}</p>
          <button className="closeBtn" onClick={onClose}>Close</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
