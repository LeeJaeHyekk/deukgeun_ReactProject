// 프론트엔드 전용 Toast 유틸리티

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // 간단한 toast 구현 (실제로는 toast 라이브러리 사용 권장)
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
  `
  
  document.body.appendChild(toast)
  
  // 3초 후 자동 제거
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}
