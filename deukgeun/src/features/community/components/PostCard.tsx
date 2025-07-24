// import { motion } from 'framer-motion'

// interface Post {
//   id: number;
//   title: string;
//   content: string;
//   author: string;
//   createdAt: string;
// }

// interface PostCardProps {
//   post: Post;
//   index: number;
//   onClick: (post: Post) => void;
// }

// export const PostCard = ({ post, index, onClick }: PostCardProps) => {
//   const direction = index % 2 === 0 ? -10 : 10;

//   return (
//     <motion.div 
//       onClick={() => onClick(post)}  
//       className="bg-neutral-800 rounded-xl p-4 cursor-pointer hover:scale-105 transition-all"
//       animate={{
//         y: [0, direction, 0],
//       }}
//       transition={{
//         repeat: Infinity,
//         repeatType: 'loop',
//         duration: 4,
//         delay: (index % 4) * 0.3,
//       }}
//     >
//       <h2 className="text-xl font-semibold">{post.title}</h2>
//       <p className="text-sm text-gray-400">{post.content}</p>
//     </motion.div>
//   );
// };

import { motion } from 'framer-motion'
import './PostCard.module.css'

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  index: number;
  onClick: (post: Post) => void;
}

export const PostCard = ({ post, index, onClick }: PostCardProps) => {
  const direction = index % 2 === 0 ? -10 : 10;

  return (
    <motion.div 
      onClick={() => onClick(post)}  
      className="card"
      animate={{
        y: [0, direction, 0],
      }}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        duration: 4,
        delay: (index % 4) * 0.3,
      }}
    >
      <h2 className="title">{post.title}</h2>
      <p className="content">{post.content}</p>
    </motion.div>
  )
}

