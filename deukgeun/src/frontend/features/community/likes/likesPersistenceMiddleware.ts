import { Middleware } from '@reduxjs/toolkit'

export const likesPersistenceMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  const result = next(action)
  const actionsToPersist = ['likes/addLike', 'likes/removeLike', 'likes/setLikedIds']
  
  if (actionsToPersist.includes(action.type)) {
    const state = storeAPI.getState() as any
    try {
      localStorage.setItem('likedIds', JSON.stringify(state.likes.likedIds || []))
      console.log('💾 [likesPersistenceMiddleware] 로컬 스토리지 저장:', state.likes.likedIds)
    } catch (e) {
      console.error('💾 [likesPersistenceMiddleware] 로컬 스토리지 저장 실패:', e)
    }
  }
  
  return result
}
