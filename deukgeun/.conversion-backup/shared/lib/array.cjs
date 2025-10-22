// ============================================================================
// Array utilities
// ============================================================================

const array
module.exports.array = array = {
  // Remove duplicates from array
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)]
  },

  // Remove duplicates by key
  uniqueBy: <T, K>(arr: T[], keyFn: (item: T) => K): T[] => {
    const seen = new Set<K>()
    return arr.filter(item => {
      const key = keyFn(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  },

  // Group array by key
  groupBy: <T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Record<K, T[]> => {
    return arr.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {} as Record<K, T[]>)
  },

  // Sort array by key
  sortBy: <T, K>(arr: T[], keyFn: (item: T) => K, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...arr].sort((a, b) => {
      const aVal = keyFn(a)
      const bVal = keyFn(b)
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  },

  // Find item by key
  findBy: <T, K>(arr: T[], keyFn: (item: T) => K, value: K): T | undefined => {
    return arr.find(item => keyFn(item) === value)
  },

  // Find index by key
  findIndexBy: <T, K>(arr: T[], keyFn: (item: T) => K, value: K): number => {
    return arr.findIndex(item => keyFn(item) === value)
  },

  // Filter array by key
  filterBy: <T, K>(arr: T[], keyFn: (item: T) => K, value: K): T[] => {
    return arr.filter(item => keyFn(item) === value)
  },

  // Chunk array into smaller arrays
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  },

  // Flatten nested arrays
  flatten: <T>(arr: (T | T[])[]): T[] => {
    return arr.reduce<T[]>((flat, item) => {
      return flat.concat(Array.isArray(item) ? array.flatten(item) : item)
    }, [])
  },

  // Get random item from array
  random: <T>(arr: T[]): T | undefined => {
    if (arr.length === 0) return undefined
    return arr[Math.floor(Math.random() * arr.length)]
  },

  // Get random items from array
  randomItems: <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  },

  // Shuffle array
  shuffle: <T>(arr: T[]): T[] => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

  // Get intersection of two arrays
  intersection: <T>(arr1: T[], arr2: T[]): T[] => {
    return arr1.filter(item => arr2.includes(item))
  },

  // Get union of two arrays
  union: <T>(arr1: T[], arr2: T[]): T[] => {
    return array.unique([...arr1, ...arr2])
  },

  // Get difference of two arrays
  difference: <T>(arr1: T[], arr2: T[]): T[] => {
    return arr1.filter(item => !arr2.includes(item))
  },

  // Check if array is empty
  isEmpty: <T>(arr: T[]): boolean => {
    return arr.length === 0
  },

  // Check if array is not empty
  isNotEmpty: <T>(arr: T[]): boolean => {
    return arr.length > 0
  },

  // Get first item
  first: <T>(arr: T[]): T | undefined => {
    return arr[0]
  },

  // Get last item
  last: <T>(arr: T[]): T | undefined => {
    return arr[arr.length - 1]
  },

  // Get items at specific indices
  at: <T>(arr: T[], indices: number[]): T[] => {
    return indices.map(index => arr[index]).filter(item => item !== undefined)
  },

  // Remove item by index
  removeAt: <T>(arr: T[], index: number): T[] => {
    if (index < 0 || index >= arr.length) return arr
    return [...arr.slice(0, index), ...arr.slice(index + 1)]
  },

  // Remove item by value
  remove: <T>(arr: T[], value: T): T[] => {
    return arr.filter(item => item !== value)
  },

  // Insert item at index
  insert: <T>(arr: T[], index: number, item: T): T[] => {
    if (index < 0) return [item, ...arr]
    if (index >= arr.length) return [...arr, item]
    return [...arr.slice(0, index), item, ...arr.slice(index)]
  },

  // Move item from one index to another
  move: <T>(arr: T[], fromIndex: number, toIndex: number): T[] => {
    if (fromIndex < 0 || fromIndex >= arr.length) return arr
    if (toIndex < 0 || toIndex >= arr.length) return arr
    
    const item = arr[fromIndex]
    const newArr = array.removeAt(arr, fromIndex)
    return array.insert(newArr, toIndex, item)
  },

  // Sum array of numbers
  sum: (arr: number[]): number => {
    return arr.reduce((sum, num) => sum + num, 0)
  },

  // Average of array of numbers
  average: (arr: number[]): number => {
    if (arr.length === 0) return 0
    return array.sum(arr) / arr.length
  },

  // Min value in array
  min: (arr: number[]): number | undefined => {
    if (arr.length === 0) return undefined
    return Math.min(...arr)
  },

  // Max value in array
  max: (arr: number[]): number | undefined => {
    if (arr.length === 0) return undefined
    return Math.max(...arr)
  },

  // Count occurrences of value
  count: <T>(arr: T[], value: T): number => {
    return arr.filter(item => item === value).length
  },

  // Count by key
  countBy: <T, K>(arr: T[], keyFn: (item: T) => K): Record<string, number> => {
    return arr.reduce((counts, item) => {
      const key = String(keyFn(item))
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  },
}