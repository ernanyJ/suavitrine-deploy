'use client'

import { useState } from 'react'
import { Store } from '../types/store'
import { CategoriesSlider } from './CategoriesSlider'
import { ProductsGrid } from './ProductsGrid'

interface StoreContentClientProps {
  store: Store
  themeMode: 'dark' | 'light'
  roundedClass: string
  primaryColor: string
  textColor: string
  borderColor: string
  productCardShadow: string
}

export function StoreContentClient({
  store,
  themeMode,
  roundedClass,
  primaryColor,
  textColor,
  borderColor,
  productCardShadow,
}: StoreContentClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  return (
    <>
      {/* Categorias - Slider Horizontal */}
      {store.categories.length > 0 && (
        <CategoriesSlider
          categories={store.categories}
          storeId={store.id}
          themeMode={themeMode}
          roundedClass={roundedClass}
          primaryColor={primaryColor}
          textColor={textColor}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
      )}

      {/* Produtos Filtrados */}
      <ProductsGrid
        categories={store.categories}
        storeId={store.id}
        themeMode={themeMode}
        roundedClass={roundedClass}
        primaryColor={primaryColor}
        textColor={textColor}
        borderColor={borderColor}
        productCardShadow={productCardShadow}
        phoneNumber={store.phoneNumber}
        selectedCategoryId={selectedCategoryId}
      />
    </>
  )
}

