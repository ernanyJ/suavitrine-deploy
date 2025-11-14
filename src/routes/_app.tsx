import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { OnboardingDialog } from '@/components/onboarding-dialog'
import { BetaWarningDialog } from '@/components/beta-warning-dialog'
import { OnboardingTour } from '@/components/onboarding-tour'
import { authStorage } from '@/lib/api/auth'
import { StoreProvider } from '@/contexts/store-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const token = authStorage.getToken()
    if (!token) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const [showCreateStoreDialog, setShowCreateStoreDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <StoreProvider>
      <OnboardingTour />
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden md:flex">
          <AppSidebar
            onCreateStore={() => setShowCreateStoreDialog(true)}
          />
        </aside>

        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-40">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
            <AppSidebar
              onCreateStore={() => {
                setShowCreateStoreDialog(true)
                setMobileMenuOpen(false)
              }}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto md:ml-0">
          <Outlet />
        </main>
      </div>
      {/* Controlled dialog for creating new stores */}
      <OnboardingDialog
        open={showCreateStoreDialog}
        onOpenChange={setShowCreateStoreDialog}
      />
      {/* Uncontrolled dialog for onboarding (shows when user has no stores) */}
      <OnboardingDialog />
      {/* Beta Warning Dialog - Shows automatically on first visit */}
      <BetaWarningDialog />
    </StoreProvider>
  )
}
