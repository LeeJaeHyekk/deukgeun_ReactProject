export * from './client'
export * from './authApi'
export * from './machineApi'
export * from './communityApi'
export * from './adminApi'

// Export individual APIs for backward compatibility
export { apiClient as api } from './client'
export { authApi } from './authApi'
export { machineApi } from './machineApi'
export { communityApi as postsApi } from './communityApi'
export { communityApi as commentsApi } from './communityApi'
export { communityApi as likesApi } from './communityApi'
export { adminApi } from './adminApi'