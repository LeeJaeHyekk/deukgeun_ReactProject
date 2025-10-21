// ============================================================================
// Machine Guide API Service
// ============================================================================

import { api } from "@frontend/shared/api"
import { API_ENDPOINTS } from "@frontend/shared/config"
import type {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
} from "../types"

// 백엔드 응답 타입 정의
interface BackendMachineListResponse {
  message: string
  data: Machine[]
  count: number
}

interface BackendMachineResponse {
  message: string
  data: Machine
}

// 타입 안전 헬퍼 함수들
function isBackendMachineListResponse(
  data: any
): data is BackendMachineListResponse {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.data) &&
    typeof data.count === "number"
  )
}

function isBackendMachineResponse(data: any): data is BackendMachineResponse {
  return (
    data &&
    typeof data === "object" &&
    data.data &&
    typeof data.data === "object"
  )
}

function extractMachineListData(responseData: any): {
  machines: Machine[]
  count: number
} {
  if (isBackendMachineListResponse(responseData)) {
    return {
      machines: responseData.data,
      count: responseData.count,
    }
  }

  if (Array.isArray(responseData)) {
    return {
      machines: responseData,
      count: responseData.length,
    }
  }

  return {
    machines: [],
    count: 0,
  }
}

function extractMachineData(responseData: any): Machine | null {
  if (isBackendMachineResponse(responseData)) {
    return responseData.data
  }

  if (responseData && typeof responseData === "object" && responseData.id) {
    return responseData as Machine
  }

  return null
}

/**
 * Machine Guide API Service
 * 머신 가이드 기능에 특화된 API 호출을 담당합니다.
 */
export class MachineApiService {
  private static instance: MachineApiService

  private constructor() {}

  public static getInstance(): MachineApiService {
    if (!MachineApiService.instance) {
      MachineApiService.instance = new MachineApiService()
    }
    return MachineApiService.instance
  }

  /**
   * 모든 머신 조회
   */
  async getMachines(): Promise<{ machines: Machine[]; count: number }> {
    const response = await api.get(API_ENDPOINTS.MACHINES.LIST)
    console.log("머신 API 응답:", response)

    // ApiResponse 래핑된 데이터에서 실제 백엔드 응답 추출
    const responseData = (response.data as any).data || response.data
    return extractMachineListData(responseData)
  }

  /**
   * ID로 특정 머신 조회
   */
  async getMachine(id: number): Promise<{ machine: Machine }> {
    const response = await api.get(API_ENDPOINTS.MACHINES.DETAIL(id))

    const responseData = (response.data as any).data || response.data
    const machine = extractMachineData(responseData)

    if (!machine) {
      throw new Error("Machine not found")
    }

    return { machine }
  }

  /**
   * 새 머신 생성
   */
  async createMachine(
    data: CreateMachineRequest
  ): Promise<{ machine: Machine }> {
    const response = await api.post(API_ENDPOINTS.MACHINES.CREATE, data)

    const responseData = (response.data as any).data || response.data
    const machine = extractMachineData(responseData)

    if (!machine) {
      throw new Error("Failed to create machine")
    }

    return { machine }
  }

  /**
   * 머신 정보 수정
   */
  async updateMachine(
    id: number,
    data: UpdateMachineRequest
  ): Promise<{ machine: Machine }> {
    const response = await api.put(API_ENDPOINTS.MACHINES.UPDATE(id), data)

    const responseData = (response.data as any).data || response.data
    const machine = extractMachineData(responseData)

    if (!machine) {
      throw new Error("Failed to update machine")
    }

    return { machine }
  }

  /**
   * 머신 삭제
   */
  async deleteMachine(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.MACHINES.DELETE(id))
  }

  /**
   * 조건별 머신 필터링
   */
  async filterMachines(
    filters: MachineFilterQuery
  ): Promise<{ machines: Machine[]; count: number }> {
    const params = new URLSearchParams()
    if (filters.category) params.append("category", filters.category)
    if (filters.difficulty) params.append("difficulty", filters.difficulty)
    if (filters.target) params.append("target", filters.target)
    if (filters.search) params.append("search", filters.search)

    const response = await api.get(
      `${API_ENDPOINTS.MACHINES.FILTER}?${params.toString()}`
    )

    const responseData = (response.data as any).data || response.data
    return extractMachineListData(responseData)
  }

  /**
   * 카테고리별 머신 조회
   */
  async getMachinesByCategory(
    category: string
  ): Promise<{ machines: Machine[]; count: number }> {
    const response = await api.get(
      API_ENDPOINTS.MACHINES.GET_BY_CATEGORY(category)
    )

    const responseData = (response.data as any).data || response.data
    return extractMachineListData(responseData)
  }

  /**
   * 난이도별 머신 조회
   */
  async getMachinesByDifficulty(
    difficulty: string
  ): Promise<{ machines: Machine[]; count: number }> {
    const response = await api.get(
      API_ENDPOINTS.MACHINES.GET_BY_DIFFICULTY(difficulty)
    )

    const responseData = (response.data as any).data || response.data
    return extractMachineListData(responseData)
  }

  /**
   * 타겟별 머신 조회
   */
  async getMachinesByTarget(
    target: string
  ): Promise<{ machines: Machine[]; count: number }> {
    const response = await api.get(API_ENDPOINTS.MACHINES.GET_BY_TARGET(target))

    const responseData = (response.data as any).data || response.data
    return extractMachineListData(responseData)
  }
}

// 싱글톤 인스턴스 export
export const machineApiService = MachineApiService.getInstance()
