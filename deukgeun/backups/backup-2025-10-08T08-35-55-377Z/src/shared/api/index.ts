export * from './client'
export * from './authApi'
export * from './machineApi'
export * from './communityApi'
export * from './adminApi'

// Export individual APIs for backward compatibility
export { apiClient as api } from './client'
export { authApi } from './authApi'
export { machineApi } from './machineApi'
export { communityApi as postsApi, communityApi as commentsApi, communityApi as likesApi } from './communityApi'
export { adminApi } from './adminApi'