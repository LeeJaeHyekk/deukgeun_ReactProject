// ============================================================================
// Machine 모듈 인덱스
// ============================================================================

// Machine 관련 라우트
export { default as machineRoutes } from "@backend/routes/machine"

// Machine 컨트롤러
export { 
  createMachine, 
  getAllMachines, 
  getMachineById, 
  updateMachine 
} from "@backend/controllers/machineController"

// Machine 서비스
export { MachineService } from "@backend/services/machineService"
export { EquipmentService } from "@backend/services/equipmentService"

// Machine 엔티티
export { Machine } from "@backend/entities/Machine"
export { Equipment } from "@backend/entities/Equipment"

// Machine 관련 라우트
export { default as equipmentRoutes } from "@backend/routes/equipment"
