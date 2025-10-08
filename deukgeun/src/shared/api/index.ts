export * from './client'
export * from './authApi'
export * from './machineApi'
export * from './communityApi'
export * from './adminApi'

// Export individual APIs for backward compatibility
module.exports.api = apiClient from './client'
module.exports.authApi = authApi from './authApi'
module.exports.machineApi = machineApi from './machineApi'
module.exports.postsApi = communityApi
module.exports.commentsApi = communityApi
module.exports.likesApi = communityApi from './communityApi'
module.exports.adminApi = adminApi from './adminApi'