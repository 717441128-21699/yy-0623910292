import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import ClueDetail from '@/pages/ClueDetail'
import ClueCenter from '@/pages/ClueCenter'
import TodoCenter from '@/pages/TodoCenter'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clue/all" element={<ClueCenter />} />
          <Route path="/clue/:id" element={<ClueDetail />} />
          <Route path="/todo" element={<TodoCenter />} />
        </Route>
      </Routes>
    </Router>
  )
}
