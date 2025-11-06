import { Link, useMatchRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  Tag,
  Palette, 
  LogOut,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { StoreSwitcher } from '@/components/store-switcher'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RainbowButton } from './ui/rainbow-button'
import { useSelectedStore } from '@/contexts/store-context'
import { UpgradeDialog } from './upgrade-dialog'
import { toast } from 'sonner'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Produtos',
    href: '/produtos',
    icon: Package,
  },
  {
    name: 'Categorias',
    href: '/categorias',
    icon: Tag,
  },
  {
    name: 'Personalização',
    href: '/personalizacao',
    icon: Palette,
  },
]

const bottomNavigation = [
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
]

interface AppSidebarProps {
  onCreateStore?: () => void
}

export function AppSidebar({ onCreateStore }: AppSidebarProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const matchRoute = useMatchRoute()
  const { user, logout } = useAuth()
  
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const handleWhatsAppSupport = () => {
    // Formato: wa.me/[código do país][número sem espaços ou caracteres especiais]
    // Brasil: 55, número: 95991304809
    const phoneNumber = '5595991304809'
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleUpgrade = () => {
    if (!selectedStoreId) {
      toast.error('Nenhuma loja selecionada. Por favor, crie uma loja primeiro.')
      return
    }
    setUpgradeDialogOpen(true)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        className={cn(
          "relative flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header with logo and store switcher */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Package className="size-4" />
              </div>
              {!isCollapsed && (
                <span className="text-lg font-bold">SuaVitrine (BETA)</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </Button>
          </div>
          {!isCollapsed && (
            <StoreSwitcher onCreateStore={onCreateStore} />
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-1 py-4">
            {navigation.map((item) => {
              const isActive = matchRoute({ to: item.href, fuzzy: false })
              const navButton = (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full gap-3',
                      isActive && 'bg-secondary',
                      isCollapsed ? 'justify-center px-0' : 'justify-start'
                    )}
                  >
                    <item.icon className="size-4" />
                    {!isCollapsed && item.name}
                  </Button>
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {navButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return navButton
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="px-3 py-2">
          {bottomNavigation.map((item) => {
            const isActive = matchRoute({ to: item.href, fuzzy: false })
            const navButton = (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full gap-3',
                    isActive && 'bg-secondary',
                    isCollapsed ? 'justify-center px-0' : 'justify-start'
                  )}
                >
                  <item.icon className="size-4" />
                  {!isCollapsed && item.name}
                </Button>
              </Link>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {navButton}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return navButton
          })}
        </div>

        <Separator />

        {/* User section */}
        <div className="p-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3 rounded-lg p-3 mb-2 bg-muted/50">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                <User className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          {/* WhatsApp Support Button */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="w-full mb-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  onClick={handleWhatsAppSupport}
                >
                  <MessageCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Falar com o suporte
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="default"
              className="w-full justify-start gap-2 mb-2 bg-[#18a04a] hover:bg-[#58b37b] text-white"
              onClick={handleWhatsAppSupport}
            >
              <MessageCircle className="size-4" />
              <span className="text-sm">Falar com o suporte</span>
            </Button>
          )}

          {!isCollapsed && (
            <>
              <RainbowButton 
                className="w-full mb-2" 
                onClick={handleUpgrade}
                disabled={!selectedStoreId}
              >
                Fazer Upgrade
              </RainbowButton>
              <UpgradeDialog
                open={upgradeDialogOpen}
                onOpenChange={setUpgradeDialogOpen}
                storeId={selectedStoreId}
              />
            </>
          )}
          <Separator />

          {/* Logout Button */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Sair
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

