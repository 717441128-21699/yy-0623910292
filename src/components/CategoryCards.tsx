import { Droplets, Car, Building2, GraduationCap, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { CATEGORY_COLORS, type Category } from '@/types'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '@/store'

const categoryIcons: Record<Category, React.ElementType> = {
  '供水供电': Droplets,
  '道路出行': Car,
  '物业纠纷': Building2,
  '教育医疗': GraduationCap,
  '其他': MoreHorizontal,
}

interface Props {
  stats: { category: Category; count: number; change: number }[]
}

export default function CategoryCards({ stats }: Props) {
  const navigate = useNavigate()
  const getCurrentFilters = useStore((s) => s.getCurrentFilters)

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = categoryIcons[stat.category]
        const color = CATEGORY_COLORS[stat.category]
        const isUp = stat.change > 0

        const handleClick = () => {
          const filters = getCurrentFilters()
          const params = new URLSearchParams()
          params.set('category', stat.category)
          const allCategories = Array.from(new Set([...filters.selectedCategories, stat.category]))
          if (allCategories.length > 0) {
            params.set('categories', allCategories.join(','))
          }
          if (filters.selectedStreets.length > 0) {
            params.set('streets', filters.selectedStreets.join(','))
          }
          if (filters.timeRange) {
            params.set('timeRange', filters.timeRange)
          }
          navigate(`/clue/all?${params.toString()}`)
        }

        return (
          <motion.button
            key={stat.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            onClick={handleClick}
            className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isUp ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{stat.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.count}</div>
            <div className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">{stat.category}</div>
          </motion.button>
        )
      })}
    </div>
  )
}
