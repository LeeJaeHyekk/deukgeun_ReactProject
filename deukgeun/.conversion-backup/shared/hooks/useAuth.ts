import { useAuthContext } from '@shared/contexts/AuthContext'

function useAuth() {
  return useAuthContext()
}

export default useAuth
