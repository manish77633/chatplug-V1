import { create } from 'zustand'
import api from '../utils/api'

const useDashboardStore = create((set, get) => ({
  chatbots: [],
  isLoading: false,
  lastFetched: null,

  fetchDashboard: async (token, force = false) => {
    const { lastFetched, isLoading } = get()
    const CACHE_TTL = 5 * 60 * 1000 // 5 min cache
    // Skip if data is fresh
    if (!force && lastFetched && (Date.now() - lastFetched) < CACHE_TTL) return
    // Skip if already loading
    if (isLoading) return

    set({ isLoading: true })
    try {
      const { data } = await api.get('/chatbots')
      set({
        chatbots: data.chatbots || [],
        lastFetched: Date.now(),
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  invalidate: () => set({ lastFetched: null }),
}))

export default useDashboardStore