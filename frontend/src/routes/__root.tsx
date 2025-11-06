import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useEffect } from 'react'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { Toaster } from '@/components/ui/sonner'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  // Initialize theme on app load
  useEffect(() => {
    const theme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const activeTheme = theme || systemTheme

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(activeTheme)
  }, [])

  return (
    <>
      <Outlet />
      <Toaster />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})
