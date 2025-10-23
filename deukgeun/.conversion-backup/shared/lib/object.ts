// ============================================================================
// Object utilities
// ============================================================================

export const object = {
  // Deep clone object
  clone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (obj instanceof Array) return obj.map(item => object.clone(item)) as unknown as T
    if (typeof obj === 'object') {
      const cloned = {} as T
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = object.clone(obj[key])
        }
      }
      return cloned
    }
    return obj
  },

  // Deep merge objects
  merge: <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target
    const source = sources.shift()
    
    if (object.isObject(target) && object.isObject(source)) {
      for (const key in source) {
        if (object.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          object.merge(target[key] as any, source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
    
    return object.merge(target, ...sources)
  },

  // Check if value is object
  isObject: (value: any): value is Record<string, any> => {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  },

  // Get nested property value
  get: <T>(obj: Record<string, any>, path: string, defaultValue?: T): T | undefined => {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result === null || result === undefined || !object.isObject(result)) {
        return defaultValue
      }
      result = result[key]
    }
    
    return result !== undefined ? (result as T) : defaultValue
  },

  // Set nested property value
  set: <T>(obj: Record<string, any>, path: string, value: T): void => {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!object.isObject(current[key])) {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  },

  // Pick specific properties from object
  pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key]
      }
    }
    return result
  },

  // Omit specific properties from object
  omit: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj }
    for (const key of keys) {
      delete result[key]
    }
    return result
  },

  // Get object keys
  keys: <T extends Record<string, any>>(obj: T): (keyof T)[] => {
    return Object.keys(obj) as (keyof T)[]
  },

  // Get object values
  values: <T extends Record<string, any>>(obj: T): T[keyof T][] => {
    return Object.values(obj)
  },

  // Get object entries
  entries: <T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] => {
    return Object.entries(obj) as [keyof T, T[keyof T]][]
  },

  // Check if object is empty
  isEmpty: (obj: Record<string, any>): boolean => {
    return Object.keys(obj).length === 0
  },

  // Check if object is not empty
  isNotEmpty: (obj: Record<string, any>): boolean => {
    return Object.keys(obj).length > 0
  },

  // Check if object has property
  has: (obj: Record<string, any>, key: string): boolean => {
    return Object.prototype.hasOwnProperty.call(obj, key)
  },

  // Check if object has nested property
  hasPath: (obj: Record<string, any>, path: string): boolean => {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (!object.isObject(current) || !object.has(current, key)) {
        return false
      }
      current = current[key]
    }
    
    return true
  },

  // Remove undefined values from object
  compact: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result = {} as Partial<T>
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key]
      }
    }
    return result
  },

  // Remove null values from object
  compactNull: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result = {} as Partial<T>
    for (const key in obj) {
      if (obj[key] !== null) {
        result[key] = obj[key]
      }
    }
    return result
  },

  // Remove falsy values from object
  compactFalsy: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result = {} as Partial<T>
    for (const key in obj) {
      if (obj[key]) {
        result[key] = obj[key]
      }
    }
    return result
  },

  // Transform object keys
  transformKeys: <T extends Record<string, any>>(
    obj: T,
    transformFn: (key: string) => string
  ): Record<string, any> => {
    const result: Record<string, any> = {}
    for (const key in obj) {
      result[transformFn(key)] = obj[key]
    }
    return result
  },

  // Transform object values
  transformValues: <T extends Record<string, any>, U>(
    obj: T,
    transformFn: (value: T[keyof T], key: keyof T) => U
  ): Record<keyof T, U> => {
    const result = {} as Record<keyof T, U>
    for (const key in obj) {
      result[key] = transformFn(obj[key], key)
    }
    return result
  },

  // Filter object by predicate
  filter: <T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): Partial<T> => {
    const result = {} as Partial<T>
    for (const key in obj) {
      if (predicate(obj[key], key)) {
        result[key] = obj[key]
      }
    }
    return result
  },

  // Map object to array
  map: <T extends Record<string, any>, U>(
    obj: T,
    mapFn: (value: T[keyof T], key: keyof T) => U
  ): U[] => {
    const result: U[] = []
    for (const key in obj) {
      result.push(mapFn(obj[key], key))
    }
    return result
  },

  // Reduce object
  reduce: <T extends Record<string, any>, U>(
    obj: T,
    reducer: (acc: U, value: T[keyof T], key: keyof T) => U,
    initialValue: U
  ): U => {
    let result = initialValue
    for (const key in obj) {
      result = reducer(result, obj[key], key)
    }
    return result
  },

  // Check if two objects are equal (shallow)
  isEqual: (obj1: Record<string, any>, obj2: Record<string, any>): boolean => {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    
    if (keys1.length !== keys2.length) return false
    
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) return false
    }
    
    return true
  },

  // Check if two objects are equal (deep)
  isDeepEqual: (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true
    if (obj1 == null || obj2 == null) return false
    if (typeof obj1 !== typeof obj2) return false
    
    if (object.isObject(obj1) && object.isObject(obj2)) {
      const keys1 = Object.keys(obj1)
      const keys2 = Object.keys(obj2)
      
      if (keys1.length !== keys2.length) return false
      
      for (const key of keys1) {
        if (!object.isDeepEqual(obj1[key], obj2[key])) return false
      }
      
      return true
    }
    
    return false
  },
}
