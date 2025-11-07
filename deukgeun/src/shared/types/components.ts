// ============================================================================
// 공통 컴포넌트 Props 타입 정의
// ============================================================================

import type { ReactNode } from 'react'

// 기본 컴포넌트 Props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  'data-testid'?: string
}

// 로딩 상태 Props
export interface LoadingProps {
  isLoading: boolean
  loadingText?: string
}

// 에러 상태 Props
export interface ErrorProps {
  error: string | null
  onRetry?: () => void
}

// 모달 Props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// 폼 Props
export interface FormProps<T = Record<string, unknown>> extends BaseComponentProps {
  onSubmit: (data: T) => void
  onCancel?: () => void
  isSubmitting?: boolean
  errors?: Record<string, string>
}

// 탭 Props
export interface TabProps extends BaseComponentProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Array<{
    id: string
    label: string
    icon?: ReactNode
    disabled?: boolean
  }>
}

// 리스트 Props
export interface ListProps<T> extends BaseComponentProps {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  emptyMessage?: string
  loading?: boolean
}

// 카드 Props
export interface CardProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
}

// 버튼 Props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

// 입력 필드 Props
export interface InputProps extends BaseComponentProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
}

// 선택 Props
export interface SelectProps extends BaseComponentProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  error?: string
  disabled?: boolean
  required?: boolean
}

// 체크박스 Props
export interface CheckboxProps extends BaseComponentProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  required?: boolean
}

// 라디오 Props
export interface RadioProps extends BaseComponentProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  error?: string
  disabled?: boolean
  required?: boolean
}

// 텍스트 영역 Props
export interface TextareaProps extends BaseComponentProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxLength?: number
}

// 날짜 선택 Props
export interface DatePickerProps extends BaseComponentProps {
  label?: string
  value: Date | null
  onChange: (date: Date | null) => void
  error?: string
  disabled?: boolean
  required?: boolean
  minDate?: Date
  maxDate?: Date
}

// 파일 업로드 Props
export interface FileUploadProps extends BaseComponentProps {
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // bytes
  onFileSelect: (files: File[]) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

// 진행률 표시 Props
export interface ProgressProps extends BaseComponentProps {
  value: number // 0-100
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

// 알림 Props
export interface AlertProps extends BaseComponentProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  onClose?: () => void
  closable?: boolean
}

// 툴팁 Props
export interface TooltipProps extends BaseComponentProps {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  disabled?: boolean
}

// 드롭다운 Props
export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode
  items: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    icon?: ReactNode
  }>
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  disabled?: boolean
}

// 페이지네이션 Props
export interface PaginationProps extends BaseComponentProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
}

// 검색 Props
export interface SearchProps extends BaseComponentProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSearch?: (value: string) => void
  onClear?: () => void
  loading?: boolean
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
}

// 필터 Props
export interface FilterProps extends BaseComponentProps {
  filters: Record<string, any>
  onFilterChange: (filters: Record<string, any>) => void
  onReset?: () => void
  availableFilters: Array<{
    key: string
    label: string
    type: 'select' | 'checkbox' | 'date' | 'range'
    options?: Array<{ value: string | number; label: string }>
  }>
}

// 정렬 Props
export interface SortProps extends BaseComponentProps {
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  availableSorts: Array<{
    key: string
    label: string
  }>
}

// 테이블 Props
export interface TableProps<T> extends BaseComponentProps {
  columns: Array<{
    key: string
    label: string
    sortable?: boolean
    render?: (value: unknown, item: T) => ReactNode
    width?: string
  }>
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  selectable?: boolean
  selectedItems?: T[]
  onSelectionChange?: (items: T[]) => void
}

// 차트 Props
export interface ChartProps<T = Record<string, unknown>> extends BaseComponentProps {
  data: T[]
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  width?: number
  height?: number
  options?: Record<string, unknown>
  loading?: boolean
}

