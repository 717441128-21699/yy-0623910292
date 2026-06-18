import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle2, AlertTriangle, Clock, ExternalLink, Calendar, Building2, RefreshCw } from 'lucide-react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import type { AssignmentStatus } from '@/types'
import { STREETS, DEPARTMENTS } from '@/types'

const statusConfig: Record<AssignmentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  overdue: { label: '超期', color: '#E74C3C', bg: 'bg-red-50', icon: AlertTriangle },
  urgent: { label: '临期', color: '#F39C12', bg: 'bg-orange-50', icon: Clock },
  done: { label: '已反馈', color: '#27AE60', bg: 'bg-green-50', icon: CheckCircle2 },
}

export default function TodoCenter() {
  const { getComputedAssignments, clueGroups, markAsDone, updateDeadline, getFilteredData } = useStore()
  const navigate = useNavigate()
  const assignments = getComputedAssignments()

  const [activeTab, setActiveTab] = useState<AssignmentStatus | 'all'>('all')
  const [editingDeadline, setEditingDeadline] = useState<string | null>(null)
  const [newDeadline, setNewDeadline] = useState('')
  const [filterStreet, setFilterStreet] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const { filteredClueGroups } = getFilteredData()

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (activeTab !== 'all' && a.computedStatus !== activeTab) return false
      if (filterStreet || filterDept) {
        const cg = clueGroups.find((c) => c.id === a.clueGroupId)
        if (filterStreet && !cg?.appeals.some((ap) => ap.street === filterStreet)) return false
        if (filterDept && a.department !== filterDept) return false
      }
      return true
    })
  }, [assignments, activeTab, filterStreet, filterDept, clueGroups])

  const counts = useMemo(() => ({
    overdue: assignments.filter((a) => a.computedStatus === 'overdue').length,
    urgent: assignments.filter((a) => a.computedStatus === 'urgent').length,
    done: assignments.filter((a) => a.computedStatus === 'done').length,
  }), [assignments])

  const tabs: { key: AssignmentStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: assignments.length },
    { key: 'overdue', label: '超期', count: counts.overdue },
    { key: 'urgent', label: '临期', count: counts.urgent },
    { key: 'done', label: '已反馈', count: counts.done },
  ]

  const getDaysRemaining = (deadline: string): number => {
    return differenceInDays(parseISO(deadline), now)
  }

  const handleDeadlineSave = (assignmentId: string) => {
    if (newDeadline) {
      updateDeadline(assignmentId, newDeadline)
    }
    setEditingDeadline(null)
    setNewDeadline('')
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2E7CF6' }}>
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              待办中心
            </h2>
            <p className="text-xs text-gray-400">
              自动按日期计算办理状态 · 实时刷新至 {format(now, 'MM-dd HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setNow(new Date())}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            刷新状态
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-500 font-semibold">{counts.overdue}</span>
            <span className="text-gray-400">超期</span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span className="text-orange-500 font-semibold">{counts.urgent}</span>
            <span className="text-gray-400">临期</span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span className="text-green-500 font-semibold">{counts.done}</span>
            <span className="text-gray-400">已反馈</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.key !== 'all' && (() => {
                const Icon = statusConfig[tab.key as AssignmentStatus].icon
                return <Icon className="w-3.5 h-3.5" />
              })()}
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
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
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="">全部部门</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(filterStreet || filterDept) && (
          <button
            onClick={() => { setFilterStreet(''); setFilterDept('') }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            重置
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredAssignments.map((assignment, i) => {
            const clue = clueGroups.find((cg) => cg.id === assignment.clueGroupId)
            const config = statusConfig[assignment.computedStatus]
            const StatusIcon = config.icon
            const daysLeft = getDaysRemaining(assignment.deadline)

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-4 flex items-center gap-4">
                  <div
                    className="w-1 h-14 rounded-full shrink-0"
                    style={{ background: config.color }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {clue?.summary || '未知线索'}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1"
                        style={{ background: `${config.color}10`, color: config.color }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {assignment.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        期限：{assignment.deadline}
                      </span>
                      {assignment.computedStatus !== 'done' && (
                        <span className={`font-medium ${
                          daysLeft < 0 ? 'text-red-500' : daysLeft <= 3 ? 'text-orange-500' : 'text-gray-500'
                        }`}>
                          {daysLeft < 0 ? `已超期 ${Math.abs(daysLeft)} 天` : daysLeft === 0 ? '今日到期' : `剩余 ${daysLeft} 天`}
                        </span>
                      )}
                      {assignment.feedbackAt && (
                        <span className="text-green-600">
                          反馈于 {assignment.feedbackAt}
                        </span>
                      )}
                    </div>
                    {assignment.note && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{assignment.note}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {assignment.computedStatus !== 'done' && (
                      <>
                        <button
                          onClick={() => markAsDone(assignment.id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          标记反馈
                        </button>
                        {editingDeadline === assignment.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={newDeadline}
                              onChange={(e) => setNewDeadline(e.target.value)}
                              className="px-2 py-1 border border-gray-200 rounded text-xs"
                            />
                            <button
                              onClick={() => handleDeadlineSave(assignment.id)}
                              className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                            >
                              确定
                            </button>
                            <button
                              onClick={() => setEditingDeadline(null)}
                              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingDeadline(assignment.id); setNewDeadline(assignment.deadline) }}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            改期限
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/clue/${assignment.clueGroupId}`)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      详情
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-16 text-gray-300">
            <ClipboardList className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">暂无{activeTab === 'all' ? '' : tabs.find(t => t.key === activeTab)?.label}待办</p>
          </div>
        )}
      </div>
    </div>
  )
}
