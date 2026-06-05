import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import ErrorBoundary from '@/components/common/ErrorBoundary'

// Lazy loaded Pages
const Landing          = lazy(() => import('@/pages/Landing'))
const Login            = lazy(() => import('@/pages/Login'))
const Signup           = lazy(() => import('@/pages/Signup'))
const Dashboard        = lazy(() => import('@/pages/Dashboard'))
const AiChat           = lazy(() => import('@/pages/AiChat'))
const Assignments      = lazy(() => import('@/pages/Assignments'))
const Notes            = lazy(() => import('@/pages/Notes'))
const StudyPlanner     = lazy(() => import('@/pages/StudyPlanner'))
const AssignmentAgent  = lazy(() => import('@/pages/AssignmentAgent'))
const NoticeScanner    = lazy(() => import('@/pages/NoticeScanner'))
const ContinueOnLaptop = lazy(() => import('@/pages/ContinueOnLaptop'))
const LaptopWorkspace  = lazy(() => import('@/pages/LaptopWorkspace'))

// Premium loading spinner
const RouteLoader = () => (
  <div className="flex h-full w-full min-h-[200px] items-center justify-center bg-background">
    <div className="relative flex items-center justify-center">
      <div className="absolute h-12 w-12 animate-ping rounded-full bg-brand-500/15" />
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500" />
    </div>
  </div>
)

// Safe page wrapper: suspense + error boundary per route
const SafePage = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/"       element={<SafePage><Landing /></SafePage>} />
        <Route path="/login"  element={<SafePage><Login /></SafePage>} />
        <Route path="/signup" element={<SafePage><Signup /></SafePage>} />

        {/* ── Protected routes (layout wrapped) ── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"   element={<SafePage><Dashboard /></SafePage>} />
          <Route path="/chat"        element={<SafePage><AiChat /></SafePage>} />
          <Route path="/assignments" element={<SafePage><Assignments /></SafePage>} />
          <Route path="/notes"       element={<SafePage><Notes /></SafePage>} />
          <Route path="/planner"     element={<SafePage><StudyPlanner /></SafePage>} />
          <Route path="/agent"       element={<SafePage><AssignmentAgent /></SafePage>} />
          <Route path="/scanner"     element={<SafePage><NoticeScanner /></SafePage>} />
          <Route path="/continue"    element={<SafePage><ContinueOnLaptop /></SafePage>} />
        </Route>

        {/* Fullscreen workspace */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <SafePage>
                <div className="p-4 md:p-6 h-full w-full bg-background overflow-auto">
                  <LaptopWorkspace />
                </div>
              </SafePage>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
