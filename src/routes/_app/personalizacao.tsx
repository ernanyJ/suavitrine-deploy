import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Palette,
  Upload,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Loader2,
  X,
  Info,
  ExternalLink,
  Copy,
  Monitor,
  Smartphone,
  Sparkles,
  Settings,
} from 'lucide-react'
import { useStore, useUpdateThemeConfig } from '@/lib/api/queries'
import { useSelectedStore } from '@/contexts/store-context'
import type { UpdateThemeConfigRequest, ThemeMode, RoundedLevel, BackgroundType } from '@/lib/api/stores'
import { StripedPattern } from '@/components/ui/striped-pattern'
import { DotPattern } from '@/components/ui/dot-pattern'
import { GridPattern } from '@/components/ui/grid-pattern'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import { LightRays } from '@/components/ui/light-rays'
import { FontSelect } from '@/components/font-select'
import { toast } from 'sonner'
import { PlanBadge } from '@/components/plan-badge'

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Helper function to get content type from file
const getContentType = (file: File): string => {
  return file.type || 'image/jpeg'
}

export const Route = createFileRoute('/_app/personalizacao')({
  component: PersonalizacaoPage,
})

// Helper functions for preview
function getRoundedClass(level: string): string {
  switch (level) {
    case 'NONE':
      return 'rounded-none'
    case 'SMALL':
      return 'rounded-md'
    case 'MEDIUM':
      return 'rounded-lg'
    case 'LARGE':
      return 'rounded-2xl'
    default:
      return 'rounded-lg'
  }
}

function formatFontFamily(fontName: string): string {
  if (fontName.includes(' ')) {
    return `"${fontName}"`
  }
  return fontName
}


function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// StorePreview Component
interface StorePreviewProps {
  primaryColor: string
  themeMode: ThemeMode
  primaryFont: string
  secondaryFont: string
  roundedLevel: RoundedLevel
  productCardShadow: string
  logoUrl: string | null
  bannerMobileUrl: string | null
  storeName: string
  backgroundType: BackgroundType | null
  backgroundEnabled: boolean
  backgroundOpacity: number
  backgroundColor: string
  stripedDirection: 'left' | 'right'
  stripedWidth: number
  stripedHeight: number
  dotWidth: number
  dotHeight: number
  dotGlow: boolean
  gridWidth: number
  gridHeight: number
  gridStrokeDasharray: string
  flickeringSquareSize: number
  flickeringGridGap: number
  flickeringChance: number
  flickeringMaxOpacity: number
  lightRaysCount: number
  lightRaysBlur: number
  lightRaysSpeed: number
  lightRaysLength: string
  isExpanded?: boolean
}

function StorePreview({
  primaryColor,
  themeMode,
  primaryFont,
  secondaryFont: _secondaryFont,
  roundedLevel,
  productCardShadow,
  logoUrl,
  bannerMobileUrl,
  storeName,
  backgroundType,
  backgroundEnabled,
  backgroundOpacity,
  backgroundColor,
  stripedDirection,
  stripedWidth,
  stripedHeight,
  dotWidth,
  dotHeight,
  dotGlow,
  gridWidth,
  gridHeight,
  gridStrokeDasharray,
  flickeringSquareSize,
  flickeringGridGap,
  flickeringChance,
  flickeringMaxOpacity,
  lightRaysCount,
  lightRaysBlur,
  lightRaysSpeed,
  lightRaysLength,
  isExpanded = false,
}: StorePreviewProps) {
  const themeModeLower = themeMode.toLowerCase()
  const roundedClass = getRoundedClass(roundedLevel)
  const formattedPrimaryFont = primaryFont ? formatFontFamily(primaryFont) : 'Inter'
  const fontFamily = formattedPrimaryFont + ', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  // Calculate background and text colors based on theme mode
  const bgColor = themeModeLower === 'dark' ? '#000000' : '#fafafa'
  const textColor = themeModeLower === 'dark' ? '#fafafa' : '#27272a'
  const borderColor = themeModeLower === 'dark' ? '#27272a' : '#e4e4e7'
  const headerBg = themeModeLower === 'dark' ? '#000000' : '#ffffff'

  // Convert shadow color to rgba for box-shadow
  const shadowRgb = hexToRgb(productCardShadow)
  const boxShadow = shadowRgb
    ? `0 10px 15px -3px rgba(${shadowRgb.r}, ${shadowRgb.g}, ${shadowRgb.b}, 0.1), 0 4px 6px -4px rgba(${shadowRgb.r}, ${shadowRgb.g}, ${shadowRgb.b}, 0.1)`
    : 'none'

  // Convert background color hex to RGB for style
  const bgColorRgb = hexToRgb(backgroundColor)
  const backgroundStyle = bgColorRgb
    ? { color: `rgba(${bgColorRgb.r}, ${bgColorRgb.g}, ${bgColorRgb.b}, ${backgroundOpacity})` }
    : { color: backgroundColor, opacity: backgroundOpacity }

  // Helper to render background component
  const renderBackground = () => {
    if (!backgroundType || backgroundType === 'NONE' || !backgroundEnabled) {
      return null
    }

    switch (backgroundType) {
      case 'STRIPED':
        return (
          <StripedPattern
            direction={stripedDirection}
            width={stripedWidth}
            height={stripedHeight}
            style={backgroundStyle}
          />
        )
      case 'DOT':
        return (
          <DotPattern
            width={dotWidth}
            height={dotHeight}
            glow={dotGlow}
            style={backgroundStyle}
          />
        )
      case 'GRID':
        return (
          <GridPattern
            width={gridWidth}
            height={gridHeight}
            strokeDasharray={gridStrokeDasharray}
            style={backgroundStyle}
          />
        )
      case 'FLICKERING_GRID':
        return (
          <FlickeringGrid
            squareSize={flickeringSquareSize}
            gridGap={flickeringGridGap}
            flickerChance={flickeringChance}
            color={backgroundColor}
            maxOpacity={flickeringMaxOpacity}
          />
        )
      case 'LIGHT_RAYS':
        return (
          <LightRays
            count={lightRaysCount}
            blur={lightRaysBlur}
            speed={lightRaysSpeed}
            length={lightRaysLength}
            color={backgroundColor}
            style={{ opacity: backgroundOpacity }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="max-h-[80vh] rounded-lg border overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ backgroundColor: bgColor, fontFamily }}
      >
        {/* Background Pattern */}
        {renderBackground()}
        {/* Header with logo */}
        <header
          className="relative z-10 h-12 flex items-center justify-center border-b"
          style={{ borderColor: borderColor, backgroundColor: headerBg }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className={`h-8 w-auto ${roundedClass} object-contain`}
            />
          ) : (
            <div
              className={`h-7 w-24 ${roundedClass} flex items-center justify-center`}
              style={{ backgroundColor: primaryColor }}
            >
              <span
                className="text-xs font-semibold"
                style={{ color: '#ffffff' }}
              >
                {storeName.toUpperCase().slice(0, 5)}
              </span>
            </div>
          )}
        </header>

        {/* Banner */}
        <div className="relative z-10 px-3 pt-3">
          {bannerMobileUrl ? (
            <img
              src={bannerMobileUrl}
              alt="Banner"
              className={`w-full aspect-4/1 object-cover ${roundedClass}`}
            />
          ) : (
            <div
              className={`w-full aspect-4/1 ${roundedClass} flex items-center justify-center`}
              style={{
                backgroundColor: themeModeLower === 'dark' ? '#1a1a1a' : '#e4e4e7',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: themeModeLower === 'dark' ? '#52525b' : '#a1a1aa' }}
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="relative z-10 px-3 pt-3">
          <p className="text-lg font-semibold mb-2 mt-4">Categorias</p>
          <div className="flex gap-5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Category 1 */}
            <div className="flex min-w-[120px] max-w-[120px] flex-col items-center gap-1 ">
              <div
                className={`w-full aspect-square flex items-center justify-center ${roundedClass}`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#27272a' : '#f4f4f5',
                }}
              >
                <ImageIcon
                  className="w-7 h-7"
                  style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
                />
              </div>
              <span
                className="text-[13px] text-center"
                style={{ color: textColor }}
              >
                Categoria 1
              </span>
            </div>

            {/* Category 2 */}
            <div className="flex min-w-[120px] max-w-[120px] flex-col items-center gap-1">
              <div
                className={`w-full aspect-square flex items-center justify-center ${roundedClass}`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#27272a' : '#f4f4f5',
                }}
              >
                <ImageIcon
                  className="w-7 h-7"
                  style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
                />
              </div>
              <span
                className="text-[13px] text-center"
                style={{ color: textColor }}
              >
                Categoria 2
              </span>
            </div>

            {/* Category 3 */}
            <div className="flex min-w-[120px] max-w-[120px] flex-col items-center gap-1">
              <div
                className={`w-full aspect-square flex items-center justify-center ${roundedClass}`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#27272a' : '#f4f4f5',
                }}
              >
                <ImageIcon
                  className="w-7 h-7"
                  style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
                />
              </div>
              <span
                className="text-[13px] text-center"
                style={{ color: textColor }}
              >
                Categoria 3
              </span>
            </div>

            <div className="flex min-w-[120px] max-w-[120px] flex-col items-center gap-1">
              <div
                className={`w-full aspect-square flex items-center justify-center ${roundedClass}`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#27272a' : '#f4f4f5',
                }}
              >
                <ImageIcon
                  className="w-7 h-7"
                  style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
                />
              </div>
              <span
                className="text-[13px] text-center"
                style={{ color: textColor }}
              >
                Categoria 4
              </span>
            </div>
          </div>
        </div>

        {/* Products by Category */}
        <div className="relative z-10 px-3 pt-4 space-y-4">
          {/* Category 1 Products */}
          <div className="space-y-2">
            <h3
              className="text-lg font-semibold mt-2"
              style={{ color: textColor }}
            >
              Categoria 1
            </h3>
            <div
              className={`grid gap-2 ${isExpanded ? 'grid-cols-[repeat(auto-fit,minmax(150px,1fr))]' : 'grid-cols-2'}`}
            >
              {/* Product 1 */}
              <div
                className={`${roundedClass} border border-gray-200/30 dark:border-gray-700/30 overflow-hidden`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#09090b' : '#ffffff',
                  boxShadow,
                }}
              >
                <div
                  className={`w-full h-48 ${roundedClass} flex items-center justify-center`}
                  style={{
                    backgroundColor: themeModeLower === 'dark' ? '#1a1a1a' : '#f4f4f5',
                  }}
                >
                  <ImageIcon
                    className="w-10 h-10"
                    style={{ color: themeModeLower === 'dark' ? '#52525b' : '#a1a1aa' }}
                  />
                </div>
                <div className="p-1.5 ml-2 h-16">
                  <h4
                    className="truncate text-[14px] font-medium mb-0.5"
                    style={{ color: textColor }}
                  >
                    Produto 1
                  </h4>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: primaryColor }}
                  >
                    R$ 89,90
                  </p>
                </div>
              </div>

              {/* Product 2 */}
              <div
                className={`${roundedClass} border border-gray-200/30 dark:border-gray-700/30 overflow-hidden`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#09090b' : '#ffffff',
                  boxShadow,
                }}
              >
                <div
                  className={`w-full h-48 ${roundedClass} flex items-center justify-center`}
                  style={{
                    backgroundColor: themeModeLower === 'dark' ? '#1a1a1a' : '#f4f4f5',
                  }}
                >
                  <ImageIcon
                    className="w-10 h-10"
                    style={{ color: themeModeLower === 'dark' ? '#52525b' : '#a1a1aa' }}
                  />
                </div>
                <div className="p-1.5 ml-2 h-16">
                  <h4
                    className="truncate text-[14px] font-medium mb-0.5"
                    style={{ color: textColor }}
                  >
                    Produto 2
                  </h4>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: primaryColor }}
                  >
                    R$ 129,90
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category 2 Products */}
          <div className="space-y-2 pt-6">
            <h3
              className="text-lg font-semibold"
              style={{ color: textColor }}
            >
              Categoria 2
            </h3>
            <div
              className={`grid gap-2 ${isExpanded ? 'grid-cols-[repeat(auto-fit,minmax(150px,1fr))]' : 'grid-cols-2'}`}
            >
              {/* Product 1 */}
              <div
                className={`${roundedClass} border border-gray-200/30 dark:border-gray-700/30 overflow-hidden`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#09090b' : '#ffffff',
                  boxShadow,
                }}
              >
                <div
                  className={`w-full h-48 ${roundedClass} flex items-center justify-center`}
                  style={{
                    backgroundColor: themeModeLower === 'dark' ? '#1a1a1a' : '#f4f4f5',
                  }}
                >
                  <ImageIcon
                    className="w-10 h-10"
                    style={{ color: themeModeLower === 'dark' ? '#52525b' : '#a1a1aa' }}
                  />
                </div>
                <div className="p-1.5 ml-2 h-16">
                  <h4
                    className="truncate text-[14px] font-medium mb-0.5"
                    style={{ color: textColor }}
                  >
                    Produto 3
                  </h4>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: primaryColor }}
                  >
                    R$ 79,90
                  </p>
                </div>
              </div>

              {/* Product 2 */}
              <div
                className={`${roundedClass} border border-gray-200/30 dark:border-gray-700/30 overflow-hidden`}
                style={{
                  backgroundColor: themeModeLower === 'dark' ? '#09090b' : '#ffffff',
                  boxShadow,
                }}
              >
                <div
                  className={`w-full h-48 ${roundedClass} flex items-center justify-center`}
                  style={{
                    backgroundColor: themeModeLower === 'dark' ? '#1a1a1a' : '#f4f4f5',
                  }}
                >
                  <ImageIcon
                    className="w-10 h-10"
                    style={{ color: themeModeLower === 'dark' ? '#52525b' : '#a1a1aa' }}
                  />
                </div>
                <div className="p-1.5 ml-2 h-16">
                  <h4
                    className="truncate text-[14px] font-medium mb-0.5"
                    style={{ color: textColor }}
                  >
                    Produto 4
                  </h4>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: primaryColor }}
                  >
                    R$ 99,90
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="relative z-10 mt-8 mb-4 border-t pt-3 px-3 space-y-3"
          style={{ borderColor: borderColor }}
        >
          <div>
            <h4
              className="text-[12px] font-semibold mb-1.5"
              style={{ color: textColor }}
            >
              Sobre
            </h4>
            <p
              className="text-[10px]"
              style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
            >
              {storeName}
            </p>
            <p
              className="text-[10px] mt-1"
              style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
            >
              Rua Exemplo, 123
            </p>
          </div>

          <div>
            <h4
              className="text-[12px] font-semibold mb-1.5"
              style={{ color: textColor }}
            >
              Contato
            </h4>
            <p
              className="text-[10px]"
              style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
            >
              contato@exemplo.com
            </p>
            <p
              className="text-[10px] mt-1"
              style={{ color: themeModeLower === 'dark' ? '#a1a1aa' : '#71717a' }}
            >
              (11) 98765-4321
            </p>
          </div>

          <div>
            <h4
              className="text-[12px] font-semibold mb-1.5"
              style={{ color: textColor }}
            >
              Redes Sociais
            </h4>
            <p
              className="text-[10px]"
              style={{ color: primaryColor }}
            >
              @exemplo_loja
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