// 지도 Props
export interface MapProps extends BaseComponentProps {
  center: {
    lat: number
    lng: number
  }
  zoom?: number
  markers?: Array<{
    lat: number
    lng: number
    title?: string
    onClick?: () => void
  }>
  onMapClick?: (lat: number, lng: number) => void
  loading?: boolean
}

// 캘린더 Props
export interface CalendarProps extends BaseComponentProps {
  value: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  events?: Array<{
    date: Date
    title: string
    color?: string
  }>
  locale?: string
}

// 타이머 Props
export interface TimerProps extends BaseComponentProps {
  initialTime?: number // 초 단위
  onTimeUpdate?: (time: number) => void
  onTimerComplete?: () => void
  autoStart?: boolean
  format?: 'mm:ss' | 'hh:mm:ss' | 'ss'
}

// 아바타 Props
export interface AvatarProps extends BaseComponentProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  fallback?: string
}

// 배지 Props
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

// 스켈레톤 Props
export interface SkeletonProps extends BaseComponentProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular'
  animation?: 'pulse' | 'wave' | 'none'
}

// 스피너 Props
export interface SpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  text?: string
}

// 토글 Props
export interface ToggleProps extends BaseComponentProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

// 슬라이더 Props
export interface SliderProps extends BaseComponentProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  marks?: Array<{
    value: number
    label: string
  }>
  range?: boolean
  valueLabelDisplay?: 'auto' | 'on' | 'off'
}

// 레이팅 Props
export interface RatingProps extends BaseComponentProps {
  value: number
  onChange: (value: number) => void
  max?: number
  disabled?: boolean
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  allowHalf?: boolean
}

// 스텝 Props
export interface StepProps extends BaseComponentProps {
  current: number
  steps: Array<{
    title: string
    description?: string
    icon?: ReactNode
  }>
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'dots' | 'numbers'
}

// 탭 패널 Props
export interface TabPanelProps extends BaseComponentProps {
  value: string
  index: string
  children: ReactNode
}

// 액코디언 Props
export interface AccordionProps extends BaseComponentProps {
  items: Array<{
    title: string
    content: ReactNode
    expanded?: boolean
  }>
  allowMultiple?: boolean
  onToggle?: (index: number) => void
}

// 캐러셀 Props
export interface CarouselProps extends BaseComponentProps {
  items: ReactNode[]
  autoplay?: boolean
  autoplayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  infinite?: boolean
  onSlideChange?: (index: number) => void
}

// 그리드 Props
export interface GridProps extends BaseComponentProps {
  columns?: number
  gap?: string | number
  responsive?: boolean
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

// 플렉스 Props
export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: string | number
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

// 스택 Props
export interface StackProps extends BaseComponentProps {
  direction?: 'row' | 'column'
  spacing?: string | number
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

// 박스 Props
export interface BoxProps extends BaseComponentProps {
  padding?: string | number
  margin?: string | number
  width?: string | number
  height?: string | number
  backgroundColor?: string
  border?: string
  borderRadius?: string | number
  boxShadow?: string
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
  zIndex?: number
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
}

// 컨테이너 Props
export interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | false
  fluid?: boolean
  padding?: string | number
}

// 섹션 Props
export interface SectionProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  variant?: 'default' | 'outlined' | 'filled'
}

// 헤더 Props
export interface HeaderProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  variant?: 'default' | 'transparent' | 'fixed'
  sticky?: boolean
}

// 푸터 Props
export interface FooterProps extends BaseComponentProps {
  variant?: 'default' | 'minimal' | 'full'
  links?: Array<{
    label: string
    href: string
    external?: boolean
  }>
  social?: Array<{
    name: string
    href: string
    icon: ReactNode
  }>
}

// 사이드바 Props
export interface SidebarProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  variant?: 'overlay' | 'push' | 'static'
  width?: string | number
  position?: 'left' | 'right'
}

