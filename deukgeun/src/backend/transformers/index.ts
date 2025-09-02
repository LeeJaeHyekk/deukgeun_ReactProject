// ============================================================================
// Transformer 통합 인덱스 파일
// 모든 Transformer를 중앙에서 관리
// ============================================================================

// Machine Transformer
export { MachineTransformer } from "./machine.transformer.js"

// User Transformer
export { UserTransformer } from "./user.transformer.js"

// Post Transformer
export { PostTransformer } from "./post.transformer.js"

// Comment Transformer
export { CommentTransformer } from "./comment.transformer.js"

// Gym Transformer
export { GymTransformer } from "./gym.transformer.js"

// WorkoutSession Transformer
export { WorkoutSessionTransformer } from "./workoutsession.transformer.js"

// ExerciseSet Transformer
export { ExerciseSetTransformer } from "./exerciseset.transformer.js"

// ExpHistory Transformer
export { ExpHistoryTransformer } from "./exphistory.transformer.js"

// UserLevel Transformer
export { UserLevelTransformer } from "./userlevel.transformer.js"

// Like Transformer
export { LikeTransformer } from "./like.transformer.js"

// ============================================================================
// 통합된 Transformer 함수들 (편의성을 위해)
// ============================================================================

import { MachineTransformer } from "./machine.transformer.js"
import { UserTransformer } from "./user.transformer.js"
import { PostTransformer } from "./post.transformer.js"
import { CommentTransformer } from "./comment.transformer.js"
import { GymTransformer } from "./gym.transformer.js"
import { WorkoutSessionTransformer } from "./workoutsession.transformer.js"
import { ExerciseSetTransformer } from "./exerciseset.transformer.js"
import { ExpHistoryTransformer } from "./exphistory.transformer.js"
import { UserLevelTransformer } from "./userlevel.transformer.js"
import { LikeTransformer } from "./like.transformer.js"

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

export * from "./nullableDate.js"
export * from "./bigintNumber.js"
