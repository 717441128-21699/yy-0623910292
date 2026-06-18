import FilterBar from '@/components/FilterBar'
import CategoryCards from '@/components/CategoryCards'
import TrendChart from '@/components/TrendChart'
import AlertPanel from '@/components/AlertPanel'
import HeatMap from '@/components/HeatMap'
import { getCategoryStats, getTrendData, getAlertItems, getStreetHeatData } from '@/data/mockData'
import { useStore } from '@/store'
import { Activity } from 'lucide-react'

export default function Dashboard() {
  const { selectedCategories } = useStore()
  const stats = getCategoryStats()
  const trendData = getTrendData()
  const alerts = getAlertItems()
  const streetHeat = getStreetHeatData()

  const totalAppeals = stats.reduce((sum, s) => sum + s.count, 0)

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
            <p className="text-xs text-gray-400">实时掌握全县民生诉求动态</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#2E7CF6' }}>{totalAppeals}</div>
            <div className="text-xs text-gray-400">本周诉求总量</div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{alerts.length}</div>
            <div className="text-xs text-gray-400">预警点</div>
          </div>
        </div>
      </div>

      <FilterBar />
      <CategoryCards stats={stats} />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <TrendChart data={trendData} selectedCategories={selectedCategories} />
        </div>
        <div>
          <AlertPanel alerts={alerts} />
        </div>
      </div>

      <HeatMap data={streetHeat} />
    </div>
  )
}
