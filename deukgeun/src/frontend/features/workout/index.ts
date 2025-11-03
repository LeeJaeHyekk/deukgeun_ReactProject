// ============================================================================
// Workout Feature Main Export
// ============================================================================

// Main Components
export { WorkoutPage } from "./WorkoutPage"

// Store
export { useWorkoutStore } from "./store/workoutStore"

// Hooks
export * from "./hooks"

// Types (주요 타입만 명시적 export, LoadingState는 컴포넌트와 충돌 방지)
export type { Goal, Task, TaskStatus, CompletedWorkout, ActiveWorkout, WorkoutState } from "./slices/workoutSlice"

// Constants
export * from "./constants"

// API
export * from "./api"

// Services (excluding workoutApi to avoid duplicate export)
export { WorkoutSessionService, SectionGenerationService } from "./services"

// Utils
export * from "./utils"

// Data
export * from "./data"

// Contexts
export * from "./contexts"

// Components (명시적 export로 LoadingState 컴포넌트만 export)
export * from "./components"
// LoadingState 컴포넌트는 components/common에서 export됨
