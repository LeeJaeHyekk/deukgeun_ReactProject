// ============================================================================
// Transformer 통합 인덱스 파일
// 모든 Transformer를 중앙에서 관리
// ============================================================================

// Machine Transformer
export { MachineTransformer } from "../domains/machine/transformers/machine.transformer"

// User Transformer
export { UserTransformer } from "../domains/auth/transformers/user.transformer"

// Post Transformer
export { PostTransformer } from "../domains/community/transformers/post.transformer"

// Comment Transformer
export { CommentTransformer } from "../domains/community/transformers/comment.transformer"

// Gym Transformer
export { GymTransformer } from "../domains/gym/transformers/gym.transformer"

// WorkoutSession Transformer
export { WorkoutSessionTransformer } from "../domains/workout/transformers/workoutsession.transformer"

// ExerciseSet Transformer
export { ExerciseSetTransformer } from "../domains/workout/transformers/exerciseset.transformer"

// ExpHistory Transformer
export { ExpHistoryTransformer } from "../domains/level/transformers/exphistory.transformer"

// UserLevel Transformer
export { UserLevelTransformer } from "../domains/level/transformers/userlevel.transformer"

// Like Transformer
export { LikeTransformer } from "../domains/community/transformers/like.transformer"

// ============================================================================
// 통합된 Transformer 함수들 (편의성을 위해)
// ============================================================================

import { MachineTransformer } from "../domains/machine/transformers/machine.transformer"
import { UserTransformer } from "../domains/auth/transformers/user.transformer"
import { PostTransformer } from "../domains/community/transformers/post.transformer"
import { CommentTransformer } from "../domains/community/transformers/comment.transformer"
import { GymTransformer } from "../domains/gym/transformers/gym.transformer"
import { WorkoutSessionTransformer } from "../domains/workout/transformers/workoutsession.transformer"
import { ExerciseSetTransformer } from "../domains/workout/transformers/exerciseset.transformer"
import { ExpHistoryTransformer } from "../domains/level/transformers/exphistory.transformer"
import { UserLevelTransformer } from "../domains/level/transformers/userlevel.transformer"
import { LikeTransformer } from "../domains/community/transformers/like.transformer"

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
