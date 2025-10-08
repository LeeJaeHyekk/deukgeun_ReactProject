// ============================================================================
// Base Modal Component - Foundation for all workout modals
// ============================================================================

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './BaseModal.module.css'

// ============================================================================
// Types
// ============================================================================

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'top' | 'bottom'
  backdrop?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  children: React.ReactNode
  scrollable?: boolean
  maxHeight?: string
  fullScreen?: boolean
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  position = 'center',
  backdrop = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  scrollable = false,
  maxHeight,
  fullScreen = false,
  className = ''
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    const handleBackdropClick = (event: MouseEvent) => {
      if (closeOnBackdrop && event.target === backdropRef.current) {
        onClose()
      }
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    // Add event listeners
    document.addEventListener('keydown', handleEscape)
    if (backdropRef.current) {
      backdropRef.current.addEventListener('click', handleBackdropClick)
    }

    // Focus trap
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (firstElement) {
        firstElement.focus()
      }

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
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

      document.addEventListener('keydown', handleTabKey)

      return () => {
        document.removeEventListener('keydown', handleTabKey)
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      if (backdropRef.current) {
        backdropRef.current.removeEventListener('click', handleBackdropClick)
      }
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, closeOnEscape, closeOnBackdrop])

  // ============================================================================
  // Render
  // ============================================================================

  if (!isOpen) return null

  const modalContent = (
    <div
      ref={backdropRef}
      className={`${styles.backdrop} ${backdrop ? styles.backdropVisible : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={subtitle ? 'modal-subtitle' : undefined}
    >
      <div
        ref={modalRef}
        className={`
          ${styles.modal}
          ${styles[`size-${size}`]}
          ${styles[`position-${position}`]}
          ${fullScreen ? styles.fullScreen : ''}
          ${className}
        `}
        style={{ maxHeight }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <div className={styles.titleSection}>
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
                {subtitle && (
                  <p id="modal-subtitle" className={styles.subtitle}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="모달 닫기"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`${styles.body} ${scrollable ? styles.scrollable : ''}`}>
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// ============================================================================
// Sub-components
// ============================================================================

export function ModalHeader({
  title,
  subtitle,
  icon,
  actions,
  onClose
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode[]
  onClose?: () => void
}) {
  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <div>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          {subtitle && (
            <p id="modal-subtitle" className={styles.subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className={styles.headerActions}>
        {actions && actions.map((action, index) => (
          <div key={index} className={styles.action}>
            {action}
          </div>
        ))}
        {onClose && (
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="모달 닫기"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export function ModalBody({
  children,
  padding = '20px',
  scrollable = false,
  maxHeight
}: {
  children: React.ReactNode
  padding?: string
  scrollable?: boolean
  maxHeight?: string
}) {
  return (
    <div
      className={`${styles.body} ${scrollable ? styles.scrollable : ''}`}
      style={{ padding, maxHeight }}
    >
      {children}
    </div>
  )
}

export function ModalFooter({
  primaryAction,
  secondaryAction,
  dangerAction,
  isLoading = false,
  disabled = false
}: {
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  dangerAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  isLoading?: boolean
  disabled?: boolean
}) {
  return (
    <div className={styles.footer}>
      <div className={styles.footerActions}>
        {dangerAction && (
          <button
            type="button"
            className={`${styles.button} ${styles.dangerButton}`}
            onClick={dangerAction.onClick}
            disabled={disabled || dangerAction.disabled || isLoading}
          >
            {dangerAction.label}
          </button>
        )}
        {secondaryAction && (
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={secondaryAction.onClick}
            disabled={disabled || secondaryAction.disabled || isLoading}
          >
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button
            type="button"
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={primaryAction.onClick}
            disabled={disabled || primaryAction.disabled || isLoading}
          >
            {isLoading ? '처리 중...' : primaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}
