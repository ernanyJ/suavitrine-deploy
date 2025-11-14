import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Plus, Trash2, PlusCircle, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

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

// Helper function to validate if file is an image
const validateImageFile = (file: File): void => {
  // Check if file type starts with 'image/'
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Apenas arquivos de imagem são permitidos. Apenas JPG, JPEG e PNG são permitidos.')
  }

  // Check allowed MIME types (apenas JPG, JPEG e PNG)
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error(`Tipo de imagem não suportado: ${file.type}. Apenas JPG, JPEG e PNG são permitidos.`)
  }

  // Check file extension
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.jpg', '.jpeg', '.png']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

  if (!hasValidExtension) {
    throw new Error('Extensão de arquivo não permitida. Apenas JPG, JPEG e PNG são permitidos.')
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 5MB')
  }

  if (file.size === 0) {
    throw new Error('Arquivo vazio ou inválido.')
  }
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
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

// Constants for validation limits
const MAX_TITLE_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 1000
const MAX_VARIATION_TITLE_LENGTH = 50
const MAX_VARIATION_IMAGE_URL_LENGTH = 500
const MAX_PRICE_CENTS = 99999999 // R$ 999.999,99
const MAX_CATEGORY_NAME_LENGTH = 50

// Validation functions
const validateTitle = ({ value }: { value: string }) => {
  if (!value || value.trim() === '') {
    return 'Este campo é obrigatório'
  }
  if (value.length > MAX_TITLE_LENGTH) {
    return `Título deve ter no máximo ${MAX_TITLE_LENGTH} caracteres`
  }
  return undefined
}

