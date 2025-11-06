'use client'

import { useRef } from 'react'
import { Store } from '../types/store'
import { CategoryImage } from './CategoryImage'

interface CategoriesSliderProps {
  categories: Store['categories']
  storeId: string
  themeMode: 'dark' | 'light'
  roundedClass: string
  primaryColor: string
  textColor: string
  selectedCategoryId: string | null
  onCategorySelect: (categoryId: string | null) => void
}

export function CategoriesSlider({
  categories,
  storeId,
  themeMode,
  roundedClass,
  primaryColor,
  textColor,
  selectedCategoryId,
  onCategorySelect,
}: CategoriesSliderProps) {
  // Show all categories in the slider, not just the first 6
  const categoriesToShow = categories
  
  // Rastrear último clique por categoria para evitar spam (10 segundos)
  const lastClickTimestampsRef = useRef<Map<string, number>>(new Map())

  const handleCategoryClick = (categoryId: string | null) => {
    if (!categoryId) return
    
    // Toggle: se clicar na mesma categoria, desselecionar (mostrar todas)
    const newSelectedId = selectedCategoryId === categoryId ? null : categoryId
    onCategorySelect(newSelectedId)

    // Registrar evento apenas quando está selecionando uma categoria (não quando está desselecionando)
    if (newSelectedId !== null) {
      const now = Date.now()
      const lastClickTime = lastClickTimestampsRef.current.get(categoryId)
      
      // Verificar se passou menos de 10 segundos desde o último clique nesta categoria
      if (lastClickTime && (now - lastClickTime) < 10000) {
        // Menos de 10 segundos desde o último clique - não registrar para evitar spam
        return
      }
      
      // Atualizar timestamp do último clique
      lastClickTimestampsRef.current.set(categoryId, now)
      
      // Registrar de forma assíncrona sem bloquear a UI
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      fetch(`${baseUrl}/api/v1/metrics/events/category-click/${storeId}/${categoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        // Silently fail - metrics are not critical for the user experience
        console.error('Failed to record category click metric:', error)
      })
    }
  }

  return (
    <section className="mb-12">
      <h2
        className="mb-6 text-2xl font-bold"
        style={{ color: textColor }}
      >
        Categorias
      </h2>

      {/* Slider Container */}
      <div className="relative">
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 px-1">
          {categoriesToShow.map((category) => {
            const isSelected = selectedCategoryId === category.id
            return (
              <div
                key={category.id}
                className="flex min-w-[120px] max-w-[120px] sm:min-w-[140px] sm:max-w-[140px] p-1"
              >
                <button
                  type="button"
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex w-full flex-col items-center gap-2 transition-all hover:scale-105 ${roundedClass}`}
                  style={{
                    ...(isSelected && {
                      boxShadow: `0 0 0 2px ${primaryColor}`,
                    }),
                  }}
                >
              {/* Category Image */}
              <div className="w-full">
                <CategoryImage
                  imageUrl={category.imageUrl}
                  categoryName={category.name}
                  themeMode={themeMode}
                  roundedClass={roundedClass}
                />
              </div>

              {/* Category Name */}
              <span
                className={`text-sm font-medium truncate w-full text-center ${
                  isSelected ? 'font-bold' : ''
                }`}
                style={{ 
                  color: isSelected ? primaryColor : textColor 
                }}
              >
                {category.name}
              </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

