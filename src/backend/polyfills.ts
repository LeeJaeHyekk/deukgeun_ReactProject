// Browser API polyfills for Node.js backend environment

// Global polyfills
if (typeof global !== 'undefined') {
  // File API polyfill
  if (typeof global.File === 'undefined') {
    global.File = class File {
      name: string
      size: number
      type: string
      lastModified: number
      
      constructor(
        fileBits: BlobPart[],
        fileName: string,
        options?: FilePropertyBag
      ) {
        this.name = fileName
        this.size = 0
        this.type = options?.type || ''
        this.lastModified = options?.lastModified || Date.now()
      }
    } as any
  }

  // HeadersInit polyfill
  if (typeof global.HeadersInit === 'undefined') {
    global.HeadersInit = Object as any
  }

  // Storage polyfills
  if (typeof global.localStorage === 'undefined') {
    const storage = new Map<string, string>()
    global.localStorage = {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      length: storage.size,
      key: (index: number) => Array.from(storage.keys())[index] || null
    } as any
  }

  if (typeof global.sessionStorage === 'undefined') {
    const storage = new Map<string, string>()
    global.sessionStorage = {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      length: storage.size,
      key: (index: number) => Array.from(storage.keys())[index] || null
    } as any
  }

  // StorageEvent polyfill
  if (typeof global.StorageEvent === 'undefined') {
    global.StorageEvent = class StorageEvent extends Event {
      key: string | null
      newValue: string | null
      oldValue: string | null
      storageArea: Storage | null
      url: string

      constructor(type: string, eventInitDict?: StorageEventInit) {
        super(type, eventInitDict)
        this.key = eventInitDict?.key || null
        this.newValue = eventInitDict?.newValue || null
        this.oldValue = eventInitDict?.oldValue || null
        this.storageArea = eventInitDict?.storageArea || null
        this.url = eventInitDict?.url || ''
      }
    } as any
  }

  // Window polyfill
  if (typeof global.window === 'undefined') {
    global.window = {
      localStorage: global.localStorage,
      sessionStorage: global.sessionStorage,
      addEventListener: () => {},
      removeEventListener: () => {},
      onRecaptchaLoad: undefined,
      grecaptcha: undefined
    } as any
  }

  // Document polyfill
  if (typeof global.document === 'undefined') {
    global.document = {
      createElement: (tagName: string) => ({
        addEventListener: () => {},
        removeEventListener: () => {},
        appendChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        style: {}
      }),
      head: {
        appendChild: () => {}
      },
      body: {
        style: {},
        appendChild: () => {}
      },
      addEventListener: () => {},
      removeEventListener: () => {}
    } as any
  }

  // RequestAnimationFrame polyfill
  if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(callback, 16) as any
    }
  }

  // Storage type polyfill
  if (typeof global.Storage === 'undefined') {
    global.Storage = class Storage {
      getItem(key: string): string | null { return null }
      setItem(key: string, value: string): void {}
      removeItem(key: string): void {}
      clear(): void {}
      get length(): number { return 0 }
      key(index: number): string | null { return null }
    } as any
  }
}

// Export for module usage
export {}
