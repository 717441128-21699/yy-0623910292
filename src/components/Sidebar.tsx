import { LayoutDashboard, FileSearch, ClipboardList, Shield } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useStore } from '@/store'
import { useEffect, useState } from 'react'
import { computeAssignmentStatus } from '@/data/mockData'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '诉求看板' },
  { to: '/clue/all', icon: FileSearch, label: '线索中心' },
  { to: '/todo', icon: ClipboardList, label: '待办中心' },
]

export default function Sidebar() {
  const assignments = useStore((s) => s.assignments)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const computed = assignments.map((a) => {
    const isDone = a.status === 'done' || !!a.feedbackAt
    return { ...a, computedStatus: computeAssignmentStatus(a.deadline, isDone, a.feedbackAt) }
  })
  const overdueCount = computed.filter((a) => a.computedStatus === 'overdue').length
  const urgentCount = computed.filter((a) => a.computedStatus === 'urgent').length
  const todoBadge = overdueCount + urgentCount

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col" style={{ background: '#1B2A4A' }}>
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#2E7CF6' }}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white text-sm font-semibold leading-tight" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            民生诉求
          </h1>
          <p className="text-white/50 text-xs">督办工作台</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
            {item.label === '待办中心' && todoBadge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {todoBadge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-white text-xs font-medium">
            张
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">张晓明</p>
            <p className="text-white/40 text-xs">督办员</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
