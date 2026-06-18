import { STREETS } from '@/types'
import { motion } from 'framer-motion'

interface Props {
  data: { street: string; count: number }[]
}

export default function HeatMap({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const countMap = Object.fromEntries(data.map((d) => [d.street, d.count]))

  const getColor = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.75) return '#1E40AF'
    if (ratio > 0.5) return '#2E7CF6'
    if (ratio > 0.25) return '#7CB8F9'
    return '#BFDBFE'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          热点街道分布
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm" style={{ background: '#BFDBFE' }}></span>
          <span>低</span>
          <span className="w-3 h-3 rounded-sm" style={{ background: '#7CB8F9' }}></span>
          <span className="w-3 h-3 rounded-sm" style={{ background: '#2E7CF6' }}></span>
          <span className="w-3 h-3 rounded-sm" style={{ background: '#1E40AF' }}></span>
          <span>高</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {STREETS.map((street, i) => {
          const count = countMap[street] || 0
          return (
            <motion.div
              key={street}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="relative rounded-lg p-4 text-white overflow-hidden"
              style={{ background: getColor(count) }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -translate-y-4 translate-x-4"></div>
              <div className="relative">
                <p className="text-xs opacity-80 mb-1">{street}</p>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs opacity-60 mt-0.5">条诉求</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
