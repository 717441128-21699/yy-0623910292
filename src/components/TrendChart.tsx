import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CATEGORIES, CATEGORY_COLORS, type TrendPoint } from '@/types'

interface Props {
  data: TrendPoint[]
  selectedCategories: string[]
}

export default function TrendChart({ data, selectedCategories }: Props) {
  const displayCategories = selectedCategories.length > 0
    ? CATEGORIES.filter(c => selectedCategories.includes(c))
    : CATEGORIES

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    return `${parts[1]}/${parts[2]}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          诉求热度趋势
        </h3>
        <span className="text-xs text-gray-400">近30天各分类诉求量变化</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: '#1B2A4A',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              color: '#fff',
            }}
            labelStyle={{ color: '#94A3B8', marginBottom: 4 }}
            labelFormatter={formatDate}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {displayCategories.map((cat) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={CATEGORY_COLORS[cat]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
