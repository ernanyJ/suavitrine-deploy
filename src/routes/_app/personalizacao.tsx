import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
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
  Palette,
  Upload,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
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

// Expandable Card Component
interface ExpandableCardProps {
  title: string
  description: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  defaultIcon?: React.ReactNode
  collapsedContent?: React.ReactNode
}

function ExpandableCard({
  title,
  description,
  isExpanded,
  onToggle,
  children,
  defaultIcon,
  collapsedContent,
}: ExpandableCardProps) {
  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between text-left hover:bg-accent/50 rounded-lg -m-2 p-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            {defaultIcon}
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {isExpanded ? (
        <CardContent>{children}</CardContent>
      ) : (
        collapsedContent && <CardContent className="pt-0">{collapsedContent}</CardContent>
      )}
    </Card>
  )
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
            <div className="grid grid-cols-2 gap-2">
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
            <div className="grid grid-cols-2 gap-2">
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
      
      <p className="text-xs text-muted-foreground text-center">
        Preview em tempo real das personalizações
      </p>
    </div>
  )
}

function PersonalizacaoPage() {
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()
  
  // Fetch current store data
  const { data: store, isLoading } = useStore(selectedStoreId)
  
  // Check if store has BASIC or PRO plan for background feature
  const canEditBackground = store?.activePlan === 'BASIC' || store?.activePlan === 'PRO'
  
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
  
  // Expandable sections state
  const [isBrandingExpanded, setIsBrandingExpanded] = useState(true)
  const [isColorsExpanded, setIsColorsExpanded] = useState(false)
  const [isBannersExpanded, setIsBannersExpanded] = useState(false)
  const [isBackgroundExpanded, setIsBackgroundExpanded] = useState(false)
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false)

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
      toast.success('Tema atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar tema')
      console.error(error)
    }
  }
  
  const handleOpenStore = () => {
    if (!store?.slug) {
      toast.error('Slug da loja não disponível')
      return
    }
    
    // Determinar a URL base baseada no ambiente
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const baseUrl = isDevelopment 
      ? 'http://localhost:3001'
      : 'https://suavitrine-stores.vercel.app'
    
    const storeUrl = `${baseUrl}/${store.slug}`
    window.open(storeUrl, '_blank', 'noopener,noreferrer')
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
          } else if (type === 'tablet') {
            setBannerTabletFile(file)
            setBannerTabletUrl(previewUrl)
          } else if (type === 'mobile') {
            setBannerMobileFile(file)
            setBannerMobileUrl(previewUrl)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  
  const handleRemoveBanner = (type: 'desktop' | 'tablet' | 'mobile') => () => {
    if (type === 'desktop') {
      setBannerDesktopUrl(null)
      setBannerDesktopFile(null)
      if (bannerDesktopInputRef.current) {
        bannerDesktopInputRef.current.value = ''
      }
    } else if (type === 'tablet') {
      setBannerTabletUrl(null)
      setBannerTabletFile(null)
      if (bannerTabletInputRef.current) {
        bannerTabletInputRef.current.value = ''
      }
    } else if (type === 'mobile') {
      setBannerMobileUrl(null)
      setBannerMobileFile(null)
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
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalização</h1>
          <p className="text-muted-foreground">
            Customize a aparência da sua vitrine
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Branding */}
          <ExpandableCard
            title="Identidade Visual"
            description="Configure o logo e as informações da sua loja"
            isExpanded={isBrandingExpanded}
            onToggle={() => setIsBrandingExpanded(!isBrandingExpanded)}
            defaultIcon={<ImageIcon className="size-5 text-muted-foreground" />}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nome da Loja</Label>
                <Input
                  id="store-name"
                  placeholder="Minha Loja Incrível"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-description">Descrição</Label>
                <Textarea
                  id="store-description"
                  placeholder="Descreva sua loja..."
                  rows={3}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo da Loja</Label>
                <div className="flex items-start gap-4">
                  {logoUrl ? (
                    <div className="relative group">
                      <img 
                        src={logoUrl} 
                        alt="Logo preview" 
                        className="size-20 rounded-lg object-cover border-2"
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
                    <div className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                      <ImageIcon className="size-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      className="gap-2"
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Recomendado: 200x200px, PNG ou JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableCard>

          {/* Colors */}
          <ExpandableCard
            title="Cores do Tema"
            description="Personalize as cores da sua vitrine virtual"
            isExpanded={isColorsExpanded}
            onToggle={() => setIsColorsExpanded(!isColorsExpanded)}
            defaultIcon={<Palette className="size-5 text-muted-foreground" />}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor Primária</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
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
                <Label htmlFor="rounded-level">Nível de Arredondamento</Label>
                <Select value={roundedLevel} onValueChange={(value: RoundedLevel) => setRoundedLevel(value)}>
                  <SelectTrigger id="rounded-level">
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
                <Label htmlFor="product-card-shadow">Cor da Sombra dos Cards</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="product-card-shadow"
                    type="color"
                    value={productCardShadow}
                    onChange={(e) => setProductCardShadow(e.target.value)}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    value={productCardShadow}
                    onChange={(e) => setProductCardShadow(e.target.value)}
                    className="flex-1 font-mono"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Define a cor da sombra aplicada nos cards de produtos
                </p>
              </div>

              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleReset}
                disabled={updateThemeMutation.isPending}
              >
                <RotateCcw className="size-4" />
                Restaurar Valores Padrão
              </Button>
            </div>
          </ExpandableCard>

          {/* Banners */}
          <ExpandableCard
            title="Banners da Loja"
            description="Configure os banners que aparecem no topo da sua loja para diferentes dispositivos"
            isExpanded={isBannersExpanded}
            onToggle={() => setIsBannersExpanded(!isBannersExpanded)}
            defaultIcon={<Upload className="size-5 text-muted-foreground" />}
            collapsedContent={
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Desktop</p>
                  {bannerDesktopUrl ? (
                    <img src={bannerDesktopUrl} alt="Desktop banner" className="w-full h-12 object-cover rounded" />
                  ) : (
                    <div className="w-full h-12 border-2 border-dashed rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tablet</p>
                  {bannerTabletUrl ? (
                    <img src={bannerTabletUrl} alt="Tablet banner" className="w-full h-12 object-cover rounded" />
                  ) : (
                    <div className="w-full h-12 border-2 border-dashed rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  {bannerMobileUrl ? (
                    <img src={bannerMobileUrl} alt="Mobile banner" className="w-full h-12 object-cover rounded" />
                  ) : (
                    <div className="w-full h-12 border-2 border-dashed rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Desktop Banner */}
              <div className="space-y-2">
                <Label>Banner Desktop (1920x480px)</Label>
                {bannerDesktopUrl ? (
                  <div className="relative group">
                    <img 
                      src={bannerDesktopUrl} 
                      alt="Banner desktop preview" 
                      className="w-full aspect-4/1 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveBanner('desktop')}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-4/1 rounded-lg border-2 border-dashed bg-muted flex items-center justify-center py-4">
                    <div className="text-center">
                      <ImageIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Nenhum banner desktop
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2"
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
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 1920x480px (4:1), JPG ou PNG
                  </p>
                )}
              </div>

              {/* Tablet Banner */}
              <div className="space-y-2">
                <Label>Banner Tablet (1200x300px)</Label>
                {bannerTabletUrl ? (
                  <div className="relative group">
                    <img 
                      src={bannerTabletUrl} 
                      alt="Banner tablet preview" 
                      className="w-full aspect-4/1 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveBanner('tablet')}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-4/1 rounded-lg border-2 border-dashed bg-muted flex items-center justify-center py-4">
                    <div className="text-center">
                      <ImageIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Nenhum banner tablet
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2"
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
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 1200x300px (4:1), JPG ou PNG
                  </p>
                )}
              </div>

              {/* Mobile Banner */}
              <div className="space-y-2">
                <Label>Banner Mobile (800x200px)</Label>
                {bannerMobileUrl ? (
                  <div className="relative group">
                    <img 
                      src={bannerMobileUrl} 
                      alt="Banner mobile preview" 
                      className="w-full aspect-4/1 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveBanner('mobile')}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-4/1 rounded-lg border-2 border-dashed bg-muted flex items-center justify-center py-4">
                    <div className="text-center">
                      <ImageIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Nenhum banner mobile
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2"
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
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 800x200px (4:1), JPG ou PNG
                  </p>
                )}
              </div>
            </div>
          </ExpandableCard>

          {/* Background */}
          <ExpandableCard
            title="Background"
            description={canEditBackground 
              ? "Configure o padrão de fundo da sua loja" 
              : "Disponível apenas para planos BASIC e PRO"}
            isExpanded={isBackgroundExpanded}
            onToggle={() => canEditBackground && setIsBackgroundExpanded(!isBackgroundExpanded)}
            collapsedContent={
              !canEditBackground ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="size-4" />
                  <span>Feature disponível apenas para planos BASIC e PRO</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">
                    {backgroundType === 'NONE' || !backgroundType 
                      ? 'Nenhum' 
                      : backgroundType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {backgroundType && backgroundType !== 'NONE' && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">Ativado:</span>
                      <span className="font-medium">{backgroundEnabled ? 'Sim' : 'Não'}</span>
                    </>
                  )}
                </div>
              )
            }
          >
            {!canEditBackground ? (
              <div className="space-y-4 rounded-lg border p-6 text-center">
                <Info className="size-8 mx-auto text-muted-foreground mb-2" />
                <div>
                  <h4 className="font-medium mb-1">Feature Premium</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    A personalização de background está disponível apenas para planos BASIC e PRO.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-muted-foreground">Plano atual:</span>
                    <PlanBadge plan={store?.activePlan} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Faça upgrade do seu plano para acessar esta feature
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="background-type">Tipo de Background</Label>
                <Select 
                  value={backgroundType || 'NONE'} 
                  onValueChange={(value: BackgroundType) => setBackgroundType(value === 'NONE' ? null : value)}
                >
                  <SelectTrigger id="background-type">
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
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Ativar Background</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostra ou esconde o background
                      </p>
                    </div>
                    <Switch 
                      checked={backgroundEnabled} 
                      onCheckedChange={setBackgroundEnabled} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background-opacity">Opacidade ({Math.round(backgroundOpacity * 100)}%)</Label>
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
                    <Label htmlFor="background-color">Cor do Background</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="background-color"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Striped Pattern Config */}
                  {backgroundType === 'STRIPED' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium text-sm">Configurações do Padrão Listrado</h4>
                      <div className="space-y-2">
                        <Label htmlFor="striped-direction">Direção</Label>
                        <Select 
                          value={stripedDirection} 
                          onValueChange={(value: 'left' | 'right') => setStripedDirection(value)}
                        >
                          <SelectTrigger id="striped-direction">
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
                          <Label htmlFor="striped-width">Largura</Label>
                          <Input
                            id="striped-width"
                            type="number"
                            min="5"
                            max="50"
                            value={stripedWidth}
                            onChange={(e) => setStripedWidth(parseInt(e.target.value) || 10)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="striped-height">Altura</Label>
                          <Input
                            id="striped-height"
                            type="number"
                            min="5"
                            max="50"
                            value={stripedHeight}
                            onChange={(e) => setStripedHeight(parseInt(e.target.value) || 10)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dot Pattern Config */}
                  {backgroundType === 'DOT' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium text-sm">Configurações do Padrão de Pontos</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="dot-width">Largura</Label>
                          <Input
                            id="dot-width"
                            type="number"
                            min="8"
                            max="50"
                            value={dotWidth}
                            onChange={(e) => setDotWidth(parseInt(e.target.value) || 16)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dot-height">Altura</Label>
                          <Input
                            id="dot-height"
                            type="number"
                            min="8"
                            max="50"
                            value={dotHeight}
                            onChange={(e) => setDotHeight(parseInt(e.target.value) || 16)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label>Efeito Brilho (Glow)</Label>
                          <p className="text-sm text-muted-foreground">
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
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium text-sm">Configurações do Padrão de Grade</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="grid-width">Largura</Label>
                          <Input
                            id="grid-width"
                            type="number"
                            min="20"
                            max="100"
                            value={gridWidth}
                            onChange={(e) => setGridWidth(parseInt(e.target.value) || 40)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grid-height">Altura</Label>
                          <Input
                            id="grid-height"
                            type="number"
                            min="20"
                            max="100"
                            value={gridHeight}
                            onChange={(e) => setGridHeight(parseInt(e.target.value) || 40)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grid-stroke-dasharray">Tracejado (Stroke Dasharray)</Label>
                        <Input
                          id="grid-stroke-dasharray"
                          type="text"
                          value={gridStrokeDasharray}
                          onChange={(e) => setGridStrokeDasharray(e.target.value)}
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use "0" para linha sólida ou números como "5,5" para tracejado
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Flickering Grid Config */}
                  {backgroundType === 'FLICKERING_GRID' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium text-sm">Configurações do Padrão de Grade Piscante</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="flickering-square-size">Tamanho do Quadrado</Label>
                          <Input
                            id="flickering-square-size"
                            type="number"
                            min="2"
                            max="20"
                            value={flickeringSquareSize}
                            onChange={(e) => setFlickeringSquareSize(parseInt(e.target.value) || 4)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flickering-grid-gap">Espaçamento</Label>
                          <Input
                            id="flickering-grid-gap"
                            type="number"
                            min="2"
                            max="20"
                            value={flickeringGridGap}
                            onChange={(e) => setFlickeringGridGap(parseInt(e.target.value) || 6)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="flickering-chance">Chance de Piscar (0-1)</Label>
                          <Input
                            id="flickering-chance"
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={flickeringChance}
                            onChange={(e) => setFlickeringChance(parseFloat(e.target.value) || 0.3)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flickering-max-opacity">Opacidade Máxima (0-1)</Label>
                          <Input
                            id="flickering-max-opacity"
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={flickeringMaxOpacity}
                            onChange={(e) => setFlickeringMaxOpacity(parseFloat(e.target.value) || 0.3)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Light Rays Config */}
                  {backgroundType === 'LIGHT_RAYS' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium text-sm">Configurações dos Raios de Luz</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="light-rays-count">Quantidade</Label>
                          <Input
                            id="light-rays-count"
                            type="number"
                            min="1"
                            max="20"
                            value={lightRaysCount}
                            onChange={(e) => setLightRaysCount(parseInt(e.target.value) || 7)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="light-rays-blur">Desfoque (Blur)</Label>
                          <Input
                            id="light-rays-blur"
                            type="number"
                            min="0"
                            max="100"
                            value={lightRaysBlur}
                            onChange={(e) => setLightRaysBlur(parseInt(e.target.value) || 36)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="light-rays-speed">Velocidade</Label>
                          <Input
                            id="light-rays-speed"
                            type="number"
                            min="1"
                            max="30"
                            value={lightRaysSpeed}
                            onChange={(e) => setLightRaysSpeed(parseInt(e.target.value) || 14)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="light-rays-length">Comprimento</Label>
                          <Input
                            id="light-rays-length"
                            type="text"
                            value={lightRaysLength}
                            onChange={(e) => setLightRaysLength(e.target.value)}
                            placeholder="70vh"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use valores CSS como "70vh", "100%", "500px"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              </div>
            )}
          </ExpandableCard>

          {/* Advanced Settings */}
          <ExpandableCard
            title="Configurações Avançadas"
            description="Personalizações adicionais do tema"
            isExpanded={isAdvancedExpanded}
            onToggle={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Mostrar Badges de Promoção</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibe badges em produtos com desconto
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Ativar Busca por Voz</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que clientes busquem por voz
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Chat ao Vivo</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa o chat em tempo real com clientes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </ExpandableCard>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Visualização em tempo real das alterações
              </CardDescription>
            </CardHeader>
            <CardContent>
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
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
