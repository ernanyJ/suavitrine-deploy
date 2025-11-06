'use client'

import { useEffect } from 'react'

interface StoreAccessTrackerProps {
  storeId: string
}

export function StoreAccessTracker({ storeId }: StoreAccessTrackerProps) {
  useEffect(() => {
    const recordStoreAccess = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
        await fetch(`${baseUrl}/api/v1/metrics/events/store-access/${storeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        // Silently fail - metrics are not critical for the user experience
        console.error('Failed to record store access metric:', error)
      }
    }

    recordStoreAccess()
  }, [storeId])

  // Este componente não renderiza nada visualmente
  return null
}