const validateDescription = ({ value }: { value: string }) => {
  if (value && value.length > MAX_DESCRIPTION_LENGTH) {
    return `Descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`
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
  if (cents > MAX_PRICE_CENTS) {
    return `Preço máximo permitido é R$ ${(MAX_PRICE_CENTS / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
  if (cents > MAX_PRICE_CENTS) {
    return `Preço máximo permitido é R$ ${(MAX_PRICE_CENTS / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return undefined
}

// Format input value as user types (convert cents to formatted string)
const formatPriceInput = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/[^\d]/g, '')
  
  if (numbers === '') return ''
  
  // Limit to max price
  const limitedNumbers = numbers.slice(0, String(MAX_PRICE_CENTS).length)
  
  // Convert to number
  const cents = parseInt(limitedNumbers) || 0
  
  // Ensure it doesn't exceed max
  const finalCents = Math.min(cents, MAX_PRICE_CENTS)
  
  // Format as reais with comma
  const reais = finalCents / 100
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
  const [isMobile, setIsMobile] = useState(false)
  const [categorySelectOpen, setCategorySelectOpen] = useState(false)
  const [selectedCategoryImage, setSelectedCategoryImage] = useState<File | null>(null)
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null)

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset category form when popover closes
  useEffect(() => {
    if (!popoverOpen) {
      setNewCategoryName('')
      setSelectedCategoryImage(null)
      setCategoryImagePreview(null)
    }
  }, [popoverOpen])

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
        toast.error('Título é obrigatório')
        return
      }
      if (!value.price || value.price.trim() === '') {
        toast.error('Preço é obrigatório')
        return
      }
      if (images.length === 0) {
        toast.error('Adicione pelo menos uma imagem')
        return
      }
      
      // Parse price from formatted string to cents
      const priceInCents = parseCentsFromReais(value.price)
      if (priceInCents <= 0) {
        toast.error('Preço deve ser maior que zero')
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

        // Create the product (cache will be updated automatically via onSuccess)
        await createProductMutation.mutateAsync({
          title: value.title,
          price: priceInCents,
          promotionalPrice: promotionalPriceInCents,
          showPromotionBadge: value.showPromotionBadge || false,
          description: value.description || undefined,
          storeId,
          categoryId: value.categoryId || undefined,
          available: value.available ?? true,
          images: imageRequests,
          variations: variations.length > 0 ? variations : undefined,
        })
        
        // Only close dialog and reset form after successful API response
        form.reset()
        setVariations([])
        setImages([])
        setPopoverOpen(false)
        setNewCategoryName('')
        onOpenChange(false)
        
        // Show success toast
        toast.success('Produto criado com sucesso')
      } catch (error) {
        console.error('Error creating product:', error)
        toast.error('Erro ao criar produto', {
          description: 'Não foi possível criar o produto. Tente novamente.',
        })
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

  const handleCategoryImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        validateImageFile(file)
        setSelectedCategoryImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setCategoryImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error validating image:', error)
        toast.error(error instanceof Error ? error.message : 'Erro ao validar imagem. Por favor, selecione apenas arquivos de imagem válidos.')
        // Reset input
        event.target.value = ''
      }
    }
  }

  const handleRemoveCategoryImage = () => {
    setSelectedCategoryImage(null)
    setCategoryImagePreview(null)
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !storeId) return

    try {
      let imageData = undefined
      if (selectedCategoryImage) {
        const base64 = await fileToBase64(selectedCategoryImage)
        const contentType = getContentType(selectedCategoryImage)
        imageData = {
          base64Image: base64,
          fileName: selectedCategoryImage.name,
          contentType,
        }
      }

      const newCategory = await createCategoryMutation.mutateAsync({
        name: newCategoryName,
        storeId,
        image: imageData,
      })
      
      // Reset and close popover first
      setNewCategoryName('')
      setSelectedCategoryImage(null)
      setCategoryImagePreview(null)
      setPopoverOpen(false)
      
      // Update the form to select the new category
      // Using requestAnimationFrame to ensure the cache update is processed first
      requestAnimationFrame(() => {
        form.setFieldValue('categoryId', newCategory.id)
      })
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    try {
      const validFiles: File[] = []
      const errors: string[] = []

      Array.from(files).slice(0, 5 - images.length).forEach((file) => {
        try {
          validateImageFile(file)
          validFiles.push(file)
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Arquivo inválido'}`)
        }
      })

      if (errors.length > 0) {
        alert('Erro ao carregar imagens:\n' + errors.join('\n'))
      }

      if (validFiles.length > 0) {
        setImages([...images, ...validFiles])
      }
    } catch (error) {
      console.error('Error validating images:', error)
      alert('Erro ao validar imagens. Por favor, selecione apenas arquivos de imagem válidos.')
    }
    
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

  // Shared form content
  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col h-full"
    >
      {isMobile ? (
        <div className="flex-1 overflow-y-auto p-4 overscroll-contain touch-pan-y space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagens do Produto *</Label>
              
              {/* Main Image or Upload Button */}
              {images.length === 0 ? (
                // Upload Button - Square with dashed border (only when no images)
                <label className="block">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="aspect-square w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted">
                    <Upload className="size-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Adicionar imagens
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      (0/5)
                    </span>
                  </div>
                </label>
              ) : (
                // Layout: Principal | Secondary images column
                <div className="flex gap-3 items-start">
                  {/* Main Image - Left side */}
                  <div className="w-[60%] flex-shrink-0 relative aspect-square rounded-lg border-2 border-primary overflow-hidden bg-muted">
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

                  {/* Secondary Images Column - Right side */}
                  {images.length > 1 && (
                    <div className="w-28 sm:w-32 flex-shrink-0 space-y-2 overflow-y-auto">
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
                            <p className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-center px-1">
                              Principal
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add more images button */}
                      {images.length < 5 && (
                        <label className="block aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex items-center justify-center bg-muted/50 hover:bg-muted">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Upload className="size-5 text-muted-foreground" />
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
                onChange: validateTitle,
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
                    maxLength={MAX_TITLE_LENGTH}
                  />
                  <div className="flex items-center justify-between">
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {field.state.value.length}/{MAX_TITLE_LENGTH}
                    </p>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Category */}
            <form.Field
              name="categoryId"
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="w-full">
                        <Select
                          value={field.state.value || ''}
                          onValueChange={(value) => field.handleChange(value === 'none' ? '' : value)}
                          open={categorySelectOpen}
                          onOpenChange={setCategorySelectOpen}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <div
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCategorySelectOpen(false)
                                setTimeout(() => setPopoverOpen(true), 0)
                              }}
                            >
                              <PlusCircle className="size-4 mr-2" />
                              Criar nova categoria
                            </div>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                            {field.state.value && (
                              <SelectItem value="none">
                                Nenhuma
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[calc(100vw-2rem)] max-w-80"
                      align="start"
                    >
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
                            onChange={(e) => setNewCategoryName(e.target.value.slice(0, MAX_CATEGORY_NAME_LENGTH))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleCreateCategory()
                              }
                            }}
                            maxLength={MAX_CATEGORY_NAME_LENGTH}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Imagem da Categoria</Label>
                          <div className="flex flex-col gap-2">
                            {categoryImagePreview ? (
                              <div className="relative group">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                  <img
                                    src={categoryImagePreview}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={handleRemoveCategoryImage}
                                  className="absolute right-2 top-2"
                                >
                                  <X className="size-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                                  onChange={handleCategoryImageChange}
                                  className="absolute inset-0 cursor-pointer opacity-0"
                                  disabled={createCategoryMutation.isPending}
                                />
                                <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 transition-colors hover:bg-muted">
                                  <div className="flex flex-col items-center gap-2 text-center">
                                    <Upload className="size-5 text-muted-foreground" />
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">Clique para fazer upload</span>
                                      <p className="text-[10px]">PNG, JPG até 5MB</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
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
              )}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <form.Field 
              name="description"
              validators={{
                onChange: validateDescription,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Descreva o produto..."
                    rows={3}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <div className="flex items-center justify-between">
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {field.state.value.length}/{MAX_DESCRIPTION_LENGTH}
                    </p>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Variations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Variações</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariation}
                  className="shrink-0"
                >
                  <Plus className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Adicionar Variação</span>
                  <span className="sm:hidden">Adicionar</span>
                </Button>
              </div>

              {variations.map((variation, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 border rounded-lg bg-muted"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Título da variação"
                      value={variation.title}
                      onChange={(e) =>
                        updateVariation(index, 'title', e.target.value.slice(0, MAX_VARIATION_TITLE_LENGTH))
                      }
                      maxLength={MAX_VARIATION_TITLE_LENGTH}
                    />
                    <Input
                      placeholder="URL da imagem"
                      value={variation.imageUrl}
                      onChange={(e) =>
                        updateVariation(index, 'imageUrl', e.target.value.slice(0, MAX_VARIATION_IMAGE_URL_LENGTH))
                      }
                      maxLength={MAX_VARIATION_IMAGE_URL_LENGTH}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariation(index)}
                    className="self-end sm:self-auto shrink-0"
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
      ) : (
        // Desktop layout: 2 columns
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Left column: Images */}
          <div className="w-1/3 flex-shrink-0 overflow-y-auto pr-2">
            <div className="space-y-3 pb-4">
              <Label>Imagens do Produto *</Label>
              
              {/* Main Image or Upload Button */}
              {images.length === 0 ? (
                // Upload Button - Square with dashed border (only when no images)
                <label className="block">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="aspect-square w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted">
                    <Upload className="size-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Adicionar imagens
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      (0/5)
                    </span>
                  </div>
                </label>
              ) : (
                // Layout: 1ª linha (Principal + 2 menores) | 2ª linha (2 imagens)
                <div className="flex flex-col gap-3">
                  {/* 1ª Linha: Principal (maior) | Coluna direita (até 2 imagens menores) */}
                  <div className="grid grid-cols-[2fr_1fr] gap-3 items-stretch">
                    {/* Imagem Principal - 1ª Coluna */}
                    <div className="relative aspect-square rounded-lg border-2 border-primary overflow-hidden bg-muted w-full">
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

                    {/* 2ª Coluna: Grid vertical com até 2 imagens menores */}
                    {images.length > 1 && (
                      <div className="grid grid-rows-2 gap-2 h-full w-full" style={{ gridTemplateRows: '1fr 1fr' }}>
                        {images.slice(1, 3).map((image, index) => (
                          <div
                            key={index + 1}
                            className="relative rounded-lg border overflow-hidden bg-muted group cursor-pointer w-full"
                            style={{ aspectRatio: '1 / 1' }}
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
                              <p className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-center px-1">
                                Principal
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Espaço vazio ou botão de adicionar na 2ª coluna */}
                        {images.length === 2 && images.length < 5 && (
                          <label className="block rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex items-center justify-center bg-muted/50 hover:bg-muted w-full" style={{ aspectRatio: '1 / 1' }}>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Upload className="size-5 text-muted-foreground" />
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2ª Linha: Grid de 2 colunas com imagens do mesmo tamanho */}
                  {images.length > 3 && (
                    <div className="grid grid-cols-2 gap-3">
                      {images.slice(3, 5).map((image, index) => (
                        <div
                          key={index + 3}
                          className="relative aspect-square rounded-lg border overflow-hidden bg-muted group cursor-pointer"
                          onClick={() => moveImageToFront(index + 3)}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Imagem ${index + 4}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index + 3)
                            }}
                          >
                            <X className="size-3" />
                          </Button>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <p className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-center px-1">
                              Principal
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Botão de adicionar na 2ª linha (se tiver menos de 5 imagens) */}
                      {images.length < 5 && images.length === 4 && (
                        <label className="block aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex items-center justify-center bg-muted/50 hover:bg-muted">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Upload className="size-5 text-muted-foreground" />
                        </label>
                      )}
                    </div>
                  )}
                  
                  {/* Se tiver apenas 3 imagens, mostrar botão de adicionar na 2ª linha */}
                  {images.length === 3 && images.length < 5 && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex items-center justify-center bg-muted/50 hover:bg-muted">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Upload className="size-5 text-muted-foreground" />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Form fields */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {/* Title */}
            <form.Field
              name="title"
              validators={{
                onChange: validateTitle,
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
                    maxLength={MAX_TITLE_LENGTH}
                  />
                  <div className="flex items-center justify-between">
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {field.state.value.length}/{MAX_TITLE_LENGTH}
                    </p>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Category */}
            <form.Field
              name="categoryId"
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="w-full">
                        <Select
                          value={field.state.value || ''}
                          onValueChange={(value) => field.handleChange(value === 'none' ? '' : value)}
                          open={categorySelectOpen}
                          onOpenChange={setCategorySelectOpen}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <div
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCategorySelectOpen(false)
                                setTimeout(() => setPopoverOpen(true), 0)
                              }}
                            >
                              <PlusCircle className="size-4 mr-2" />
                              Criar nova categoria
                            </div>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                            {field.state.value && (
                              <SelectItem value="none">
                                Nenhuma
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[calc(100vw-2rem)] max-w-80"
                      align="start"
                    >
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
                            onChange={(e) => setNewCategoryName(e.target.value.slice(0, MAX_CATEGORY_NAME_LENGTH))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleCreateCategory()
                              }
                            }}
                            maxLength={MAX_CATEGORY_NAME_LENGTH}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Imagem da Categoria</Label>
                          <div className="flex flex-col gap-2">
                            {categoryImagePreview ? (
                              <div className="relative group">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                  <img
                                    src={categoryImagePreview}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={handleRemoveCategoryImage}
                                  className="absolute right-2 top-2"
                                >
                                  <X className="size-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                                  onChange={handleCategoryImageChange}
                                  className="absolute inset-0 cursor-pointer opacity-0"
                                  disabled={createCategoryMutation.isPending}
                                />
                                <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 transition-colors hover:bg-muted">
                                  <div className="flex flex-col items-center gap-2 text-center">
                                    <Upload className="size-5 text-muted-foreground" />
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">Clique para fazer upload</span>
                                      <p className="text-[10px]">PNG, JPG até 5MB</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
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
              )}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <form.Field 
              name="description"
              validators={{
                onChange: validateDescription,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Descreva o produto..."
                    rows={3}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <div className="flex items-center justify-between">
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {field.state.value.length}/{MAX_DESCRIPTION_LENGTH}
                    </p>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Variations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Variações</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariation}
                  className="shrink-0"
                >
                  <Plus className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Adicionar Variação</span>
                  <span className="sm:hidden">Adicionar</span>
                </Button>
              </div>

              {variations.map((variation, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 border rounded-lg bg-muted"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Título da variação"
                      value={variation.title}
                      onChange={(e) =>
                        updateVariation(index, 'title', e.target.value.slice(0, MAX_VARIATION_TITLE_LENGTH))
                      }
                      maxLength={MAX_VARIATION_TITLE_LENGTH}
                    />
                    <Input
                      placeholder="URL da imagem"
                      value={variation.imageUrl}
                      onChange={(e) =>
                        updateVariation(index, 'imageUrl', e.target.value.slice(0, MAX_VARIATION_IMAGE_URL_LENGTH))
                      }
                      maxLength={MAX_VARIATION_IMAGE_URL_LENGTH}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariation(index)}
                    className="self-end sm:self-auto shrink-0"
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
        </div>
      )}

    </form>
  )

  // Render Dialog for desktop, Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh] p-0 flex flex-col overflow-hidden">
          <DrawerHeader className="p-4 pb-2 border-b shrink-0">
            <DrawerTitle>Adicionar Produto</DrawerTitle>
            <DrawerDescription>
              Preencha os dados do novo produto para adicioná-lo à loja
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {formContent}
          </div>
          <DrawerFooter className="gap-2 border-t pt-4 px-4 pb-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => form.handleSubmit()}
              disabled={createProductMutation.isPending}
              className="w-full"
            >
              {createProductMutation.isPending ? 'Criando...' : 'Criar Produto'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[50%] !w-[50%] sm:!min-w-[1000px] max-h-[90vh] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo produto para adicioná-lo à loja
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 px-6 py-4 flex flex-col">
          {formContent}
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => form.handleSubmit()}
            disabled={createProductMutation.isPending}
            className="w-full md:w-auto"
          >
            {createProductMutation.isPending ? 'Criando...' : 'Criar Produto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

