const { useAuthContext  } = require('@shared/contexts/AuthContext')

function useAuth() {
  return useAuthContext()
}
