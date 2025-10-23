import React from 'react'
import styles from './GymDetailView.module.css'
import { formatPhoneNumber } from '../../utils/phoneFormatter'
import { formatDistance } from '../../utils/distanceUtils'
import { Gym } from '../../types'

interface GymDetailViewProps {
  gym: Gym
  onClose: () => void
}

export const GymDetailView: React.FC<GymDetailViewProps> = ({ gym, onClose }) => {
  const getDistanceDisplay = (gym: Gym): string => {
    if (gym.distance !== undefined) {
      return formatDistance(gym.distance)
    }
    return '거리 정보 없음'
  }

  return (
    <div className={styles.viewDetailView}>
      <div className={styles.viewDetailHeader}>
        <h3>{gym.name}</h3>
        <button 
          className={styles.viewDetailCloseButton}
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      
      <div className={styles.viewDetailContent}>
        <div className={styles.viewDetailInfo}>
          {/* 기본 정보 섹션 */}
          <div className={styles.viewDetailBasicInfo}>
            <h4 className={styles.viewDetailName}>{gym.name}</h4>
            <div className={styles.viewDetailAddress}>
              <span className={styles.viewDetailLabel}>📍 주소</span>
              <span className={styles.viewDetailValue}>{gym.address}</span>
            </div>
            {gym.phone && (
              <div className={styles.viewDetailPhone}>
                <span className={styles.viewDetailLabel}>📞 전화</span>
                <span className={styles.viewDetailValue}>{formatPhoneNumber(gym.phone)}</span>
              </div>
            )}
            <div className={styles.viewDetailDistance}>
              <span className={styles.viewDetailLabel}>🚶 거리</span>
              <span className={styles.viewDetailValue}>{getDistanceDisplay(gym)}</span>
            </div>
          </div>
          
          {/* 시설 정보 섹션 */}
          <div className={styles.viewDetailFacilities}>
            <h4 className={styles.viewDetailSectionTitle}>🏋️ 시설 정보</h4>
            <div className={styles.viewDetailFacilityTags}>
              {gym.hasPT && <span className={styles.viewDetailTag}>💪 PT</span>}
              {gym.hasGX && <span className={styles.viewDetailTag}>🎵 GX</span>}
              {gym.is24Hours && <span className={styles.viewDetailTag}>🕒 24시간</span>}
              {gym.hasParking && <span className={styles.viewDetailTag}>🚗 주차</span>}
              {gym.hasShower && <span className={styles.viewDetailTag}>🚿 샤워</span>}
            </div>
          </div>
          
          {/* 추가 정보 섹션 */}
          <div className={styles.viewDetailAdditionalInfo}>
            <h4 className={styles.viewDetailSectionTitle}>📋 상세 정보</h4>
            
            <div className={styles.viewDetailInfoGrid}>
              <div className={styles.viewDetailInfoItem}>
                <span className={styles.viewDetailLabel}>💰 가격</span>
                <span className={styles.viewDetailValue}>{gym.price || '문의'}</span>
              </div>
              
              <div className={styles.viewDetailInfoItem}>
                <span className={styles.viewDetailLabel}>⭐ 평점</span>
                <span className={styles.viewDetailValue}>
                  {gym.rating ? `${gym.rating.toFixed(1)}/5.0` : '정보 없음'}
                  {gym.reviewCount && <span className={styles.viewDetailReviewCount}>({gym.reviewCount}개 리뷰)</span>}
                </span>
              </div>
              
              <div className={styles.viewDetailInfoItem}>
                <span className={styles.viewDetailLabel}>🏢 유형</span>
                <span className={styles.viewDetailValue}>{gym.type || '피트니스'}</span>
              </div>
              
              <div className={styles.viewDetailInfoItem}>
                <span className={styles.viewDetailLabel}>🕐 운영시간</span>
                <span className={styles.viewDetailValue}>{gym.is24Hours ? '24시간 운영' : '06:00-22:00'}</span>
              </div>
              
              <div className={styles.viewDetailInfoItem}>
                <span className={styles.viewDetailLabel}>📍 좌표</span>
                <span className={styles.viewDetailValue}>
                  {gym.latitude?.toFixed(6)}, {gym.longitude?.toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
