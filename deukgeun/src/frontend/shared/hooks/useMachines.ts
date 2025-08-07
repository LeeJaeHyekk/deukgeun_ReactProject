import { useState, useEffect, useCallback } from "react";
import { machineApi } from "../api/machineApi";
import {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
} from "../types/machine";
import { showToast } from "../lib";

/**
 * Machine 관련 커스텀 훅
 * 기구 데이터 관리와 API 호출을 담당합니다.
 */
export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 기구 조회
  const fetchMachines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await machineApi.getAllMachines();
      setMachines(response.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "기구 목록을 불러오는데 실패했습니다.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 기구 조회
  const fetchMachineById = useCallback(
    async (id: number): Promise<Machine | null> => {
      try {
        const response = await machineApi.getMachineById(id);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "기구 정보를 불러오는데 실패했습니다.";
        showToast(errorMessage, "error");
        return null;
      }
    },
    []
  );

  // 기구 생성 (Admin 권한 필요)
  const createMachine = useCallback(
    async (machineData: CreateMachineRequest): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await machineApi.createMachine(machineData);
        showToast(response.message, "success");

        // 목록 새로고침
        await fetchMachines();
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "기구 생성에 실패했습니다.";
        setError(errorMessage);
        showToast(errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchMachines]
  );

  // 기구 수정 (Admin 권한 필요)
  const updateMachine = useCallback(
    async (id: number, updateData: UpdateMachineRequest): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await machineApi.updateMachine(id, updateData);
        showToast(response.message, "success");

        // 목록 새로고침
        await fetchMachines();
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "기구 수정에 실패했습니다.";
        setError(errorMessage);
        showToast(errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchMachines]
  );

  // 기구 삭제 (Admin 권한 필요)
  const deleteMachine = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await machineApi.deleteMachine(id);
        showToast(response.message, "success");

        // 목록 새로고침
        await fetchMachines();
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "기구 삭제에 실패했습니다.";
        setError(errorMessage);
        showToast(errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchMachines]
  );

  // 기구 필터링
  const filterMachines = useCallback(
    async (filters: MachineFilterQuery): Promise<Machine[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await machineApi.filterMachines(filters);
        setMachines(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "기구 필터링에 실패했습니다.";
        setError(errorMessage);
        showToast(errorMessage, "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 카테고리별 기구 조회
  const getMachinesByCategory = useCallback(
    async (category: string): Promise<Machine[]> => {
      return filterMachines({ category: category as any });
    },
    [filterMachines]
  );

  // 난이도별 기구 조회
  const getMachinesByDifficulty = useCallback(
    async (difficulty: string): Promise<Machine[]> => {
      return filterMachines({ difficulty: difficulty as any });
    },
    [filterMachines]
  );

  // 타겟 근육별 기구 조회
  const getMachinesByTarget = useCallback(
    async (target: string): Promise<Machine[]> => {
      return filterMachines({ target });
    },
    [filterMachines]
  );

  // 컴포넌트 마운트 시 기구 목록 로드
  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  return {
    machines,
    loading,
    error,
    fetchMachines,
    fetchMachineById,
    createMachine,
    updateMachine,
    deleteMachine,
    filterMachines,
    getMachinesByCategory,
    getMachinesByDifficulty,
    getMachinesByTarget,
  };
};
