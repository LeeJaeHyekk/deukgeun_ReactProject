import { useState } from "react"

export interface Post {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
}

export const usePostModal = () => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  return {
    selectedPost,
    openPost: (post: Post) => setSelectedPost(post),
    closePost: () => setSelectedPost(null),
  }
}
