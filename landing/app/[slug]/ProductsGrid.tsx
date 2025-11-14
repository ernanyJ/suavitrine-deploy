'use client'

import { useState } from 'react'
import { Store } from '../types/store'
import { ProductCard } from './ProductCard'

interface ProductsGridProps {
  categories: Store['categories']
  storeId: string
  themeMode: 'dark' | 'light'
  roundedClass: string
  primaryColor: string
  textColor: string
  borderColor: string
  productCardShadow: string
  phoneNumber?: string
  selectedCategoryId: string | null
  searchQuery: string
}

export function ProductsGrid({
  categories,
  storeId,
  themeMode,
  roundedClass,
  primaryColor,
  textColor,
  borderColor,
  productCardShadow,
  phoneNumber,
  selectedCategoryId,
  searchQuery,
}: ProductsGridProps) {
  // Se uma categoria estiver selecionada, mostrar apenas os produtos dessa categoria
  // Caso contrário, mostrar todos os produtos organizados por categoria
  let filteredCategories = selectedCategoryId
    ? categories.filter(cat => cat.id === selectedCategoryId)
    : categories

  // Filtrar produtos por pesquisa se houver termo de busca
  if (searchQuery.trim()) {
    const searchLower = searchQuery.toLowerCase().trim()
    filteredCategories = filteredCategories.map(category => ({
      ...category,
      products: category.products.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      )
    })).filter(category => category.products.length > 0)
  }

  // Encontrar a categoria selecionada para mostrar o nome
  const selectedCategory = selectedCategoryId
    ? categories.find(cat => cat.id === selectedCategoryId)
    : null

  // Se nenhuma categoria tiver produtos, não mostrar nada
  const categoriesWithProducts = filteredCategories.filter(
    cat => cat.products.length > 0
  )

  if (categoriesWithProducts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p
          className="text-lg"
          style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
        >
          {searchQuery.trim()
            ? `Nenhum produto encontrado para "${searchQuery}".`
            : 'Nenhum produto encontrado nesta categoria.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Texto de filtro quando uma categoria está selecionada ou há pesquisa */}
      {(selectedCategory || searchQuery.trim()) && (
        <div className="mb-6">
          <p
            className="text-base"
            style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
          >
            {selectedCategory && searchQuery.trim() && (
              <>
                Filtrando pela categoria <span style={{ color: primaryColor, fontWeight: 600 }}>{selectedCategory.name}</span> e pesquisa <span style={{ color: primaryColor, fontWeight: 600 }}>"{searchQuery}"</span>
              </>
            )}
            {selectedCategory && !searchQuery.trim() && (
              <>
                Filtrando pela categoria <span style={{ color: primaryColor, fontWeight: 600 }}>{selectedCategory.name}</span>
              </>
            )}
            {!selectedCategory && searchQuery.trim() && (
              <>
                Resultados para <span style={{ color: primaryColor, fontWeight: 600 }}>"{searchQuery}"</span>
              </>
            )}
          </p>
        </div>
      )}
      <section className="space-y-12">
      {categoriesWithProducts.map((category) => (
        <div key={category.id || 'uncategorized'}>
          <h3
            className="mb-6 text-xl font-semibold"
            style={{ color: textColor }}
          >
            {category.name}
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeId={storeId}
                themeMode={themeMode}
                roundedClass={roundedClass}
                primaryColor={primaryColor}
                textColor={textColor}
                borderColor={borderColor}
                productCardShadow={productCardShadow}
                phoneNumber={phoneNumber}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
    </>
  )
}

