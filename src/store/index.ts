import { create } from 'zustand'
import type { ClueGroup, Assignment, AssignmentStatus } from '@/types'
import { getClueGroups, getAssignments } from '@/data/mockData'

interface AppState {
  clueGroups: ClueGroup[]
  assignments: Assignment[]
  selectedStreets: string[]
  selectedCategories: string[]
  timeRange: '7d' | '30d' | 'custom'
  addAssignment: (clueGroupId: string, department: string, deadline: string, note: string) => void
  markAsDone: (assignmentId: string) => void
  updateDeadline: (assignmentId: string, newDeadline: string) => void
  setSelectedStreets: (streets: string[]) => void
  setSelectedCategories: (categories: string[]) => void
  setTimeRange: (range: '7d' | '30d' | 'custom') => void
}

export const useStore = create<AppState>((set) => ({
  clueGroups: getClueGroups(),
  assignments: getAssignments(),
  selectedStreets: [],
  selectedCategories: [],
  timeRange: '7d',
  addAssignment: (clueGroupId, department, deadline, note) =>
    set((state) => {
      const newAssignment: Assignment = {
        id: `as_${Date.now()}`,
        clueGroupId,
        department,
        deadline,
        note,
        status: 'urgent',
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
      const updatedAssignments = state.assignments.map((a) =>
        a.id === assignmentId ? { ...a, deadline: newDeadline } : a
      )
      const updatedGroups = state.clueGroups.map((cg) =>
        cg.assignment?.id === assignmentId
          ? { ...cg, assignment: { ...cg.assignment!, deadline: newDeadline } }
          : cg
      )
      return { assignments: updatedAssignments, clueGroups: updatedGroups }
    }),
  setSelectedStreets: (streets) => set({ selectedStreets: streets }),
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setTimeRange: (range) => set({ timeRange: range }),
}))
