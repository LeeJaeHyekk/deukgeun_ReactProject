import { Users, MapPin, MessageCircle, Trophy } from 'lucide-react'
import styles from '../HomePage.module.css'
import { formatNumber } from '../utils'
import type { Stats } from '../types'

interface StatsSectionProps {
  stats: Stats
  isLoading: boolean
}

/**
 * 통계 섹션 컴포넌트
 */
export const StatsSection = ({ stats, isLoading }: StatsSectionProps) => {
  return (
    <div className={styles.statsSection}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>
              {isLoading ? '...' : formatNumber(stats.activeUsers)}
            </h3>
            <p>활성 사용자</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MapPin size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>
              {isLoading ? '...' : formatNumber(stats.totalGyms)}
            </h3>
            <p>등록된 헬스장</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MessageCircle size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>
              {isLoading ? '...' : formatNumber(stats.totalPosts)}
            </h3>
            <p>커뮤니티 게시글</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Trophy size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>
              {isLoading ? '...' : formatNumber(stats.achievements)}
            </h3>
            <p>달성된 업적</p>
          </div>
        </div>
      </div>
    </div>
  )
}
