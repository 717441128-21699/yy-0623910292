export type Source = 'hotline' | 'governance' | 'forum'

export type Category = '供水供电' | '道路出行' | '物业纠纷' | '教育医疗' | '其他'

export type AssignmentStatus = 'overdue' | 'urgent' | 'normal' | 'done'

export interface Appeal {
  id: string
  source: Source
  category: Category
  content: string
  location: string
  street: string
  community?: string
  createdAt: string
  clueGroupId: string
}

export interface ClueGroup {
  id: string
  category: Category
  appeals: Appeal[]
  summary: string
  firstSeenAt: string
  locations: string[]
  isAssigned: boolean
  assignment?: Assignment
}

export interface Assignment {
  id: string
  clueGroupId: string
  department: string
  deadline: string
  note: string
  status: AssignmentStatus
  createdAt: string
  feedbackAt?: string
}

export interface CategoryStat {
  category: Category
  count: number
  change: number
}

export interface AlertItem {
  id: string
  location: string
  street: string
  category: Category
  increase: number
  currentCount: number
}

export interface TrendPoint {
  date: string
  '供水供电': number
  '道路出行': number
  '物业纠纷': number
  '教育医疗': number
  '其他': number
}

export const CATEGORIES: Category[] = ['供水供电', '道路出行', '物业纠纷', '教育医疗', '其他']

export const CATEGORY_COLORS: Record<Category, string> = {
  '供水供电': '#2E7CF6',
  '道路出行': '#F59E0B',
  '物业纠纷': '#EF4444',
  '教育医疗': '#10B981',
  '其他': '#8B5CF6',
}

export const SOURCE_LABELS: Record<Source, string> = {
  hotline: '12345热线',
  governance: '问政平台',
  forum: '本地论坛',
}

export const DEPARTMENTS = [
  '城管局',
  '住建局',
  '水务局',
  '供电公司',
  '交通局',
  '教育局',
  '卫健委',
  '物业办',
  '街道办',
  '市场监管局',
]

export const STREETS = [
  '长安街道',
  '永安街道',
  '新华街道',
  '朝阳街道',
  '东城街道',
  '西关街道',
]
