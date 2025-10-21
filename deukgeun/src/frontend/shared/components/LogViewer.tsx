import React, { useState, useEffect } from 'react'
import { logger } from '../utils/logger'

interface LogViewerProps {
  isOpen: boolean
  onClose: () => void
}

export function LogViewer({ isOpen, onClose }: LogViewerProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('')
  const [category, setCategory] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setLogs(logger.getLogs())
    }
  }, [isOpen])

  const filteredLogs = logs.filter(log => {
    const matchesFilter = !filter || log.message.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = !category || log.category === category
    return matchesFilter && matchesCategory
  })

  const categories = [...new Set(logs.map(log => log.category))]

  const handleDownload = () => {
    logger.downloadLogs()
  }

  const handleClear = () => {
    logger.clearLogs()
    setLogs([])
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 9999,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>로그 뷰어</h2>
          <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
            닫기
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="로그 필터..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">모든 카테고리</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button onClick={handleDownload} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
            다운로드
          </button>
          <button onClick={handleClear} style={{ padding: '8px 16px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}>
            지우기
          </button>
        </div>

        <div style={{ maxHeight: '60vh', overflow: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: '8px',
                borderBottom: '1px solid #eee',
                fontSize: '12px',
                fontFamily: 'monospace',
                backgroundColor: log.level === 'error' ? '#ffebee' : 
                               log.level === 'warn' ? '#fff3e0' : 
                               log.level === 'info' ? '#e3f2fd' : '#f5f5f5'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>
                  [{log.timestamp}] [{log.level.toUpperCase()}] [{log.category}]
                </span>
              </div>
              <div style={{ marginBottom: '4px' }}>{log.message}</div>
              {log.data && (
                <div style={{ color: '#666', fontSize: '11px' }}>
                  {JSON.stringify(log.data, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
