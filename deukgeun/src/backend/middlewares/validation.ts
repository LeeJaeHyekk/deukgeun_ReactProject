import { Request, Response, NextFunction } from "express"
import { CreateMachineRequest, UpdateMachineRequest } from "../types/machine"
import type { MachineCategory, DifficultyLevel } from "../../types/machine"

/**
 * Machine 생성 요청 데이터 검증
 */
export const validateCreateMachine = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: CreateMachineRequest = req.body

  // 필수 필드 검증
  if (!data.machine_key || typeof data.machine_key !== "string") {
    return res.status(400).json({
      message: "machine_key는 필수 필드이며 문자열이어야 합니다.",
    })
  }

  if (!data.name_ko || typeof data.name_ko !== "string") {
    return res.status(400).json({
      message: "name_ko는 필수 필드이며 문자열이어야 합니다.",
    })
  }

  if (!data.image_url || typeof data.image_url !== "string") {
    return res.status(400).json({
      message: "image_url은 필수 필드이며 문자열이어야 합니다.",
    })
  }

  if (!data.short_desc || typeof data.short_desc !== "string") {
    return res.status(400).json({
      message: "short_desc는 필수 필드이며 문자열이어야 합니다.",
    })
  }

  if (!data.detail_desc || typeof data.detail_desc !== "string") {
    return res.status(400).json({
      message: "detail_desc는 필수 필드이며 문자열이어야 합니다.",
    })
  }

  // 카테고리 검증
  const validCategories = ["상체", "하체", "전신", "기타"]
  if (!validCategories.includes(data.category)) {
    return res.status(400).json({
      message: `category는 다음 중 하나여야 합니다: ${validCategories.join(", ")}`,
    })
  }

  // 난이도 검증
  const validDifficulties = ["초급", "중급", "고급"]
  if (
    data.difficulty_level &&
    !validDifficulties.includes(data.difficulty_level)
  ) {
    return res.status(400).json({
      message: `difficulty_level은 다음 중 하나여야 합니다: ${validDifficulties.join(", ")}`,
    })
  }

  // target_muscle 검증
  if (data.target_muscle && !Array.isArray(data.target_muscle)) {
    return res.status(400).json({
      message: "target_muscle은 배열이어야 합니다.",
    })
  }

  // 문자열 길이 제한
  if (data.machine_key.length > 100) {
    return res.status(400).json({
      message: "machine_key는 100자를 초과할 수 없습니다.",
    })
  }

  if (data.name_ko.length > 100) {
    return res.status(400).json({
      message: "name_ko는 100자를 초과할 수 없습니다.",
    })
  }

  if (data.name_en && data.name_en.length > 100) {
    return res.status(400).json({
      message: "name_en은 100자를 초과할 수 없습니다.",
    })
  }

  if (data.image_url.length > 255) {
    return res.status(400).json({
      message: "image_url은 255자를 초과할 수 없습니다.",
    })
  }

  if (data.short_desc.length > 255) {
    return res.status(400).json({
      message: "short_desc는 255자를 초과할 수 없습니다.",
    })
  }

  next()
}

/**
 * Machine 수정 요청 데이터 검증
 */
export const validateUpdateMachine = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: UpdateMachineRequest = req.body

  // 카테고리 검증
  if (data.category) {
    const validCategories = ["상체", "하체", "전신", "기타"]
    if (!validCategories.includes(data.category)) {
      return res.status(400).json({
        message: `category는 다음 중 하나여야 합니다: ${validCategories.join(", ")}`,
      })
    }
  }

  // 난이도 검증
  if (data.difficulty_level) {
    const validDifficulties = ["초급", "중급", "고급"]
    if (!validDifficulties.includes(data.difficulty_level)) {
      return res.status(400).json({
        message: `difficulty_level은 다음 중 하나여야 합니다: ${validDifficulties.join(", ")}`,
      })
    }
  }

  // target_muscle 검증
  if (data.target_muscle && !Array.isArray(data.target_muscle)) {
    return res.status(400).json({
      message: "target_muscle은 배열이어야 합니다.",
    })
  }

  // 문자열 길이 제한
  if (data.machine_key && data.machine_key.length > 100) {
    return res.status(400).json({
      message: "machine_key는 100자를 초과할 수 없습니다.",
    })
  }

  if (data.name_ko && data.name_ko.length > 100) {
    return res.status(400).json({
      message: "name_ko는 100자를 초과할 수 없습니다.",
    })
  }

  if (data.name_en && data.name_en.length > 100) {
    return res.status(400).json({
      message: "name_en은 100자를 초과할 수 없습니다.",
    })
  }

  if (data.image_url && data.image_url.length > 255) {
    return res.status(400).json({
      message: "image_url은 255자를 초과할 수 없습니다.",
    })
  }

  if (data.short_desc && data.short_desc.length > 255) {
    return res.status(400).json({
      message: "short_desc는 255자를 초과할 수 없습니다.",
    })
  }

  next()
}

/**
 * ID 파라미터 검증
 */
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const numId = parseInt(id)

  if (isNaN(numId) || numId <= 0) {
    return res.status(400).json({
      message: "유효하지 않은 ID입니다. 양의 정수여야 합니다.",
    })
  }

  next()
}

/**
 * 필터 쿼리 검증
 */
export const validateFilterQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { category, difficulty, target } = req.query

  if (category && typeof category !== "string") {
    return res.status(400).json({
      message: "category는 문자열이어야 합니다.",
    })
  }

  if (difficulty && typeof difficulty !== "string") {
    return res.status(400).json({
      message: "difficulty는 문자열이어야 합니다.",
    })
  }

  if (target && typeof target !== "string") {
    return res.status(400).json({
      message: "target은 문자열이어야 합니다.",
    })
  }

  // 카테고리 값 검증
  if (category && typeof category === "string") {
    const validCategories = ["상체", "하체", "전신", "기타"]
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `category는 다음 중 하나여야 합니다: ${validCategories.join(", ")}`,
      })
    }
  }

  // 난이도 값 검증
  if (difficulty && typeof difficulty === "string") {
    const validDifficulties = ["초급", "중급", "고급"]
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        message: `difficulty는 다음 중 하나여야 합니다: ${validDifficulties.join(", ")}`,
      })
    }
  }

  next()
}
