'use client'

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

interface CartFooterProps {
  themeMode: 'dark' | 'light'
  primaryColor: string
  textColor: string
  phoneNumber?: string
}

export function CartFooter({
  themeMode,
  primaryColor,
  textColor,
  phoneNumber,
}: CartFooterProps) {
  const { items, getTotalPrice, clearCart } = useCart()
  const bgColor = themeMode === 'dark' ? '#000000' : '#ffffff'
  const borderColor = themeMode === 'dark' ? '#27272a' : '#e4e4e7'

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

    const message = formatWhatsAppMessage()
    const whatsappUrl = `https://wa.me/55${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    clearCart()
  }

  if (items.length === 0) return null

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 border-t p-4 shadow-lg"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div>
          <p
            className="text-sm"
            style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
          >
            Total ({items.length} {items.length === 1 ? 'item' : 'itens'})
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: primaryColor }}
          >
            R$ {formatPrice(getTotalPrice())}
          </p>
        </div>
        <Button
          onClick={handleWhatsAppClick}
          disabled={!phoneNumber}
          className="flex items-center justify-center gap-2 px-6 py-6 text-base font-semibold"
          style={{
            backgroundColor: primaryColor,
            color: getContrastTextColor(primaryColor),
          }}
        >
          <WhatsAppIcon className="w-5 h-5" />
          Comprar
        </Button>
      </div>
    </footer>
  )
}

