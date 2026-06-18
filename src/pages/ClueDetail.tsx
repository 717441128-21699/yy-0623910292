import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { CATEGORY_COLORS, SOURCE_LABELS, DEPARTMENTS, type Source } from '@/types'
import { ArrowLeft, Phone, MessageSquare, Globe, MapPin, Clock, Users, CheckCircle, AlertCircle, Timer, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { computeAssignmentStatus } from '@/data/mockData'

const sourceIcons: Record<Source, React.ElementType> = {
  hotline: Phone,
  governance: MessageSquare,
  forum: Globe,
}

export default function ClueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clueGroups = useStore((s) => s.clueGroups)
  const addAssignment = useStore((s) => s.addAssignment)

  const clue = clueGroups.find((cg) => cg.id === id)
  const [expandedAppeals, setExpandedAppeals] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [department, setDepartment] = useState('')
  const [deadline, setDeadline] = useState('')
  const [note, setNote] = useState('')

  if (!clue) {
    return (
      <div className="p-6">
        <div className="text-center py-20 text-gray-400">
          <p>未找到该线索</p>
          <button onClick={() => navigate('/clue/all')} className="mt-2 text-blue-500 hover:underline text-sm">
            返回线索中心
          </button>
        </div>
      </div>
    )
  }

  const color = CATEGORY_COLORS[clue.category]

  const computedAssignment = useMemo(() => {
    if (clue.isAssigned && clue.assignment) {
      const a = clue.assignment
      const isDone = a.status === 'done' || !!a.feedbackAt
      const computedStatus = computeAssignmentStatus(a.deadline, isDone, a.feedbackAt)
      return { ...a, computedStatus }
    }
    return null
  }, [clue.isAssigned, clue.assignment])

  const toggleAppeal = (appealId: string) => {
    setExpandedAppeals((prev) => {
      const next = new Set(prev)
      if (next.has(appealId)) next.delete(appealId)
      else next.add(appealId)
      return next
    })
  }

  const handleSubmit = () => {
    if (!department || !deadline) return
    addAssignment(clue.id, department, deadline, note)
    setShowForm(false)
    setDepartment('')
    setDeadline('')
    setNote('')
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            线索详情
          </h2>
          <p className="text-xs text-gray-400">查看合并留言与跟办信息</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-10 rounded-full" style={{ background: color }} />
              <div>
                <h3 className="text-base font-semibold text-gray-800">{clue.summary}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ background: `${color}15`, color }}
                  >
                    {clue.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {clue.appeals.length} 条合并留言
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 首发于 {clue.firstSeenAt}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {clue.locations.map((loc) => (
                <span
                  key={loc}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: `${color}10`, color }}
                >
                  <MapPin className="w-3 h-3" />
                  {loc}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {clue.appeals.map((appeal) => {
                  const SourceIcon = sourceIcons[appeal.source]
                  const isExpanded = expandedAppeals.has(appeal.id)
                  return (
                    <motion.div
                      key={appeal.id}
                      initial={false}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        isExpanded ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                      onClick={() => toggleAppeal(appeal.id)}
                    >
                      <div className="p-3 flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: `${color}10` }}
                        >
                          <SourceIcon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isExpanded ? 'text-gray-800' : 'text-gray-600'} truncate`}>
                            {appeal.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                          <span className="flex items-center gap-1">
                            <SourceIcon className="w-3 h-3" />
                            {SOURCE_LABELS[appeal.source]}
                          </span>
                          <span>{appeal.createdAt}</span>
                        </div>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-0">
                              <div className="p-3 bg-white rounded-md border border-gray-100">
                                <p className="text-sm text-gray-700 leading-relaxed">{appeal.content}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {appeal.location}
                                  </span>
                                  {appeal.community && (
                                    <span>小区：{appeal.community}</span>
                                  )}
                                  <span>街道：{appeal.street}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {computedAssignment ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                跟办信息
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${
                    computedAssignment.computedStatus === 'done' ? 'text-green-500' :
                    computedAssignment.computedStatus === 'overdue' ? 'text-red-500' : 'text-orange-500'
                  }`} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    computedAssignment.computedStatus === 'done' ? 'bg-green-50 text-green-600' :
                    computedAssignment.computedStatus === 'overdue' ? 'bg-red-50 text-red-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {computedAssignment.computedStatus === 'done' ? '已反馈' :
                     computedAssignment.computedStatus === 'overdue' ? '超期' : '跟办中'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">责任部门：</span>
                  <span className="text-gray-700 font-medium">{computedAssignment.department}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">办理期限：</span>
                  <span className="text-gray-700 font-medium">{computedAssignment.deadline}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">备注：</span>
                  <span className="text-gray-700">{computedAssignment.note}</span>
                </div>
                {computedAssignment.feedbackAt && (
                  <div className="text-sm">
                    <span className="text-gray-400">反馈时间：</span>
                    <span className="text-green-600 font-medium">{computedAssignment.feedbackAt}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  添加跟办
                </h4>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="text-xs px-3 py-1.5 rounded-lg text-white transition-all hover:shadow-md"
                  style={{ background: '#2E7CF6' }}
                >
                  {showForm ? '收起' : '新建跟办'}
                </button>
              </div>

              {!showForm && (
                <div className="text-center py-6 text-gray-300">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">尚未指派跟办</p>
                  <p className="text-xs mt-1">点击"新建跟办"开始</p>
                </div>
              )}

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">责任部门 *</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                        >
                          <option value="">请选择部门</option>
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">办理期限 *</label>
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">备注</label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          placeholder="输入备注信息..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
                        />
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={!department || !deadline}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md"
                        style={{ background: '#2E7CF6' }}
                      >
                        <Save className="w-4 h-4" />
                        保存跟办
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              线索概览
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">线索编号</span>
                <span className="text-gray-700 font-mono text-xs">{clue.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">合并留言</span>
                <span className="text-gray-700">{clue.appeals.length} 条</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">首发时间</span>
                <span className="text-gray-700">{clue.firstSeenAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">涉及地点</span>
                <span className="text-gray-700">{clue.locations.length} 处</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">来源渠道</span>
                <div className="flex items-center gap-1">
                  {[...new Set(clue.appeals.map(a => a.source))].map(src => {
                    const Icon = sourceIcons[src]
                    return (
                      <span key={src} className="flex items-center gap-0.5 text-xs text-gray-600">
                        <Icon className="w-3 h-3" />
                        {SOURCE_LABELS[src]}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
