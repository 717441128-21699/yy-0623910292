import { useState } from 'react'
import { useStore } from '@/store'
import { CATEGORIES, CATEGORY_COLORS, SOURCE_LABELS, STREETS, type Category, type Source } from '@/types'
import { FileSearch, ChevronDown, ChevronUp, Phone, MessageSquare, Globe, MapPin, Clock, Users } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const sourceIcons: Record<Source, React.ElementType> = {
  hotline: Phone,
  governance: MessageSquare,
  forum: Globe,
}

export default function ClueCenter() {
  const clueGroups = useStore((s) => s.clueGroups)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const categoryFilter = searchParams.get('category') || ''
  const streetFilter = searchParams.get('street') || ''

  const [filterCategory, setFilterCategory] = useState<Category | ''>(
    CATEGORIES.includes(categoryFilter as Category) ? (categoryFilter as Category) : ''
  )
  const [filterStreet, setFilterStreet] = useState(streetFilter || '')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = clueGroups.filter((cg) => {
    if (filterCategory && cg.category !== filterCategory) return false
    if (filterStreet && !cg.locations.some((l) => l.includes(filterStreet)) && !cg.appeals.some(a => a.street === filterStreet)) return false
    return true
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2E7CF6' }}>
          <FileSearch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            线索中心
          </h2>
          <p className="text-xs text-gray-400">相似诉求已自动合并，点击查看详情</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => setFilterCategory('')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
              filterCategory === '' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                filterCategory === cat ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={filterCategory === cat ? { color: CATEGORY_COLORS[cat] } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={filterStreet}
          onChange={(e) => setFilterStreet(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="">全部街道</option>
          {STREETS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400 ml-auto">
          共 {filtered.length} 组线索
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((cg, i) => (
            <motion.div
              key={cg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === cg.id ? null : cg.id)}
                className="w-full text-left p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div
                  className="w-1 h-12 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[cg.category] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{cg.summary}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${CATEGORY_COLORS[cg.category]}15`, color: CATEGORY_COLORS[cg.category] }}
                    >
                      {cg.category}
                    </span>
                    {cg.isAssigned && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        cg.assignment?.status === 'done' ? 'bg-green-50 text-green-600' :
                        cg.assignment?.status === 'overdue' ? 'bg-red-50 text-red-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {cg.assignment?.status === 'done' ? '已反馈' :
                         cg.assignment?.status === 'overdue' ? '超期' : '跟办中'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cg.appeals.length} 条留言
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      首发于 {cg.firstSeenAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cg.locations.join('、')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/clue/${cg.id}`) }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    详情
                  </button>
                  {expandedId === cg.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedId === cg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-50 px-4 py-3 space-y-2 bg-gray-50/30">
                      {cg.appeals.map((appeal) => {
                        const SourceIcon = sourceIcons[appeal.source]
                        return (
                          <div key={appeal.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: `${CATEGORY_COLORS[cg.category]}10` }}
                            >
                              <SourceIcon className="w-3.5 h-3.5" style={{ color: CATEGORY_COLORS[cg.category] }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 leading-relaxed">{appeal.content}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <SourceIcon className="w-3 h-3" />
                                  {SOURCE_LABELS[appeal.source]}
                                </span>
                                <span>{appeal.createdAt}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {appeal.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
