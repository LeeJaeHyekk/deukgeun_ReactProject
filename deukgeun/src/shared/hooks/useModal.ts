// ============================================================================
// 모달 관리 훅
// ============================================================================

import { useState, useCallback, useRef, useEffect } from "react"

// 모달 훅 옵션
export interface UseModalOptions {
  initialOpen?: boolean
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  preventScroll?: boolean
}

// 모달 훅 반환 타입
export interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  modalRef: React.RefObject<HTMLDivElement>
  overlayRef: React.RefObject<HTMLDivElement>
}

// 모달 훅
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const {
    initialOpen = false,
    closeOnEscape = true,
    closeOnOverlayClick = true,
    preventScroll = true,
  } = options

  const [isOpen, setIsOpen] = useState(initialOpen)
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // 모달 열기
  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  // 모달 닫기
  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  // 모달 토글
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // ESC 키 처리
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [closeOnEscape, isOpen, close])

  // 오버레이 클릭 처리
  useEffect(() => {
    if (!closeOnOverlayClick || !isOpen) return

    const handleOverlayClick = (event: MouseEvent) => {
      if (overlayRef.current && event.target === overlayRef.current) {
        close()
      }
    }

    const overlay = overlayRef.current
    if (overlay) {
      overlay.addEventListener("click", handleOverlayClick)
      return () => overlay.removeEventListener("click", handleOverlayClick)
    }
  }, [closeOnOverlayClick, isOpen, close])

  // 스크롤 방지
  useEffect(() => {
    if (!preventScroll) return

    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, preventScroll])

  // 포커스 트랩
  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    firstElement.focus()

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    modal.addEventListener("keydown", handleTabKey)
    return () => modal.removeEventListener("keydown", handleTabKey)
  }, [isOpen])

  return {
    isOpen,
    open,
    close,
    toggle,
    modalRef,
    overlayRef,
  }
}

// 다중 모달 관리 훅
export function useMultiModal() {
  const [modals, setModals] = useState<Record<string, boolean>>({})

  const openModal = useCallback((modalId: string) => {
    setModals(prev => ({ ...prev, [modalId]: true }))
  }, [])

  const closeModal = useCallback((modalId: string) => {
    setModals(prev => ({ ...prev, [modalId]: false }))
  }, [])

  const toggleModal = useCallback((modalId: string) => {
    setModals(prev => ({ ...prev, [modalId]: !prev[modalId] }))
  }, [])

  const isModalOpen = useCallback(
    (modalId: string) => {
      return modals[modalId] || false
    },
    [modals]
  )

  const closeAllModals = useCallback(() => {
    setModals({})
  }, [])

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    closeAllModals,
  }
}

// 모달 스택 관리 훅
export function useModalStack() {
  const [modalStack, setModalStack] = useState<string[]>([])

  const pushModal = useCallback((modalId: string) => {
    setModalStack(prev => [...prev, modalId])
  }, [])

  const popModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1))
  }, [])

  const clearStack = useCallback(() => {
    setModalStack([])
  }, [])

  const getTopModal = useCallback(() => {
    return modalStack[modalStack.length - 1]
  }, [modalStack])

  const isModalInStack = useCallback(
    (modalId: string) => {
      return modalStack.includes(modalId)
    },
    [modalStack]
  )

  return {
    modalStack,
    pushModal,
    popModal,
    clearStack,
    getTopModal,
    isModalInStack,
  }
}
