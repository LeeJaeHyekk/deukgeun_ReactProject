// ============================================================================
// 인증 훅
// ============================================================================

import { useAuth as useAuthContext } from "../contexts/AuthContext.js"

export function useAuth() {
  return useAuthContext()
}
