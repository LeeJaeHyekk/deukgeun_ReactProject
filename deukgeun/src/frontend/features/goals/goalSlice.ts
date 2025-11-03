// ============================================================================
// Goal Redux Slice - 목표 관리
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { WorkoutGoal } from '../../shared/types/goal'
import { goalApi } from '../../shared/api/goalApi'

// ============================================================================
// State Interface
// ============================================================================

interface GoalsState {
  list: WorkoutGoal[]
  selected: WorkoutGoal | null
  loading: boolean
  error: string | null
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: GoalsState = {
  list: [],
  selected: null,
  loading: false,
  error: null
}

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * 사용자의 모든 목표 조회
 */
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (userId: number | string, { rejectWithValue }) => {
    try {
      return await goalApi.fetchGoals(userId)
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

/**
 * 특정 목표 조회
 */
export const fetchGoal = createAsyncThunk(
  'goals/fetchGoal',
  async (goalId: number | string, { rejectWithValue }) => {
    try {
      return await goalApi.fetchGoal(goalId)
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

/**
 * 새 목표 생성
 */
export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (payload: Partial<WorkoutGoal>, { rejectWithValue }) => {
    try {
      return await goalApi.createGoal(payload)
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

/**
 * 목표 수정
 */
export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async (
    { goalId, payload }: { goalId: number | string; payload: Partial<WorkoutGoal> },
    { rejectWithValue }
  ) => {
    try {
      return await goalApi.updateGoal(goalId, payload)
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

/**
 * 목표 삭제
 */
export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (goalId: number | string, { rejectWithValue }) => {
    try {
      await goalApi.deleteGoal(goalId)
      return goalId
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

// ============================================================================
// Slice
// ============================================================================

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    /**
     * 목표 선택
     */
    selectGoal(state, action: PayloadAction<WorkoutGoal | null>) {
      state.selected = action.payload
    },

    /**
     * 에러 초기화
     */
    clearGoalsError(state) {
      state.error = null
    },

    /**
     * 로컬 목표 추가 (낙관적 업데이트용)
     */
    addGoalLocal(state, action: PayloadAction<WorkoutGoal>) {
      state.list.unshift(action.payload)
    },

    /**
     * 로컬 목표 업데이트 (낙관적 업데이트용)
     */
    updateGoalLocal(
      state,
      action: PayloadAction<{ goalId: number | string; payload: Partial<WorkoutGoal> }>
    ) {
      const idx = state.list.findIndex(
        g => String(g.goalId) === String(action.payload.goalId)
      )
      if (idx >= 0) {
        state.list[idx] = { ...state.list[idx], ...action.payload.payload }
      }
      if (state.selected && String(state.selected.goalId) === String(action.payload.goalId)) {
        state.selected = { ...state.selected, ...action.payload.payload }
      }
    },

    /**
     * 로컬 목표 삭제 (낙관적 업데이트용)
     */
    deleteGoalLocal(state, action: PayloadAction<number | string>) {
      state.list = state.list.filter(g => String(g.goalId) !== String(action.payload))
      if (state.selected && String(state.selected.goalId) === String(action.payload)) {
        state.selected = null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchGoals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action: PayloadAction<WorkoutGoal[]>) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload || action.error?.message || '목표 조회 실패')
      })

      // fetchGoal
      .addCase(fetchGoal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGoal.fulfilled, (state, action: PayloadAction<WorkoutGoal>) => {
        state.loading = false
        state.selected = action.payload
        // 목록에도 업데이트
        const idx = state.list.findIndex(
          g => String(g.goalId) === String(action.payload.goalId)
        )
        if (idx >= 0) {
          state.list[idx] = action.payload
        } else {
          state.list.unshift(action.payload)
        }
      })
      .addCase(fetchGoal.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload || action.error?.message || '목표 조회 실패')
      })

      // createGoal
      .addCase(createGoal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createGoal.fulfilled, (state, action: PayloadAction<WorkoutGoal>) => {
        state.loading = false
        state.list.unshift(action.payload)
        state.selected = action.payload
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload || action.error?.message || '목표 생성 실패')
      })

      // updateGoal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGoal.fulfilled, (state, action: PayloadAction<WorkoutGoal>) => {
        state.loading = false
        const idx = state.list.findIndex(
          g => String(g.goalId) === String(action.payload.goalId)
        )
        if (idx >= 0) {
          state.list[idx] = action.payload
        }
        if (state.selected && String(state.selected.goalId) === String(action.payload.goalId)) {
          state.selected = action.payload
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload || action.error?.message || '목표 수정 실패')
      })

      // deleteGoal
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteGoal.fulfilled, (state, action: PayloadAction<number | string>) => {
        state.loading = false
        state.list = state.list.filter(g => String(g.goalId) !== String(action.payload))
        if (state.selected && String(state.selected.goalId) === String(action.payload)) {
          state.selected = null
        }
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload || action.error?.message || '목표 삭제 실패')
      })
  }
})

// ============================================================================
// Exports
// ============================================================================

export const {
  selectGoal,
  clearGoalsError,
  addGoalLocal,
  updateGoalLocal,
  deleteGoalLocal
} = goalSlice.actions

export default goalSlice.reducer

