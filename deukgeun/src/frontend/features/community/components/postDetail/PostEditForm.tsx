import React from 'react'
import styles from './PostEditForm.module.css'

interface PostEditFormProps {
  editData: {
    title: string
    content: string
    category: string
  }
  onEditDataChange: (data: { title: string; content: string; category: string }) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
}

export function PostEditForm({ 
  editData, 
  onEditDataChange, 
  onSave, 
  onCancel, 
  loading 
}: PostEditFormProps) {
  return (
    <div className={styles.editForm}>
      <input
        type="text"
        value={editData.title}
        onChange={e =>
          onEditDataChange({ ...editData, title: e.target.value })
        }
        className={styles.titleInput}
        placeholder="제목을 입력하세요"
      />
      <textarea
        value={editData.content}
        onChange={e =>
          onEditDataChange({ ...editData, content: e.target.value })
        }
        className={styles.contentInput}
        placeholder="내용을 입력하세요"
        rows={8}
      />
      <div className={styles.editActions}>
        <button
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={loading}
        >
          취소
        </button>
        <button
          onClick={onSave}
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
