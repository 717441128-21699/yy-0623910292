import { useState } from 'react'
import { useStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle2, AlertTriangle, Clock, ExternalLink, Calendar, Building2 } from 'lucide-react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import type { AssignmentStatus } from '@/types'

const statusConfig: Record<AssignmentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  overdue: { label: '超期', color: '#E74C3C', bg: 'bg-red-50', icon: AlertTriangle },
  urgent: { label: '临期', color: '#F39C12', bg: 'bg-orange-50', icon: Clock },
  done: { label: '已反馈', color: '#27AE60', bg: 'bg-green-50', icon: CheckCircle2 },
}

export default function TodoCenter() {
  const assignments = useStore((s) => s.assignments)
  const clueGroups = useStore((s) => s.clueGroups)
  const markAsDone = useStore((s) => s.markAsDone)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<AssignmentStatus | 'all'>('all')
  const [editingDeadline, setEditingDeadline] = useState<string | null>(null)
  const [newDeadline, setNewDeadline] = useState('')
  const { updateDeadline } = useStore()

  const filtered = activeTab === 'all'
    ? assignments
    : assignments.filter((a) => a.status === activeTab)

  const overdueCount = assignments.filter((a) => a.status === 'overdue').length
  const urgentCount = assignments.filter((a) => a.status === 'urgent').length
  const doneCount = assignments.filter((a) => a.status === 'done').length

  const tabs: { key: AssignmentStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: assignments.length },
    { key: 'overdue', label: '超期', count: overdueCount },
    { key: 'urgent', label: '临期', count: urgentCount },
    { key: 'done', label: '已反馈', count: doneCount },
  ]

  const getDaysRemaining = (deadline: string): number => {
    return differenceInDays(parseISO(deadline), new Date())
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2E7CF6' }}>
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            待办中心
          </h2>
          <p className="text-xs text-gray-400">跟踪线索办理进度，避免超期遗漏</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5">
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

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((assignment, i) => {
            const clue = clueGroups.find((cg) => cg.id === assignment.clueGroupId)
            const config = statusConfig[assignment.status]
            const StatusIcon = config.icon
            const daysLeft = getDaysRemaining(assignment.deadline)

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
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
                      {assignment.status !== 'done' && (
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
                    {assignment.status !== 'done' && (
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
                              className="text-xs px-2 py-1 rounded bg-blue-500 text-white"
                            >
                              确定
                            </button>
                            <button
                              onClick={() => setEditingDeadline(null)}
                              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600"
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

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-300">
            <ClipboardList className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">暂无{activeTab === 'all' ? '' : tabs.find(t => t.key === activeTab)?.label}待办</p>
          </div>
        )}
      </div>
    </div>
  )
}
