import React, { useState } from "react"
import {
  updateGymDatabase,
  checkDatabaseStatus,
} from "../../script/updateGymDatabase"
import styles from "./DatabaseUpdatePage.module.css"

interface DatabaseStatus {
  totalGyms: number
  lastUpdated: string | null
  databaseStatus: string
}

interface UpdateResult {
  success: boolean
  totalFetched?: number
  validCount?: number
  error?: string
  message: string
}

export default function DatabaseUpdatePage() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [lastUpdateResult, setLastUpdateResult] = useState<UpdateResult | null>(
    null
  )
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  const handleUpdateDatabase = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    setLastUpdateResult(null)

    try {
      const result = await updateGymDatabase()
      setLastUpdateResult(result)

      // 업데이트 후 상태 새로고침
      if (result.success) {
        await refreshStatus()
      }
    } catch (error) {
      setLastUpdateResult({
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
        message: "업데이트 중 오류가 발생했습니다.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const refreshStatus = async () => {
    setIsLoadingStatus(true)
    try {
      const statusData = await checkDatabaseStatus()
      if (statusData?.success) {
        setStatus(statusData.data)
      }
    } catch (error) {
      console.error("상태 확인 실패:", error)
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "없음"
    return new Date(dateString).toLocaleString("ko-KR")
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>데이터베이스 관리</h1>
        <p>서울시 공공데이터 API를 통해 헬스장 정보를 최신화합니다.</p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>데이터베이스 상태</h2>
          <button
            onClick={refreshStatus}
            disabled={isLoadingStatus}
            className={styles.refreshButton}
          >
            {isLoadingStatus ? "새로고침 중..." : "새로고침"}
          </button>
        </div>

        {status ? (
          <div className={styles.statusGrid}>
            <div className={styles.statusCard}>
              <h3>총 헬스장 수</h3>
              <p className={styles.statusValue}>
                {status.totalGyms.toLocaleString()}개
              </p>
            </div>
            <div className={styles.statusCard}>
              <h3>마지막 업데이트</h3>
              <p className={styles.statusValue}>
                {formatDate(status.lastUpdated)}
              </p>
            </div>
            <div className={styles.statusCard}>
              <h3>데이터베이스 상태</h3>
              <p
                className={`${styles.statusValue} ${
                  styles[status.databaseStatus]
                }`}
              >
                {status.databaseStatus === "healthy" ? "정상" : "오류"}
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.noStatus}>
            <p>상태 정보를 불러오지 못했습니다.</p>
            <button onClick={refreshStatus} className={styles.primaryButton}>
              상태 확인
            </button>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>데이터베이스 최신화</h2>
        <div className={styles.updateInfo}>
          <p>
            서울시 공공데이터 API에서 최신 헬스장 정보를 가져와 데이터베이스를
            업데이트합니다.
          </p>
          <ul>
            <li>서울시 공공데이터 API 호출</li>
            <li>유효한 데이터 필터링</li>
            <li>기존 데이터 업데이트 또는 새 데이터 추가</li>
          </ul>
        </div>

        <button
          onClick={handleUpdateDatabase}
          disabled={isUpdating}
          className={`${styles.primaryButton} ${
            isUpdating ? styles.loading : ""
          }`}
        >
          {isUpdating ? "업데이트 중..." : "데이터베이스 최신화"}
        </button>

        {lastUpdateResult && (
          <div
            className={`${styles.resultCard} ${
              styles[lastUpdateResult.success ? "success" : "error"]
            }`}
          >
            <h3>
              {lastUpdateResult.success
                ? "✅ 업데이트 완료"
                : "❌ 업데이트 실패"}
            </h3>
            <p>{lastUpdateResult.message}</p>
            {lastUpdateResult.success && (
              <div className={styles.resultStats}>
                <p>
                  총 가져온 데이터:{" "}
                  {lastUpdateResult.totalFetched?.toLocaleString()}개
                </p>
                <p>
                  유효한 데이터: {lastUpdateResult.validCount?.toLocaleString()}
                  개
                </p>
              </div>
            )}
            {lastUpdateResult.error && (
              <p className={styles.errorMessage}>
                오류: {lastUpdateResult.error}
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>주의사항</h2>
        <div className={styles.warning}>
          <ul>
            <li>업데이트는 시간이 걸릴 수 있습니다 (1-2분 소요)</li>
            <li>업데이트 중에는 페이지를 새로고침하지 마세요</li>
            <li>기존 데이터는 보존되며, 새로운 정보로 업데이트됩니다</li>
            <li>API 호출 제한이 있을 수 있으니 과도한 사용을 피해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
