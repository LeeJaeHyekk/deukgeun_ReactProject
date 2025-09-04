import api from "./client"

// 머신 관련 API 함수들
export const machineApi = {
  // 머신 목록 조회
  getMachines: async (params?: any) => {
    const response = await api.get("/machines", { params })
    return { machines: response.data }
  },

  // 머신 상세 조회
  getMachine: async (id: string) => {
    const response = await api.get(`/machines/${id}`)
    return { machine: response.data }
  },

  // 머신 생성
  createMachine: async (data: any) => {
    const response = await api.post("/machines", data)
    return response.data
  },

  // 머신 수정
  updateMachine: async (id: string, data: any) => {
    const response = await api.put(`/machines/${id}`, data)
    return { machine: response.data }
  },

  // 머신 삭제
  deleteMachine: async (id: string) => {
    const response = await api.delete(`/machines/${id}`)
    return response.data
  },

  // 머신 카테고리별 조회
  getMachinesByCategory: async (category: string) => {
    const response = await api.get(`/machines/category/${category}`)
    return response.data
  },

  // 머신 난이도별 조회
  getMachinesByDifficulty: async (difficulty: string) => {
    const response = await api.get(`/machines/difficulty/${difficulty}`)
    return { machines: response.data }
  },

  // 머신 타겟 부위별 조회
  getMachinesByTarget: async (target: string) => {
    const response = await api.get(`/machines/target/${target}`)
    return { machines: response.data }
  },

  // 머신 검색
  searchMachines: async (query: string) => {
    const response = await api.get("/machines/search", { query })
    return { machines: response.data }
  },

  // 머신 필터링
  filterMachines: async (filterParams: any) => {
    const response = await api.get("/machines/filter", filterParams)
    return { machines: response.data }
  },
}
