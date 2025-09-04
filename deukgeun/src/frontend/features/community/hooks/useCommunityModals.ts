import { useState, useCallback } from "react"
import { Post as CommunityPost } from "../../../types/community"

export function useCommunityModals() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)

  // 글쓰기 모달 열기
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  // 글쓰기 모달 닫기
  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  // 게시글 상세 모달 열기
  const openDetailModal = useCallback((post: CommunityPost) => {
    setSelectedPost(post)
    setIsDetailModalOpen(true)
  }, [])

  // 게시글 상세 모달 닫기
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedPost(null)
  }, [])

  // 모든 모달 닫기
  const closeAllModals = useCallback(() => {
    setIsCreateModalOpen(false)
    setIsDetailModalOpen(false)
    setSelectedPost(null)
  }, [])

  return {
    // 상태
    isCreateModalOpen,
    isDetailModalOpen,
    selectedPost,

    // 액션
    openCreateModal,
    closeCreateModal,
    openDetailModal,
    closeDetailModal,
    closeAllModals,
  }
}
