import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'

// Pages
import Landing          from '@/pages/Landing'
import Login            from '@/pages/Login'
import Signup           from '@/pages/Signup'
import Dashboard        from '@/pages/Dashboard'
import AiChat           from '@/pages/AiChat'
import Assignments      from '@/pages/Assignments'
import Notes            from '@/pages/Notes'
import StudyPlanner     from '@/pages/StudyPlanner'
import AssignmentAgent  from '@/pages/AssignmentAgent'
import NoticeScanner    from '@/pages/NoticeScanner'
import OfficeKit        from '@/pages/OfficeKit'
import LaptopWorkspace  from '@/pages/LaptopWorkspace'

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public routes ──────────────────────────────────── */}
      <Route path="/"       element={<Landing />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ── Protected routes (layout wrapped) ──────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/chat"        element={<AiChat />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/notes"       element={<Notes />} />
        <Route path="/planner"     element={<StudyPlanner />} />
        <Route path="/agent"       element={<AssignmentAgent />} />
        <Route path="/scanner"     element={<NoticeScanner />} />
        <Route path="/office"      element={<OfficeKit />} />
      </Route>

      {/* Fullscreen workspace route */}
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <div className="p-4 md:p-6 h-screen w-screen bg-background">
              <LaptopWorkspace />
            </div>
          </ProtectedRoute>
        }
      />

      {/* ── Catch-all ──────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
