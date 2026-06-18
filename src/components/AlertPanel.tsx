import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import { CATEGORY_COLORS, type AlertItem } from '@/types'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Props {
  alerts: AlertItem[]
}

export default function AlertPanel({ alerts }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          突增预警
        </h3>
        <span className="text-xs text-gray-400 ml-auto">环比增长 &gt;50%</span>
      </div>
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
        {alerts.map((alert, i) => (
          <motion.button
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            onClick={() => navigate(`/clue/all?category=${encodeURIComponent(alert.category)}&street=${encodeURIComponent(alert.street)}`)}
            className="w-full text-left p-3 rounded-lg border border-red-100 hover:border-red-200 hover:bg-red-50/50 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-800">{alert.location}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: `${CATEGORY_COLORS[alert.category]}15`, color: CATEGORY_COLORS[alert.category] }}
              >
                {alert.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">当前 {alert.currentCount} 条诉求</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500">
                <ArrowUpRight className="w-3 h-3" />
                +{alert.increase}%
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
