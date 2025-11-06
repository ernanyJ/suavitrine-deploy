import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Plus, Trash2, PlusCircle, Upload, X } from 'lucide-react'

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Helper function to get content type from file
const getContentType = (file: File): string => {
  return file.type || 'image/jpeg'
}

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
import { Badge } from '@/components/ui/badge'
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
import { useCreateProduct, useStoreCategories, useCreateCategory } from '@/lib/api/queries'

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

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
}

export function CreateProductDialog({
  open,
  onOpenChange,
  storeId,
}: CreateProductDialogProps) {
  const createProductMutation = useCreateProduct()
  const createCategoryMutation = useCreateCategory(storeId)
  const { data: categories = [] } = useStoreCategories(storeId)

  const [variations, setVariations] = useState<
    Array<{ title: string; imageUrl: string }>
  >([])
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [images, setImages] = useState<File[]>([])

  const form = useForm({
    defaultValues: {
      title: '',
      price: '', // Now a string to support empty initial value
      promotionalPrice: '',
      showPromotionBadge: false,
      description: '',
      categoryId: '',
      available: true,
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
      if (images.length === 0) {
        // TODO: show error message to user
        return
      }
      if (!value.categoryId) {
        return
      }
      
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
        // Convert images to base64
        const imageRequests = await Promise.all(
          images.map(async (file, index) => {
            const base64Image = await fileToBase64(file)
            return {
              base64Image,
              fileName: file.name,
              contentType: getContentType(file),
              displayOrder: index,
            }
          })
        )

        await createProductMutation.mutateAsync({
          title: value.title,
          price: priceInCents,
          promotionalPrice: promotionalPriceInCents,
          showPromotionBadge: value.showPromotionBadge || false,
          description: value.description || undefined,
          storeId,
          categoryId: value.categoryId,
          available: value.available ?? true,
          images: imageRequests,
          variations: variations.length > 0 ? variations : undefined,
        })
        // Reset form
        form.reset()
        setVariations([])
        setImages([])
        setPopoverOpen(false)
        setNewCategoryName('')
        onOpenChange(false)
      } catch (error) {
        console.error('Error creating product:', error)
      }
    },
  })

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles = Array.from(files).slice(0, 5 - images.length)
    setImages([...images, ...newFiles])
    
    // Reset input
    event.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const moveImageToFront = (index: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(index, 1)
    newImages.unshift(removed)
    setImages(newImages)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo produto para adicioná-lo à loja
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
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Imagens do Produto *</Label>
              
              {/* Upload Button */}
              {images.length < 5 && (
                <label className="flex">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed cursor-pointer"
                    asChild
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="size-4" />
                      Adicionar imagens ({images.length}/5)
                    </span>
                  </Button>
                </label>
              )}

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="space-y-3">
                  {/* Main Image (First/Largest) */}
                  <div className="relative aspect-square w-full rounded-lg border-2 border-primary overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(images[0])}
                      alt="Imagem principal"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(0)}
                    >
                      <X className="size-4" />
                    </Button>
                    <div className="absolute top-2 left-2">
                      <Badge>Principal</Badge>
                    </div>
                  </div>

                  {/* Secondary Images (Grid) */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(1).map((image, index) => (
                        <div
                          key={index + 1}
                          className="relative aspect-square rounded-lg border overflow-hidden bg-muted group cursor-pointer"
                          onClick={() => moveImageToFront(index + 1)}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Imagem ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index + 1)
                            }}
                          >
                            <X className="size-3" />
                          </Button>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <p className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Toque para tornar principal
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add more images button in grid */}
                      {images.length < 5 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex items-center justify-center bg-muted/50 hover:bg-muted">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Upload className="size-6 text-muted-foreground" />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? 'Criando...' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

