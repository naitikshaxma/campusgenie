import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import MobileBottomNav from './MobileBottomNav'
import AnimatedPage from '@/components/common/AnimatedPage'
import MobileOnboarding from './MobileOnboarding'
import FloatingAiAssistant from './FloatingAiAssistant'
import DemoLandingOverlay from '@/components/demo/DemoLandingOverlay'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('hasOnboarded')) {
      setShowOnboarding(true)
    }
  }, [])

  // Preload critical routes for demo performance
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('CAMPUSGENIE_DEMO_MODE') === 'true') {
      import('@/pages/AssignmentAgent');
      import('@/pages/ContinueOnLaptop');
      import('@/pages/StudyPlanner');
      import('@/pages/Assignments');
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <MobileOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <DemoLandingOverlay />

      {/* Sidebar (Desktop & Tablet) */}
      <div className="hidden md:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
        <div className="hidden md:block">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Header on mobile (if we want a simple header, or just let pages handle it) */}
        
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
          {/* Add safe area bottom padding for mobile nav */}
          <div className="h-full p-4 md:p-6 pb-28 md:pb-6 max-w-[1600px] mx-auto">
            <AnimatedPage>
              <Outlet />
            </AnimatedPage>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation & Global AI Assistant */}
      <FloatingAiAssistant />
      <MobileBottomNav />
    </div>
  )
}
