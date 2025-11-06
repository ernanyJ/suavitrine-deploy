import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Upload, X, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUpdateCategory, useCategoryProducts, useUpdateProductsOrder } from '@/lib/api/queries'
import type { CategoryResponse } from '@/lib/api/categories'
import type { ProductResponse } from '@/lib/api/products'

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

// Validation functions
const validateRequired = ({ value }: { value: string }) => {
  if (!value || value.trim() === '') {
    return 'Este campo é obrigatório'
  }
  return undefined
}

// Sortable Product Row Component
interface SortableProductRowProps {
  product: ProductResponse
}

function SortableProductRow({ product }: SortableProductRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{product.title}</TableCell>
      <TableCell>
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(product.price/100.0)}
      </TableCell>
      <TableCell>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="h-8 w-8 rounded object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            N/A
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}

interface EditCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  category: CategoryResponse
}

export function EditCategoryDialog({
  open,
  onOpenChange,
  storeId,
  category,
}: EditCategoryDialogProps) {
  const updateCategoryMutation = useUpdateCategory(storeId)
  const updateProductsOrderMutation = useUpdateProductsOrder(storeId)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProductsExpanded, setIsProductsExpanded] = useState(false)
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [hasOrderChanged, setHasOrderChanged] = useState(false)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch products when section is expanded
  const { data: categoryProducts, isLoading: isLoadingProducts } = useCategoryProducts(
    isProductsExpanded ? category.id : null
  )

  useEffect(() => {
    if (category) {
      form.setFieldValue('name', category.name)
      form.setFieldValue('description', category.description || '')
      // Set preview to existing image if available
      if (category.imageUrl) {
        setPreview(category.imageUrl)
      }
    }
  }, [category])

  // Update products when data is fetched
  useEffect(() => {
    if (categoryProducts) {
      setProducts(categoryProducts)
    }
  }, [categoryProducts])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsProductsExpanded(false)
      setProducts([])
      setHasOrderChanged(false)
    }
  }, [open])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (category.imageUrl) {
      setPreview(category.imageUrl)
    } else {
      setPreview(null)
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        setHasOrderChanged(true)
        return newItems
      })
    }
  }

  const handleSaveOrder = async () => {
    if (hasOrderChanged && products.length > 0) {
      try {
        await updateProductsOrderMutation.mutateAsync({
          categoryId: category.id,
          productIds: products.map((product) => product.id),
        })
        setHasOrderChanged(false)
      } catch (error) {
        console.error('Error updating products order:', error)
      }
    }
  }

  const form = useForm({
    defaultValues: {
      name: category.name,
      description: category.description || '',
    },
    onSubmit: async ({ value }) => {
      try {
        let imageData = undefined
        if (selectedImage) {
          const base64 = await fileToBase64(selectedImage)
          const contentType = getContentType(selectedImage)
          imageData = {
            base64Image: base64,
            fileName: selectedImage.name,
            contentType,
          }
        }

        // Update category
        await updateCategoryMutation.mutateAsync({
          categoryId: category.id,
          data: {
            name: value.name,
            description: value.description || undefined,
            image: imageData,
          },
        })

        // Save products order if changed
        await handleSaveOrder()

        // Reset image
        setSelectedImage(null)
        onOpenChange(false)
      } catch (error) {
        console.error('Error updating category:', error)
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da categoria.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: validateRequired,
            }}
          >
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Nome da Categoria *</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={e => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Ex: Eletrônicos"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Descrição</Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={e => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Descrição da categoria"
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <div className="space-y-2">
            <Label>Imagem da Categoria</Label>
            <div className="flex flex-col gap-4">
              {preview ? (
                <div className="relative group">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={updateCategoryMutation.isPending}
                  />
                  <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 transition-colors hover:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Upload className="size-8 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Clique para fazer upload</span>
                        <p>ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 5MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProductsExpanded(!isProductsExpanded)}
              className="w-full justify-between"
            >
              <span>Produtos da Categoria</span>
              {isProductsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isProductsExpanded && (
              <div className="space-y-4">
                {isLoadingProducts ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Carregando produtos...
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum produto encontrado nesta categoria.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Arraste e solte para reordenar os produtos
                      </p>
                      {hasOrderChanged && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveOrder}
                          disabled={updateProductsOrderMutation.isPending}
                        >
                          {updateProductsOrderMutation.isPending
                            ? 'Salvando...'
                            : 'Salvar Ordem'}
                        </Button>
                      )}
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={products.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead>Preço</TableHead>
                              <TableHead>Imagem</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product) => (
                              <SortableProductRow
                                key={product.id}
                                product={product}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateCategoryMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                updateCategoryMutation.isPending ||
                updateProductsOrderMutation.isPending ||
                !form.state.canSubmit
              }
            >
              {updateCategoryMutation.isPending || updateProductsOrderMutation.isPending
                ? 'Salvando...'
                : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

