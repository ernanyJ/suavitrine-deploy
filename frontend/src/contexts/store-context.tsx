import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useUserStores } from '@/lib/api/queries'
import { useAuth } from '@/hooks/useAuth'

interface StoreContextType {
  selectedStoreId: string | null
  setSelectedStoreId: (storeId: string | null) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  const { data: stores = [] } = useUserStores(userId ?? null)
  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(() => {
    // Try to get from localStorage first
    const saved = localStorage.getItem('selectedStoreId')
    if (saved) return saved
    // Otherwise use first store
    return null
  })

  // Update selected store when stores load for the first time
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      const firstStoreId = stores[0].storeId
      setSelectedStoreIdState(firstStoreId)
      localStorage.setItem('selectedStoreId', firstStoreId)
    }
  }, [stores, selectedStoreId])

  // Ensure selected store is still valid when stores change
  useEffect(() => {
    if (selectedStoreId && stores.length > 0) {
      const storeExists = stores.some(store => store.storeId === selectedStoreId)
      if (!storeExists) {
        // If selected store no longer exists, select the first one
        const firstStoreId = stores[0].storeId
        setSelectedStoreIdState(firstStoreId)
        localStorage.setItem('selectedStoreId', firstStoreId)
      }
    }
  }, [stores, selectedStoreId])

  const setSelectedStoreId = (storeId: string | null) => {
    setSelectedStoreIdState(storeId)
    if (storeId) {
      localStorage.setItem('selectedStoreId', storeId)
    } else {
      localStorage.removeItem('selectedStoreId')
    }
  }

  return (
    <StoreContext.Provider value={{ selectedStoreId, setSelectedStoreId }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useSelectedStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useSelectedStore must be used within a StoreProvider')
  }
  return context
}

