import { MapPin, Dumbbell, Users, BarChart3 } from 'lucide-react'
import styles from '../HomePage.module.css'

/**
 * 게스트 섹션 컴포넌트
 */
export const GuestSection = () => {
  const guestServices = [
    {
      icon: MapPin,
      title: '내 주변 헬스장 찾기',
      description: '가까운 헬스장을 쉽게 찾고 정보를 확인하세요'
    },
    {
      icon: Dumbbell,
      title: '운동 기구 가이드',
      description: '헬스장의 모든 기구 사용법을 배우세요'
    },
    {
      icon: Users,
      title: '커뮤니티 참여',
      description: '다른 운동인들과 소통하고 정보를 공유하세요'
    },
    {
      icon: BarChart3,
      title: '운동 기록 관리',
      description: '나의 운동을 체계적으로 기록하고 관리하세요'
    }
  ]

  return (
    <div className={styles.guestSection}>
      <div className={styles.guestHeader}>
        <h2>운동을 기록하고 습관화 해보세요</h2>
        <p>헬스장 찾기부터 운동 기록까지, 모든 것을 한 곳에서</p>
      </div>
      <div className={styles.guestGrid}>
        {guestServices.map((service, index) => {
          const IconComponent = service.icon
          return (
            <div key={index} className={styles.guestCard}>
              <div className={styles.guestIcon}>
                <IconComponent size={32} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
