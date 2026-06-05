import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import MobileBottomNav from './MobileBottomNav'
import AnimatedPage from '@/components/common/AnimatedPage'
import MobileOnboarding from './MobileOnboarding'
import FloatingAiAssistant from './FloatingAiAssistant'
import ErrorBoundary from '@/components/common/ErrorBoundary'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!localStorage.getItem('hasOnboarded')) {
      setShowOnboarding(true)
    }
  }, [])

  return (
    <div className="flex h-full overflow-hidden bg-background relative">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <MobileOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Sidebar (Desktop & Tablet only) */}
      <div className="hidden md:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">

        {/* Desktop Top Navbar */}
        <div className="hidden md:block">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto mobile-scroll relative z-0">
          <div className="h-full p-4 md:p-6 pb-nav md:pb-6 max-w-[1600px] mx-auto">
            <ErrorBoundary key={location.pathname}>
              <AnimatedPage>
                <Outlet />
              </AnimatedPage>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Floating AI — desktop only to avoid mobile overlaps */}
      <div className="hidden md:block">
        <FloatingAiAssistant />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
