// import { useState, useEffect } from 'react'
// import { PostCard } from './PostCard'
// import { PostModal } from './PostModal'
// import { usePostModal } from '../hooks/usePostModal'

// interface Post {
//     id: number;
//     title: string;
//     content: string;
//     author: string;
//     createdAt: string;
//   }

//   const mockPosts = Array.from({ length: 12 }).map((_, i) => ({
//     id: i,
//     title: `Post ${i + 1}`,
//     content: 'Lorem ipsum dolor sit amet.',
//     author: '작성자',
//     createdAt: new Date().toISOString(),
//   }))
  

// export const PostGrid = () => {
//   const { selectedPost, openPost, closePost } = usePostModal()

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//       {mockPosts.map((post, i) => (
//         <PostCard key={post.id} post={post} index={i} onClick={() => openPost(post)} />
//       ))}
//       {selectedPost && <PostModal post={selectedPost} onClose={closePost} />}
//     </div>
//   )
// }

import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { usePostModal } from '../hooks/usePostModal';
import './PostGrid.module.css'; // ✅ .module.css → 일반 CSS로 변경하여 import

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

const mockPosts: Post[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  title: `Post ${i + 1}`,
  content: 'Lorem ipsum dolor sit amet.',
  author: '작성자',
  createdAt: new Date().toISOString(),
}));

export const PostGrid = () => {
  const { selectedPost, openPost, closePost } = usePostModal();

  return (
    <div className="post-grid-container">
      {mockPosts.map((post, i) => (
        <div key={post.id} className="post-grid-item">
          <PostCard post={post} index={i} onClick={() => openPost(post)} />
        </div>
      ))}
      {selectedPost && <PostModal post={selectedPost} onClose={closePost} />}
    </div>
  );
};