function PersonalizacaoPage() {
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()

  // Fetch current store data
  const { data: store, isLoading } = useStore(selectedStoreId)

  // Check if store has BASIC or PRO plan for background feature
  const canEditBackground = !isLoading && (store?.activePlan === 'BASIC' || store?.activePlan === 'PRO')
  
  // Debug log (remover após resolver o problema)
  useEffect(() => {
    if (store) {
      console.log('Store activePlan:', store.activePlan, 'canEditBackground:', canEditBackground)
    }
  }, [store, canEditBackground])

  // Initialize form state from store data
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')
  const [themeMode, setThemeMode] = useState<ThemeMode>('LIGHT')
  const [primaryFont, setPrimaryFont] = useState('')
  const [secondaryFont, setSecondaryFont] = useState('')
  const [roundedLevel, setRoundedLevel] = useState<RoundedLevel>('MEDIUM')
  const [productCardShadow, setProductCardShadow] = useState('#000000')

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Desktop banner
  const [bannerDesktopUrl, setBannerDesktopUrl] = useState<string | null>(null)
  const [bannerDesktopFile, setBannerDesktopFile] = useState<File | null>(null)
  const bannerDesktopInputRef = useRef<HTMLInputElement>(null)

  // Tablet banner
  const [bannerTabletUrl, setBannerTabletUrl] = useState<string | null>(null)
  const [bannerTabletFile, setBannerTabletFile] = useState<File | null>(null)
  const bannerTabletInputRef = useRef<HTMLInputElement>(null)

  // Mobile banner
  const [bannerMobileUrl, setBannerMobileUrl] = useState<string | null>(null)
  const [bannerMobileFile, setBannerMobileFile] = useState<File | null>(null)
  const bannerMobileInputRef = useRef<HTMLInputElement>(null)

  // Banner deletion flags
  const [bannerDesktopDelete, setBannerDesktopDelete] = useState(false)
  const [bannerTabletDelete, setBannerTabletDelete] = useState(false)
  const [bannerMobileDelete, setBannerMobileDelete] = useState(false)

  // Background
  const [backgroundType, setBackgroundType] = useState<BackgroundType | null>(null)
  const [backgroundEnabled, setBackgroundEnabled] = useState(true)
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.7)
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  // Striped pattern config
  const [stripedDirection, setStripedDirection] = useState<'left' | 'right'>('left')
  const [stripedWidth, setStripedWidth] = useState(10)
  const [stripedHeight, setStripedHeight] = useState(10)
  // Dot pattern config
  const [dotWidth, setDotWidth] = useState(16)
  const [dotHeight, setDotHeight] = useState(16)
  const [dotGlow, setDotGlow] = useState(false)
  // Grid pattern config
  const [gridWidth, setGridWidth] = useState(40)
  const [gridHeight, setGridHeight] = useState(40)
  const [gridStrokeDasharray, setGridStrokeDasharray] = useState('0')
  // Flickering grid config
  const [flickeringSquareSize, setFlickeringSquareSize] = useState(4)
  const [flickeringGridGap, setFlickeringGridGap] = useState(6)
  const [flickeringChance, setFlickeringChance] = useState(0.3)
  const [flickeringMaxOpacity, setFlickeringMaxOpacity] = useState(0.3)
  // Light rays config
  const [lightRaysCount, setLightRaysCount] = useState(7)
  const [lightRaysBlur, setLightRaysBlur] = useState(36)
  const [lightRaysSpeed, setLightRaysSpeed] = useState(14)
  const [lightRaysLength, setLightRaysLength] = useState('100%')

  // Active tab state
  const [activeTab, setActiveTab] = useState('identidade')

  // View mode state (settings or preview)
  const [showPreview, setShowPreview] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // AlertDialog state for mobile background tab
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false)

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update form when store data loads
  useEffect(() => {
    if (store) {
      setStoreName(store.name || '')
      setStoreDescription(store.description || '')
      setPrimaryColor(store.primaryColor || '#0ea5e9')
      setThemeMode(store.themeMode || 'LIGHT')
      setPrimaryFont(store.primaryFont || '')
      setSecondaryFont(store.secondaryFont || '')
      setRoundedLevel(store.roundedLevel || 'MEDIUM')
      setProductCardShadow(store.productCardShadow || '#000000')
      setLogoUrl(store.logoUrl || null)
      setBannerDesktopUrl(store.bannerDesktopUrl || null)
      setBannerTabletUrl(store.bannerTabletUrl || null)
      setBannerMobileUrl(store.bannerMobileUrl || null)
      setBackgroundType(store.backgroundType || null)
      setBackgroundEnabled(store.backgroundEnabled ?? true)
      setBackgroundOpacity(store.backgroundOpacity ?? 0.7)
      setBackgroundColor(store.backgroundColor || '#000000')

      // Parse background config JSON if exists
      if (store.backgroundConfigJson) {
        try {
          const config = JSON.parse(store.backgroundConfigJson)
          if (store.backgroundType === 'STRIPED') {
            setStripedDirection(config.direction || 'left')
            setStripedWidth(config.width || 10)
            setStripedHeight(config.height || 10)
          } else if (store.backgroundType === 'DOT') {
            setDotWidth(config.width || 16)
            setDotHeight(config.height || 16)
            setDotGlow(config.glow || false)
          } else if (store.backgroundType === 'GRID') {
            setGridWidth(config.width || 40)
            setGridHeight(config.height || 40)
            setGridStrokeDasharray(config.strokeDasharray || '0')
          } else if (store.backgroundType === 'FLICKERING_GRID') {
            setFlickeringSquareSize(config.squareSize || 4)
            setFlickeringGridGap(config.gridGap || 6)
            setFlickeringChance(config.flickerChance || 0.3)
            setFlickeringMaxOpacity(config.maxOpacity || 0.3)
          } else if (store.backgroundType === 'LIGHT_RAYS') {
            setLightRaysCount(config.count || 7)
            setLightRaysBlur(config.blur || 36)
            setLightRaysSpeed(config.speed || 14)
            setLightRaysLength(config.length || '70vh')
          }
        } catch (e) {
          console.error('Error parsing background config JSON:', e)
        }
      }
    }
  }, [store])

  // Mutation for updating theme
  const updateThemeMutation = useUpdateThemeConfig()

  // Helper function to build background config JSON
  const buildBackgroundConfigJson = (): string | undefined => {
    if (!backgroundType || backgroundType === 'NONE') {
      return undefined
    }

    let config: Record<string, any> = {}

    switch (backgroundType) {
      case 'STRIPED':
        config = {
          direction: stripedDirection,
          width: stripedWidth,
          height: stripedHeight,
        }
        break
      case 'DOT':
        config = {
          width: dotWidth,
          height: dotHeight,
          glow: dotGlow,
        }
        break
      case 'GRID':
        config = {
          width: gridWidth,
          height: gridHeight,
          strokeDasharray: gridStrokeDasharray,
        }
        break
      case 'FLICKERING_GRID':
        config = {
          squareSize: flickeringSquareSize,
          gridGap: flickeringGridGap,
          flickerChance: flickeringChance,
          maxOpacity: flickeringMaxOpacity,
        }
        break
      case 'LIGHT_RAYS':
        config = {
          count: lightRaysCount,
          blur: lightRaysBlur,
          speed: lightRaysSpeed,
          length: lightRaysLength,
        }
        break
    }

    return JSON.stringify(config)
  }

  const handleSave = async () => {
    if (!selectedStoreId) {
      toast.error('Nenhuma loja selecionada')
      return
    }

    try {
      let logoData = undefined
      let bannerDesktopData = undefined
      let bannerTabletData = undefined
      let bannerMobileData = undefined

      // Process logo if uploaded
      if (logoFile) {
        const base64Image = await fileToBase64(logoFile)
        logoData = {
          base64Image,
          fileName: logoFile.name,
          contentType: getContentType(logoFile),
        }
      }

      // Process desktop banner if uploaded
      if (bannerDesktopFile) {
        const base64Image = await fileToBase64(bannerDesktopFile)
        bannerDesktopData = {
          base64Image,
          fileName: bannerDesktopFile.name,
          contentType: getContentType(bannerDesktopFile),
        }
      }

      // Process tablet banner if uploaded
      if (bannerTabletFile) {
        const base64Image = await fileToBase64(bannerTabletFile)
        bannerTabletData = {
          base64Image,
          fileName: bannerTabletFile.name,
          contentType: getContentType(bannerTabletFile),
        }
      }

      // Process mobile banner if uploaded
      if (bannerMobileFile) {
        const base64Image = await fileToBase64(bannerMobileFile)
        bannerMobileData = {
          base64Image,
          fileName: bannerMobileFile.name,
          contentType: getContentType(bannerMobileFile),
        }
      }

      const backgroundConfig = buildBackgroundConfigJson()

      const data: UpdateThemeConfigRequest = {
        name: storeName,
        description: storeDescription,
        primaryColor,
        themeMode,
        primaryFont: primaryFont || undefined,
        secondaryFont: secondaryFont || undefined,
        roundedLevel,
        productCardShadow,
        logo: logoData,
        bannerDesktop: bannerDesktopData,
        bannerTablet: bannerTabletData,
        bannerMobile: bannerMobileData,
        // Only include delete flags if they are true
        bannerDesktopDelete: bannerDesktopDelete || undefined,
        bannerTabletDelete: bannerTabletDelete || undefined,
        bannerMobileDelete: bannerMobileDelete || undefined,
        // Only include background fields if user has BASIC or PRO plan
        backgroundType: canEditBackground ? (backgroundType || undefined) : undefined,
        backgroundEnabled: canEditBackground && backgroundType && backgroundType !== 'NONE' ? backgroundEnabled : undefined,
        backgroundOpacity: canEditBackground && backgroundType && backgroundType !== 'NONE' ? backgroundOpacity : undefined,
        backgroundColor: canEditBackground && backgroundType && backgroundType !== 'NONE' ? backgroundColor : undefined,
        backgroundConfigJson: canEditBackground ? backgroundConfig : undefined,
      }

      await updateThemeMutation.mutateAsync({ storeId: selectedStoreId, data })
      setLogoFile(null)
      setBannerDesktopFile(null)
      setBannerTabletFile(null)
      setBannerMobileFile(null)
      // Reset deletion flags after successful save
      setBannerDesktopDelete(false)
      setBannerTabletDelete(false)
      setBannerMobileDelete(false)
      toast.success('Tema atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar tema')
      console.error(error)
    }
  }

  const getStoreUrl = () => {
    if (!store?.slug) {
      return null
    }

    // Determinar a URL base baseada no ambiente
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const baseUrl = isDevelopment
      ? 'http://localhost:3001'
      : 'https://suavitrine.tech'

    return `${baseUrl}/${store.slug}`
  }

  const handleOpenStore = () => {
    const storeUrl = getStoreUrl()
    if (!storeUrl) {
      toast.error('Slug da loja não disponível')
      return
    }

    window.open(storeUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCopyStoreLink = async () => {
    const storeUrl = getStoreUrl()
    if (!storeUrl) {
      toast.error('Slug da loja não disponível')
      return
    }

    try {
      await navigator.clipboard.writeText(storeUrl)
      toast.success('Link copiado para a área de transferência!')
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      toast.error('Erro ao copiar link')
    }
  }

  const handleReset = () => {
    setStoreName('')
    setStoreDescription('')
    setPrimaryColor('#0ea5e9')
    setThemeMode('LIGHT')
    setPrimaryFont('')
    setSecondaryFont('')
    setRoundedLevel('MEDIUM')
    setProductCardShadow('#000000')
    setLogoUrl(null)
    setBannerDesktopUrl(null)
    setBannerTabletUrl(null)
    setBannerMobileUrl(null)
    setLogoFile(null)
    setBannerDesktopFile(null)
    setBannerTabletFile(null)
    setBannerMobileFile(null)
    // Reset deletion flags
    setBannerDesktopDelete(false)
    setBannerTabletDelete(false)
    setBannerMobileDelete(false)
    setBackgroundType(null)
    setBackgroundEnabled(true)
    setBackgroundOpacity(0.7)
    setBackgroundColor('#000000')
    setStripedDirection('left')
    setStripedWidth(10)
    setStripedHeight(10)
    setDotWidth(16)
    setDotHeight(16)
    setDotGlow(false)
    setGridWidth(40)
    setGridHeight(40)
    setGridStrokeDasharray('0')
    setFlickeringSquareSize(4)
    setFlickeringGridGap(6)
    setFlickeringChance(0.3)
    setFlickeringMaxOpacity(0.3)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const previewUrl = reader.result as string
        setLogoFile(file)
        setLogoUrl(previewUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoUrl(null)
    setLogoFile(null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handleBannerUpload = (type: 'desktop' | 'tablet' | 'mobile') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          const previewUrl = reader.result as string

          if (type === 'desktop') {
            setBannerDesktopFile(file)
            setBannerDesktopUrl(previewUrl)
            setBannerDesktopDelete(false) // Reset delete flag when uploading new banner
          } else if (type === 'tablet') {
            setBannerTabletFile(file)
            setBannerTabletUrl(previewUrl)
            setBannerTabletDelete(false) // Reset delete flag when uploading new banner
          } else if (type === 'mobile') {
            setBannerMobileFile(file)
            setBannerMobileUrl(previewUrl)
            setBannerMobileDelete(false) // Reset delete flag when uploading new banner
          }
        }
        reader.readAsDataURL(file)
      }
    }

  const handleRemoveBanner = (type: 'desktop' | 'tablet' | 'mobile') => () => {
    if (type === 'desktop') {
      setBannerDesktopUrl(null)
      setBannerDesktopFile(null)
      setBannerDesktopDelete(true)
      if (bannerDesktopInputRef.current) {
        bannerDesktopInputRef.current.value = ''
      }
    } else if (type === 'tablet') {
      setBannerTabletUrl(null)
      setBannerTabletFile(null)
      setBannerTabletDelete(true)
      if (bannerTabletInputRef.current) {
        bannerTabletInputRef.current.value = ''
      }
    } else if (type === 'mobile') {
      setBannerMobileUrl(null)
      setBannerMobileFile(null)
      setBannerMobileDelete(true)
      if (bannerMobileInputRef.current) {
        bannerMobileInputRef.current.value = ''
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (!selectedStoreId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nenhuma loja selecionada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-16 md:pt-6 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Personalização</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Customize a aparência da sua vitrine de forma simples e intuitiva
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Store URL */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Input
              readOnly
              value={getStoreUrl() || 'Slug não disponível'}
              className="pr-10 font-mono text-sm"
              disabled={!store?.slug}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleCopyStoreLink}
              disabled={!store?.slug}
              title="Copiar link"
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 ver-vitrine-btn"
            onClick={handleOpenStore}
            disabled={!store?.slug}
          >
            <ExternalLink className="size-4" />
            Ver Vitrine
          </Button>
          <Button
            className="gap-2"
            onClick={handleSave}
            disabled={updateThemeMutation.isPending}
          >
            {updateThemeMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Main Content: Tabs + Preview */}
      {!isMobile && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Panel with Tabs */}
          <div className={`lg:col-span-2 transition-opacity ${showPreview ? 'opacity-0 pointer-events-none hidden' : 'opacity-100'}`}>
            <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start mb-6 bg-[#F6F8F7]">
                    <TabsTrigger value="identidade" className="gap-2">
                      <ImageIcon className="size-4" />
                      Identidade
                    </TabsTrigger>
                    <TabsTrigger value="cores" className="gap-2">
                      <Palette className="size-4" />
                      Cores
                    </TabsTrigger>
                    <TabsTrigger value="banners" className="gap-2">
                      <Upload className="size-4" />
                      Banners
                    </TabsTrigger>
                    {canEditBackground ? (
                      <TabsTrigger value="background" className="gap-2">
                        <Sparkles className="size-4" />
                        Fundo
                      </TabsTrigger>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TabsTrigger
                              value="background"
                              className="gap-2 opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <Sparkles className="size-4" />
                              Fundo
                            </TabsTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Recurso disponível no plano</span>
                              <PlanBadge plan="BASIC" />
                              <span className="text-sm">ou superior</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TabsList>

                  {/* Identidade Tab */}
                  <TabsContent value="identidade" className="space-y-6 mt-0">
                    <div className="space-y-1 mb-6">
                      <h2 className="text-xl font-semibold text-[#1E1E1E]">Identidade Visual</h2>
                      <p className="text-sm text-[#6B6B6B]">
                        Configure o nome, descrição e logo da sua loja
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="store-name" className="text-sm font-medium text-[#1E1E1E]">
                          Nome da Loja
                        </Label>
                        <Input
                          id="store-name"
                          placeholder="Minha Loja Incrível"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="store-description" className="text-sm font-medium text-[#1E1E1E]">
                          Descrição
                        </Label>
                        <Textarea
                          id="store-description"
                          placeholder="Descreva sua loja em poucas palavras..."
                          rows={3}
                          value={storeDescription}
                          onChange={(e) => setStoreDescription(e.target.value)}
                          className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-[#1E1E1E]">Logo da Loja</Label>
                        <div className="flex items-start gap-4">
                          {logoUrl ? (
                            <div className="relative group">
                              <img
                                src={logoUrl}
                                alt="Logo preview"
                                className="size-24 rounded-xl object-cover border-2 border-[#E2E5E3]"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm"
                                onClick={handleRemoveLogo}
                              >
                                <X className="size-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex size-24 items-center justify-center rounded-xl border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7]">
                              <ImageIcon className="size-8 text-[#6B6B6B]" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <Button
                              variant="outline"
                              className="gap-2 border-[#E2E5E3] hover:bg-[#F6F8F7]"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              <Upload className="size-4" />
                              {logoUrl ? 'Alterar Logo' : 'Fazer Upload'}
                            </Button>
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <p className="text-xs text-[#6B6B6B]">
                              Recomendado: 200x200px, PNG ou JPG
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Cores Tab */}
                  <TabsContent value="cores" className="space-y-6 mt-0">
                    <div className="space-y-1 mb-6">
                      <h2 className="text-xl font-semibold text-[#1E1E1E]">Cores do Tema</h2>
                      <p className="text-sm text-[#6B6B6B]">
                        Personalize as cores, fontes e estilos visuais da sua vitrine
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="primary-color" className="text-sm font-medium text-[#1E1E1E]">
                          Cor Primária
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="primary-color"
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="h-12 w-20 cursor-pointer rounded-lg border-[#E2E5E3]"
                          />
                          <Input
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 font-mono border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                            placeholder="#000000"
                          />
                        </div>
                        <p className="text-xs text-[#6B6B6B]">
                          Esta cor será usada em botões, links e elementos de destaque
                        </p>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-[#E2E5E3] p-4 bg-white">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium text-[#1E1E1E]">Modo Escuro</Label>
                          <p className="text-xs text-[#6B6B6B]">
                            Ative o tema escuro para sua loja
                          </p>
                        </div>
                        <Switch
                          checked={themeMode === 'DARK'}
                          onCheckedChange={(checked) => setThemeMode(checked ? 'DARK' : 'LIGHT')}
                        />
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <FontSelect
                          label="Fonte Principal"
                          value={primaryFont}
                          onChange={setPrimaryFont}
                          placeholder="Selecione a fonte principal"
                        />

                        <FontSelect
                          label="Fonte Secundária"
                          value={secondaryFont}
                          onChange={setSecondaryFont}
                          placeholder="Selecione a fonte secundária"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rounded-level" className="text-sm font-medium text-[#1E1E1E]">
                          Nível de Arredondamento
                        </Label>
                        <Select value={roundedLevel} onValueChange={(value: RoundedLevel) => setRoundedLevel(value)}>
                          <SelectTrigger id="rounded-level" className="border-[#E2E5E3] focus:border-[#B6F09C]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">Quadrado (0px)</SelectItem>
                            <SelectItem value="SMALL">Pequeno (4px)</SelectItem>
                            <SelectItem value="MEDIUM">Médio (8px)</SelectItem>
                            <SelectItem value="LARGE">Grande (16px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="product-card-shadow" className="text-sm font-medium text-[#1E1E1E]">
                          Cor da Sombra dos Cards
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="product-card-shadow"
                            type="color"
                            value={productCardShadow}
                            onChange={(e) => setProductCardShadow(e.target.value)}
                            className="h-12 w-20 cursor-pointer rounded-lg border-[#E2E5E3]"
                          />
                          <Input
                            value={productCardShadow}
                            onChange={(e) => setProductCardShadow(e.target.value)}
                            className="flex-1 font-mono border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                            placeholder="#000000"
                          />
                        </div>
                        <p className="text-xs text-[#6B6B6B]">
                          Define a cor da sombra aplicada nos cards de produtos
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Banners Tab */}
                  <TabsContent value="banners" className="space-y-6 mt-0">
                    <div className="space-y-1 mb-6">
                      <h2 className="text-xl font-semibold text-[#1E1E1E]">Banners da Loja</h2>
                      <p className="text-sm text-[#6B6B6B]">
                        Configure os banners que aparecem no topo da sua loja para diferentes dispositivos
                      </p>
                    </div>

                    <div className="space-y-8">
                      {/* Desktop Banner */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-[#1E1E1E]">
                            Banner Desktop
                          </Label>
                          <span className="text-xs text-[#6B6B6B]">1920x480px (4:1)</span>
                        </div>
                        {bannerDesktopUrl ? (
                          <div className="relative group">
                            <img
                              src={bannerDesktopUrl}
                              alt="Banner desktop preview"
                              className="w-full aspect-4/1 rounded-xl object-cover border border-[#E2E5E3]"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity rounded-full shadow-sm"
                              onClick={handleRemoveBanner('desktop')}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-4/1 rounded-xl border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7] flex items-center justify-center">
                            <div className="text-center space-y-3">
                              <ImageIcon className="size-10 mx-auto text-[#6B6B6B]" />
                              <Button
                                variant="outline"
                                className="gap-2 border-[#E2E5E3] hover:bg-white"
                                onClick={() => bannerDesktopInputRef.current?.click()}
                              >
                                <Upload className="size-4" />
                                Adicionar Banner Desktop
                              </Button>
                              <input
                                ref={bannerDesktopInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload('desktop')}
                                className="hidden"
                              />
                              <p className="text-xs text-[#6B6B6B]">
                                Recomendado: 1920x480px, JPG ou PNG
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tablet Banner */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-[#1E1E1E]">
                            Banner Tablet
                          </Label>
                          <span className="text-xs text-[#6B6B6B]">1200x300px (4:1)</span>
                        </div>
                        {bannerTabletUrl ? (
                          <div className="relative group">
                            <img
                              src={bannerTabletUrl}
                              alt="Banner tablet preview"
                              className="w-full aspect-4/1 rounded-xl object-cover border border-[#E2E5E3]"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity rounded-full shadow-sm"
                              onClick={handleRemoveBanner('tablet')}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-4/1 rounded-xl border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7] flex items-center justify-center">
                            <div className="text-center space-y-3">
                              <ImageIcon className="size-10 mx-auto text-[#6B6B6B]" />
                              <Button
                                variant="outline"
                                className="gap-2 border-[#E2E5E3] hover:bg-white"
                                onClick={() => bannerTabletInputRef.current?.click()}
                              >
                                <Upload className="size-4" />
                                Adicionar Banner Tablet
                              </Button>
                              <input
                                ref={bannerTabletInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload('tablet')}
                                className="hidden"
                              />
                              <p className="text-xs text-[#6B6B6B]">
                                Recomendado: 1200x300px, JPG ou PNG
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Banner */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-[#1E1E1E]">
                            Banner Mobile
                          </Label>
                          <span className="text-xs text-[#6B6B6B]">800x200px (4:1)</span>
                        </div>
                        {bannerMobileUrl ? (
                          <div className="relative group">
                            <img
                              src={bannerMobileUrl}
                              alt="Banner mobile preview"
                              className="w-full aspect-4/1 rounded-xl object-cover border border-[#E2E5E3]"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity rounded-full shadow-sm"
                              onClick={handleRemoveBanner('mobile')}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-4/1 rounded-xl border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7] flex items-center justify-center">
                            <div className="text-center space-y-3">
                              <ImageIcon className="size-10 mx-auto text-[#6B6B6B]" />
                              <Button
                                variant="outline"
                                className="gap-2 border-[#E2E5E3] hover:bg-white"
                                onClick={() => bannerMobileInputRef.current?.click()}
                              >
                                <Upload className="size-4" />
                                Adicionar Banner Mobile
                              </Button>
                              <input
                                ref={bannerMobileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload('mobile')}
                                className="hidden"
                              />
                              <p className="text-xs text-[#6B6B6B]">
                                Recomendado: 800x200px, JPG ou PNG
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Background Tab */}
                  {canEditBackground && (
                    <TabsContent value="background" className="space-y-6 mt-0">
                      <div className="space-y-1 mb-6">
                        <h2 className="text-xl font-semibold text-[#1E1E1E]">Fundo da Loja</h2>
                        <p className="text-sm text-[#6B6B6B]">
                          Configure padrões de fundo personalizados para sua vitrine
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="background-type" className="text-sm font-medium text-[#1E1E1E]">
                            Tipo de Fundo
                          </Label>
                          <Select
                            value={backgroundType || 'NONE'}
                            onValueChange={(value: BackgroundType) => setBackgroundType(value === 'NONE' ? null : value)}
                          >
                            <SelectTrigger id="background-type" className="border-[#E2E5E3] focus:border-[#B6F09C]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NONE">Nenhum</SelectItem>
                              <SelectItem value="STRIPED">Listrado</SelectItem>
                              <SelectItem value="DOT">Pontos</SelectItem>
                              <SelectItem value="GRID">Grade</SelectItem>
                              <SelectItem value="FLICKERING_GRID">Grade Piscante</SelectItem>
                              <SelectItem value="LIGHT_RAYS">Raios de Luz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {backgroundType && backgroundType !== 'NONE' && (
                          <>
                            <div className="flex items-center justify-between rounded-xl border border-[#E2E5E3] p-4 bg-white">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-[#1E1E1E]">Ativar Fundo</Label>
                                <p className="text-xs text-[#6B6B6B]">
                                  Mostra ou esconde o padrão de fundo
                                </p>
                              </div>
                              <Switch
                                checked={backgroundEnabled}
                                onCheckedChange={setBackgroundEnabled}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="background-opacity" className="text-sm font-medium text-[#1E1E1E]">
                                Opacidade ({Math.round(backgroundOpacity * 100)}%)
                              </Label>
                              <Input
                                id="background-opacity"
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={backgroundOpacity}
                                onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="background-color" className="text-sm font-medium text-[#1E1E1E]">
                                Cor do Fundo
                              </Label>
                              <div className="flex items-center gap-3">
                                <Input
                                  id="background-color"
                                  type="color"
                                  value={backgroundColor}
                                  onChange={(e) => setBackgroundColor(e.target.value)}
                                  className="h-12 w-20 cursor-pointer rounded-lg border-[#E2E5E3]"
                                />
                                <Input
                                  value={backgroundColor}
                                  onChange={(e) => setBackgroundColor(e.target.value)}
                                  className="flex-1 font-mono border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                  placeholder="#000000"
                                />
                              </div>
                            </div>

                            {/* Striped Pattern Config */}
                            {backgroundType === 'STRIPED' && (
                              <div className="space-y-4 rounded-xl border border-[#E2E5E3] p-4 bg-[#F6F8F7]">
                                <h4 className="font-medium text-sm text-[#1E1E1E]">Padrão Listrado</h4>
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="striped-direction" className="text-xs font-medium text-[#1E1E1E]">
                                      Direção
                                    </Label>
                                    <Select
                                      value={stripedDirection}
                                      onValueChange={(value: 'left' | 'right') => setStripedDirection(value)}
                                    >
                                      <SelectTrigger id="striped-direction" className="border-[#E2E5E3]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="left">Esquerda</SelectItem>
                                        <SelectItem value="right">Direita</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="striped-width" className="text-xs font-medium text-[#1E1E1E]">
                                        Largura
                                      </Label>
                                      <Input
                                        id="striped-width"
                                        type="number"
                                        min="5"
                                        max="50"
                                        value={stripedWidth}
                                        onChange={(e) => setStripedWidth(parseInt(e.target.value) || 10)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="striped-height" className="text-xs font-medium text-[#1E1E1E]">
                                        Altura
                                      </Label>
                                      <Input
                                        id="striped-height"
                                        type="number"
                                        min="5"
                                        max="50"
                                        value={stripedHeight}
                                        onChange={(e) => setStripedHeight(parseInt(e.target.value) || 10)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Dot Pattern Config */}
                            {backgroundType === 'DOT' && (
                              <div className="space-y-4 rounded-xl border border-[#E2E5E3] p-4 bg-[#F6F8F7]">
                                <h4 className="font-medium text-sm text-[#1E1E1E]">Padrão de Pontos</h4>
                                <div className="space-y-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="dot-width" className="text-xs font-medium text-[#1E1E1E]">
                                        Largura
                                      </Label>
                                      <Input
                                        id="dot-width"
                                        type="number"
                                        min="8"
                                        max="50"
                                        value={dotWidth}
                                        onChange={(e) => setDotWidth(parseInt(e.target.value) || 16)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="dot-height" className="text-xs font-medium text-[#1E1E1E]">
                                        Altura
                                      </Label>
                                      <Input
                                        id="dot-height"
                                        type="number"
                                        min="8"
                                        max="50"
                                        value={dotHeight}
                                        onChange={(e) => setDotHeight(parseInt(e.target.value) || 16)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between rounded-lg border border-[#E2E5E3] p-3 bg-white">
                                    <div className="space-y-0.5">
                                      <Label className="text-xs font-medium text-[#1E1E1E]">Efeito Brilho</Label>
                                      <p className="text-xs text-[#6B6B6B]">
                                        Adiciona animação de brilho
                                      </p>
                                    </div>
                                    <Switch
                                      checked={dotGlow}
                                      onCheckedChange={setDotGlow}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Grid Pattern Config */}
                            {backgroundType === 'GRID' && (
                              <div className="space-y-4 rounded-xl border border-[#E2E5E3] p-4 bg-[#F6F8F7]">
                                <h4 className="font-medium text-sm text-[#1E1E1E]">Padrão de Grade</h4>
                                <div className="space-y-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="grid-width" className="text-xs font-medium text-[#1E1E1E]">
                                        Largura
                                      </Label>
                                      <Input
                                        id="grid-width"
                                        type="number"
                                        min="20"
                                        max="100"
                                        value={gridWidth}
                                        onChange={(e) => setGridWidth(parseInt(e.target.value) || 40)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="grid-height" className="text-xs font-medium text-[#1E1E1E]">
                                        Altura
                                      </Label>
                                      <Input
                                        id="grid-height"
                                        type="number"
                                        min="20"
                                        max="100"
                                        value={gridHeight}
                                        onChange={(e) => setGridHeight(parseInt(e.target.value) || 40)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="grid-stroke-dasharray" className="text-xs font-medium text-[#1E1E1E]">
                                      Estilo da Linha
                                    </Label>
                                    <Input
                                      id="grid-stroke-dasharray"
                                      type="text"
                                      value={gridStrokeDasharray}
                                      onChange={(e) => setGridStrokeDasharray(e.target.value)}
                                      placeholder="0 (sólida) ou 5,5 (tracejada)"
                                      className="border-[#E2E5E3]"
                                    />
                                    <p className="text-xs text-[#6B6B6B]">
                                      Use "0" para linha sólida ou "5,5" para tracejada
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Flickering Grid Config */}
                            {backgroundType === 'FLICKERING_GRID' && (
                              <div className="space-y-4 rounded-xl border border-[#E2E5E3] p-4 bg-[#F6F8F7]">
                                <h4 className="font-medium text-sm text-[#1E1E1E]">Grade Piscante</h4>
                                <div className="space-y-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="flickering-square-size" className="text-xs font-medium text-[#1E1E1E]">
                                        Tamanho do Quadrado
                                      </Label>
                                      <Input
                                        id="flickering-square-size"
                                        type="number"
                                        min="2"
                                        max="20"
                                        value={flickeringSquareSize}
                                        onChange={(e) => setFlickeringSquareSize(parseInt(e.target.value) || 4)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="flickering-grid-gap" className="text-xs font-medium text-[#1E1E1E]">
                                        Espaçamento
                                      </Label>
                                      <Input
                                        id="flickering-grid-gap"
                                        type="number"
                                        min="2"
                                        max="20"
                                        value={flickeringGridGap}
                                        onChange={(e) => setFlickeringGridGap(parseInt(e.target.value) || 6)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="flickering-chance" className="text-xs font-medium text-[#1E1E1E]">
                                        Intensidade (0-1)
                                      </Label>
                                      <Input
                                        id="flickering-chance"
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={flickeringChance}
                                        onChange={(e) => setFlickeringChance(parseFloat(e.target.value) || 0.3)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="flickering-max-opacity" className="text-xs font-medium text-[#1E1E1E]">
                                        Brilho Máximo (0-1)
                                      </Label>
                                      <Input
                                        id="flickering-max-opacity"
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={flickeringMaxOpacity}
                                        onChange={(e) => setFlickeringMaxOpacity(parseFloat(e.target.value) || 0.3)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Light Rays Config */}
                            {backgroundType === 'LIGHT_RAYS' && (
                              <div className="space-y-4 rounded-xl border border-[#E2E5E3] p-4 bg-[#F6F8F7]">
                                <h4 className="font-medium text-sm text-[#1E1E1E]">Raios de Luz</h4>
                                <div className="space-y-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="light-rays-count" className="text-xs font-medium text-[#1E1E1E]">
                                        Quantidade
                                      </Label>
                                      <Input
                                        id="light-rays-count"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={lightRaysCount}
                                        onChange={(e) => setLightRaysCount(parseInt(e.target.value) || 7)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="light-rays-blur" className="text-xs font-medium text-[#1E1E1E]">
                                        Desfoque
                                      </Label>
                                      <Input
                                        id="light-rays-blur"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={lightRaysBlur}
                                        onChange={(e) => setLightRaysBlur(parseInt(e.target.value) || 36)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="light-rays-speed" className="text-xs font-medium text-[#1E1E1E]">
                                        Velocidade
                                      </Label>
                                      <Input
                                        id="light-rays-speed"
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={lightRaysSpeed}
                                        onChange={(e) => setLightRaysSpeed(parseInt(e.target.value) || 14)}
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="light-rays-length" className="text-xs font-medium text-[#1E1E1E]">
                                        Comprimento
                                      </Label>
                                      <Input
                                        id="light-rays-length"
                                        type="text"
                                        value={lightRaysLength}
                                        onChange={(e) => setLightRaysLength(e.target.value)}
                                        placeholder="70vh"
                                        className="border-[#E2E5E3]"
                                      />
                                    </div>
                                  </div>
                                  <p className="text-xs text-[#6B6B6B]">
                                    Use valores como "70vh", "100%" ou "500px"
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel - Desktop */}
          {!showPreview && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Preview</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPreview(true)}
                      title="Expandir preview"
                      className="h-8 w-8 text-[#6B6B6B] hover:text-[#1E1E1E]"
                    >
                      <Monitor className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-3 px-1">
                    <p className="text-[10px] text-[#6B6B6B] text-center leading-relaxed">
                      Esta é uma representação aproximada. Os resultados reais da página podem variar.
                    </p>
                  </div>
                  <StorePreview
                    primaryColor={primaryColor}
                    themeMode={themeMode}
                    primaryFont={primaryFont}
                    secondaryFont={secondaryFont}
                    roundedLevel={roundedLevel}
                    productCardShadow={productCardShadow}
                    logoUrl={logoUrl}
                    bannerMobileUrl={bannerMobileUrl}
                    storeName={storeName || store?.name || 'Minha Loja'}
                    backgroundType={backgroundType}
                    backgroundEnabled={backgroundEnabled}
                    backgroundOpacity={backgroundOpacity}
                    backgroundColor={backgroundColor}
                    stripedDirection={stripedDirection}
                    stripedWidth={stripedWidth}
                    stripedHeight={stripedHeight}
                    dotWidth={dotWidth}
                    dotHeight={dotHeight}
                    dotGlow={dotGlow}
                    gridWidth={gridWidth}
                    gridHeight={gridHeight}
                    gridStrokeDasharray={gridStrokeDasharray}
                    flickeringSquareSize={flickeringSquareSize}
                    flickeringGridGap={flickeringGridGap}
                    flickeringChance={flickeringChance}
                    flickeringMaxOpacity={flickeringMaxOpacity}
                    lightRaysCount={lightRaysCount}
                    lightRaysBlur={lightRaysBlur}
                    lightRaysSpeed={lightRaysSpeed}
                    lightRaysLength={lightRaysLength}
                    isExpanded={false}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Fullscreen Preview - Desktop */}
          {showPreview && (
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-[#1E1E1E]">Preview da Loja</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPreview(false)}
                      title="Voltar para modo normal"
                      className="border-[#E2E5E3] hover:bg-[#F6F8F7]"
                    >
                      <Smartphone className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 px-1">
                    <p className="text-[10px] text-[#6B6B6B] text-center leading-relaxed">
                      Esta é uma representação aproximada. Os resultados reais da página podem variar.
                    </p>
                  </div>
                  <StorePreview
                    primaryColor={primaryColor}
                    themeMode={themeMode}
                    primaryFont={primaryFont}
                    secondaryFont={secondaryFont}
                    roundedLevel={roundedLevel}
                    productCardShadow={productCardShadow}
                    logoUrl={logoUrl}
                    bannerMobileUrl={bannerMobileUrl}
                    storeName={storeName || store?.name || 'Minha Loja'}
                    backgroundType={backgroundType}
                    backgroundEnabled={backgroundEnabled}
                    backgroundOpacity={backgroundOpacity}
                    backgroundColor={backgroundColor}
                    stripedDirection={stripedDirection}
                    stripedWidth={stripedWidth}
                    stripedHeight={stripedHeight}
                    dotWidth={dotWidth}
                    dotHeight={dotHeight}
                    dotGlow={dotGlow}
                    gridWidth={gridWidth}
                    gridHeight={gridHeight}
                    gridStrokeDasharray={gridStrokeDasharray}
                    flickeringSquareSize={flickeringSquareSize}
                    flickeringGridGap={flickeringGridGap}
                    flickeringChance={flickeringChance}
                    flickeringMaxOpacity={flickeringMaxOpacity}
                    lightRaysCount={lightRaysCount}
                    lightRaysBlur={lightRaysBlur}
                    lightRaysSpeed={lightRaysSpeed}
                    lightRaysLength={lightRaysLength}
                    isExpanded={true}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Mobile Layout: Full width settings */}
      {isMobile && !showPreview && (
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start mb-6 bg-[#F6F8F7] flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <TabsTrigger value="identidade" className="gap-2 text-xs whitespace-nowrap shrink-0">
                  <ImageIcon className="size-3" />
                  Identidade
                </TabsTrigger>
                <TabsTrigger value="cores" className="gap-2 text-xs whitespace-nowrap shrink-0">
                  <Palette className="size-3" />
                  Cores
                </TabsTrigger>
                <TabsTrigger value="banners" className="gap-2 text-xs whitespace-nowrap shrink-0">
                  <Upload className="size-3" />
                  Banners
                </TabsTrigger>
                {canEditBackground ? (
                  <TabsTrigger value="background" className="gap-2 text-xs whitespace-nowrap shrink-0">
                    <Sparkles className="size-3" />
                    Fundo
                  </TabsTrigger>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="background"
                          className="gap-2 text-xs whitespace-nowrap shrink-0 opacity-50 cursor-not-allowed"
                          disabled
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowBackgroundDialog(true)
                          }}
                        >
                          <Sparkles className="size-3" />
                          Fundo
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Recurso disponível no plano</span>
                          <PlanBadge plan="BASIC" />
                          <span className="text-sm">ou superior</span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TabsList>

              {/* Identidade Tab Content */}
              <TabsContent value="identidade" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="store-name-mobile" className="text-sm font-medium text-[#1E1E1E]">Nome da Loja</Label>
                    <Input
                      id="store-name-mobile"
                      placeholder="Minha Loja Incrível"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-description-mobile" className="text-sm font-medium text-[#1E1E1E]">Descrição</Label>
                    <Textarea
                      id="store-description-mobile"
                      placeholder="Descreva sua loja..."
                      rows={3}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E1E]">Logo da Loja</Label>
                    <div className="flex flex-col items-start gap-4 md:flex-row">
                      {logoUrl ? (
                        <div className="relative group">
                          <img
                            src={logoUrl}
                            alt="Logo preview"
                            className="size-20 rounded-lg object-cover border-2 border-[#E2E5E3]"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                            onClick={handleRemoveLogo}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7]">
                          <ImageIcon className="size-8 text-[#6B6B6B]" />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <Button
                          variant="outline"
                          className="gap-2 w-full md:w-auto border-[#E2E5E3] hover:bg-[#F6F8F7] text-[#1E1E1E]"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          <Upload className="size-4" />
                          {logoUrl ? 'Alterar Logo' : 'Fazer Upload'}
                        </Button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-[#6B6B6B] mt-2">
                          Recomendado: 200x200px, PNG ou JPG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Cores Tab Content */}
              <TabsContent value="cores" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color-mobile" className="text-sm font-medium text-[#1E1E1E]">Cor Primária</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primary-color-mobile"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-20 cursor-pointer border-[#E2E5E3]"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 font-mono border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[#E2E5E3] p-4 bg-white">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-[#1E1E1E]">Modo Escuro</Label>
                      <p className="text-xs text-[#6B6B6B]">
                        Ative o tema escuro para sua loja
                      </p>
                    </div>
                    <Switch
                      checked={themeMode === 'DARK'}
                      onCheckedChange={(checked) => setThemeMode(checked ? 'DARK' : 'LIGHT')}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FontSelect
                      label="Fonte Principal"
                      value={primaryFont}
                      onChange={setPrimaryFont}
                      placeholder="Selecione a fonte principal"
                    />

                    <FontSelect
                      label="Fonte Secundária"
                      value={secondaryFont}
                      onChange={setSecondaryFont}
                      placeholder="Selecione a fonte secundária"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rounded-level-mobile" className="text-sm font-medium text-[#1E1E1E]">Nível de Arredondamento</Label>
                    <Select value={roundedLevel} onValueChange={(value: RoundedLevel) => setRoundedLevel(value)}>
                      <SelectTrigger id="rounded-level-mobile" className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Quadrado (0px)</SelectItem>
                        <SelectItem value="SMALL">Pequeno (4px)</SelectItem>
                        <SelectItem value="MEDIUM">Médio (8px)</SelectItem>
                        <SelectItem value="LARGE">Grande (16px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-card-shadow-mobile" className="text-sm font-medium text-[#1E1E1E]">Cor da Sombra dos Cards</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="product-card-shadow-mobile"
                        type="color"
                        value={productCardShadow}
                        onChange={(e) => setProductCardShadow(e.target.value)}
                        className="h-10 w-20 cursor-pointer border-[#E2E5E3]"
                      />
                      <Input
                        value={productCardShadow}
                        onChange={(e) => setProductCardShadow(e.target.value)}
                        className="flex-1 font-mono border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                        placeholder="#000000"
                      />
                    </div>
                    <p className="text-xs text-[#6B6B6B]">
                      Define a cor da sombra aplicada nos cards de produtos
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="gap-2 w-full border-[#E2E5E3] hover:bg-[#F6F8F7] text-[#1E1E1E]"
                    onClick={handleReset}
                    disabled={updateThemeMutation.isPending}
                  >
                    <RotateCcw className="size-4" />
                    Restaurar Valores Padrão
                  </Button>
                </div>
              </TabsContent>

              {/* Banners Tab Content */}
              <TabsContent value="banners" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Desktop Banner */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E1E]">Banner Desktop (1920x480px)</Label>
                    {bannerDesktopUrl ? (
                      <div className="relative group">
                        <img
                          src={bannerDesktopUrl}
                          alt="Banner desktop preview"
                          className="w-full aspect-4/1 rounded-lg object-cover border border-[#E2E5E3]"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={handleRemoveBanner('desktop')}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-4/1 rounded-lg border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7] flex items-center justify-center py-4">
                        <div className="text-center">
                          <ImageIcon className="size-8 mx-auto mb-2 text-[#6B6B6B]" />
                          <p className="text-sm text-[#6B6B6B] mb-2">
                            Nenhum banner desktop
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-[#E2E5E3] hover:bg-[#F6F8F7] text-[#1E1E1E]"
                            onClick={() => bannerDesktopInputRef.current?.click()}
                          >
                            <Upload className="size-3" />
                            Adicionar Banner
                          </Button>
                          <input
                            ref={bannerDesktopInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload('desktop')}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                    {!bannerDesktopUrl && (
                      <p className="text-xs text-[#6B6B6B]">
                        Recomendado: 1920x480px (4:1), JPG ou PNG
                      </p>
                    )}
                  </div>

                  {/* Tablet Banner */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E1E]">Banner Tablet (1200x300px)</Label>
                    {bannerTabletUrl ? (
                      <div className="relative group">
                        <img
                          src={bannerTabletUrl}
                          alt="Banner tablet preview"
                          className="w-full aspect-4/1 rounded-lg object-cover border border-[#E2E5E3]"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={handleRemoveBanner('tablet')}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-4/1 rounded-lg border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7] flex items-center justify-center py-4">
                        <div className="text-center">
                          <ImageIcon className="size-8 mx-auto mb-2 text-[#6B6B6B]" />
                          <p className="text-sm text-[#6B6B6B] mb-2">
                            Nenhum banner tablet
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-[#E2E5E3] hover:bg-[#F6F8F7] text-[#1E1E1E]"
                            onClick={() => bannerTabletInputRef.current?.click()}
                          >
                            <Upload className="size-3" />
                            Adicionar Banner
                          </Button>
                          <input
                            ref={bannerTabletInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload('tablet')}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                    {!bannerTabletUrl && (
                      <p className="text-xs text-[#6B6B6B]">
                        Recomendado: 1200x300px (4:1), JPG ou PNG
                      </p>
                    )}
                  </div>

                  {/* Mobile Banner */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E1E]">Banner Mobile (800x200px)</Label>
                    {bannerMobileUrl ? (
                      <div className="relative group">
                        <img
                          src={bannerMobileUrl}
                          alt="Banner mobile preview"
                          className="w-full aspect-4/1 rounded-lg object-cover border border-[#E2E5E3]"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={handleRemoveBanner('mobile')}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-4/1 rounded-lg border-2 border-dashed border-[#E2E5E3] bg-[#F6F8F7] flex items-center justify-center py-4">
                        <div className="text-center">
                          <ImageIcon className="size-8 mx-auto mb-2 text-[#6B6B6B]" />
                          <p className="text-sm text-[#6B6B6B] mb-2">
                            Nenhum banner mobile
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-[#E2E5E3] hover:bg-[#F6F8F7] text-[#1E1E1E]"
                            onClick={() => bannerMobileInputRef.current?.click()}
                          >
                            <Upload className="size-3" />
                            Adicionar Banner
                          </Button>
                          <input
                            ref={bannerMobileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload('mobile')}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                    {!bannerMobileUrl && (
                      <p className="text-xs text-[#6B6B6B]">
                        Recomendado: 800x200px (4:1), JPG ou PNG
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Background Tab Content */}
              {canEditBackground && (
                <TabsContent value="background" className="space-y-6 mt-0">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="background-type-mobile" className="text-sm font-medium text-[#1E1E1E]">Tipo de Background</Label>
                      <Select
                        value={backgroundType || 'NONE'}
                        onValueChange={(value: BackgroundType) => setBackgroundType(value === 'NONE' ? null : value)}
                      >
                        <SelectTrigger id="background-type-mobile" className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Nenhum</SelectItem>
                          <SelectItem value="STRIPED">Listrado (Striped)</SelectItem>
                          <SelectItem value="DOT">Pontos (Dot)</SelectItem>
                          <SelectItem value="GRID">Grade (Grid)</SelectItem>
                          <SelectItem value="FLICKERING_GRID">Grade Piscante (Flickering Grid)</SelectItem>
                          <SelectItem value="LIGHT_RAYS">Raios de Luz (Light Rays)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {backgroundType && backgroundType !== 'NONE' && (
                      <>
                        <div className="flex items-center justify-between rounded-lg border border-[#E2E5E3] p-4 bg-white">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium text-[#1E1E1E]">Ativar Background</Label>
                            <p className="text-xs text-[#6B6B6B]">
                              Mostra ou esconde o background
                            </p>
                          </div>
                          <Switch
                            checked={backgroundEnabled}
                            onCheckedChange={setBackgroundEnabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="background-opacity-mobile" className="text-sm font-medium text-[#1E1E1E]">Opacidade ({Math.round(backgroundOpacity * 100)}%)</Label>
                          <Input
                            id="background-opacity-mobile"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={backgroundOpacity}
                            onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="background-color-mobile" className="text-sm font-medium text-[#1E1E1E]">Cor do Background</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              id="background-color-mobile"
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="h-10 w-20 cursor-pointer border-[#E2E5E3]"
                            />
                            <Input
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="flex-1 font-mono border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        {/* Striped Pattern Config */}
                        {backgroundType === 'STRIPED' && (
                          <div className="space-y-4 rounded-lg border border-[#E2E5E3] p-4 bg-white">
                            <h4 className="font-medium text-sm text-[#1E1E1E]">Configurações do Padrão Listrado</h4>
                            <div className="space-y-2">
                              <Label htmlFor="striped-direction-mobile" className="text-sm font-medium text-[#1E1E1E]">Direção</Label>
                              <Select
                                value={stripedDirection}
                                onValueChange={(value: 'left' | 'right') => setStripedDirection(value)}
                              >
                                <SelectTrigger id="striped-direction-mobile" className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Esquerda</SelectItem>
                                  <SelectItem value="right">Direita</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="striped-width-mobile" className="text-sm font-medium text-[#1E1E1E]">Largura</Label>
                                <Input
                                  id="striped-width-mobile"
                                  type="number"
                                  min="5"
                                  max="50"
                                  value={stripedWidth}
                                  onChange={(e) => setStripedWidth(parseInt(e.target.value) || 10)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="striped-height-mobile" className="text-sm font-medium text-[#1E1E1E]">Altura</Label>
                                <Input
                                  id="striped-height-mobile"
                                  type="number"
                                  min="5"
                                  max="50"
                                  value={stripedHeight}
                                  onChange={(e) => setStripedHeight(parseInt(e.target.value) || 10)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dot Pattern Config */}
                        {backgroundType === 'DOT' && (
                          <div className="space-y-4 rounded-lg border border-[#E2E5E3] p-4 bg-white">
                            <h4 className="font-medium text-sm text-[#1E1E1E]">Configurações do Padrão de Pontos</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="dot-width-mobile" className="text-sm font-medium text-[#1E1E1E]">Largura</Label>
                                <Input
                                  id="dot-width-mobile"
                                  type="number"
                                  min="8"
                                  max="50"
                                  value={dotWidth}
                                  onChange={(e) => setDotWidth(parseInt(e.target.value) || 16)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dot-height-mobile" className="text-sm font-medium text-[#1E1E1E]">Altura</Label>
                                <Input
                                  id="dot-height-mobile"
                                  type="number"
                                  min="8"
                                  max="50"
                                  value={dotHeight}
                                  onChange={(e) => setDotHeight(parseInt(e.target.value) || 16)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[#E2E5E3] p-4 bg-white">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-[#1E1E1E]">Efeito Brilho (Glow)</Label>
                                <p className="text-xs text-[#6B6B6B]">
                                  Adiciona animação de brilho aos pontos
                                </p>
                              </div>
                              <Switch
                                checked={dotGlow}
                                onCheckedChange={setDotGlow}
                              />
                            </div>
                          </div>
                        )}

                        {/* Grid Pattern Config */}
                        {backgroundType === 'GRID' && (
                          <div className="space-y-4 rounded-lg border border-[#E2E5E3] p-4 bg-white">
                            <h4 className="font-medium text-sm text-[#1E1E1E]">Configurações do Padrão de Grade</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="grid-width-mobile" className="text-sm font-medium text-[#1E1E1E]">Largura</Label>
                                <Input
                                  id="grid-width-mobile"
                                  type="number"
                                  min="20"
                                  max="100"
                                  value={gridWidth}
                                  onChange={(e) => setGridWidth(parseInt(e.target.value) || 40)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="grid-height-mobile" className="text-sm font-medium text-[#1E1E1E]">Altura</Label>
                                <Input
                                  id="grid-height-mobile"
                                  type="number"
                                  min="20"
                                  max="100"
                                  value={gridHeight}
                                  onChange={(e) => setGridHeight(parseInt(e.target.value) || 40)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="grid-stroke-dasharray-mobile" className="text-sm font-medium text-[#1E1E1E]">Tracejado (Stroke Dasharray)</Label>
                              <Input
                                id="grid-stroke-dasharray-mobile"
                                type="text"
                                value={gridStrokeDasharray}
                                onChange={(e) => setGridStrokeDasharray(e.target.value)}
                                placeholder="0"
                                className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                              />
                              <p className="text-xs text-[#6B6B6B]">
                                Use "0" para linha sólida ou números como "5,5" para tracejado
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Flickering Grid Config */}
                        {backgroundType === 'FLICKERING_GRID' && (
                          <div className="space-y-4 rounded-lg border border-[#E2E5E3] p-4 bg-white">
                            <h4 className="font-medium text-sm text-[#1E1E1E]">Configurações do Padrão de Grade Piscante</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="flickering-square-size-mobile" className="text-sm font-medium text-[#1E1E1E]">Tamanho do Quadrado</Label>
                                <Input
                                  id="flickering-square-size-mobile"
                                  type="number"
                                  min="2"
                                  max="20"
                                  value={flickeringSquareSize}
                                  onChange={(e) => setFlickeringSquareSize(parseInt(e.target.value) || 4)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="flickering-grid-gap-mobile" className="text-sm font-medium text-[#1E1E1E]">Espaçamento</Label>
                                <Input
                                  id="flickering-grid-gap-mobile"
                                  type="number"
                                  min="2"
                                  max="20"
                                  value={flickeringGridGap}
                                  onChange={(e) => setFlickeringGridGap(parseInt(e.target.value) || 6)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="flickering-chance-mobile" className="text-sm font-medium text-[#1E1E1E]">Chance de Piscar (0-1)</Label>
                                <Input
                                  id="flickering-chance-mobile"
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={flickeringChance}
                                  onChange={(e) => setFlickeringChance(parseFloat(e.target.value) || 0.3)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="flickering-max-opacity-mobile" className="text-sm font-medium text-[#1E1E1E]">Opacidade Máxima (0-1)</Label>
                                <Input
                                  id="flickering-max-opacity-mobile"
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={flickeringMaxOpacity}
                                  onChange={(e) => setFlickeringMaxOpacity(parseFloat(e.target.value) || 0.3)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Light Rays Config */}
                        {backgroundType === 'LIGHT_RAYS' && (
                          <div className="space-y-4 rounded-lg border border-[#E2E5E3] p-4 bg-white">
                            <h4 className="font-medium text-sm text-[#1E1E1E]">Configurações dos Raios de Luz</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="light-rays-count-mobile" className="text-sm font-medium text-[#1E1E1E]">Quantidade</Label>
                                <Input
                                  id="light-rays-count-mobile"
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={lightRaysCount}
                                  onChange={(e) => setLightRaysCount(parseInt(e.target.value) || 7)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="light-rays-blur-mobile" className="text-sm font-medium text-[#1E1E1E]">Desfoque (Blur)</Label>
                                <Input
                                  id="light-rays-blur-mobile"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={lightRaysBlur}
                                  onChange={(e) => setLightRaysBlur(parseInt(e.target.value) || 36)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="light-rays-speed-mobile" className="text-sm font-medium text-[#1E1E1E]">Velocidade</Label>
                                <Input
                                  id="light-rays-speed-mobile"
                                  type="number"
                                  min="1"
                                  max="30"
                                  value={lightRaysSpeed}
                                  onChange={(e) => setLightRaysSpeed(parseInt(e.target.value) || 14)}
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="light-rays-length-mobile" className="text-sm font-medium text-[#1E1E1E]">Comprimento</Label>
                                <Input
                                  id="light-rays-length-mobile"
                                  type="text"
                                  value={lightRaysLength}
                                  onChange={(e) => setLightRaysLength(e.target.value)}
                                  placeholder="70vh"
                                  className="border-[#E2E5E3] focus:border-[#B6F09C] focus:ring-[#B6F09C]"
                                />
                                <p className="text-xs text-[#6B6B6B]">
                                  Use valores CSS como "70vh", "100%", "500px"
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}


      {/* Mobile Preview Sheet */}
      {isMobile && (
        <Sheet open={showPreview} onOpenChange={setShowPreview}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Preview da Loja</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <div className="mb-3 px-1">
                <p className="text-[10px] text-[#6B6B6B] text-center leading-relaxed">
                  Esta é uma representação aproximada. Os resultados reais da página podem variar.
                </p>
              </div>
              <StorePreview
                primaryColor={primaryColor}
                themeMode={themeMode}
                primaryFont={primaryFont}
                secondaryFont={secondaryFont}
                roundedLevel={roundedLevel}
                productCardShadow={productCardShadow}
                logoUrl={logoUrl}
                bannerMobileUrl={bannerMobileUrl}
                storeName={storeName || store?.name || 'Minha Loja'}
                backgroundType={backgroundType}
                backgroundEnabled={backgroundEnabled}
                backgroundOpacity={backgroundOpacity}
                backgroundColor={backgroundColor}
                stripedDirection={stripedDirection}
                stripedWidth={stripedWidth}
                stripedHeight={stripedHeight}
                dotWidth={dotWidth}
                dotHeight={dotHeight}
                dotGlow={dotGlow}
                gridWidth={gridWidth}
                gridHeight={gridHeight}
                gridStrokeDasharray={gridStrokeDasharray}
                flickeringSquareSize={flickeringSquareSize}
                flickeringGridGap={flickeringGridGap}
                flickeringChance={flickeringChance}
                flickeringMaxOpacity={flickeringMaxOpacity}
                lightRaysCount={lightRaysCount}
                lightRaysBlur={lightRaysBlur}
                lightRaysSpeed={lightRaysSpeed}
                lightRaysLength={lightRaysLength}
                isExpanded={false}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Floating Toggle Button - Mobile Only */}
      {isMobile && (
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
          size="icon"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <Settings className="size-5" />
              <span className="sr-only">Ver Configurações</span>
            </>
          ) : (
            <>
              <Monitor className="size-5" />
              <span className="sr-only">Ver Preview</span>
            </>
          )}
        </Button>
      )}

      {/* AlertDialog for background feature on mobile */}
      <AlertDialog open={showBackgroundDialog} onOpenChange={setShowBackgroundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Info className="size-5" />
              Feature Premium
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p className="text-sm text-[#6B6B6B]">
                A personalização de background está disponível apenas para planos BASIC e PRO.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-xs text-[#6B6B6B]">Plano atual:</span>
                <PlanBadge plan={store?.activePlan} />
              </div>
              <p className="text-xs text-[#6B6B6B] pt-2">
                Faça upgrade do seu plano para acessar esta feature
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowBackgroundDialog(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
