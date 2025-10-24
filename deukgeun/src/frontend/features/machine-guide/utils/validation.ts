// ============================================================================
// Machine Guide Validation Utilities
// ============================================================================

import type { MachineDTO } from "../../../../shared/types/dto/machine.dto"

/**
 * 머신 데이터 유효성 검사
 */
export function validateMachine(machine: any): machine is MachineDTO {
  return (
    machine &&
    typeof machine === 'object' &&
    typeof machine.id === 'number' &&
    typeof machine.name === 'string' &&
    typeof machine.machineKey === 'string' &&
    typeof machine.imageUrl === 'string' &&
    typeof machine.shortDesc === 'string' &&
    typeof machine.detailDesc === 'string' &&
    typeof machine.category === 'string' &&
    typeof machine.difficulty === 'string' &&
    typeof machine.isActive === 'boolean'
  )
}

/**
 * 머신 배열 유효성 검사
 */
export function validateMachineArray(machines: any): machines is MachineDTO[] {
  return Array.isArray(machines) && machines.every(validateMachine)
}

/**
 * 검색어 유효성 검사
 */
export function isValidSearchTerm(searchTerm: string): boolean {
  return typeof searchTerm === 'string' && searchTerm.trim().length >= 1
}

/**
 * 필터 값 유효성 검사
 */
export function isValidFilterValue(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * 안전한 문자열 추출
 */
export function safeStringExtract(value: any): string {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object' && typeof value.name === 'string') {
    return value.name
  }
  return ''
}

/**
 * 안전한 배열 추출
 */
export function safeArrayExtract(value: any): string[] {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string')
  }
  return []
}
