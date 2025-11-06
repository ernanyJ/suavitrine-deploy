import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { OnboardingDialog } from '@/components/onboarding-dialog'
import { authStorage } from '@/lib/api/auth'
import { StoreProvider } from '@/contexts/store-context'

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

  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar 
          onCreateStore={() => setShowCreateStoreDialog(true)} 
        />
        <main className="flex-1 overflow-y-auto">
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
    </StoreProvider>
  )
}
