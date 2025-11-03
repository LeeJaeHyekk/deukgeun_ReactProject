// ============================================================================
// Transformer 통합 인덱스 파일
// 모든 Transformer를 중앙에서 관리
// ============================================================================

// Machine Transformer
export { MachineTransformer } from "./machineTransformer"

// User Transformer
export { UserTransformer } from "./userTransformer"

// Post Transformer
export { PostTransformer } from "./postTransformer"

// Comment Transformer
export { CommentTransformer } from "./commentTransformer"

// Gym Transformer
export { GymTransformer } from "./gymTransformer"

// WorkoutSession Transformer
export { WorkoutSessionTransformer } from "./workoutsessionTransformer"

// ExerciseSet Transformer
export { ExerciseSetTransformer } from "./exercisesetTransformer"

// ExpHistory Transformer
export { ExpHistoryTransformer } from "./exphistoryTransformer"

// UserLevel Transformer
export { UserLevelTransformer } from "./userlevelTransformer"

// Like Transformer
export { LikeTransformer } from "./likeTransformer"

// ============================================================================
// 통합된 Transformer 함수들 (편의성을 위해)
// ============================================================================

import { MachineTransformer } from "@backend/transformers/machineTransformer"
import { UserTransformer } from "@backend/transformers/userTransformer"
import { PostTransformer } from "@backend/transformers/postTransformer"
import { CommentTransformer } from "@backend/transformers/commentTransformer"
import { GymTransformer } from "@backend/transformers/gymTransformer"
import { WorkoutSessionTransformer } from "@backend/transformers/workoutsessionTransformer"
import { ExerciseSetTransformer } from "@backend/transformers/exercisesetTransformer"
import { ExpHistoryTransformer } from "@backend/transformers/exphistoryTransformer"
import { UserLevelTransformer } from "@backend/transformers/userlevelTransformer"
import { LikeTransformer } from "@backend/transformers/likeTransformer"

// Machine 변환 함수들
export const toMachineDTO = MachineTransformer.toDTO
export const toMachineEntity = MachineTransformer.toEntity
export const toMachineDTOList = MachineTransformer.toDTOList

// User 변환 함수들
export const toUserDTO = UserTransformer.toDTO
export const toUserEntity = UserTransformer.toEntity
export const toUserDTOList = UserTransformer.toDTOList

// Post 변환 함수들
export const toPostDTO = PostTransformer.toDTO
export const toPostEntity = PostTransformer.toEntity
export const toPostDTOList = PostTransformer.toDTOList

// Comment 변환 함수들
export const toCommentDTO = CommentTransformer.toDTO
export const toCommentEntity = CommentTransformer.toEntity
export const toCommentDTOList = CommentTransformer.toDTOList

// Gym 변환 함수들
export const toGymDTO = GymTransformer.toDTO
export const toGymEntity = GymTransformer.toEntity
export const toGymDTOList = GymTransformer.toDTOList

// WorkoutSession 변환 함수들
export const toWorkoutSessionDTO = WorkoutSessionTransformer.toDTO
export const toWorkoutSessionEntity = WorkoutSessionTransformer.toEntity
export const toWorkoutSessionDTOList = WorkoutSessionTransformer.toDTOList

// ExerciseSet 변환 함수들
export const toExerciseSetDTO = ExerciseSetTransformer.toDTO
export const toExerciseSetEntity = ExerciseSetTransformer.toEntity
export const toExerciseSetDTOList = ExerciseSetTransformer.toDTOList

// ExpHistory 변환 함수들
export const toExpHistoryDTO = ExpHistoryTransformer.toDTO
export const toExpHistoryEntity = ExpHistoryTransformer.toEntity
export const toExpHistoryDTOList = ExpHistoryTransformer.toDTOList

// UserLevel 변환 함수들
export const toUserLevelDTO = UserLevelTransformer.toDTO
export const toUserLevelEntity = UserLevelTransformer.toEntity
export const toUserLevelDTOList = UserLevelTransformer.toDTOList

// Like 변환 함수들
export const toLikeDTO = LikeTransformer.toDTO
export const toLikeEntity = LikeTransformer.toEntity
export const toLikeDTOList = LikeTransformer.toDTOList

export * from "./nullableDate"
export * from "./bigintNumber"
