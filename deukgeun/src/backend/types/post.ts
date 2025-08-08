export interface Post {
  id?: number
  title: string
  content: string
  author: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreatePostRequest {
  title: string
  content: string
  author: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  author?: string
}
