import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ClueGroup, Assignment, AssignmentStatus, Category } from '@/types'
import { STREETS } from '@/types'
import {
  appeals,
  getBaseClueGroups,
  getBaseAssignments,
  computeAssignmentStatus,
  getFilteredAppeals,
  getFilteredCategoryStats,
  getFilteredAlertItems,
  getFilteredTrendData,
  getFilteredStreetHeat,
  getFilteredClueGroups,
} from '@/data/mockData'

interface PersistState {
  clueGroups: ClueGroup[]
  assignments: Assignment[]
}

interface AppState extends PersistState {
  selectedStreets: string[]
  selectedCategories: string[]
  timeRange: '7d' | '30d' | 'custom'
  filterApplied: boolean
  addAssignment: (clueGroupId: string, department: string, deadline: string, note: string) => void
  markAsDone: (assignmentId: string) => void
  updateDeadline: (assignmentId: string, newDeadline: string) => void
  setSelectedStreets: (streets: string[]) => void
  setSelectedCategories: (categories: string[]) => void
  setTimeRange: (range: '7d' | '30d' | 'custom') => void
  applyFilters: () => void
  resetFilters: () => void
  getComputedAssignments: () => (Assignment & { computedStatus: AssignmentStatus })[]
  getFilteredData: () => {
    filteredAppeals: ReturnType<typeof getFilteredAppeals>
    categoryStats: ReturnType<typeof getFilteredCategoryStats>
    alertItems: ReturnType<typeof getFilteredAlertItems>
    trendData: ReturnType<typeof getFilteredTrendData>
    streetHeat: ReturnType<typeof getFilteredStreetHeat>
    filteredClueGroups: ReturnType<typeof getFilteredClueGroups>
    totalAppeals: number
  }
}

const baseClueGroups = getBaseClueGroups()
const baseAssignments = getBaseAssignments()

const initialState: PersistState = {
  clueGroups: baseClueGroups,
  assignments: baseAssignments,
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      selectedStreets: [],
      selectedCategories: [],
      timeRange: '7d',
      filterApplied: true,

      addAssignment: (clueGroupId, department, deadline, note) =>
        set((state) => {
          const computedStatus = computeAssignmentStatus(deadline, false)
          const newAssignment: Assignment = {
            id: `as_${Date.now()}`,
            clueGroupId,
            department,
            deadline,
            note,
            status: computedStatus,
            createdAt: new Date().toISOString().slice(0, 10),
          }
          const updatedGroups = state.clueGroups.map((cg) =>
            cg.id === clueGroupId
              ? { ...cg, isAssigned: true, assignment: newAssignment }
              : cg
          )
          return {
            clueGroups: updatedGroups,
            assignments: [...state.assignments, newAssignment],
          }
        }),

      markAsDone: (assignmentId) =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10)
          const updatedAssignments = state.assignments.map((a) =>
            a.id === assignmentId ? { ...a, status: 'done' as AssignmentStatus, feedbackAt: today } : a
          )
          const updatedGroups = state.clueGroups.map((cg) =>
            cg.assignment?.id === assignmentId
              ? { ...cg, assignment: { ...cg.assignment!, status: 'done' as AssignmentStatus, feedbackAt: today } }
              : cg
          )
          return { assignments: updatedAssignments, clueGroups: updatedGroups }
        }),

      updateDeadline: (assignmentId, newDeadline) =>
        set((state) => {
          const target = state.assignments.find((a) => a.id === assignmentId)
          const newStatus = target ? computeAssignmentStatus(newDeadline, target.status === 'done', target.feedbackAt) : 'urgent'
          const updatedAssignments = state.assignments.map((a) =>
            a.id === assignmentId ? { ...a, deadline: newDeadline, status: newStatus } : a
          )
          const updatedGroups = state.clueGroups.map((cg) =>
            cg.assignment?.id === assignmentId
              ? { ...cg, assignment: { ...cg.assignment!, deadline: newDeadline, status: newStatus } }
              : cg
          )
          return { assignments: updatedAssignments, clueGroups: updatedGroups }
        }),

      setSelectedStreets: (streets) => set({ selectedStreets: streets, filterApplied: false }),
      setSelectedCategories: (categories) => set({ selectedCategories: categories, filterApplied: false }),
      setTimeRange: (range) => set({ timeRange: range, filterApplied: false }),
      applyFilters: () => set({ filterApplied: true }),
      resetFilters: () => set({ selectedStreets: [], selectedCategories: [], timeRange: '7d', filterApplied: true }),

      getComputedAssignments: () => {
        const state = get()
        return state.assignments.map((a) => {
          const isDone = a.status === 'done' || !!a.feedbackAt
          const computedStatus = computeAssignmentStatus(a.deadline, isDone, a.feedbackAt)
          return { ...a, computedStatus }
        })
      },

      getFilteredData: () => {
        const state = get()
        const { selectedStreets, selectedCategories, timeRange, clueGroups } = state
        const filteredAppeals = getFilteredAppeals(appeals, selectedStreets, selectedCategories, timeRange)
        const categoryStats = getFilteredCategoryStats(filteredAppeals, appeals, selectedStreets, selectedCategories, timeRange)
        const alertItems = getFilteredAlertItems(filteredAppeals, appeals, selectedStreets, selectedCategories, timeRange)
        const trendData = getFilteredTrendData(appeals, selectedStreets, selectedCategories, timeRange)
        const streetHeat = getFilteredStreetHeat(filteredAppeals, STREETS)
        const filteredClueGroups = getFilteredClueGroups(clueGroups, selectedStreets, selectedCategories)
        const totalAppeals = filteredAppeals.length
        return { filteredAppeals, categoryStats, alertItems, trendData, streetHeat, filteredClueGroups, totalAppeals }
      },
    }),
    {
      name: 'gov-hotline-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clueGroups: state.clueGroups,
        assignments: state.assignments,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const today = new Date().toISOString().slice(0, 10)
          state.clueGroups = state.clueGroups.map((cg) => {
            if (cg.assignment && cg.assignment.status !== 'done' && !cg.assignment.feedbackAt) {
              const newStatus = computeAssignmentStatus(cg.assignment.deadline, false)
              return { ...cg, assignment: { ...cg.assignment, status: newStatus } }
            }
            return cg
          })
          state.assignments = state.assignments.map((a) => {
            if (a.status !== 'done' && !a.feedbackAt) {
              return { ...a, status: computeAssignmentStatus(a.deadline, false) }
            }
            return a
          })
        }
      },
    }
  )
)