// 네비게이션 Props
export interface NavigationProps extends BaseComponentProps {
  items: Array<{
    label: string
    href?: string
    icon?: ReactNode
    active?: boolean
    disabled?: boolean
    onClick?: () => void
    children?: Array<{
      label: string
      href: string
      icon?: ReactNode
    }>
  }>
  variant?: 'horizontal' | 'vertical'
  orientation?: 'left' | 'center' | 'right'
}

// 브레드크럼 Props
export interface BreadcrumbProps extends BaseComponentProps {
  items: Array<{
    label: string
    href?: string
    active?: boolean
  }>
  separator?: ReactNode
  maxItems?: number
}

// 메뉴 Props
export interface MenuProps extends BaseComponentProps {
  items: Array<{
    label: string
    href?: string
    icon?: ReactNode
    active?: boolean
    disabled?: boolean
    onClick?: () => void
    badge?: string | number
    children?: Array<{
      label: string
      href: string
      icon?: ReactNode
    }>
  }>
  variant?: 'default' | 'minimal' | 'pills'
  orientation?: 'horizontal' | 'vertical'
}

// 사이드바 메뉴 Props
export interface SidebarMenuProps extends BaseComponentProps {
  items: Array<{
    label: string
    href?: string
    icon?: ReactNode
    active?: boolean
    disabled?: boolean
    onClick?: () => void
    badge?: string | number
    children?: Array<{
      label: string
      href: string
      icon?: ReactNode
    }>
  }>
  collapsed?: boolean
  onToggle?: () => void
}

// 컨텍스트 메뉴 Props
export interface ContextMenuProps extends BaseComponentProps {
  items: Array<{
    label: string
    icon?: ReactNode
    onClick: () => void
    disabled?: boolean
    separator?: boolean
  }>
  trigger: ReactNode
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
}

// 팝오버 Props
export interface PopoverProps extends BaseComponentProps {
  content: ReactNode
  trigger: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  triggerType?: 'hover' | 'click' | 'focus'
  disabled?: boolean
}

// 모달 다이얼로그 Props
export interface ModalDialogProps extends Omit<ModalProps, 'size'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  maskClosable?: boolean
  destroyOnClose?: boolean
  centered?: boolean
}

// 드로어 Props
export interface DrawerProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  placement?: 'top' | 'bottom' | 'left' | 'right'
  size?: string | number
  closable?: boolean
  maskClosable?: boolean
  destroyOnClose?: boolean
}

// 백드롭 Props
export interface BackdropProps extends BaseComponentProps {
  open: boolean
  onClick?: () => void
  invisible?: boolean
}

// 포털 Props
export interface PortalProps extends BaseComponentProps {
  container?: HTMLElement
  disablePortal?: boolean
}

// 트랜지션 Props
export interface TransitionProps extends BaseComponentProps {
  in: boolean
  timeout?: number
  appear?: boolean
  unmountOnExit?: boolean
  mountOnEnter?: boolean
}

