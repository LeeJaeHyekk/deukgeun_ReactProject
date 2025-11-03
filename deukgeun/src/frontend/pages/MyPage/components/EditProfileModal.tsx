// ============================================================================
// EditProfileModal - 회원정보 수정 모달
// ============================================================================

import React, { useState, useEffect, useCallback } from "react"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import styles from "./EditProfileModal.module.css"

interface EditProfileForm {
  nickname: string
  phone: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { user, updateUser } = useAuthRedux()

  const [formData, setFormData] = useState<EditProfileForm>({
    nickname: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof EditProfileForm | "submit", string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  // 사용자 정보 초기화
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nickname: user.nickname || "",
        phone: user.phone || user.phoneNumber || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setErrors({})
      setShowPasswordFields(false)
    }
  }, [user, isOpen])

  // 모달 열릴 때 외부 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // 입력 핸들러
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      // 에러 초기화
      if (errors[name as keyof EditProfileForm]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      }
    },
    [errors]
  )

  // 유효성 검증
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof EditProfileForm | "submit", string>> = {}

    // 닉네임 검증
    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요."
    } else if (formData.nickname.trim().length < 2) {
      newErrors.nickname = "닉네임은 2자 이상이어야 합니다."
    } else if (formData.nickname.trim().length > 20) {
      newErrors.nickname = "닉네임은 20자 이하여야 합니다."
    }

    // 전화번호 검증
    if (formData.phone && !/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "전화번호는 010-XXXX-XXXX 형식이어야 합니다."
    }

    // 비밀번호 변경 시 검증
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "현재 비밀번호를 입력해주세요."
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "새 비밀번호를 입력해주세요."
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = "비밀번호는 8자 이상이어야 합니다."
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
        newErrors.newPassword = "비밀번호는 영문 대소문자와 숫자를 포함해야 합니다."
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, showPasswordFields])

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsLoading(true)

      try {
        const updateData: any = {
          nickname: formData.nickname.trim(),
          phone: formData.phone.trim() || undefined,
        }

        // 비밀번호 변경이 요청된 경우에만 비밀번호 필드 추가
        if (showPasswordFields && formData.newPassword && formData.newPassword.trim()) {
          updateData.currentPassword = formData.currentPassword
          updateData.newPassword = formData.newPassword.trim()
        }

        console.log("📤 [EditProfileModal] 업데이트 요청 데이터:", {
          ...updateData,
          currentPassword: updateData.currentPassword ? "***" : undefined,
          newPassword: updateData.newPassword ? "***" : undefined,
        })

        const response = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "업데이트 실패" }))
          const errorMessage = errorData.message || errorData.error || "업데이트에 실패했습니다."
          console.error("❌ [EditProfileModal] API 오류 응답:", errorData)
          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log("✅ [EditProfileModal] API 성공 응답:", result)

        // 응답 구조에 따라 user 데이터 추출
        const updatedUser = result.data?.user || result.data || result.user || result

        // Redux 상태 업데이트 - 기존 user 정보와 병합하여 업데이트
        if (updatedUser && updatedUser.id) {
          // 기존 user 정보와 병합 (accessToken 등 유지)
          const mergedUser = {
            ...user,
            ...updatedUser,
            // accessToken은 기존 것을 유지 (서버에서 반환하지 않을 수 있음)
            accessToken: user?.accessToken || updatedUser.accessToken,
          }

          updateUser(mergedUser)
          console.log("✅ [EditProfileModal] Redux 상태 업데이트 완료")
        } else {
          console.warn("⚠️ [EditProfileModal] 업데이트된 사용자 데이터가 올바르지 않습니다:", updatedUser)
        }

        // 성공 콜백
        if (onSuccess) {
          onSuccess()
        }

        // 모달 닫기
        onClose()
      } catch (error: any) {
        console.error("❌ [EditProfileModal] 회원정보 수정 실패:", error)
        setErrors({
          submit: error.message || "회원정보 수정에 실패했습니다. 다시 시도해주세요.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [formData, showPasswordFields, validateForm, user, updateUser, onSuccess, onClose]
  )

  // 전화번호 포맷팅
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 3) {
      value = value.slice(0, 3) + "-" + value.slice(3)
    }
    if (value.length > 8) {
      value = value.slice(0, 8) + "-" + value.slice(8)
    }

    setFormData((prev) => ({ ...prev, phone: value }))

    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }))
    }
  }, [errors.phone])

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>회원정보 수정</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* 닉네임 */}
          <div className={styles.formGroup}>
            <label htmlFor="nickname" className={styles.label}>
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="닉네임을 입력하세요"
              disabled={isLoading}
              required
            />
            {errors.nickname && <span className={styles.error}>{errors.nickname}</span>}
          </div>

          {/* 전화번호 */}
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={styles.input}
              placeholder="010-1234-5678"
              disabled={isLoading}
              maxLength={13}
            />
            {errors.phone && <span className={styles.error}>{errors.phone}</span>}
          </div>

          {/* 비밀번호 변경 토글 */}
          <div className={styles.formGroup}>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPasswordFields((prev) => !prev)}
              disabled={isLoading}
            >
              {showPasswordFields ? "비밀번호 변경 취소" : "비밀번호 변경"}
            </button>
          </div>

          {/* 비밀번호 변경 필드 */}
          {showPasswordFields && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" className={styles.label}>
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="현재 비밀번호를 입력하세요"
                  disabled={isLoading}
                />
                {errors.currentPassword && (
                  <span className={styles.error}>{errors.currentPassword}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="새 비밀번호를 입력하세요 (8자 이상, 영문 대소문자, 숫자 포함)"
                  disabled={isLoading}
                />
                {errors.newPassword && (
                  <span className={styles.error}>{errors.newPassword}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <span className={styles.error}>{errors.confirmPassword}</span>
                )}
              </div>
            </>
          )}

          {/* 전송 에러 */}
          {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

          {/* 버튼 */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
