// ============================================================================
// Storage utilities
// ============================================================================

const storage
module.exports.storage = storage = {
  // Local Storage utilities
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error getting from localStorage:', error)
      return null
    }
  },

  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Error setting to localStorage:', error)
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },

  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  // JSON utilities
  getJSON: <T>(key: string): T | null => {
    try {
      const item = storage.get(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error parsing JSON from localStorage:', error)
      return null
    }
  },

  setJSON: <T>(key: string, value: T): void => {
    try {
      storage.set(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error stringifying JSON to localStorage:', error)
    }
  },

  // Session Storage utilities
  session: {
    get: (key: string): string | null => {
      try {
        return sessionStorage.getItem(key)
      } catch (error) {
        console.error('Error getting from sessionStorage:', error)
        return null
      }
    },

    set: (key: string, value: string): void => {
      try {
        sessionStorage.setItem(key, value)
      } catch (error) {
        console.error('Error setting to sessionStorage:', error)
      }
    },

    remove: (key: string): void => {
      try {
        sessionStorage.removeItem(key)
      } catch (error) {
        console.error('Error removing from sessionStorage:', error)
      }
    },

    clear: (): void => {
      try {
        sessionStorage.clear()
      } catch (error) {
        console.error('Error clearing sessionStorage:', error)
      }
    },

    getJSON: <T>(key: string): T | null => {
      try {
        const item = storage.session.get(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error('Error parsing JSON from sessionStorage:', error)
        return null
      }
    },

    setJSON: <T>(key: string, value: T): void => {
      try {
        storage.session.set(key, JSON.stringify(value))
      } catch (error) {
        console.error('Error stringifying JSON to sessionStorage:', error)
      }
    },
  },
}