// 애니메이션 Props
export interface AnimationProps extends BaseComponentProps {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'shake' | 'pulse'
  duration?: number
  delay?: number
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  iterationCount?: number | 'infinite'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

// 스크롤 Props
export interface ScrollProps extends BaseComponentProps {
  direction?: 'horizontal' | 'vertical' | 'both'
  behavior?: 'auto' | 'smooth'
  snap?: boolean
  snapAlign?: 'start' | 'center' | 'end'
  snapStop?: boolean
}

// 가상화 Props
export interface VirtualizationProps extends BaseComponentProps {
  itemCount: number
  itemSize: number
  renderItem: (index: number) => ReactNode
  overscan?: number
  direction?: 'horizontal' | 'vertical'
}

// 무한 스크롤 Props
export interface InfiniteScrollProps extends BaseComponentProps {
  hasMore: boolean
  loadMore: () => void
  threshold?: number
  loader?: ReactNode
  endMessage?: ReactNode
}

// 지연 로딩 Props
export interface LazyLoadProps extends BaseComponentProps {
  threshold?: number
  rootMargin?: string
  placeholder?: ReactNode
  fallback?: ReactNode
}

// 인터섹션 옵저버 Props
export interface IntersectionObserverProps extends BaseComponentProps {
  threshold?: number | number[]
  rootMargin?: string
  root?: Element | null
  onIntersect?: (entry: IntersectionObserverEntry) => void
  onEnter?: (entry: IntersectionObserverEntry) => void
  onLeave?: (entry: IntersectionObserverEntry) => void
}

// 리사이즈 옵저버 Props
export interface ResizeObserverProps extends BaseComponentProps {
  onResize?: (entry: ResizeObserverEntry) => void
  onResizeStart?: (entry: ResizeObserverEntry) => void
  onResizeEnd?: (entry: ResizeObserverEntry) => void
}

// 뷰포트 Props
export interface ViewportProps extends BaseComponentProps {
  width?: number
  height?: number
  onViewportChange?: (viewport: { width: number; height: number }) => void
}

// 미디어 쿼리 Props
export interface MediaQueryProps extends Omit<BaseComponentProps, 'children'> {
  query: string
  children: (matches: boolean) => ReactNode
}

// 브레이크포인트 Props
export interface BreakpointProps extends Omit<BaseComponentProps, 'children'> {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  children: (matches: boolean) => ReactNode
}

// 반응형 Props
export interface ResponsiveProps<T = Record<string, unknown>> extends Omit<BaseComponentProps, 'children'> {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  xxl?: T
  children: (props: T) => ReactNode
}

// 테마 Props
export interface ThemeProps extends BaseComponentProps {
  theme: 'light' | 'dark' | 'auto'
  onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void
}

// 로케일 Props
export interface LocaleProps extends BaseComponentProps {
  locale: string
  onLocaleChange?: (locale: string) => void
}

// 접근성 Props
export interface AccessibilityProps extends BaseComponentProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  'aria-selected'?: boolean
  'aria-checked'?: boolean
  'aria-disabled'?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-busy'?: boolean
  'aria-controls'?: string
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  'aria-flowto'?: string
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  'aria-level'?: number
  'aria-multiline'?: boolean
  'aria-multiselectable'?: boolean
  'aria-orientation'?: 'horizontal' | 'vertical'
  'aria-pressed'?: boolean
  'aria-readonly'?: boolean
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all'
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
  'aria-valuemax'?: number
  'aria-valuemin'?: number
  'aria-valuenow'?: number
  'aria-valuetext'?: string
  role?: string
  tabIndex?: number
}

// 키보드 Props
export interface KeyboardProps extends BaseComponentProps {
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  onKeyPress?: (event: KeyboardEvent) => void
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onSpace?: () => void
  onTab?: () => void
  onBackspace?: () => void
  onDelete?: () => void
}

// 마우스 Props
export interface MouseProps extends BaseComponentProps {
  onMouseDown?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onMouseOver?: (event: MouseEvent) => void
  onMouseOut?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
  onDoubleClick?: (event: MouseEvent) => void
  onContextMenu?: (event: MouseEvent) => void
}

// 터치 Props
export interface TouchProps extends BaseComponentProps {
  onTouchStart?: (event: TouchEvent) => void
  onTouchEnd?: (event: TouchEvent) => void
  onTouchMove?: (event: TouchEvent) => void
  onTouchCancel?: (event: TouchEvent) => void
}

// 드래그 Props
export interface DragProps extends BaseComponentProps {
  onDragStart?: (event: DragEvent) => void
  onDragEnd?: (event: DragEvent) => void
  onDragOver?: (event: DragEvent) => void
  onDragEnter?: (event: DragEvent) => void
  onDragLeave?: (event: DragEvent) => void
  onDrop?: (event: DragEvent) => void
  draggable?: boolean
  onDrag?: (event: DragEvent) => void
}

