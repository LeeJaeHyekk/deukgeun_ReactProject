// ============================================================================
// Machine Guide Feature Exports
// ============================================================================

// Components
export { default as MachineGuidePage } from "./MachineGuidePage"
export { MachineFilter } from "./components/MachineFilter"
export { MachineCard } from "./components/MachineCard"
export { MachineModal } from "./components/MachineModal"
export { PerformanceMonitor } from "./components/PerformanceMonitor"

// Hooks
export { useMachines } from "./hooks/useMachines"

// Services
export { MachineApiService } from "./services/machineApi"

// Types
export type {
  Machine,
  MachineCategory,
  DifficultyLevel,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineListResponse,
  MachineResponse,
  MachineFilterQuery,
} from "./types"

// Utils
export { findMatchingImage } from "./utils/machineImageUtils"

// Constants
export {
  MACHINE_CATEGORIES,
  DIFFICULTY_LEVELS,
  TARGET_MUSCLES,
} from "./types"
