'use client'

import { useRef, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { getContrastTextColor } from '@/lib/utils'

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

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  themeMode: 'dark' | 'light'
  primaryColor: string
  textColor: string
  borderColor: string
  phoneNumber?: string
}

export function CartSheet({
  open,
  onOpenChange,
  storeId,
  themeMode,
  primaryColor,
  textColor,
  borderColor,
  phoneNumber,
}: CartSheetProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart()
  const bgColor = themeMode === 'dark' ? '#09090b' : '#ffffff'
  const secondaryTextColor = themeMode === 'dark' ? '#a1a1aa' : '#71717a'
  const conversionRegisteredRef = useRef(false)

  // Resetar flag quando o sheet abrir ou fechar
  useEffect(() => {
    conversionRegisteredRef.current = false
  }, [open])

  // Format price in Brazilian format (comma as decimal separator)
  const formatPrice = (priceInCents: number): string => {
    return (priceInCents / 100).toFixed(2).replace('.', ',')
  }

  // Format WhatsApp message with cart items
  const formatWhatsAppMessage = () => {
    const itemsText = items
      .map((item) => {
        const price = item.product.promotionalPrice || item.product.price
        const formattedPrice = formatPrice(price)
        return `${item.quantity}x ${item.product.title} - R$ ${formattedPrice}`
      })
      .join('\n')

    const totalPrice = getTotalPrice()
    const formattedTotal = formatPrice(totalPrice)

    return `Olá! Gostaria de finalizar a compra dos seguintes produtos:\n\n${itemsText}\n\nTotal: R$ ${formattedTotal}`
  }

  const handleWhatsAppClick = () => {
    if (!phoneNumber || items.length === 0) return
    
    // Registrar conversão para todos os produtos do carrinho apenas uma vez por abertura do sheet (sem bloquear)
    if (!conversionRegisteredRef.current) {
      conversionRegisteredRef.current = true
      // Registrar de forma assíncrona sem bloquear a UI
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      // Usar Promise.allSettled para garantir que todas as conversões sejam registradas
      // mesmo se algumas falharem, mas sem await para não bloquear
      Promise.allSettled(
        items.map((item) =>
          fetch(`${baseUrl}/api/v1/metrics/events/product-conversion/${storeId}/${item.product.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        )
      ).catch((error) => {
        // Silently fail - metrics are not critical for the user experience
        console.error('Failed to record product conversion metrics:', error)
      })
    }
    
    // Abrir WhatsApp imediatamente, sem esperar a API
    const message = formatWhatsAppMessage()
    const whatsappUrl = `https://wa.me/55${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    clearCart()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
        }}
      >
        <SheetHeader className="shrink-0">
          <SheetTitle style={{ color: textColor }}>Carrinho de Compras</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p style={{ color: secondaryTextColor }}>Seu carrinho está vazio</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0 px-4">
                {items.map((item) => {
                  const price = item.product.promotionalPrice || item.product.price
                  const imageUrl = item.product.images?.[0]?.url

                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-4 pb-4 border-b"
                      style={{ borderColor: borderColor }}
                    >
                      {imageUrl && (
                        <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={imageUrl}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-semibold text-sm truncate mb-1"
                          style={{ color: textColor }}
                        >
                          {item.product.title}
                        </h4>
                        <p
                          className="text-base font-bold mb-2"
                          style={{ color: primaryColor }}
                        >
                          R$ {formatPrice(price)}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded border"
                            style={{
                              borderColor: borderColor,
                              color: textColor,
                            }}
                          >
                            -
                          </button>
                          <span style={{ color: textColor }}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded border"
                            style={{
                              borderColor: borderColor,
                              color: textColor,
                            }}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto text-xs px-2 py-1 rounded"
                            style={{
                              color: secondaryTextColor,
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <SheetFooter className="flex-col gap-2 shrink-0">
                <div className="w-full flex justify-between items-center py-2">
                  <span style={{ color: textColor }} className="font-semibold">
                    Total:
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    R$ {formatPrice(getTotalPrice())}
                  </span>
                </div>
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
                  Finalizar Compra
                </Button>
              </SheetFooter>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

