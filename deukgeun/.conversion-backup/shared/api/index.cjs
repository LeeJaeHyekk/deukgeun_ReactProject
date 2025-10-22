Object.assign(module.exports, require('./client'))
Object.assign(module.exports, require('./authApi'))
Object.assign(module.exports, require('./machineApi'))
Object.assign(module.exports, require('./communityApi'))
Object.assign(module.exports, require('./adminApi'))

// Export individual APIs for backward compatibility
module.exports.api = apiClient from './client'
module.exports.authApi = authApi from './authApi'
module.exports.machineApi = machineApi from './machineApi'
module.exports.postsApi = communityApi from './communityApi'
module.exports.commentsApi = communityApi from './communityApi'
module.exports.likesApi = communityApi from './communityApi'
module.exports.adminApi = adminApi from './adminApi'