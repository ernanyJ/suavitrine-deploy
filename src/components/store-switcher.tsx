import { Check, ChevronsUpDown, PlusCircle, Store } from 'lucide-react'
import { useState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useUserStores, useStore } from '@/lib/api/queries'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { PlanBadge } from '@/components/plan-badge'
import { useSelectedStore } from '@/contexts/store-context'

interface StoreSwitcherProps {
  onCreateStore?: () => void
}

export function StoreSwitcher({ onCreateStore }: StoreSwitcherProps = {}) {
  const { userId } = useAuth()
  const { data: stores = [], isLoading } = useUserStores(userId ?? null)
  const { selectedStoreId, setSelectedStoreId } = useSelectedStore()
  const [open, setOpen] = useState(false)

  // Find the selected store object
  const selectedStore = useMemo(() => {
    if (!selectedStoreId) return null
    return stores.find(store => store.storeId === selectedStoreId) || null
  }, [stores, selectedStoreId])
  
  // Fetch plan for selected store
  const { data: selectedStoreData } = useStore(selectedStoreId)

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between px-3"
        disabled
      >
        <div className="flex items-center gap-2 min-w-0">
          <Loader2 className="size-4 animate-spin" />
          <span className="truncate text-sm font-medium">Carregando...</span>
        </div>
      </Button>
    )
  }

  if (stores.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between px-3"
        disabled
      >
        <div className="flex items-center gap-2 min-w-0">
          <Store className="size-4" />
          <span className="truncate text-sm font-medium">
            Nenhuma loja encontrada
          </span>
        </div>
      </Button>
    )
  }

  const displayName = selectedStore?.storeName || stores[0]?.storeName || 'Selecione uma loja'

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar loja"
          className="w-full justify-between px-3"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="text-xs">
                {displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">
              {displayName}
            </span>
            <PlanBadge plan={selectedStoreData?.activePlan} className="shrink-0" />
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Minhas Lojas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stores.map((store) => {
          // For dropdown items, show the badge for the selected store (we have the data)
          // For other stores, we'll show FREE as default since we don't want to fetch all stores
          const isSelected = selectedStoreId === store.storeId
          const storePlan = isSelected ? selectedStoreData?.activePlan : undefined
          
          return (
            <DropdownMenuItem
              key={store.id}
              onSelect={() => {
                setSelectedStoreId(store.storeId)
                setOpen(false)
              }}
              className="gap-2 cursor-pointer"
            >
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="text-xs">
                  {store.storeName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{store.storeName}</span>
              <div className="flex items-center gap-1 shrink-0">
                <PlanBadge plan={storePlan} className="text-[10px] px-1.5 py-0" />
                <Check
                  className={cn(
                    'size-4',
                    isSelected ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </div>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="gap-2 cursor-pointer"
          onSelect={() => {
            setOpen(false)
            onCreateStore?.()
          }}
        >
          <PlusCircle className="size-4" />
          <span>Criar nova loja</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

