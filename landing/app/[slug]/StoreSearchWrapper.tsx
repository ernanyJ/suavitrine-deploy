'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Store } from '../types/store'
import { StoreHeader } from './StoreHeader'
import { StoreContentClient } from './StoreContentClient'

interface StoreSearchWrapperProps {
  store: Store
  themeMode: 'dark' | 'light'
  roundedClass: string
  primaryColor: string
  textColor: string
  borderColor: string
  productCardShadow: string
  logoUrl?: string
  phoneNumber?: string
  children?: ReactNode
}

export function StoreSearchWrapper({
  store,
  themeMode,
  roundedClass,
  primaryColor,
  textColor,
  borderColor,
  productCardShadow,
  logoUrl,
  phoneNumber,
  children,
}: StoreSearchWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <StoreHeader
        logoUrl={logoUrl}
        storeName={store.name}
        storeId={store.id}
        roundedClass={roundedClass}
        primaryColor={primaryColor}
        textColor={textColor}
        borderColor={borderColor}
        themeMode={themeMode}
        phoneNumber={phoneNumber}
      />
      {children}
      <div className="container mx-auto px-4 pb-24 relative z-10">
        <StoreContentClient
          store={store}
          themeMode={themeMode}
          roundedClass={roundedClass}
          primaryColor={primaryColor}
          textColor={textColor}
          borderColor={borderColor}
          productCardShadow={productCardShadow}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </>
  )
}