// 포커스 Props
export interface FocusProps extends BaseComponentProps {
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onFocusIn?: (event: FocusEvent) => void
  onFocusOut?: (event: FocusEvent) => void
  autoFocus?: boolean
  tabIndex?: number
}

// 폼 Props
export interface FormFieldProps extends BaseComponentProps {
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  helpText?: string
  hint?: string
}

// 검증 Props
export interface ValidationProps extends BaseComponentProps {
  rules?: Array<{
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: unknown) => boolean | string
  }>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnSubmit?: boolean
}

// 상태 Props
export interface StateProps extends BaseComponentProps {
  state?: 'default' | 'loading' | 'success' | 'error' | 'warning' | 'info'
  message?: string
  onStateChange?: (state: string) => void
}

// 생명주기 Props
export interface LifecycleProps extends BaseComponentProps {
  onMount?: () => void
  onUnmount?: () => void
  onUpdate?: () => void
  onError?: (error: Error) => void
}

// 성능 Props
export interface PerformanceProps extends BaseComponentProps {
  lazy?: boolean
  memo?: boolean
  pure?: boolean
  onRender?: (renderTime: number) => void
  onReRender?: (reason: string) => void
}

// 디버깅 Props
export interface DebugProps extends BaseComponentProps {
  debug?: boolean
  logLevel?: 'error' | 'warn' | 'info' | 'debug'
  onLog?: (level: string, message: string, data?: unknown) => void
}

// 테스트 Props
export interface TestProps extends BaseComponentProps {
  'data-testid'?: string
  'data-test-class'?: string
  'data-test-state'?: string
  'data-test-value'?: string
}

// 개발자 도구 Props
export interface DevToolsProps extends BaseComponentProps {
  devMode?: boolean
  showProps?: boolean
  showState?: boolean
  showPerformance?: boolean
  onDevToolsToggle?: (enabled: boolean) => void
}

// 모든 Props를 결합한 유니온 타입
export type AllComponentProps = 
  | BaseComponentProps
  | LoadingProps
  | ErrorProps
  | ModalProps
  | FormProps
  | TabProps
  | ListProps<any>
  | CardProps
  | ButtonProps
  | InputProps
  | SelectProps
  | CheckboxProps
  | RadioProps
  | TextareaProps
  | DatePickerProps
  | FileUploadProps
  | ProgressProps
  | AlertProps
  | TooltipProps
  | DropdownProps
  | PaginationProps
  | SearchProps
  | FilterProps
  | SortProps
  | TableProps<any>
  | ChartProps
  | MapProps
  | CalendarProps
  | TimerProps
  | AvatarProps
  | BadgeProps
  | SkeletonProps
  | SpinnerProps
  | ToggleProps
  | SliderProps
  | RatingProps
  | StepProps
  | TabPanelProps
  | AccordionProps
  | CarouselProps
  | GridProps
  | FlexProps
  | StackProps
  | BoxProps
  | ContainerProps
  | SectionProps
  | HeaderProps
  | FooterProps
  | SidebarProps
  | NavigationProps
  | BreadcrumbProps
  | MenuProps
  | SidebarMenuProps
  | ContextMenuProps
  | PopoverProps
  | ModalDialogProps
  | DrawerProps
  | BackdropProps
  | PortalProps
  | TransitionProps
  | AnimationProps
  | ScrollProps
  | VirtualizationProps
  | InfiniteScrollProps
  | LazyLoadProps
  | IntersectionObserverProps
  | ResizeObserverProps
  | ViewportProps
  | MediaQueryProps
  | BreakpointProps
  | ResponsiveProps
  | ThemeProps
  | LocaleProps
  | AccessibilityProps
  | KeyboardProps
  | MouseProps
  | TouchProps
  | DragProps
  | FocusProps
  | FormFieldProps
  | ValidationProps
  | StateProps
  | LifecycleProps
  | PerformanceProps
  | DebugProps
  | TestProps
  | DevToolsProps
