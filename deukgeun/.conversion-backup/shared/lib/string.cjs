// ============================================================================
// String utilities
// ============================================================================

const string
module.exports.string = string = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  // Capitalize all words
  capitalizeWords: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  },

  // Convert to camelCase
  toCamelCase: (str: string): string => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    }).replace(/\s+/g, '')
  },

  // Convert to kebab-case
  toKebabCase: (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  },

  // Convert to snake_case
  toSnakeCase: (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
  },

  // Convert to PascalCase
  toPascalCase: (str: string): string => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
      return word.toUpperCase()
    }).replace(/\s+/g, '')
  },

  // Truncate string with ellipsis
  truncate: (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str
    return str.substring(0, length - suffix.length) + suffix
  },

  // Remove HTML tags
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, '')
  },

  // Escape HTML
  escapeHtml: (str: string): string => {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  },

  // Unescape HTML
  unescapeHtml: (str: string): string => {
    const div = document.createElement('div')
    div.innerHTML = str
    return div.textContent || div.innerText || ''
  },

  // Generate random string
  random: (length = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // Generate slug from string
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // Check if string is empty
  isEmpty: (str: string): boolean => {
    return !str || str.trim().length === 0
  },

  // Check if string is not empty
  isNotEmpty: (str: string): boolean => {
    return !string.isEmpty(str)
  },

  // Remove extra whitespace
  normalizeWhitespace: (str: string): string => {
    return str.replace(/\s+/g, ' ').trim()
  },

  // Split string by delimiter and trim each part
  splitAndTrim: (str: string, delimiter: string): string[] => {
    return str.split(delimiter).map(part => part.trim()).filter(part => part.length > 0)
  },

  // Join array with delimiter
  join: (arr: string[], delimiter = ', '): string => {
    return arr.filter(item => item && item.trim().length > 0).join(delimiter)
  },

  // Check if string contains substring (case insensitive)
  contains: (str: string, substring: string): boolean => {
    return str.toLowerCase().includes(substring.toLowerCase())
  },

  // Check if string starts with substring (case insensitive)
  startsWith: (str: string, substring: string): boolean => {
    return str.toLowerCase().startsWith(substring.toLowerCase())
  },

  // Check if string ends with substring (case insensitive)
  endsWith: (str: string, substring: string): boolean => {
    return str.toLowerCase().endsWith(substring.toLowerCase())
  },

  // Replace all occurrences
  replaceAll: (str: string, search: string, replace: string): string => {
    return str.split(search).join(replace)
  },

  // Count occurrences of substring
  count: (str: string, substring: string): number => {
    return (str.match(new RegExp(substring, 'g')) || []).length
  },

  // Reverse string
  reverse: (str: string): string => {
    return str.split('').reverse().join('')
  },

  // Check if string is palindrome
  isPalindrome: (str: string): boolean => {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '')
    return cleaned === string.reverse(cleaned)
  },
}