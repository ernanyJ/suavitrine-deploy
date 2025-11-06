'use client'

import { useState, useEffect, useRef } from 'react'
import { Product } from '../types/store'
import { useCart } from '../contexts/CartContext'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getContrastTextColor } from '@/lib/utils'

interface ProductDetailsProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  themeMode: 'dark' | 'light'
  roundedClass: string
  primaryColor: string
  textColor: string
  borderColor: string
  phoneNumber?: string
}

// WhatsApp icon SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.149.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

export function ProductDetails({
  product,
  open,
  onOpenChange,
  storeId,
  themeMode,
  roundedClass,
  primaryColor,
  textColor,
  borderColor,
  phoneNumber,
}: ProductDetailsProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const conversionRegisteredRef = useRef(false)
  const clickRegisteredRef = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (open && product) {
      setSelectedImageIndex(0)
      
      // Registrar evento de clique do produto quando o dialog abrir (apenas uma vez)
      if (!clickRegisteredRef.current) {
        clickRegisteredRef.current = true
        // Registrar de forma assíncrona sem bloquear a UI
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
        fetch(`${baseUrl}/api/v1/metrics/events/product-click/${storeId}/${product.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          // Silently fail - metrics are not critical for the user experience
          console.error('Failed to record product click metric:', error)
        })
      }
    }
    
    // Resetar flags quando o dialog/drawer fechar
    if (!open) {
      conversionRegisteredRef.current = false
      clickRegisteredRef.current = false
    }
  }, [open, product, storeId])

  if (!product) return null

  const currentImage = product.images?.[selectedImageIndex]?.url
  const hasMultipleImages = (product.images?.length || 0) > 1
  const bgColor = themeMode === 'dark' ? '#09090b' : '#ffffff'
  const secondaryTextColor = themeMode === 'dark' ? '#a1a1aa' : '#71717a'

  // Format price in Brazilian format (comma as decimal separator)
  const formatPrice = (priceInCents: number): string => {
    return (priceInCents / 100).toFixed(2).replace('.', ',')
  }

  // Format WhatsApp message
  const formatWhatsAppMessage = () => {
    const productName = encodeURIComponent(product.title)
    const price = product.promotionalPrice || product.price
    const formattedPrice = formatPrice(price)
    return `Olá! Gostaria de mais informações sobre o produto: ${productName} - R$ ${formattedPrice}`
  }

  const handleWhatsAppClick = () => {
    if (!phoneNumber) return
    
    // Registrar conversão do produto apenas uma vez por abertura do dialog/drawer (sem bloquear)
    if (!conversionRegisteredRef.current) {
      conversionRegisteredRef.current = true
      // Registrar de forma assíncrona sem bloquear a UI
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      fetch(`${baseUrl}/api/v1/metrics/events/product-conversion/${storeId}/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        // Silently fail - metrics are not critical for the user experience
        console.error('Failed to record product conversion metric:', error)
      })
    }
    
    // Abrir WhatsApp imediatamente, sem esperar a API
    const message = formatWhatsAppMessage()
    const whatsappUrl = `https://wa.me/55${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product)
    // Opcional: fechar o modal após adicionar
    onOpenChange(false)
  }

  const productContent = (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div
          className={`relative aspect-square w-full overflow-hidden ${roundedClass}`}
          style={{
            backgroundColor: themeMode === 'dark' ? '#1a1a1a' : '#e4e4e7',
          }}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
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
                style={{ color: secondaryTextColor }}
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
          )}
          {product.showPromotionBadge && product.promotionalPrice && (
            <Badge
              className="absolute top-4 right-4 z-10 text-xs px-3 py-1.5 shadow-lg"
              style={{
                backgroundColor: primaryColor,
                color: getContrastTextColor(primaryColor),
              }}
            >
              PROMOÇÃO
            </Badge>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {hasMultipleImages && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {product.images?.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`relative shrink-0 overflow-hidden transition-all ${
                  index === selectedImageIndex
                    ? 'opacity-100'
                    : 'opacity-60 hover:opacity-100'
                } ${roundedClass}`}
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: themeMode === 'dark' ? '#1a1a1a' : '#e4e4e7',
                  border: index === selectedImageIndex ? `2px solid ${primaryColor}` : '2px solid transparent',
                }}
              >
                <img
                  src={image.url}
                  alt={`${product.title} - Imagem ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: textColor }}
          >
            {product.title}
          </h2>
          {product.description && (
            <p
              className="mt-2 text-base leading-relaxed whitespace-pre-line"
              style={{ color: secondaryTextColor }}
            >
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          {product.promotionalPrice ? (
            <>
              <div className="flex items-center gap-2">
                <p
                  className="text-lg line-through"
                  style={{ color: secondaryTextColor }}
                >
                  R$ {formatPrice(product.price)}
                </p>
              </div>
              <p
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                R$ {formatPrice(product.promotionalPrice)}
              </p>
            </>
          ) : (
            <p
              className="text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              R$ {formatPrice(product.price)}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={handleAddToCart}
          variant="secondary"
          className="w-full text-base font-semibold py-6"
        >
          Adicionar ao carrinho
        </Button>
        <Button
          onClick={handleWhatsAppClick}
          disabled={!phoneNumber}
          className="w-full text-base font-semibold py-6 flex items-center justify-center gap-2"
          style={{
            backgroundColor: primaryColor,
            color: getContrastTextColor(primaryColor),
          }}
        >
          <WhatsAppIcon className="w-5 h-5" />
          Comprar
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
          }}
        >
          <DrawerHeader
            style={{
              borderBottomColor: borderColor,
              borderBottomWidth: '1px',
            }}
          >
            <DrawerTitle style={{ color: textColor }}>Detalhes do Produto</DrawerTitle>
            <DrawerDescription style={{ color: secondaryTextColor }}>
              Visualize todas as informações do produto
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
            {productContent}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 scrollbar-hide"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle style={{ color: textColor }}>Detalhes do Produto</DialogTitle>
          <DialogDescription style={{ color: secondaryTextColor }}>
            Visualize todas as informações do produto
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">{productContent}</div>
      </DialogContent>
    </Dialog>
  )
}

