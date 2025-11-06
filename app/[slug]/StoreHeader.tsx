'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { CartSheet } from './CartSheet'
import { useCart } from '../contexts/CartContext'
import { getContrastTextColor } from '@/lib/utils'

interface StoreHeaderProps {
  logoUrl?: string
  storeName: string
  storeId: string
  roundedClass: string
  primaryColor: string
  textColor: string
  borderColor: string
  themeMode: 'dark' | 'light'
  phoneNumber?: string
}

export function StoreHeader({
  logoUrl,
  storeName,
  storeId,
  roundedClass,
  primaryColor,
  textColor,
  borderColor,
  themeMode,
  phoneNumber,
}: StoreHeaderProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const { getTotalItems } = useCart()

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          borderColor: borderColor,
          backgroundColor: themeMode === 'dark' ? '#000000' : '#ffffff',
        }}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex-1" />
          <div className="flex items-center justify-center flex-1">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                className={`h-10 w-auto ${roundedClass} object-contain`}
              />
            ) : (
              <div
                className={`h-10 w-32 ${roundedClass} flex items-center justify-center`}
                style={{ backgroundColor: primaryColor }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: getContrastTextColor(primaryColor) }}
                >
                  {storeName.toUpperCase().slice(0, 5)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-md transition-all hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: textColor,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: textColor }} />
              {getTotalItems() > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10"
                  style={{
                    backgroundColor: primaryColor,
                    color: getContrastTextColor(primaryColor),
                  }}
                >
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        storeId={storeId}
        themeMode={themeMode}
        primaryColor={primaryColor}
        textColor={textColor}
        borderColor={borderColor}
        phoneNumber={phoneNumber}
      />
    </>
  )
}

