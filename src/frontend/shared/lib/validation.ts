import { z } from "zod"

// 공통 검증 스키마
export const validation = {
  // 이메일 검증
  email: z.string().email("올바른 이메일 형식이 아닙니다"),

  // 비밀번호 검증
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),

  // 이름 검증
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),

  // 전화번호 검증
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, "올바른 전화번호 형식이 아닙니다"),

  // 숫자 검증
  number: z.number().positive("양수여야 합니다"),

  // 문자열 검증
  string: z.string().min(1, "필수 입력 항목입니다"),

  // 유틸리티 함수들
  isRequired: (value: any) => {
    return value !== null && value !== undefined && value !== ""
  },

  isEmail: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  isPassword: (value: string) => {
    return value.length >= 8
  },
}

export default validation
