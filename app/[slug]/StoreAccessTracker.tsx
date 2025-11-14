'use client'

import { useEffect } from 'react'
import { getBackendUrl, shouldMakeApiCall } from '@/lib/api-config'

interface StoreAccessTrackerProps {
  storeId: string
}

export function StoreAccessTracker({ storeId }: StoreAccessTrackerProps) {
  useEffect(() => {
    const recordStoreAccess = async () => {
      // Get backend URL first to check if it's available
      const baseUrl = getBackendUrl()
      const canMakeApiCall = shouldMakeApiCall()
      
      // Debug logs (only in development or if explicitly enabled)
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
        console.log('[StoreAccessTracker] Debug info:', {
          storeId,
          baseUrl: baseUrl || 'NOT SET',
          canMakeApiCall,
          nodeEnv: process.env.NODE_ENV,
          backendUrlEnv: process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT SET',
        })
      }
      
      // Skip API call if backend URL is not configured
      if (!canMakeApiCall || !baseUrl) {
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
          console.warn('[StoreAccessTracker] Skipping metric - backend URL not configured', {
            baseUrl,
            canMakeApiCall,
          })
        }
        return
      }
      
      try {
        const url = `${baseUrl}/api/v1/metrics/events/store-access/${storeId}`
        
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
          console.log('[StoreAccessTracker] Sending metric to:', url)
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add keepalive to ensure request completes even if page unloads
          keepalive: true,
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
          console.log('[StoreAccessTracker] Metric sent successfully')
        }
      } catch (error) {
        // Log error for debugging (metrics are not critical for the user experience)
        console.error('[StoreAccessTracker] Failed to record store access metric:', error)
        
        // In production, also log to console if debug is enabled
        if (process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
          console.error('[StoreAccessTracker] Error details:', {
            error,
            storeId,
            baseUrl,
            url: `${baseUrl}/api/v1/metrics/events/store-access/${storeId}`,
          })
        }
      }
    }

    // Small delay to ensure component is fully mounted and env vars are available
    const timeoutId = setTimeout(() => {
      recordStoreAccess()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [storeId])

  // Este componente não renderiza nada visualmente
  return null
}
