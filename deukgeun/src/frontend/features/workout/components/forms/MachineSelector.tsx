import React, { useState, useEffect } from "react"
import { Button } from "../ui/Button"

interface Machine {
  id: number
  name: string
  category: string
  imageUrl?: string
  description?: string
  isAvailable: boolean
}

interface MachineSelectorProps {
  onMachineSelect: (machineId: number) => void
  selectedMachineId?: number
  gymId?: number
}

export function MachineSelector({
  onMachineSelect,
  selectedMachineId,
  gymId,
}: MachineSelectorProps) {
  const [machines, setMachines] = useState<Machine[]>([])
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // 샘플 기구 데이터
  const sampleMachines: Machine[] = [
    {
      id: 1,
      name: "벤치프레스",
      category: "가슴",
      description: "가슴 근육을 발달시키는 대표적인 운동",
      isAvailable: true,
    },
    {
      id: 2,
      name: "스쿼트랙",
      category: "하체",
      description: "하체 근육을 발달시키는 복합 운동",
      isAvailable: true,
    },
    {
      id: 3,
      name: "데드리프트 플랫폼",
      category: "등",
      description: "등과 하체를 동시에 발달시키는 운동",
      isAvailable: true,
    },
    {
      id: 4,
      name: "오버헤드프레스",
      category: "어깨",
      description: "어깨 근육을 발달시키는 운동",
      isAvailable: true,
    },
    {
      id: 5,
      name: "바벨로우",
      category: "등",
      description: "등 근육을 발달시키는 운동",
      isAvailable: true,
    },
    {
      id: 6,
      name: "풀업바",
      category: "등",
      description: "상체를 들어올리는 운동",
      isAvailable: true,
    },
    {
      id: 7,
      name: "딥스바",
      category: "삼두",
      description: "삼두근을 발달시키는 운동",
      isAvailable: true,
    },
    {
      id: 8,
      name: "레그프레스",
      category: "하체",
      description: "하체 근육을 발달시키는 운동",
      isAvailable: true,
    },
    {
      id: 9,
      name: "레그컬",
      category: "하체",
      description: "햄스트링을 발달시키는 운동",
      isAvailable: true,
    },
    {
      id: 10,
      name: "레그익스텐션",
      category: "하체",
      description: "대퇴사두근을 발달시키는 운동",
      isAvailable: true,
    },
    {
      id: 11,
      name: "러닝머신",
      category: "유산소",
      description: "유산소 운동을 위한 기구",
      isAvailable: true,
    },
    {
      id: 12,
      name: "자전거",
      category: "유산소",
      description: "유산소 운동을 위한 기구",
      isAvailable: true,
    },
  ]

  useEffect(() => {
    // 실제로는 API에서 기구 데이터를 가져옴
    const fetchMachines = async () => {
      try {
        setIsLoading(true)
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500))
        setMachines(sampleMachines)
        setFilteredMachines(sampleMachines)
      } catch (error) {
        console.error("기구 데이터를 가져오는데 실패했습니다:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMachines()
  }, [gymId])

  useEffect(() => {
    let filtered = machines

    // 카테고리 필터링
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        machine => machine.category === selectedCategory
      )
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        machine =>
          machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredMachines(filtered)
  }, [machines, selectedCategory, searchTerm])

  const categories = [
    "all",
    ...Array.from(new Set(machines.map(m => m.category))),
  ]

  const handleMachineSelect = (machineId: number) => {
    onMachineSelect(machineId)
  }

  const getSelectedMachine = () => {
    return machines.find(machine => machine.id === selectedMachineId)
  }

  if (isLoading) {
    return (
      <div className="machine-selector">
        <h3>기구 선택</h3>
        <div className="loading-state">
          <div className="loading-spinner">기구 목록을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="machine-selector">
      <h3>기구 선택</h3>

      {/* 검색 및 필터 */}
      <div className="machine-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="기구 이름으로 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "전체" : category}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 기구 표시 */}
      {selectedMachineId && getSelectedMachine() && (
        <div className="selected-machine-display">
          <h4>선택된 기구</h4>
          <div className="selected-machine-card">
            <div className="machine-info">
              <h5>{getSelectedMachine()?.name}</h5>
              <p className="machine-category">
                {getSelectedMachine()?.category}
              </p>
              <p className="machine-description">
                {getSelectedMachine()?.description}
              </p>
            </div>
            <Button
              onClick={() => handleMachineSelect(0)}
              size="small"
              variant="secondary"
            >
              선택 해제
            </Button>
          </div>
        </div>
      )}

      {/* 기구 목록 */}
      <div className="machine-grid">
        {filteredMachines.length > 0 ? (
          filteredMachines.map(machine => (
            <div
              key={machine.id}
              className={`machine-item ${selectedMachineId === machine.id ? "selected" : ""} ${!machine.isAvailable ? "unavailable" : ""}`}
              onClick={() =>
                machine.isAvailable && handleMachineSelect(machine.id)
              }
            >
              <div className="machine-image">
                {machine.imageUrl ? (
                  <img src={machine.imageUrl} alt={machine.name} />
                ) : (
                  <div className="machine-placeholder">
                    {machine.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="machine-info">
                <h4>{machine.name}</h4>
                <p className="machine-category">{machine.category}</p>
                {machine.description && (
                  <p className="machine-description">{machine.description}</p>
                )}
                {!machine.isAvailable && (
                  <span className="unavailable-badge">사용 불가</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              variant="secondary"
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      {/* 기구 통계 */}
      <div className="machine-stats">
        <div className="stat-item">
          <span className="stat-label">총 기구 수:</span>
          <span className="stat-value">{machines.length}개</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">사용 가능:</span>
          <span className="stat-value">
            {machines.filter(m => m.isAvailable).length}개
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">카테고리:</span>
          <span className="stat-value">{categories.length - 1}개</span>
        </div>
      </div>
    </div>
  )
}
