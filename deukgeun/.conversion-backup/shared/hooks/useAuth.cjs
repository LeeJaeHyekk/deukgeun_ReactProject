const { useAuthContext  } = require('../contexts/AuthContext')

function useAuth() {
  return useAuthContext()
}

module.exports = useAuth