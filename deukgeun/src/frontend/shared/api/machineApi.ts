import { api } from "./index";
import { API_ENDPOINTS } from "../config";
import {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
  MachineResponse,
  MachineListResponse,
  MachineFilterResponse,
} from "../types/machine";

/**
 * Machine API 서비스
 * 백엔드 Machine API와 통신하는 함수들을 제공합니다.
 */
export const machineApi = {
  /**
   * 모든 기구 목록을 조회합니다.
   */
  getAllMachines: async (): Promise<MachineListResponse> => {
    return api.get<MachineListResponse>(API_ENDPOINTS.MACHINES.LIST);
  },

  /**
   * 특정 기구를 ID로 조회합니다.
   */
  getMachineById: async (id: number): Promise<MachineResponse> => {
    return api.get<MachineResponse>(API_ENDPOINTS.MACHINES.DETAIL(id));
  },

  /**
   * 새로운 기구를 생성합니다. (Admin 권한 필요)
   */
  createMachine: async (
    machineData: CreateMachineRequest
  ): Promise<MachineResponse> => {
    return api.post<MachineResponse>(
      API_ENDPOINTS.MACHINES.CREATE,
      machineData
    );
  },

  /**
   * 기존 기구를 수정합니다. (Admin 권한 필요)
   */
  updateMachine: async (
    id: number,
    updateData: UpdateMachineRequest
  ): Promise<MachineResponse> => {
    return api.put<MachineResponse>(
      API_ENDPOINTS.MACHINES.UPDATE(id),
      updateData
    );
  },

  /**
   * 기구를 삭제합니다. (Admin 권한 필요)
   */
  deleteMachine: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(API_ENDPOINTS.MACHINES.DELETE(id));
  },

  /**
   * 조건에 따라 기구를 필터링하여 조회합니다.
   */
  filterMachines: async (
    filters: MachineFilterQuery
  ): Promise<MachineFilterResponse> => {
    const queryParams = new URLSearchParams();

    if (filters.category) {
      queryParams.append("category", filters.category);
    }
    if (filters.difficulty) {
      queryParams.append("difficulty", filters.difficulty);
    }
    if (filters.target) {
      queryParams.append("target", filters.target);
    }

    const url = `${API_ENDPOINTS.MACHINES.FILTER}?${queryParams.toString()}`;
    return api.get<MachineFilterResponse>(url);
  },

  /**
   * 카테고리별로 기구를 조회합니다.
   */
  getMachinesByCategory: async (
    category: string
  ): Promise<MachineFilterResponse> => {
    return machineApi.filterMachines({ category: category as any });
  },

  /**
   * 난이도별로 기구를 조회합니다.
   */
  getMachinesByDifficulty: async (
    difficulty: string
  ): Promise<MachineFilterResponse> => {
    return machineApi.filterMachines({ difficulty: difficulty as any });
  },

  /**
   * 타겟 근육별로 기구를 조회합니다.
   */
  getMachinesByTarget: async (
    target: string
  ): Promise<MachineFilterResponse> => {
    return machineApi.filterMachines({ target });
  },
};
