import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { CATEGORIES, CATEGORY_COLORS, SOURCE_LABELS, STREETS, type Category, type Source } from '@/types'
import { FileSearch, ChevronDown, ChevronUp, Phone, MessageSquare, Globe, MapPin, Clock, Users, FileText, Copy, CheckCircle2, AlertTriangle, Building2, TrendingUp } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

const sourceIcons: Record<Source, React.ElementType> = {
  hotline: Phone,
  governance: MessageSquare,
  forum: Globe,
}

type ViewMode = 'list' | 'briefing'

export default function ClueCenter() {
  const { getFilteredData, getComputedAssignments, clueGroups, selectedStreets, selectedCategories, timeRange } = useStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const categoryFilterParam = searchParams.get('category') || ''
  const streetFilterParam = searchParams.get('street') || ''

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterCategory, setFilterCategory] = useState<Category | ''>(
    CATEGORIES.includes(categoryFilterParam as Category) ? (categoryFilterParam as Category) : ''
  )
  const [filterStreet, setFilterStreet] = useState(streetFilterParam || '')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { filteredClueGroups, alertItems, categoryStats, totalAppeals } = getFilteredData()
  const computedAssignments = getComputedAssignments()

  const filtered = useMemo(() => {
    return filteredClueGroups.filter((cg) => {
      if (filterCategory && cg.category !== filterCategory) return false
      if (filterStreet && !cg.appeals.some(a => a.street === filterStreet)) return false
      return true
    })
  }, [filteredClueGroups, filterCategory, filterStreet])

  const briefingData = useMemo(() => {
    const highFreqClues = [...filteredClueGroups]
      .sort((a, b) => b.appeals.length - a.appeals.length)
      .slice(0, 5)

    const deptStats: Record<string, { total: number; overdue: number; urgent: number; done: number }> = {}
    for (const a of computedAssignments) {
      if (!deptStats[a.department]) deptStats[a.department] = { total: 0, overdue: 0, urgent: 0, done: 0 }
      deptStats[a.department].total += 1
      deptStats[a.department][a.computedStatus] += 1
    }
    const departments = Object.entries(deptStats).sort((a, b) => (b[1].overdue + b[1].urgent) - (a[1].overdue + a[1].urgent))

    const statusSummary = {
      total: computedAssignments.length,
      overdue: computedAssignments.filter(a => a.computedStatus === 'overdue').length,
      urgent: computedAssignments.filter(a => a.computedStatus === 'urgent').length,
      done: computedAssignments.filter(a => a.computedStatus === 'done').length,
    }

    return { highFreqClues, departments, statusSummary }
  }, [filteredClueGroups, computedAssignments])

  const generateBriefingText = (): string => {
    const today = format(new Date(), 'yyyy年MM月dd日')
    let text = `【民生诉求晨会简报】${today}\n\n`

    text += `一、总体情况\n`
    text += `  本周期共接诉求 ${totalAppeals} 件，涉及 ${selectedStreets.length > 0 ? selectedStreets.length : 6} 个街道，${filteredClueGroups.length} 组线索。\n`
    text += `  已派单 ${briefingData.statusSummary.total} 件，超期 ${briefingData.statusSummary.overdue} 件，临期 ${briefingData.statusSummary.urgent} 件，已反馈 ${briefingData.statusSummary.done} 件。\n\n`

    if (alertItems.length > 0) {
      text += `二、突增预警（环比增长>50%）\n`
      alertItems.forEach((al, i) => {
        text += `  ${i + 1}. ${al.location}（${al.category}）：当前 ${al.currentCount} 条，环比 +${al.increase}%\n`
      })
      text += `\n`
    }

    text += `三、高频线索（按留言数排序）\n`
    briefingData.highFreqClues.forEach((cg, i) => {
      const status = !cg.isAssigned ? '待派单' :
        cg.assignment?.status === 'done' ? '已反馈' :
        cg.assignment?.status === 'overdue' ? '超期' : '跟办中'
      const dept = cg.assignment?.department || '待指派'
      text += `  ${i + 1}. 【${cg.category}】${cg.summary}\n`
      text += `     留言 ${cg.appeals.length} 条 · 涉及 ${cg.locations.join('、')} · ${dept} · ${status}\n`
    })
    text += `\n`

    const overdueDepts = briefingData.departments.filter(([, s]) => s.overdue > 0)
    if (overdueDepts.length > 0) {
      text += `四、超期督办重点部门\n`
      overdueDepts.forEach(([dept, stats]) => {
        text += `  · ${dept}：超期 ${stats.overdue} 件，临期 ${stats.urgent} 件\n`
      })
      text += `\n`
    }

    text += `五、分类统计（本周期/环比）\n`
    categoryStats.forEach((s) => {
      const change = s.change >= 0 ? `+${s.change}` : `${s.change}`
      text += `  · ${s.category}：${s.count} 件（${change}%）\n`
    })

    return text
  }

  const handleCopy = async () => {
    const text = generateBriefingText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2E7CF6' }}>
            <FileSearch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              线索中心
            </h2>
            <p className="text-xs text-gray-400">
              {viewMode === 'list' ? '相似诉求已自动合并，点击查看详情' : '晨会汇报材料自动汇总，一键复制'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${
              viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            线索列表
          </button>
          <button
            onClick={() => setViewMode('briefing')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${
              viewMode === 'briefing' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            晨会材料
          </button>
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

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-end">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制汇报文本
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                突增预警（环比增长&gt;50%）
              </h4>
              {alertItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {alertItems.map((alert, i) => (
                    <div key={alert.id} className="p-3 rounded-lg border border-red-100 bg-red-50/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{alert.location}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${CATEGORY_COLORS[alert.category]}15`, color: CATEGORY_COLORS[alert.category] }}>
                          {alert.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{alert.street} · 当前 {alert.currentCount} 条</span>
                        <span className="text-red-500 font-semibold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          +{alert.increase}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">暂无突增预警</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                <Users className="w-4 h-4 text-blue-500" />
                高频线索 TOP 5
              </h4>
              <div className="space-y-2">
                {briefingData.highFreqClues.map((cg, i) => {
                  const status = !cg.isAssigned ? '待派单' :
                    cg.assignment?.status === 'done' ? '已反馈' :
                    cg.assignment?.status === 'overdue' ? '超期' : '跟办中'
                  const statusColor = !cg.isAssigned ? 'gray' :
                    cg.assignment?.status === 'done' ? 'green' :
                    cg.assignment?.status === 'overdue' ? 'red' : 'orange'
                  return (
                    <div key={cg.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: CATEGORY_COLORS[cg.category] }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800 font-medium truncate">{cg.summary}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>{cg.appeals.length} 条留言</span>
                          <span>·</span>
                          <span>{cg.locations.join('、')}</span>
                          <span>·</span>
                          <span>{cg.assignment?.department || '待指派'}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        statusColor === 'gray' ? 'bg-gray-100 text-gray-600' :
                        statusColor === 'green' ? 'bg-green-100 text-green-600' :
                        statusColor === 'red' ? 'bg-red-100 text-red-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  <Building2 className="w-4 h-4 text-blue-500" />
                  责任部门督办
                </h4>
                <div className="space-y-2">
                  {briefingData.departments.slice(0, 6).map(([dept, stats]) => (
                    <div key={dept} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{dept}</span>
                      <div className="flex items-center gap-2">
                        {stats.overdue > 0 && <span className="text-red-500 font-medium">超期{stats.overdue}</span>}
                        {stats.urgent > 0 && <span className="text-orange-500 font-medium">临期{stats.urgent}</span>}
                        <span className="text-green-600 font-medium">已办{stats.done}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  <FileText className="w-4 h-4 text-blue-500" />
                  分类统计
                </h4>
                <div className="space-y-3">
                  {categoryStats.map((stat) => (
                    <div key={stat.category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{stat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{stat.count} 件</span>
                          <span className={`text-xs ${stat.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {stat.change >= 0 ? '+' : ''}{stat.change}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, stat.count * 5)}%`,
                            background: CATEGORY_COLORS[stat.category],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                <FileText className="w-4 h-4 text-gray-500" />
                汇报文本预览
              </h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
                {generateBriefingText()}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
