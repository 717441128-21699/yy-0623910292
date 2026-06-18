import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/store'
import { CATEGORIES, CATEGORY_COLORS, SOURCE_LABELS, STREETS, type Category, type Source } from '@/types'
import { FileSearch, ChevronDown, ChevronUp, Phone, MessageSquare, Globe, MapPin, Clock, Users, FileText, Copy, CheckCircle2, AlertTriangle, Building2, TrendingUp, Filter, AlertCircle, CheckCircle, User, X, ChevronRight, Timer, ArrowRight } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { computeAssignmentStatus } from '@/data/mockData'

const sourceIcons: Record<Source, React.ElementType> = {
  hotline: Phone,
  governance: MessageSquare,
  forum: Globe,
}

type ViewMode = 'list' | 'briefing'

export default function ClueCenter() {
  const {
    getFilteredData,
    getComputedAssignments,
    clueGroups,
    selectedStreets,
    selectedCategories,
    timeRange,
    setSelectedStreets,
    setSelectedCategories,
    setTimeRange,
    applyFilters,
  } = useStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryFilterParam = searchParams.get('category') || ''
  const streetFilterParam = searchParams.get('street') || ''
  const streetsParam = searchParams.get('streets') || ''
  const categoriesParam = searchParams.get('categories') || ''
  const timeRangeParam = searchParams.get('timeRange') || ''
  const deptFilterParam = searchParams.get('dept') || ''

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterCategory, setFilterCategory] = useState<Category | ''>(
    CATEGORIES.includes(categoryFilterParam as Category) ? (categoryFilterParam as Category) : ''
  )
  const [filterStreet, setFilterStreet] = useState(streetFilterParam || '')
  const [filterDept, setFilterDept] = useState(deptFilterParam || '')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const streetsFromUrl = streetsParam ? streetsParam.split(',').filter(Boolean) : []
    const categoriesFromUrl = categoriesParam ? categoriesParam.split(',').filter((c): c is Category => CATEGORIES.includes(c as Category)) : []
    const timeFromUrl = (timeRangeParam === '7d' || timeRangeParam === '30d') ? timeRangeParam : null

    let hasChanges = false
    if (streetsFromUrl.length > 0 && (selectedStreets.length !== streetsFromUrl.length || streetsFromUrl.some(s => !selectedStreets.includes(s)))) {
      setSelectedStreets(streetsFromUrl)
      if (!streetsFromUrl.includes(filterStreet) && !filterStreet) {
        setFilterStreet(streetsFromUrl[0])
      }
      hasChanges = true
    }
    if (categoriesFromUrl.length > 0 && (selectedCategories.length !== categoriesFromUrl.length || categoriesFromUrl.some(c => !selectedCategories.includes(c)))) {
      setSelectedCategories(categoriesFromUrl)
      if (!filterCategory && categoriesFromUrl.length > 0) {
        setFilterCategory(categoriesFromUrl[0])
      }
      hasChanges = true
    }
    if (timeFromUrl && timeFromUrl !== timeRange) {
      setTimeRange(timeFromUrl)
      hasChanges = true
    }
    if (hasChanges) {
      applyFilters()
    }
  }, [])

  useEffect(() => {
    if (CATEGORIES.includes(categoryFilterParam as Category) && !selectedCategories.includes(categoryFilterParam as Category)) {
      setSelectedCategories([categoryFilterParam as Category])
      applyFilters()
    }
  }, [])

  const { filteredClueGroups, alertItems, categoryStats, totalAppeals } = getFilteredData()
  const computedAssignments = getComputedAssignments()

  const filtered = useMemo(() => {
    return filteredClueGroups.filter((cg) => {
      if (filterCategory && cg.category !== filterCategory) return false
      if (filterStreet && !cg.appeals.some(a => a.street === filterStreet)) return false
      if (filterDept) {
        if (!cg.assignment || cg.assignment.department !== filterDept) return false
      }
      return true
    })
  }, [filteredClueGroups, filterCategory, filterStreet, filterDept])

  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string; type: 'street' | 'category' | 'timeRange' | 'dept'; value: string }[] = []
    selectedStreets.forEach(s => {
      tags.push({ key: `street-${s}`, label: s, type: 'street', value: s })
    })
    selectedCategories.forEach(c => {
      tags.push({ key: `category-${c}`, label: c, type: 'category', value: c })
    })
    if (timeRange !== '7d') {
      tags.push({ key: 'timeRange', label: timeRange === '30d' ? '近30天' : '自定义', type: 'timeRange', value: timeRange })
    }
    if (filterDept) {
      tags.push({ key: `dept-${filterDept}`, label: filterDept, type: 'dept', value: filterDept })
    }
    return tags
  }, [selectedStreets, selectedCategories, timeRange, filterDept])

  const removeFilterTag = (type: 'street' | 'category' | 'timeRange' | 'dept', value: string) => {
    if (type === 'street') {
      setSelectedStreets(selectedStreets.filter(s => s !== value))
      if (filterStreet === value) setFilterStreet('')
      applyFilters()
    } else if (type === 'category') {
      setSelectedCategories(selectedCategories.filter(c => c !== value))
      if (filterCategory === value) setFilterCategory('')
      applyFilters()
    } else if (type === 'timeRange') {
      setTimeRange('7d')
      applyFilters()
    } else if (type === 'dept') {
      setFilterDept('')
    }
  }

  const clearAllFilters = () => {
    setSelectedStreets([])
    setSelectedCategories([])
    setTimeRange('7d')
    setFilterDept('')
    setFilterCategory('')
    setFilterStreet('')
    applyFilters()
  }

  const getClueComputedStatus = (cg: typeof filteredClueGroups[0]) => {
    if (!cg.isAssigned || !cg.assignment) return 'unassigned' as const
    const a = cg.assignment
    const isDone = a.status === 'done' || !!a.feedbackAt
    return computeAssignmentStatus(a.deadline, isDone, a.feedbackAt)
  }

  const briefingData = useMemo(() => {
    const highFreqClues = [...filteredClueGroups]
      .sort((a, b) => b.appeals.length - a.appeals.length)
      .slice(0, 5)

    const deptStats: Record<string, { total: number; overdue: number; urgent: number; normal: number; done: number }> = {}
    for (const a of computedAssignments) {
      if (!deptStats[a.department]) deptStats[a.department] = { total: 0, overdue: 0, urgent: 0, normal: 0, done: 0 }
      deptStats[a.department].total += 1
      deptStats[a.department][a.computedStatus] += 1
    }
    const departments = Object.entries(deptStats).sort((a, b) => (b[1].overdue + b[1].urgent) - (a[1].overdue + a[1].urgent))

    const statusSummary = {
      total: computedAssignments.length,
      overdue: computedAssignments.filter(a => a.computedStatus === 'overdue').length,
      urgent: computedAssignments.filter(a => a.computedStatus === 'urgent').length,
      normal: computedAssignments.filter(a => a.computedStatus === 'normal').length,
      done: computedAssignments.filter(a => a.computedStatus === 'done').length,
    }

    const timelineDepts: Record<string, { clueGroupId: string; summary: string; createdAt: string; deadline: string; feedbackAt?: string; isDone: boolean }[]> = {}
    for (const cg of filteredClueGroups) {
      if (!cg.assignment) continue
      const dept = cg.assignment.department
      if (!timelineDepts[dept]) timelineDepts[dept] = []
      timelineDepts[dept].push({
        clueGroupId: cg.id,
        summary: cg.summary,
        createdAt: cg.assignment.createdAt,
        deadline: cg.assignment.deadline,
        feedbackAt: cg.assignment.feedbackAt,
        isDone: cg.assignment.status === 'done' || !!cg.assignment.feedbackAt,
      })
    }
    Object.values(timelineDepts).forEach(items => {
      items.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    })

    return { highFreqClues, departments, statusSummary, timelineDepts }
  }, [filteredClueGroups, computedAssignments])

  const generateBriefingText = (): string => {
    const today = format(new Date(), 'yyyy年MM月dd日')
    let text = `【民生诉求晨会简报】${today}\n\n`

    text += `一、总体情况\n`
    const filterDesc: string[] = []
    if (selectedStreets.length > 0) filterDesc.push(`${selectedStreets.length}个街道（${selectedStreets.join('、')}）`)
    if (selectedCategories.length > 0) filterDesc.push(`${selectedCategories.length}类（${selectedCategories.join('、')}）`)
    filterDesc.push(timeRange === '7d' ? '近7天' : '近30天')
    text += `  周期范围：${filterDesc.join(' · ')}\n`
    text += `  本周期共接诉求 ${totalAppeals} 件，${filteredClueGroups.length} 组线索。\n`
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
      const status = getClueComputedStatus(cg)
      const statusLabel = status === 'unassigned' ? '待派单' :
        status === 'done' ? '已反馈' :
        status === 'overdue' ? '超期' :
        status === 'urgent' ? '临期' : '正常'
      const dept = cg.assignment?.department || '待指派'
      text += `  ${i + 1}. 【${cg.category}】${cg.summary}\n`
      text += `     留言 ${cg.appeals.length} 条 · 涉及 ${cg.locations.join('、')} · ${dept} · ${statusLabel}\n`
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

    const timelineEntries = Object.entries(briefingData.timelineDepts)
    if (timelineEntries.length > 0) {
      text += `五、督办闭环时间轴\n`
      timelineEntries.forEach(([dept, items]) => {
        text += `  【${dept}】\n`
        items.forEach(item => {
          text += `    · 派单：${item.createdAt} ${item.summary}\n`
          text += `      截止：${item.deadline}\n`
          if (item.feedbackAt) {
            text += `      反馈：${item.feedbackAt}\n`
          }
        })
      })
      text += `\n`
    }

    text += `六、分类统计（本周期/环比）\n`
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

  const drillToClue = (clueId: string) => {
    navigate(`/clue/${clueId}`)
  }

  const drillToCategory = (category: Category) => {
    const params = new URLSearchParams(searchParams)
    params.set('category', category)
    setSearchParams(params)
    setFilterCategory(category)
    setViewMode('list')
  }

  const drillToStreet = (street: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('street', street)
    setSearchParams(params)
    setFilterStreet(street)
    setViewMode('list')
  }

  const drillToDept = (dept: string) => {
    setFilterDept(dept === filterDept ? '' : dept)
    setViewMode('list')
  }

  const toggleCategoryFilter = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat))
    } else {
      setSelectedCategories([...selectedCategories, cat])
    }
    setFilterCategory(filterCategory === cat ? '' : cat)
    const p = new URLSearchParams(searchParams)
    if (filterCategory === cat) p.delete('category'); else p.set('category', cat)
    setSearchParams(p)
    applyFilters()
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
              {viewMode === 'list'
                ? `相似诉求已自动合并 · ${selectedStreets.length > 0 ? `${selectedStreets.length}个街道` : '全部街道'} · ${timeRange === '7d' ? '近7天' : '近30天'}`
                : '晨会汇报材料自动汇总，点击卡片可下钻查看'}
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
            onClick={() => { setFilterCategory(''); setSelectedCategories([]); const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); applyFilters() }}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
              filterCategory === '' && selectedCategories.length === 0 ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                selectedCategories.includes(cat) ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={selectedCategories.includes(cat) ? { color: CATEGORY_COLORS[cat] } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={filterStreet}
          onChange={(e) => {
            setFilterStreet(e.target.value)
            const p = new URLSearchParams(searchParams)
            if (e.target.value) p.set('street', e.target.value); else p.delete('street')
            setSearchParams(p)
          }}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="">全部街道</option>
          {STREETS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="">全部部门</option>
          {Array.from(new Set(computedAssignments.map(a => a.department))).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(selectedStreets.length > 0 || selectedCategories.length > 0 || timeRange !== '7d') && (
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600">
            <Filter className="w-3 h-3" />
            <span>
              {selectedStreets.length > 0 && `${selectedStreets.length}街道 `}
              {selectedCategories.length > 0 && `${selectedCategories.length}类型 `}
              {timeRange !== '7d' && `${timeRange === '30d' ? '近30天' : '自定义'}`}
            </span>
          </div>
        )}
        <span className="text-sm text-gray-400 ml-auto">
          共 {filtered.length} 组线索
        </span>
      </div>

      {activeFilterTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            已筛选：
          </span>
          {activeFilterTags.map(tag => (
            <span
              key={tag.key}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700"
            >
              {tag.type === 'category' && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_COLORS[tag.value as Category] || '#6B7280' }} />
              )}
              {tag.label}
              <button
                onClick={() => removeFilterTag(tag.type, tag.value)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto flex items-center gap-1 transition-colors"
          >
            清除全部
          </button>
        </div>
      )}

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
            {filtered.map((cg, i) => {
              const status = getClueComputedStatus(cg)
              const statusColor = status === 'unassigned' ? 'gray' :
                status === 'done' ? 'green' :
                status === 'overdue' ? 'red' :
                status === 'urgent' ? 'orange' : 'blue'
              const statusLabel = status === 'unassigned' ? '待派单' :
                status === 'done' ? '已反馈' :
                status === 'overdue' ? '超期' :
                status === 'urgent' ? '临期' : '正常'

              return (
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
                          statusColor === 'gray' ? 'bg-gray-50 text-gray-600' :
                          statusColor === 'green' ? 'bg-green-50 text-green-600' :
                          statusColor === 'red' ? 'bg-red-50 text-red-600' :
                          statusColor === 'orange' ? 'bg-orange-50 text-orange-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {statusLabel}
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
                      {cg.assignment && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {cg.assignment.department}
                        </span>
                      )}
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
            )})}
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
                <span className="text-xs text-gray-400 font-normal ml-2">点击卡片查看该地点线索</span>
              </h4>
              {alertItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {alertItems.map((alert, i) => (
                    <motion.div
                      key={alert.id}
                      whileHover={{ scale: 1.01, y: -2 }}
                      onClick={() => drillToStreet(alert.street)}
                      className="p-3 rounded-lg border border-red-100 bg-red-50/30 cursor-pointer hover:shadow-md transition-all"
                    >
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
                    </motion.div>
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
                <span className="text-xs text-gray-400 font-normal ml-2">点击线索查看详情，点击分类筛选</span>
              </h4>
              <div className="space-y-2">
                {briefingData.highFreqClues.map((cg, i) => {
                  const status = getClueComputedStatus(cg)
                  const statusColor = status === 'unassigned' ? 'gray' :
                    status === 'done' ? 'green' :
                    status === 'overdue' ? 'red' :
                    status === 'urgent' ? 'orange' : 'blue'
                  const statusLabel = status === 'unassigned' ? '待派单' :
                    status === 'done' ? '已反馈' :
                    status === 'overdue' ? '超期' :
                    status === 'urgent' ? '临期' : '正常'
                  return (
                    <motion.div
                      key={cg.id}
                      whileHover={{ y: -1 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
                      onClick={() => drillToClue(cg.id)}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: CATEGORY_COLORS[cg.category] }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="text-sm text-gray-800 font-medium truncate flex-1">{cg.summary}</div>
                          <button
                            onClick={(e) => { e.stopPropagation(); drillToCategory(cg.category) }}
                            className="text-xs px-1.5 py-0.5 rounded shrink-0 hover:opacity-80 transition-opacity"
                            style={{ background: `${CATEGORY_COLORS[cg.category]}15`, color: CATEGORY_COLORS[cg.category] }}
                          >
                            {cg.category}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>{cg.appeals.length} 条留言</span>
                          <span>·</span>
                          {cg.locations.map((loc, idx) => (
                            <span
                              key={loc}
                              onClick={(e) => { e.stopPropagation(); drillToStreet(cg.appeals.find(a => a.location === loc)?.street || '') }}
                              className="hover:text-blue-500 transition-colors"
                            >
                              {loc}{idx < cg.locations.length - 1 ? '、' : ''}
                            </span>
                          ))}
                          <span>·</span>
                          <span>{cg.assignment?.department || '待指派'}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        statusColor === 'gray' ? 'bg-gray-100 text-gray-600' :
                        statusColor === 'green' ? 'bg-green-100 text-green-600' :
                        statusColor === 'red' ? 'bg-red-100 text-red-600' :
                        statusColor === 'orange' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {statusLabel}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  <Building2 className="w-4 h-4 text-blue-500" />
                  责任部门督办
                  <span className="text-xs text-gray-400 font-normal ml-2">点击部门筛选</span>
                </h4>
                <div className="space-y-2">
                  {briefingData.departments.slice(0, 6).map(([dept, stats]) => (
                    <div
                      key={dept}
                      onClick={() => drillToDept(dept)}
                      className={`flex items-center justify-between text-sm p-2 rounded-md cursor-pointer transition-colors ${
                        filterDept === dept ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-gray-600">{dept}</span>
                      <div className="flex items-center gap-2">
                        {stats.overdue > 0 && (
                          <span className="flex items-center gap-0.5 text-red-500 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            {stats.overdue}
                          </span>
                        )}
                        {stats.urgent > 0 && (
                          <span className="flex items-center gap-0.5 text-orange-500 font-medium">
                            <Clock className="w-3 h-3" />
                            {stats.urgent}
                          </span>
                        )}
                        {stats.normal > 0 && (
                          <span className="flex items-center gap-0.5 text-blue-500 font-medium">
                            <User className="w-3 h-3" />
                            {stats.normal}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          {stats.done}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  <FileText className="w-4 h-4 text-blue-500" />
                  分类统计
                  <span className="text-xs text-gray-400 font-normal ml-2">点击分类筛选</span>
                </h4>
                <div className="space-y-3">
                  {categoryStats.map((stat) => (
                    <div
                      key={stat.category}
                      onClick={() => drillToCategory(stat.category)}
                      className={`cursor-pointer p-2 rounded-md transition-colors ${
                        filterCategory === stat.category ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: CATEGORY_COLORS[stat.category] }}
                          />
                          {stat.category}
                        </span>
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

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                <Timer className="w-4 h-4 text-blue-500" />
                督办闭环时间轴
                <span className="text-xs text-gray-400 font-normal ml-2">按部门分组，展示派单到反馈关键节点</span>
              </h4>
              {Object.keys(briefingData.timelineDepts).length > 0 ? (
                <div className="space-y-5">
                  {Object.entries(briefingData.timelineDepts).slice(0, 3).map(([dept, items]) => (
                    <div key={dept}>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">{dept}</span>
                        <span className="text-xs text-gray-400">{items.length} 件派单</span>
                      </div>
                      <div className="ml-2 border-l-2 border-gray-100 pl-4 space-y-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="relative">
                            <div className="flex items-start gap-3">
                              <div className="absolute -left-[1.35rem] top-1 flex flex-col items-center gap-1">
                                <div className="flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{item.createdAt}</span>
                                </div>
                              </div>
                              <div
                                className="flex-1 bg-blue-50/50 rounded-lg p-3 cursor-pointer hover:bg-blue-50 transition-colors group"
                                onClick={() => navigate(`/clue/${item.clueGroupId}`)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-blue-600">派单</span>
                                  <span className="text-xs text-gray-500 truncate flex-1">{item.summary}</span>
                                  <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 mt-3">
                              <div className="absolute -left-[1.35rem] top-[calc(2rem+0.75rem)] flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
                                <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{item.deadline}</span>
                              </div>
                              <div className="flex-1 bg-orange-50/50 rounded-lg p-3 ml-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-orange-600">改期限</span>
                                  <span className="text-xs text-gray-500">截止 {item.deadline}</span>
                                </div>
                              </div>
                            </div>
                            {item.feedbackAt && (
                              <div className="flex items-start gap-3 mt-3">
                                <div className="absolute -left-[1.35rem] top-[calc(4rem+1.5rem)] flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{item.feedbackAt}</span>
                                </div>
                                <div
                                  className="flex-1 bg-green-50/50 rounded-lg p-3 cursor-pointer hover:bg-green-50 transition-colors group"
                                  onClick={() => navigate('/todo')}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-green-600">反馈</span>
                                    <span className="text-xs text-gray-500">{item.feedbackAt}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-green-400 transition-colors ml-auto" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">暂无督办数据</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                <FileText className="w-4 h-4 text-gray-500" />
                汇报文本预览（仅当前筛选范围）
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
