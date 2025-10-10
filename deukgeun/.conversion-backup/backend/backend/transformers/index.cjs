// ============================================================================
// Transformer 통합 인덱스 파일
// 모든 Transformer를 중앙에서 관리
// ============================================================================
// Machine Transformer
module.exports.MachineTransformer = MachineTransformer from "./machine.transformer";
// User Transformer
module.exports.UserTransformer = UserTransformer from "./user.transformer";
// Post Transformer
module.exports.PostTransformer = PostTransformer from "./post.transformer";
// Comment Transformer
module.exports.CommentTransformer = CommentTransformer from "./comment.transformer";
// Gym Transformer
module.exports.GymTransformer = GymTransformer from "./gym.transformer";
// WorkoutSession Transformer
module.exports.WorkoutSessionTransformer = WorkoutSessionTransformer from "./workoutsession.transformer";
// ExerciseSet Transformer
module.exports.ExerciseSetTransformer = ExerciseSetTransformer from "./exerciseset.transformer";
// ExpHistory Transformer
module.exports.ExpHistoryTransformer = ExpHistoryTransformer from "./exphistory.transformer";
// UserLevel Transformer
module.exports.UserLevelTransformer = UserLevelTransformer from "./userlevel.transformer";
// Like Transformer
module.exports.LikeTransformer = LikeTransformer from "./like.transformer";
// ============================================================================
// 통합된 Transformer 함수들 (편의성을 위해)
// ============================================================================
const { MachineTransformer  } = require('./machine.transformer');
const { UserTransformer  } = require('./user.transformer');
const { PostTransformer  } = require('./post.transformer');
const { CommentTransformer  } = require('./comment.transformer');
const { GymTransformer  } = require('./gym.transformer');
const { WorkoutSessionTransformer  } = require('./workoutsession.transformer');
const { ExerciseSetTransformer  } = require('./exerciseset.transformer');
const { ExpHistoryTransformer  } = require('./exphistory.transformer');
const { UserLevelTransformer  } = require('./userlevel.transformer');
const { LikeTransformer  } = require('./like.transformer');
// Machine 변환 함수들
const toMachineDTO
module.exports.toMachineDTO = toMachineDTO = MachineTransformer.toDTO;
const toMachineEntity
module.exports.toMachineEntity = toMachineEntity = MachineTransformer.toEntity;
const toMachineDTOList
module.exports.toMachineDTOList = toMachineDTOList = MachineTransformer.toDTOList;
// User 변환 함수들
const toUserDTO
module.exports.toUserDTO = toUserDTO = UserTransformer.toDTO;
const toUserEntity
module.exports.toUserEntity = toUserEntity = UserTransformer.toEntity;
const toUserDTOList
module.exports.toUserDTOList = toUserDTOList = UserTransformer.toDTOList;
// Post 변환 함수들
const toPostDTO
module.exports.toPostDTO = toPostDTO = PostTransformer.toDTO;
const toPostEntity
module.exports.toPostEntity = toPostEntity = PostTransformer.toEntity;
const toPostDTOList
module.exports.toPostDTOList = toPostDTOList = PostTransformer.toDTOList;
// Comment 변환 함수들
const toCommentDTO
module.exports.toCommentDTO = toCommentDTO = CommentTransformer.toDTO;
const toCommentEntity
module.exports.toCommentEntity = toCommentEntity = CommentTransformer.toEntity;
const toCommentDTOList
module.exports.toCommentDTOList = toCommentDTOList = CommentTransformer.toDTOList;
// Gym 변환 함수들
const toGymDTO
module.exports.toGymDTO = toGymDTO = GymTransformer.toDTO;
const toGymEntity
module.exports.toGymEntity = toGymEntity = GymTransformer.toEntity;
const toGymDTOList
module.exports.toGymDTOList = toGymDTOList = GymTransformer.toDTOList;
// WorkoutSession 변환 함수들
const toWorkoutSessionDTO
module.exports.toWorkoutSessionDTO = toWorkoutSessionDTO = WorkoutSessionTransformer.toDTO;
const toWorkoutSessionEntity
module.exports.toWorkoutSessionEntity = toWorkoutSessionEntity = WorkoutSessionTransformer.toEntity;
const toWorkoutSessionDTOList
module.exports.toWorkoutSessionDTOList = toWorkoutSessionDTOList = WorkoutSessionTransformer.toDTOList;
// ExerciseSet 변환 함수들
const toExerciseSetDTO
module.exports.toExerciseSetDTO = toExerciseSetDTO = ExerciseSetTransformer.toDTO;
const toExerciseSetEntity
module.exports.toExerciseSetEntity = toExerciseSetEntity = ExerciseSetTransformer.toEntity;
const toExerciseSetDTOList
module.exports.toExerciseSetDTOList = toExerciseSetDTOList = ExerciseSetTransformer.toDTOList;
// ExpHistory 변환 함수들
const toExpHistoryDTO
module.exports.toExpHistoryDTO = toExpHistoryDTO = ExpHistoryTransformer.toDTO;
const toExpHistoryEntity
module.exports.toExpHistoryEntity = toExpHistoryEntity = ExpHistoryTransformer.toEntity;
const toExpHistoryDTOList
module.exports.toExpHistoryDTOList = toExpHistoryDTOList = ExpHistoryTransformer.toDTOList;
// UserLevel 변환 함수들
const toUserLevelDTO
module.exports.toUserLevelDTO = toUserLevelDTO = UserLevelTransformer.toDTO;
const toUserLevelEntity
module.exports.toUserLevelEntity = toUserLevelEntity = UserLevelTransformer.toEntity;
const toUserLevelDTOList
module.exports.toUserLevelDTOList = toUserLevelDTOList = UserLevelTransformer.toDTOList;
// Like 변환 함수들
const toLikeDTO
module.exports.toLikeDTO = toLikeDTO = LikeTransformer.toDTO;
const toLikeEntity
module.exports.toLikeEntity = toLikeEntity = LikeTransformer.toEntity;
const toLikeDTOList
module.exports.toLikeDTOList = toLikeDTOList = LikeTransformer.toDTOList;
Object.assign(module.exports, require('./nullableDate'));
Object.assign(module.exports, require('./bigintNumber'));
