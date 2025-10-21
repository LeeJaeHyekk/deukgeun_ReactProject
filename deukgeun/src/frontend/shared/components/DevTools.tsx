import React, { useState } from 'react'
import { LogViewer } from './LogViewer'
import { logger } from '../utils/logger'

export function DevTools() {
  const [showLogViewer, setShowLogViewer] = useState(false)

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowLogViewer(true)}
          style={{
            padding: '10px 15px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          📋 로그 보기
        </button>
        
        <button
          onClick={() => logger.downloadLogs()}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          💾 로그 다운로드
        </button>
      </div>

      <LogViewer 
        isOpen={showLogViewer} 
        onClose={() => setShowLogViewer(false)} 
      />
    </>
  )
}
