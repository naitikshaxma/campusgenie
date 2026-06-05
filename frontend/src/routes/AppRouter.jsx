import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import PlannerErrorBoundary from '@/components/planner/PlannerErrorBoundary'

// Lazy loaded Pages
const Landing         = lazy(() => import('@/pages/Landing'))
const Login           = lazy(() => import('@/pages/Login'))
const Signup          = lazy(() => import('@/pages/Signup'))
const Dashboard       = lazy(() => import('@/pages/Dashboard'))
const AiChat          = lazy(() => import('@/pages/AiChat'))
const Assignments     = lazy(() => import('@/pages/Assignments'))
const Notes           = lazy(() => import('@/pages/Notes'))
const StudyPlanner    = lazy(() => import('@/pages/StudyPlanner'))
const AssignmentAgent = lazy(() => import('@/pages/AssignmentAgent'))
const NoticeScanner   = lazy(() => import('@/pages/NoticeScanner'))
const ContinueOnLaptop= lazy(() => import('@/pages/ContinueOnLaptop'))
const LaptopWorkspace = lazy(() => import('@/pages/LaptopWorkspace'))

// Premium fallback loader
const RouteLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="relative flex items-center justify-center">
      <div className="absolute h-10 w-10 animate-ping rounded-full bg-brand-500/20" />
      <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-brand-500" />
    </div>
  </div>
)

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoader />}>
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
          <Route path="/planner"     element={<PlannerErrorBoundary><StudyPlanner /></PlannerErrorBoundary>} />
          <Route path="/agent"       element={<AssignmentAgent />} />
          <Route path="/scanner"     element={<NoticeScanner />} />
          <Route path="/continue"    element={<ContinueOnLaptop />} />
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
    </Suspense>
  )
}
