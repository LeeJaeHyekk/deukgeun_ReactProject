// ============================================================================
// 스토리지 관련 유틸리티 함수들
// ============================================================================

// 스토리지 타입

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      keys.push(key.substring(prefix!.length))
    }
  }
  
  return keys
}

// 스토리지 전체 삭제
function clearStorage
module.exports.clearStorage = clearStorage(options: StorageOptions = {}): void {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  
  const keysToRemove: string[] = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    try {
      storage.removeItem(key)
    } catch (error) {
      console.error("스토리지 삭제 실패:", error)
    }
  })
}

// 스토리지 사용량 확인
function getStorageSize
module.exports.getStorageSize = getStorageSize(options: StorageOptions = {}): number {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  let size = 0
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      const value = storage.getItem(key)
      if (value) {
        size += key.length + value.length
      }
    }
  }
  
  return size
}

// 만료된 스토리지 아이템 정리
function cleanupExpiredStorage
module.exports.cleanupExpiredStorage = cleanupExpiredStorage(options: StorageOptions = {}): void {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const keysToRemove: string[] = []
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      try {
        const item = storage.getItem(key)
        if (item) {
          const parsedItem: StorageItem = JSON.parse(item)
          if (parsedItem.ttl && Date.now() - parsedItem.timestamp > parsedItem.ttl) {
            keysToRemove.push(key)
          }
        }
      } catch (error) {
        // 잘못된 JSON 형식이면 삭제
        keysToRemove.push(key)
      }
    }
  }
  
  keysToRemove.forEach(key => {
    try {
      storage.removeItem(key)
    } catch (error) {
      console.error("스토리지 삭제 실패:", error)
    }
  })
}

// 스토리지 변경 이벤트 리스너
function addStorageListener
module.exports.addStorageListener = addStorageListener(
  callback: (event: StorageEvent) => void,
  options: StorageOptions = {}
): void {
  const { prefix } = { ...DEFAULT_OPTIONS, ...options }
  
  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith(prefix!)) {
      callback(event)
    }
  })
}

// 스토리지 변경 이벤트 리스너 제거
function removeStorageListener
module.exports.removeStorageListener = removeStorageListener(
  callback: (event: StorageEvent) => void
): void {
  window.removeEventListener("storage", callback)
}

// 스토리지 백업
function backupStorage
module.exports.backupStorage = backupStorage(options: StorageOptions = {}): Record<string, unknown> {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const backup: Record<string, unknown> = {}
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      try {
        const value = storage.getItem(key)
        if (value) {
          const parsedItem: StorageItem = JSON.parse(value)
          backup[key.substring(prefix!.length)] = parsedItem.value
        }
      } catch (error) {
        console.error("스토리지 백업 실패:", error)
      }
    }
  }
  
  return backup
}

// 스토리지 복원
function restoreStorage
module.exports.restoreStorage = restoreStorage(
  backup: Record<string, unknown>,
  options: StorageOptions = {}
): void {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  
  Object.entries(backup).forEach(([key, value]) => {
    setStorageItem(key, value, options)
  })
}

// 스토리지 마이그레이션
function migrateStorage
module.exports.migrateStorage = migrateStorage(
  oldPrefix: string,
  newPrefix: string,
  options: StorageOptions = {}
): void {
  const { type } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const keysToMigrate: Array<{ oldKey: string; newKey: string; value: string }> = []
  
  // 마이그레이션할 키들 찾기
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(oldPrefix)) {
      const value = storage.getItem(key)
      if (value) {
        const newKey = key.replace(oldPrefix, newPrefix)
        keysToMigrate.push({ oldKey: key, newKey, value })
      }
    }
  }
  
  // 마이그레이션 실행
  keysToMigrate.forEach(({ oldKey, newKey, value }) => {
    try {
      storage.setItem(newKey, value)
      storage.removeItem(oldKey)
    } catch (error) {
      console.error("스토리지 마이그레이션 실패:", error)
    }
  })
}

// 스토리지 통계
function getStorageStats
module.exports.getStorageStats = getStorageStats(options: StorageOptions = {}): {
  totalItems: number
  totalSize: number
  expiredItems: number
  validItems: number
} {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  let totalItems = 0
  let totalSize = 0
  let expiredItems = 0
  let validItems = 0
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      totalItems++
      const value = storage.getItem(key)
      if (value) {
        totalSize += key.length + value.length
        
        try {
          const parsedItem: StorageItem = JSON.parse(value)
          if (parsedItem.ttl && Date.now() - parsedItem.timestamp > parsedItem.ttl) {
            expiredItems++
          } else {
            validItems++
          }
        } catch (error) {
          expiredItems++
        }
      }
    }
  }
  
  return {
    totalItems,
    totalSize,
    expiredItems,
    validItems
  }
}

// 스토리지 압축 (큰 값들을 정리)
function compressStorage
module.exports.compressStorage = compressStorage(
  maxSize: number,
  options: StorageOptions = {}
): void {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const items: Array<{ key: string; size: number; timestamp: number }> = []
  
  // 모든 아이템 수집
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      const value = storage.getItem(key)
      if (value) {
        try {
          const parsedItem: StorageItem = JSON.parse(value)
          items.push({
            key,
            size: key.length + value.length,
            timestamp: parsedItem.timestamp
          })
        } catch (error) {
          // 잘못된 아이템은 삭제
          storage.removeItem(key)
        }
      }
    }
  }
  
  // 크기 순으로 정렬
  items.sort((a, b) => b.size - a.size)
  
  // 큰 아이템들부터 삭제
  let currentSize = getStorageSize(options)
  for (const item of items) {
    if (currentSize <= maxSize) break
    
    storage.removeItem(item.key)
    currentSize -= item.size
  }
}

// 스토리지 암호화 (간단한 Base64 인코딩)
function encryptStorageValue
module.exports.encryptStorageValue = encryptStorageValue(value: unknown): string {
  return btoa(JSON.stringify(value))
}

// 스토리지 복호화
function decryptStorageValue
module.exports.decryptStorageValue = decryptStorageValue(encryptedValue: string): unknown {
  try {
    return JSON.parse(atob(encryptedValue))
  } catch (error) {
    console.error("스토리지 복호화 실패:", error)
    return null
  }
}

// 암호화된 스토리지에 값 저장
function setEncryptedStorageItem
module.exports.setEncryptedStorageItem = setEncryptedStorageItem<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): void {
  const encryptedValue = encryptStorageValue(value)
  setStorageItem(key, encryptedValue, options)
}

// 암호화된 스토리지에서 값 가져오기
function getEncryptedStorageItem
module.exports.getEncryptedStorageItem = getEncryptedStorageItem<T>(
  key: string,
  options: StorageOptions = {}
): T | null {
  const encryptedValue = getStorageItem<string>(key, options)
  if (!encryptedValue) return null
  
  const decryptedValue = decryptStorageValue(encryptedValue)
  return decryptedValue as T
}