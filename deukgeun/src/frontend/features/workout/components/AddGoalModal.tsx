// ============================================================================
// AddGoalModal - 운동 목표 추가/편집 모달
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useDispatch } from "react-redux"
import { addGoal, editGoal } from "../slices/workoutSlice"
import type { Task, Goal } from "../slices/workoutSlice"

import styles from "./AddGoalModal.module.css"

// ID 생성 헬퍼 함수 (메모이제이션 최적화)
let idCounter = 0
function generateId(): string {
  return `goal_${Date.now()}_${++idCounter}_${Math.random().toString(36).substr(2, 9)}`
}

interface Props {
  initial?: Partial<Goal>
  onClose: () => void
}

export function AddGoalModal({ initial, onClose }: Props) {
  const dispatch = useDispatch()
  const [title, setTitle] = useState(initial?.title || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [targetDate, setTargetDate] = useState(
    initial?.targetDate ? initial.targetDate.slice(0, 10) : ""
  )
  const [difficulty, setDifficulty] = useState<Goal["difficulty"]>(
    initial?.difficulty || "intermediate"
  )
  const now = new Date().toISOString()
  const [tasks, setTasks] = useState<Task[]>(
    (initial?.tasks as Task[]) || [
      {
        taskId: generateId(),
        name: "",
        setCount: 3,
        repsPerSet: 10,
        completedSets: 0,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      } as Task,
    ]
  )

  // 모달이 열릴 때 외부 스크롤 방지
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // 콜백 메모이제이션으로 리렌더링 최적화
  const onAddTask = useCallback(() => {
    const now = new Date().toISOString()
    setTasks((s) => [
      ...s,
      {
        taskId: generateId(),
        name: "",
        setCount: 3,
        repsPerSet: 10,
        completedSets: 0,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      } as Task,
    ])
  }, [])

  const onUpdateTask = useCallback((index: number, updates: Partial<Task>) => {
    setTasks((s) => s.map((task, i) => (i === index ? { ...task, ...updates } : task)))
  }, [])

  const onRemoveTask = useCallback((index: number) => {
    setTasks((s) => s.filter((_, i) => i !== index))
  }, [])

  // 유효한 태스크 필터링 메모이제이션
  const validTasks = useMemo(
    () => tasks.filter((t) => t.name.trim() !== ""),
    [tasks]
  )

  // 검증 함수 메모이제이션
  const validateTasks = useMemo(() => {
    return () => {
      if (!title.trim()) {
        alert("제목을 입력해주세요.")
        return false
      }

      if (validTasks.length === 0) {
        alert("최소 하나의 운동 항목을 입력해주세요.")
        return false
      }

      // 각 운동 항목의 이름이 필수인지 검증
      const hasEmptyTaskName = tasks.some((task) => {
        const taskHasData = task.setCount > 0 || task.repsPerSet > 0 || task.weightPerSet
        return taskHasData && !task.name.trim()
      })

      if (hasEmptyTaskName) {
        alert("모든 운동 항목의 이름을 입력해주세요.")
        return false
      }

      // 입력값 범위 검증
      const invalidTask = validTasks.find((task) => {
        if (
          typeof task.setCount !== "number" ||
          isNaN(task.setCount) ||
          task.setCount < 1 ||
          task.setCount > 1000
        ) {
          return true
        }

        if (
          typeof task.repsPerSet !== "number" ||
          isNaN(task.repsPerSet) ||
          task.repsPerSet < 1 ||
          task.repsPerSet > 10000
        ) {
          return true
        }

        if (task.weightPerSet !== undefined) {
          if (
            typeof task.weightPerSet !== "number" ||
            isNaN(task.weightPerSet) ||
            task.weightPerSet < 0 ||
            task.weightPerSet > 10000
          ) {
            return true
          }
        }

        return false
      })

      if (invalidTask) {
        alert(
          "입력값이 유효하지 않습니다.\n" +
            "- 세트: 1 이상 1000 이하\n" +
            "- 반복: 1 이상 10000 이하\n" +
            "- 무게: 0 이상 10000 이하 (kg)"
        )
        return false
      }

      return true
    }
  }, [title, tasks, validTasks])

  const onSave = useCallback(() => {
    if (!validateTasks()) return

    const goalId = initial?.goalId || generateId()
    const now = new Date().toISOString()
    
    // 수정 모드일 때 기존 tasks의 completedSets 보존
    const existingTasks = initial?.tasks || []
    
    const goal: Goal = {
      goalId,
      title,
      description,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      status: initial?.status || "planned",
      difficulty,
      tasks: validTasks.map((t) => {
        // 수정 모드일 때 기존 task에서 completedSets 찾기
        const existingTask = existingTasks.find((et) => et.taskId === t.taskId)
        
        // 기존 completedSets 보존 (수정 모드이고 taskId가 일치하는 경우)
        // 새로 추가된 task는 0으로 초기화
        const preservedCompletedSets = initial?.goalId && existingTask?.completedSets !== undefined && existingTask.completedSets !== null && !isNaN(existingTask.completedSets)
          ? Number(existingTask.completedSets)
          : 0
        
        // 기존 status 보존
        const preservedStatus = initial?.goalId && existingTask?.status
          ? existingTask.status
          : (t.status || "pending")
        
        return {
          ...t,
          // 숫자값 정규화
          setCount: Math.max(1, Math.min(1000, Math.round(t.setCount))),
          repsPerSet: Math.max(1, Math.min(10000, Math.round(t.repsPerSet))),
          weightPerSet:
            t.weightPerSet !== undefined
              ? Math.max(0, Math.min(10000, Math.round(t.weightPerSet * 100) / 100))
              : undefined,
          // 기존 completedSets 보존 (수정 모드)
          completedSets: preservedCompletedSets,
          status: preservedStatus,
          createdAt: t.createdAt || existingTask?.createdAt || now,
          updatedAt: now,
        }
      }),
    }

    if (initial?.goalId) {
      console.log(`✏️ 목표 수정: "${goal.title}"`, {
        goalId,
        preservedCompletedSets: goal.tasks.reduce((sum, t) => sum + (t.completedSets || 0), 0),
        tasks: goal.tasks.map(t => ({
          taskId: t.taskId,
          name: t.name,
          completedSets: t.completedSets,
          setCount: t.setCount
        }))
      })
      dispatch(editGoal({ goalId, patch: goal }))
    } else {
      dispatch(addGoal(goal))
    }

    onClose()
  }, [title, description, targetDate, difficulty, validTasks, initial, dispatch, onClose, validateTasks])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{initial ? "목표 수정" : "새 목표 추가"}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="운동 목표 제목"
            />
          </div>

          <div className={styles.formGroup}>
            <label>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="목표에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>목표일</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>난이도</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Goal["difficulty"])}
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>
          </div>

          <div className={styles.tasksSection}>
            <div className={styles.sectionHeader}>
              <h4>운동 항목 *</h4>
              <button onClick={onAddTask} className={styles.addTaskButton}>
                + 추가
              </button>
            </div>

            {tasks.map((task, index) => (
              <div key={task.taskId} className={styles.taskForm}>
                <input
                  type="text"
                  placeholder="운동명 *"
                  value={task.name}
                  onChange={(e) => onUpdateTask(index, { name: e.target.value })}
                  className={styles.taskNameInput}
                  required
                />
                <div className={styles.taskInputs}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>세트</label>
                    <div className={styles.numberInputWrapper}>
                      <button
                        type="button"
                        className={styles.numberInputButton}
                        onClick={() => {
                          const newValue = Math.max(1, task.setCount - 1)
                          onUpdateTask(index, { setCount: newValue })
                        }}
                        aria-label="세트 수 감소"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        placeholder="세트"
                        value={task.setCount}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (value > 0 && !isNaN(value)) {
                            onUpdateTask(index, { setCount: value })
                          } else if (e.target.value === "") {
                            onUpdateTask(index, { setCount: 1 })
                          }
                        }}
                        min={1}
                        className={styles.numberInput}
                        aria-label="세트 수"
                      />
                      <button
                        type="button"
                        className={styles.numberInputButton}
                        onClick={() => {
                          onUpdateTask(index, { setCount: task.setCount + 1 })
                        }}
                        aria-label="세트 수 증가"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>반복</label>
                    <div className={styles.numberInputWrapper}>
                      <button
                        type="button"
                        className={styles.numberInputButton}
                        onClick={() => {
                          const newValue = Math.max(1, task.repsPerSet - 1)
                          onUpdateTask(index, { repsPerSet: newValue })
                        }}
                        aria-label="반복 횟수 감소"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        placeholder="반복"
                        value={task.repsPerSet}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (value > 0 && !isNaN(value)) {
                            onUpdateTask(index, { repsPerSet: value })
                          } else if (e.target.value === "") {
                            onUpdateTask(index, { repsPerSet: 1 })
                          }
                        }}
                        min={1}
                        className={styles.numberInput}
                        aria-label="반복 횟수"
                      />
                      <button
                        type="button"
                        className={styles.numberInputButton}
                        onClick={() => {
                          onUpdateTask(index, { repsPerSet: task.repsPerSet + 1 })
                        }}
                        aria-label="반복 횟수 증가"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>무게 (kg)</label>
                    <div className={styles.numberInputWrapper}>
                      <button
                        type="button"
                        className={styles.numberInputButton}
                        onClick={() => {
                          const newValue = Math.max(0, (task.weightPerSet || 0) - 0.5)
                          onUpdateTask(index, { weightPerSet: newValue > 0 ? newValue : undefined })
                        }}
                        aria-label="무게 감소"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        placeholder="0"
                        value={task.weightPerSet || ""}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (value >= 0 && !isNaN(value)) {
                            onUpdateTask(index, { weightPerSet: value > 0 ? value : undefined })
                          } else if (e.target.value === "") {
                            onUpdateTask(index, { weightPerSet: undefined })
                          }
                        }}
                        min={0}
                        step={0.5}
                        className={styles.numberInput}
                        aria-label="무게 (kg)"
                      />
                      <button
                        type="button"
                        className={styles.numberInputButton}
                        onClick={() => {
                          const newValue = ((task.weightPerSet || 0) + 0.5)
                          onUpdateTask(index, { weightPerSet: newValue })
                        }}
                        aria-label="무게 증가"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {tasks.length > 1 && (
                  <button
                    onClick={() => onRemoveTask(index)}
                    className={styles.removeTaskButton}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={onSave} className={styles.saveButton}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
