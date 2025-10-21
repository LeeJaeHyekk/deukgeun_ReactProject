import {
  MapPin,
  Dumbbell,
  Users,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Star,
  Award,
  MessageCircle,
  Trophy,
} from 'lucide-react'

// 기본 통계값
export const DEFAULT_STATS = {
  activeUsers: 150,
  totalGyms: 45,
  totalPosts: 320,
  achievements: 25,
} as const

// 안전장치 상수
export const SAFETY_LIMITS = {
  MAX_STATS_VALUE: 999999,
  MIN_STATS_VALUE: 0,
  MAX_RETRY_ATTEMPTS: 3,
  TIMEOUT_DURATION: 10000, // 10초
} as const

// 에러 메시지 상수
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  DATA_LOAD_ERROR: '데이터를 불러오는 중 오류가 발생했습니다.',
  VIDEO_LOAD_ERROR: '비디오를 불러올 수 없습니다.',
  GENERIC_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
} as const

// 아이콘 매핑 상수
export const ICON_MAP = {
  MapPin,
  Dumbbell,
  Users,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Star,
  Award,
  MessageCircle,
  Trophy,
} as const

// 네비게이션 경로 상수
export const NAVIGATION_PATHS = {
  LOGIN: '/login',
  LOCATION: '/location',
  MACHINE_GUIDE: '/machine-guide',
  MYPAGE: '/mypage',
  REGISTER: '/register',
} as const
