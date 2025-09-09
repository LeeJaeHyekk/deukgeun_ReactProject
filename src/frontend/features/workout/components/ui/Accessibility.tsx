import React, { useEffect, useRef, useState } from "react"

// 스크린 리더 전용 텍스트
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  id?: string
}

export function ScreenReaderOnly({ children, id }: ScreenReaderOnlyProps) {
  return (
    <span id={id} className="sr-only" aria-hidden="false">
      {children}
    </span>
  )
}

// 라이브 리전 (스크린 리더 알림용)
interface LiveRegionProps {
  children: React.ReactNode
  role?: "status" | "alert" | "log" | "timer"
  "aria-live"?: "polite" | "assertive" | "off"
  className?: string
}

export function LiveRegion({
  children,
  role = "status",
  "aria-live": ariaLive = "polite",
  className = "",
}: LiveRegionProps) {
  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`live-region ${className}`}
      aria-atomic="true"
    >
      {children}
    </div>
  )
}

// 포커스 트랩 컴포넌트
interface FocusTrapProps {
  children: React.ReactNode
  enabled?: boolean
  onEscape?: () => void
  className?: string
}

export function FocusTrap({
  children,
  enabled = true,
  onEscape,
  className = "",
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleKeyDown = (event: KeyboardEvent) => {
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
      } else if (event.key === "Escape" && onEscape) {
        onEscape()
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    firstElement.focus()

    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [enabled, onEscape])

  return (
    <div ref={containerRef} className={`focus-trap ${className}`}>
      {children}
    </div>
  )
}

// 스킵 링크
interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className = "" }: SkipLinkProps) {
  return (
    <a href={href} className={`skip-link ${className}`} tabIndex={0}>
      {children}
    </a>
  )
}

// 접근 가능한 버튼
interface AccessibleButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-expanded"?: boolean
  "aria-pressed"?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
}

export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  "aria-expanded": ariaExpanded,
  "aria-pressed": ariaPressed,
  className = "",
  type = "button",
}: AccessibleButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      className={`accessible-button ${className}`}
    >
      {children}
    </button>
  )
}

// 접근 가능한 모달
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  "aria-describedby"?: string
  className?: string
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  "aria-describedby": ariaDescribedby,
  className = "",
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = "hidden"
    } else {
      setIsVisible(false)
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`accessible-modal-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={ariaDescribedby}
    >
      <FocusTrap onEscape={onClose}>
        <div ref={modalRef} className="accessible-modal-content">
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
            <AccessibleButton
              onClick={onClose}
              aria-label="모달 닫기"
              className="modal-close"
            >
              ×
            </AccessibleButton>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </FocusTrap>
    </div>
  )
}

// 접근 가능한 탭 패널
interface TabProps {
  id: string
  label: string
  children: React.ReactNode
  disabled?: boolean
}

interface AccessibleTabsProps {
  tabs: TabProps[]
  defaultActiveTab?: string
  className?: string
}

export function AccessibleTabs({
  tabs,
  defaultActiveTab,
  className = "",
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id)
  const tabListRef = useRef<HTMLDivElement>(null)

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    const tabElements = tabListRef.current?.querySelectorAll('[role="tab"]')
    if (!tabElements) return

    const currentIndex = Array.from(tabElements).findIndex(
      tab => tab.getAttribute("aria-controls") === tabId
    )

    let nextIndex = currentIndex

    switch (event.key) {
      case "ArrowLeft":
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabElements.length - 1
        break
      case "ArrowRight":
        nextIndex = currentIndex < tabElements.length - 1 ? currentIndex + 1 : 0
        break
      case "Home":
        nextIndex = 0
        break
      case "End":
        nextIndex = tabElements.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    const nextTab = tabElements[nextIndex] as HTMLElement
    const nextTabId = nextTab.getAttribute("aria-controls")
    if (nextTabId) {
      setActiveTab(nextTabId)
      nextTab.focus()
    }
  }

  return (
    <div className={`accessible-tabs ${className}`}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="탭 목록"
        className="tab-list"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            onKeyDown={e => !tab.disabled && handleKeyDown(e, tab.id)}
            disabled={tab.disabled}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          className={`tab-panel ${activeTab === tab.id ? "active" : ""}`}
          hidden={activeTab !== tab.id}
        >
          {tab.children}
        </div>
      ))}
    </div>
  )
}

// 접근 가능한 아코디언
interface AccordionItemProps {
  id: string
  header: string
  children: React.ReactNode
  disabled?: boolean
}

interface AccessibleAccordionProps {
  items: AccordionItemProps[]
  allowMultiple?: boolean
  className?: string
}

export function AccessibleAccordion({
  items,
  allowMultiple = false,
  className = "",
}: AccessibleAccordionProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const handleToggle = (itemId: string) => {
    setExpandedItems(prev => {
      if (allowMultiple) {
        return prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      } else {
        return prev.includes(itemId) ? [] : [itemId]
      }
    })
  }

  return (
    <div className={`accessible-accordion ${className}`}>
      {items.map(item => {
        const isExpanded = expandedItems.includes(item.id)

        return (
          <div key={item.id} className="accordion-item">
            <button
              className={`accordion-header ${isExpanded ? "expanded" : ""}`}
              aria-expanded={isExpanded}
              aria-controls={`panel-${item.id}`}
              aria-disabled={item.disabled}
              onClick={() => !item.disabled && handleToggle(item.id)}
              disabled={item.disabled}
            >
              <span className="accordion-title">{item.header}</span>
              <span className="accordion-icon" aria-hidden="true">
                {isExpanded ? "−" : "+"}
              </span>
            </button>
            <div
              id={`panel-${item.id}`}
              className={`accordion-panel ${isExpanded ? "expanded" : ""}`}
              aria-labelledby={`header-${item.id}`}
              hidden={!isExpanded}
            >
              <div className="accordion-content">{item.children}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 접근 가능한 툴팁
interface AccessibleTooltipProps {
  content: string
  children: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function AccessibleTooltip({
  content,
  children,
  position = "top",
  className = "",
}: AccessibleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={triggerRef}
      className={`accessible-tooltip ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`tooltip-content tooltip-${position}`}
          aria-hidden="true"
        >
          {content}
        </div>
      )}
    </div>
  )
}

// 접근 가능한 로딩 스피너
interface AccessibleSpinnerProps {
  size?: "small" | "medium" | "large"
  label?: string
  className?: string
}

export function AccessibleSpinner({
  size = "medium",
  label = "로딩 중",
  className = "",
}: AccessibleSpinnerProps) {
  return (
    <div
      className={`accessible-spinner spinner-${size} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="spinner" aria-hidden="true"></div>
      <span className="sr-only">{label}</span>
    </div>
  )
}

// 접근 가능한 프로그레스 바
interface AccessibleProgressBarProps {
  value: number
  max: number
  label?: string
  showValue?: boolean
  className?: string
}

export function AccessibleProgressBar({
  value,
  max,
  label,
  showValue = true,
  className = "",
}: AccessibleProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`accessible-progress ${className}`}>
      {label && (
        <div className="progress-label" id="progress-label">
          {label}
        </div>
      )}
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? "progress-label" : undefined}
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        ></div>
      </div>
      {showValue && (
        <div className="progress-value" aria-hidden="true">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}
