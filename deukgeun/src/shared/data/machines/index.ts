// ============================================================================
// Machine Data Index
// ============================================================================

import chestMachines from './chest-machines.json'
import backMachines from './back-machines.json'
// import legsMachines from './legs-machines.json'
// import shouldersMachines from './shoulders-machines.json'
// import armsMachines from './arms-machines.json'
// import cardioMachines from './cardio-machines.json'

import type {
  EnhancedMachine,
  MachineCategory,
} from '../../types/machineGuide.types'

/**
 * 모든 머신 데이터를 통합하여 반환합니다.
 */
export function getAllMachines(): EnhancedMachine[] {
  const allMachines = [
    ...chestMachines.machines,
    ...backMachines.machines,
    // ...legsMachines.machines,
    // ...shouldersMachines.machines,
    // ...armsMachines.machines,
    // ...cardioMachines.machines,
  ]

  return allMachines as EnhancedMachine[]
}

/**
 * 특정 카테고리의 머신 데이터를 반환합니다.
 */
export function getMachinesByCategory(
  category: MachineCategory
): EnhancedMachine[] {
  const allMachines = getAllMachines()
  return allMachines.filter(machine => machine.category === category)
}

/**
 * 특정 머신을 ID로 찾습니다.
 */
export function getMachineById(id: number): EnhancedMachine | undefined {
  const allMachines = getAllMachines()
  return allMachines.find(machine => machine.id === id)
}

/**
 * 특정 머신을 machineKey로 찾습니다.
 */
export function getMachineByKey(
  machineKey: string
): EnhancedMachine | undefined {
  const allMachines = getAllMachines()
  return allMachines.find(machine => machine.machineKey === machineKey)
}

/**
 * 활성화된 머신만 반환합니다.
 */
export function getActiveMachines(): EnhancedMachine[] {
  const allMachines = getAllMachines()
  return allMachines.filter(machine => machine.isActive)
}

/**
 * 머신 통계를 반환합니다.
 */
export function getMachineStats() {
  const allMachines = getAllMachines()
  const activeMachines = getActiveMachines()

  const categoryCounts = allMachines.reduce(
    (counts, machine) => {
      counts[machine.category] = (counts[machine.category] || 0) + 1
      return counts
    },
    {} as Record<MachineCategory, number>
  )

  const difficultyCounts = allMachines.reduce(
    (counts, machine) => {
      counts[machine.difficulty] = (counts[machine.difficulty] || 0) + 1
      return counts
    },
    {} as Record<string, number>
  )

  return {
    total: allMachines.length,
    active: activeMachines.length,
    inactive: allMachines.length - activeMachines.length,
    categoryCounts,
    difficultyCounts,
  }
}

// 개별 카테고리 데이터 export
export { chestMachines, backMachines }
