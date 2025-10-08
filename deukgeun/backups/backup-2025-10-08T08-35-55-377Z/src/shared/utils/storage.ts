// ============================================================================
// 스토리지 관련 유틸리티 함수들
// ============================================================================

// 스토리지 타입
export type StorageType = "localStorage" | "sessionStorage"

// 스토리지 옵션
export interface StorageOptions {
  type?: StorageType
  prefix?: string
  ttl?: number // Time to live in milliseconds
}

// 스토리지 아이템
export interface StorageItem<T = unknown> {
  value: T
  timestamp: number
  ttl?: number
}

// 기본 스토리지 옵션
const DEFAULT_OPTIONS: StorageOptions = {
  type: "localStorage",
  prefix: "app_",
  ttl: undefined
}

// 스토리지 인스턴스 가져오기
function getStorage(type: StorageType): Storage {
  return type === "localStorage" ? localStorage : sessionStorage
}

// 키 생성
function createKey(key: string, prefix: string): string {
  return `${prefix}${key}`
}

// 스토리지에 값 저장
export function setStorageItem<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): void {
  const { type, prefix, ttl } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const storageKey = createKey(key, prefix!)
  
  const item: StorageItem<T> = {
    value,
    timestamp: Date.now(),
    ttl
  }
  
  try {
    storage.setItem(storageKey, JSON.stringify(item))
  } catch (error) {
    console.error("스토리지 저장 실패:", error)
  }
}

// 스토리지에서 값 가져오기
export function getStorageItem<T>(
  key: string,
  options: StorageOptions = {}
): T | null {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const storageKey = createKey(key, prefix!)
  
  try {
    const item = storage.getItem(storageKey)
    if (!item) return null
    
    const parsedItem: StorageItem<T> = JSON.parse(item)
    
    // TTL 확인
    if (parsedItem.ttl && Date.now() - parsedItem.timestamp > parsedItem.ttl) {
      removeStorageItem(key, options)
      return null
    }
    
    return parsedItem.value
  } catch (error) {
    console.error("스토리지 읽기 실패:", error)
    return null
  }
}

// 스토리지에서 값 제거
export function removeStorageItem(key: string, options: StorageOptions = {}): void {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const storageKey = createKey(key, prefix!)
  
  try {
    storage.removeItem(storageKey)
  } catch (error) {
    console.error("스토리지 삭제 실패:", error)
  }
}

// 스토리지에 값이 존재하는지 확인
export function hasStorageItem(key: string, options: StorageOptions = {}): boolean {
  return getStorageItem(key, options) !== null
}

// 스토리지 키 목록 가져오기
export function getStorageKeys(options: StorageOptions = {}): string[] {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage(type!)
  const keys: string[] = []
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && key.startsWith(prefix!)) {
      keys.push(key.substring(prefix!.length))
    }
  }
  
  return keys
}

// 스토리지 전체 삭제
export function clearStorage(options: StorageOptions = {}): void {
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
export function getStorageSize(options: StorageOptions = {}): number {
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
export function cleanupExpiredStorage(options: StorageOptions = {}): void {
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
export function addStorageListener(
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
export function removeStorageListener(
  callback: (event: StorageEvent) => void
): void {
  window.removeEventListener("storage", callback)
}

// 스토리지 백업
export function backupStorage(options: StorageOptions = {}): Record<string, unknown> {
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
export function restoreStorage(
  backup: Record<string, unknown>,
  options: StorageOptions = {}
): void {
  const { type, prefix } = { ...DEFAULT_OPTIONS, ...options }
  
  Object.entries(backup).forEach(([key, value]) => {
    setStorageItem(key, value, options)
  })
}

// 스토리지 마이그레이션
export function migrateStorage(
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
export function getStorageStats(options: StorageOptions = {}): {
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
export function compressStorage(
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
export function encryptStorageValue(value: unknown): string {
  return btoa(JSON.stringify(value))
}

// 스토리지 복호화
export function decryptStorageValue(encryptedValue: string): unknown {
  try {
    return JSON.parse(atob(encryptedValue))
  } catch (error) {
    console.error("스토리지 복호화 실패:", error)
    return null
  }
}

// 암호화된 스토리지에 값 저장
export function setEncryptedStorageItem<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): void {
  const encryptedValue = encryptStorageValue(value)
  setStorageItem(key, encryptedValue, options)
}

// 암호화된 스토리지에서 값 가져오기
export function getEncryptedStorageItem<T>(
  key: string,
  options: StorageOptions = {}
): T | null {
  const encryptedValue = getStorageItem<string>(key, options)
  if (!encryptedValue) return null
  
  const decryptedValue = decryptStorageValue(encryptedValue)
  return decryptedValue as T
}
