import React from "react"
import type { Machine } from "../../../../shared/types"
import "./MachineSelector.css"

interface MachineSelectorProps {
  machines: Machine[]
  selectedMachineId: number | null
  onMachineSelect: (machineId: number) => void
}

export function MachineSelector({
  machines,
  selectedMachineId,
  onMachineSelect,
}: MachineSelectorProps) {
  const getCategoryDisplay = (category: any) => {
    if (typeof category === "string") return category
    if (category && typeof category === "object" && category.name) return category.name
    return "기타"
  }

  return (
    <div className="machine-selector">
      <h3>기구 선택</h3>
      <div className="machine-grid">
        {machines.map(machine => (
          <div
            key={machine.id}
            className={`machine-item ${selectedMachineId === machine.id ? "selected" : ""}`}
            onClick={() => onMachineSelect(machine.id)}
          >
            {machine.imageUrl && (
              <img
                src={machine.imageUrl}
                alt={machine.name}
                className="machine-image"
              />
            )}
            <div className="machine-info">
              <span className="machine-name">{machine.name}</span>
              <span className="machine-category">{getCategoryDisplay(machine.category)}</span>
            </div>
          </div>
        ))}
      </div>
      {machines.length === 0 && (
        <div className="no-machines">
          <p>등록된 기구가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
