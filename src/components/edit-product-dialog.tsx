import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Plus, Trash2, PlusCircle } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { useUpdateProduct, useStoreCategories, useCreateCategory } from '@/lib/api/queries'
import type { ProductResponse } from '@/lib/api/products'

// Validation functions
const validateRequired = ({ value }: { value: string }) => {
  if (!value || value.trim() === '') {
    return 'Este campo é obrigatório'
  }
  return undefined
}

const validatePrice = ({ value }: { value: string }) => {
  if (!value || value.trim() === '') {
    return 'Este campo é obrigatório'
  }
  const cents = parseCentsFromReais(value)
  if (cents <= 0) {
    return 'Preço deve ser maior que zero'
  }
  return undefined
}

const validatePromotionalPrice = ({ value }: { value: string }) => {
  if (!value || value.trim() === '') {
    return undefined // Opcional
  }
  const cents = parseCentsFromReais(value)
  if (cents <= 0) {
    return 'Preço promocional deve ser maior que zero'
  }
  return undefined
}

// Format input value as user types (convert cents to formatted string)
const formatPriceInput = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/[^\d]/g, '')
  
  if (numbers === '') return ''
  
  // Convert to number
  const cents = parseInt(numbers) || 0
  
  // Format as reais with comma
  const reais = cents / 100
  return reais.toFixed(2).replace('.', ',')
}

// Parse cents from formatted reais (e.g., "1,00" -> 100)
const parseCentsFromReais = (value: string): number => {
  // Remove everything except numbers
  const numbers = value.replace(/[^\d]/g, '')
  return parseInt(numbers) || 0
}

// Format price from cents to display format
const formatPriceFromCents = (cents: number): string => {
  const reais = cents / 100
  return reais.toFixed(2).replace('.', ',')
}

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  product: ProductResponse | null
}

