// ============================================================================
// Admin Feature Public API
// ============================================================================

// Components
export { AdminLayout } from "./components/AdminLayout"

// Hooks
export { useAdmin } from "./hooks/useAdmin"

// Services
export { AdminApiService } from "./services/adminApi"

// Types
export type {
  AdminRole,
  AdminMenuItem,
  SystemStats,
  PerformanceMetrics,
  AdminDashboardData,
  AdminSettings,
  AdminActivity,
  SystemHealth,
  SystemIssue,
  DatabaseUpdateInfo,
  AdminApiResponse,
} from "./types"

// Utils
export {
  isAdmin,
  isModeratorOrHigher,
  hasRoleOrHigher,
  filterAdminMenuItems,
  evaluateSystemHealth,
  evaluatePerformance,
  formatUptime,
  formatBytes,
  formatPercentage,
  getStatusColor,
  getPerformanceColor,
  logAdminAction,
  validateAdminAccess,
  getDefaultAdminSettings,
  validateSystemStats,
  validatePerformanceMetrics,
} from "./utils/adminUtils"
