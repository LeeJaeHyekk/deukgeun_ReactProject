import React from "react";
import { Machine } from "../types/machine";
import "./MachineCard.css";

interface MachineCardProps {
  machine: Machine;
  onClick?: (machine: Machine) => void;
  showActions?: boolean;
  onEdit?: (machine: Machine) => void;
  onDelete?: (machine: Machine) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(machine);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(machine);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(machine);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "초급":
        return "#4CAF50";
      case "중급":
        return "#FF9800";
      case "고급":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "상체":
        return "#2196F3";
      case "하체":
        return "#4CAF50";
      case "전신":
        return "#9C27B0";
      case "기타":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <div className="machine-card" onClick={handleClick}>
      <div className="machine-card-image">
        <img src={machine.image_url} alt={machine.name_ko} />
        <div className="machine-card-overlay">
          <div
            className="machine-card-category"
            style={{ backgroundColor: getCategoryColor(machine.category) }}
          >
            {machine.category}
          </div>
          {machine.difficulty_level && (
            <div
              className="machine-card-difficulty"
              style={{
                backgroundColor: getDifficultyColor(machine.difficulty_level),
              }}
            >
              {machine.difficulty_level}
            </div>
          )}
        </div>
      </div>

      <div className="machine-card-content">
        <h3 className="machine-card-title">{machine.name_ko}</h3>
        {machine.name_en && (
          <p className="machine-card-subtitle">{machine.name_en}</p>
        )}
        <p className="machine-card-description">{machine.short_desc}</p>

        {machine.target_muscle && machine.target_muscle.length > 0 && (
          <div className="machine-card-targets">
            <span className="machine-card-target-label">타겟 근육:</span>
            <div className="machine-card-target-list">
              {machine.target_muscle.map((muscle, index) => (
                <span key={index} className="machine-card-target-tag">
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="machine-card-actions">
          <button
            className="machine-card-action-btn machine-card-edit-btn"
            onClick={handleEdit}
          >
            수정
          </button>
          <button
            className="machine-card-action-btn machine-card-delete-btn"
            onClick={handleDelete}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};
