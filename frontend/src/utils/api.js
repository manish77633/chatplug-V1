import axios from 'axios'
import toast from 'react-hot-toast'

// VITE_API_URL should be the backend origin (e.g. "http://localhost:5000")
// The /api prefix is appended automatically so all calls match server routes
const origin = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: origin ? `${origin}/api` : '/api',
  timeout: 30000,
})

// Auto-attach token — reads from direct 'token' key (set by authStore)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const msg = err.response?.data?.message

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    } else if (status === 429) {
      toast.error(msg || 'Too many requests, please wait')
    } else if (status >= 500) {
      toast.error(msg || 'Server error, please try again')
    }

    return Promise.reject(err)
  }
)

export default api