// components/PostModal.tsx
import { useState, useEffect } from "react"
import { showToast } from "@frontend/shared/lib"
import type { PostCategoryInfo } from "../../../../shared/types"
import styles from "./postModal.module.css"

interface PostModalProps {
  onClose: () => void
  onSubmit: (postData: {
    title: string
    content: string
    category: string
  }) => Promise<void>
  categories: PostCategoryInfo[]
}

export function PostModal({ onClose, onSubmit, categories }: PostModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: categories && categories.length > 0 ? categories[0].name : "",
  })
  const [loading, setLoading] = useState(false)

  // categories가 변경될 때 초기 카테고리 업데이트
  useEffect(() => {
    if (categories && categories.length > 0 && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: categories[0].name,
      }))
    }
  }, [categories, formData.category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      showToast("제목을 입력해주세요.", "error")
      return
    }

    if (!formData.content.trim()) {
      showToast("내용을 입력해주세요.", "error")
      return
    }

    if (!formData.category) {
      showToast("카테고리를 선택해주세요.", "error")
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      // 성공 시에만 모달 닫기
      onClose()
    } catch (error: unknown) {
      console.error("게시글 작성 실패:", error)
      // 에러 발생 시 모달은 열린 상태로 유지
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>새 게시글 작성</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              value={formData.category}
              onChange={e =>
                setFormData({ ...formData, category: e.target.value })
              }
              className={styles.select}
              required
            >
              <option value="">카테고리를 선택하세요</option>
              {(categories || []).map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={styles.input}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={e =>
                setFormData({ ...formData, content: e.target.value })
              }
              className={styles.textarea}
              placeholder="내용을 입력하세요"
              rows={8}
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "작성 중..." : "작성하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
