import FilterBar from '@/components/FilterBar'
import CategoryCards from '@/components/CategoryCards'
import TrendChart from '@/components/TrendChart'
import AlertPanel from '@/components/AlertPanel'
import HeatMap from '@/components/HeatMap'
import { useStore } from '@/store'
import { Activity, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Dashboard() {
  const { getFilteredData, selectedStreets, selectedCategories, timeRange, filterApplied, resetFilters } = useStore()
  const { categoryStats, alertItems, trendData, streetHeat, totalAppeals } = getFilteredData()

  const hasActiveFilter = selectedStreets.length > 0 || selectedCategories.length > 0

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2E7CF6' }}>
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              诉求监测看板
            </h2>
            <p className="text-xs text-gray-400">
              {timeRange === '7d' ? '近7天' : '近30天'}
              {selectedStreets.length > 0 && ` · ${selectedStreets.length}个街道`}
              {selectedCategories.length > 0 && ` · ${selectedCategories.length}类`}
              {!filterApplied && <span className="ml-2 text-orange-500">（筛选条件已变更，请点击查询）</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-3 h-3" />
              重置筛选
            </button>
          )}
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={totalAppeals}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-2xl font-bold"
                style={{ color: '#2E7CF6' }}
              >
                {totalAppeals}
              </motion.div>
            </AnimatePresence>
            <div className="text-xs text-gray-400">周期诉求总量</div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={alertItems.length}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-2xl font-bold text-red-500"
              >
                {alertItems.length}
              </motion.div>
            </AnimatePresence>
            <div className="text-xs text-gray-400">预警点</div>
          </div>
        </div>
      </div>

      <FilterBar />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedStreets.join(',')}-${selectedCategories.join(',')}-${timeRange}-${filterApplied}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <CategoryCards stats={categoryStats} />

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <TrendChart data={trendData} selectedCategories={selectedCategories} />
            </div>
            <div>
              <AlertPanel alerts={alertItems} />
            </div>
          </div>

          <HeatMap data={streetHeat} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
