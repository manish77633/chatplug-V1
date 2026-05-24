import { create } from 'zustand'
import api from '../utils/api'

const useAnalyticsStore = create((set, get) => ({
  stats: null,
  chartData: [],
  isLoading: false,
  lastFetched: null,

  fetchAnalytics: async (token, range = '7d', force = false) => {
    const { lastFetched, isLoading } = get()
    const CACHE_TTL = 3 * 60 * 1000 // 3 min cache
    if (!force && lastFetched && (Date.now() - lastFetched) < CACHE_TTL) return
    if (isLoading) return

    set({ isLoading: true })
    try {
      const { data } = await api.get('/analytics/stats')
      set({
        stats: data,
        lastFetched: Date.now(),
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  invalidate: () => set({ lastFetched: null }),
}))

export default useAnalyticsStore
