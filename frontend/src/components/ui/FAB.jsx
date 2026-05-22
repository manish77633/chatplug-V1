// src/components/ui/FAB.jsx
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function FAB({ onClick, label = 'New Chatbot', icon: Icon = Plus }) {
  return (
    <motion.button
      id="fab-new-chatbot"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="fixed bottom-20 right-4 z-50 lg:hidden flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-2xl bg-gradient-to-r from-accent to-accent-secondary text-white font-semibold shadow-xl shadow-accent/30 active:shadow-accent/20 transition-shadow"
      style={{ minHeight: 52 }}
      aria-label={label}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </motion.button>
  )
}