export function EditProductDialog({
  open,
  onOpenChange,
  storeId,
  product,
}: EditProductDialogProps) {
  const updateProductMutation = useUpdateProduct(storeId)
  const createCategoryMutation = useCreateCategory(storeId)
  const { data: categories = [] } = useStoreCategories(storeId)

  const [variations, setVariations] = useState<
    Array<{ title: string; imageUrl: string }>
  >([])
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const form = useForm({
    defaultValues: {
      title: product?.title || '',
      price: product?.price ? formatPriceFromCents(product.price) : '',
      promotionalPrice: product?.promotionalPrice ? formatPriceFromCents(product.promotionalPrice) : '',
      showPromotionBadge: product?.showPromotionBadge || false,
      description: product?.description || '',
      categoryId: product?.category?.id || '',
      available: product?.available ?? true,
      variations: [] as Array<{ title: string; imageUrl: string }>,
    },
    onSubmit: async ({ value }) => {
      // Validate all required fields before submitting
      if (!value.title || value.title.trim() === '') {
        return
      }
      if (!value.price || value.price.trim() === '') {
        return
      }
      if (!value.categoryId) {
        return
      }

      if (!product) return

      // Parse price from formatted string to cents
      const priceInCents = parseCentsFromReais(value.price)
      if (priceInCents <= 0) {
        return
      }

      // Parse promotional price if provided
      const promotionalPriceInCents = value.promotionalPrice && value.promotionalPrice.trim() !== ''
        ? parseCentsFromReais(value.promotionalPrice)
        : undefined

      try {
        await updateProductMutation.mutateAsync({
          productId: product.id,
          data: {
            title: value.title,
            price: priceInCents,
            promotionalPrice: promotionalPriceInCents,
            showPromotionBadge: value.showPromotionBadge || false,
            description: value.description || undefined,
            categoryId: value.categoryId,
            available: value.available ?? true,
            variations: variations.length > 0 ? variations : undefined,
          },
        })
        onOpenChange(false)
      } catch (error) {
        console.error('Error updating product:', error)
      }
    },
  })

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.setFieldValue('title', product.title)
      form.setFieldValue('price', formatPriceFromCents(product.price))
      form.setFieldValue('promotionalPrice', product.promotionalPrice ? formatPriceFromCents(product.promotionalPrice) : '')
      form.setFieldValue('showPromotionBadge', product.showPromotionBadge || false)
      form.setFieldValue('description', product.description || '')
      form.setFieldValue('categoryId', product.category?.id || '')
      form.setFieldValue('available', product.available ?? true)
      
      // Convert variations
      if (product.variations && product.variations.length > 0) {
        const convertedVariations = product.variations.map(v => ({
          title: v.title,
          imageUrl: v.imageUrl,
        }))
        setVariations(convertedVariations)
      } else {
        setVariations([])
      }
    }
  }, [product])

  const addVariation = () => {
    setVariations([...variations, { title: '', imageUrl: '' }])
  }

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index))
  }

  const updateVariation = (
    index: number,
    field: 'title' | 'imageUrl',
    value: string
  ) => {
    const updated = [...variations]
    updated[index] = { ...updated[index], [field]: value }
    setVariations(updated)
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !storeId) return

    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: newCategoryName,
        storeId,
      })
      
      // Update the form to select the new category
      form.setFieldValue('categoryId', newCategory.id)
      
      // Reset and close popover
      setNewCategoryName('')
      setPopoverOpen(false)
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Atualize as informações do produto
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="space-y-4 py-4">
            {/* Title */}
            <form.Field
              name="title"
              validators={{
                onChange: validateRequired,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Ex: Camiseta Básica Branca"
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Category */}
            <form.Field
              name="categoryId"
              validators={{
                onChange: validateRequired,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="categoryId">Categoria *</Label>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <PlusCircle className="size-3 mr-1" />
                          Criar categoria
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">
                            Criar nova categoria
                          </h4>
                          <div className="space-y-2">
                            <Label htmlFor="categoryName" className="text-xs">
                              Nome da categoria
                            </Label>
                            <Input
                              id="categoryName"
                              placeholder="Ex: Roupas"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleCreateCategory()
                                }
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full"
                            onClick={handleCreateCategory}
                            disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                          >
                            {createCategoryMutation.isPending ? 'Criando...' : 'Criar'}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Price */}
            <form.Field
              name="price"
              validators={{
                onChange: validatePrice,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="price"
                      type="text"
                      inputMode="numeric"
                      value={field.state.value}
                      onChange={(e) => {
                        const formatted = formatPriceInput(e.target.value)
                        field.handleChange(formatted)
                      }}
                      onBlur={field.handleBlur}
                      placeholder="0,00"
                      className="pl-9"
                    />
                  </div>
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Promotional Price */}
            <form.Field
              name="promotionalPrice"
              validators={{
                onChange: validatePromotionalPrice,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="promotionalPrice">Preço Promocional (R$)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="promotionalPrice"
                      type="text"
                      inputMode="numeric"
                      value={field.state.value}
                      onChange={(e) => {
                        const formatted = formatPriceInput(e.target.value)
                        field.handleChange(formatted)
                      }}
                      onBlur={field.handleBlur}
                      placeholder="0,00"
                      className="pl-9"
                    />
                  </div>
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Show Promotion Badge */}
            <form.Field name="showPromotionBadge">
              {(field) => (
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="showPromotionBadge">Exibir badge de promoção</Label>
                  <Switch
                    id="showPromotionBadge"
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              )}
            </form.Field>

            {/* Available */}
            <form.Field name="available">
              {(field) => (
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="available">Produto disponível</Label>
                  <Switch
                    id="available"
                    checked={field.state.value ?? true}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Descreva o produto..."
                    rows={3}
                  />
                </div>
              )}
            </form.Field>

            {/* Variations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variações</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariation}
                >
                  <Plus className="size-4 mr-2" />
                  Adicionar Variação
                </Button>
              </div>

              {variations.map((variation, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg bg-muted"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Título da variação"
                      value={variation.title}
                      onChange={(e) =>
                        updateVariation(index, 'title', e.target.value)
                      }
                    />
                    <Input
                      placeholder="URL da imagem"
                      value={variation.imageUrl}
                      onChange={(e) =>
                        updateVariation(index, 'imageUrl', e.target.value)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariation(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {variations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Opcional: Adicione variações de tamanho, cor, etc.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

