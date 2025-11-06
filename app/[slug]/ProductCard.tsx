'use client'

import { useState } from 'react'
import { Product } from '../types/store'
import { ProductImage } from './ProductImage'
import { ProductDetails } from './ProductDetails'
import { Badge } from '@/components/ui/badge'
import { getContrastTextColor } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  storeId: string
  themeMode: 'dark' | 'light'
  roundedClass: string
  primaryColor: string
  textColor: string
  borderColor: string
  productCardShadow: string
  phoneNumber?: string
}

export function ProductCard({
  product,
  storeId,
  themeMode,
  roundedClass,
  primaryColor,
  textColor,
  borderColor,
  productCardShadow,
  phoneNumber,
}: ProductCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    // Prevenir que o clique abra o modal se já estiver aberto ou fechando
    if (detailsOpen) return
    
    e.stopPropagation()
    // Abrir dialog imediatamente - a métrica será registrada quando o dialog abrir
    setDetailsOpen(true)
  }

  const imageUrl = product.images?.[0]?.url

  // Format price in Brazilian format (comma as decimal separator)
  const formatPrice = (priceInCents: number): string => {
    return (priceInCents / 100).toFixed(2).replace('.', ',')
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`relative overflow-visible ${roundedClass} border cursor-pointer transition-transform hover:scale-105`}
        style={{
          borderColor: borderColor,
          backgroundColor: themeMode === 'dark' ? '#09090b' : '#ffffff',
          boxShadow: productCardShadow,
        }}
      >
        {/* Badge de Promoção - Posicionado absolutamente no topo direito com efeito 3D */}
        {product.showPromotionBadge && product.promotionalPrice && (
          <Badge
            className="absolute -top-2 -right-2 z-20 text-xs px-2 py-1 shadow-lg"
            style={{
              backgroundColor: primaryColor,
              color: getContrastTextColor(primaryColor),
              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)`,
            }}
          >
            PROMOÇÃO
          </Badge>
        )}
        
        {/* Imagem do produto */}
        <ProductImage
          imageUrl={imageUrl}
          title={product.title}
          themeMode={themeMode}
          roundedClass={roundedClass}
        />
        <div className="p-3 text-left">
          <h4
            className="mb-1 truncate text-sm font-medium"
            style={{ color: textColor }}
          >
            {product.title}
          </h4>
          {product.description && (
            <p
              className="text-xs line-clamp-2"
              style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
            >
              {product.description}
            </p>
          )}
          {product.promotionalPrice ? (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <p
                  className="text-xs line-through"
                  style={{ color: themeMode === 'dark' ? '#71717a' : '#a1a1aa' }}
                >
                  R$ {formatPrice(product.price)}
                </p>
              </div>
              <p
                className="text-base font-bold"
                style={{ color: primaryColor }}
              >
                R$ {formatPrice(product.promotionalPrice)}
              </p>
            </div>
          ) : (
            <p
              className="mt-2 text-base font-bold"
              style={{ color: primaryColor }}
            >
              R$ {formatPrice(product.price)}
            </p>
          )}
        </div>
      </button>
      <ProductDetails
        product={product}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        storeId={storeId}
        themeMode={themeMode}
        roundedClass={roundedClass}
        primaryColor={primaryColor}
        textColor={textColor}
        borderColor={borderColor}
        phoneNumber={phoneNumber}
      />
    </>
  )
}

