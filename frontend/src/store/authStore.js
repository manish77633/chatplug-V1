import { create } from 'zustand'
import api from '../utils/api'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isHydrated: false,

  hydrate: () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    // Check token expiry client-side
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 < Date.now()) {
          // Token expired — logout
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          delete api.defaults.headers.common['Authorization']
          set({ token: null, user: null, isHydrated: true })
          return
        }
      } catch {
        // Invalid token — clear
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null, isHydrated: true })
        return
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    set({ token, user, isHydrated: true })
  },

  syncAuth: () => get().hydrate(),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    set({ user: data.user, token: data.token })
    return data
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    set({ user: data.user, token: data.token })
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    set({ user: null, token: null })
  },

  setUser: (user) => {
    set({ user })
  },

  init: () => {
    get().hydrate()
  },
}))