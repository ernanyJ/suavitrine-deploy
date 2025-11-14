import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useCreateCategory } from '@/lib/api/queries'

// Constants for validation limits
const MAX_CATEGORY_NAME_LENGTH = 50
const MAX_CATEGORY_DESCRIPTION_LENGTH = 500

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

// Validation functions
const validateRequired = ({ value }: { value: string }) => {
  if (!value || value.trim() === '') {
    return 'Este campo é obrigatório'
  }
  return undefined
}

const validateCategoryName = ({ value }: { value: string }) => {
  if (!value || value.trim() === '') {
    return 'Este campo é obrigatório'
  }
  if (value.length > MAX_CATEGORY_NAME_LENGTH) {
    return `Nome deve ter no máximo ${MAX_CATEGORY_NAME_LENGTH} caracteres`
  }
  return undefined
}

const validateCategoryDescription = ({ value }: { value: string }) => {
  if (value && value.length > MAX_CATEGORY_DESCRIPTION_LENGTH) {
    return `Descrição deve ter no máximo ${MAX_CATEGORY_DESCRIPTION_LENGTH} caracteres`
  }
  return undefined
}

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  storeId,
}: CreateCategoryDialogProps) {
  const createCategoryMutation = useCreateCategory(storeId)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        validateImageFile(file)
        setSelectedImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error validating image:', error)
        alert(error instanceof Error ? error.message : 'Erro ao validar imagem. Por favor, selecione apenas arquivos de imagem válidos.')
        // Reset input
        event.target.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setPreview(null)
  }

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
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

        await createCategoryMutation.mutateAsync({
          name: value.name,
          description: value.description || undefined,
          storeId,
          image: imageData,
        })

        // Reset form
        form.reset()
        setSelectedImage(null)
        setPreview(null)
        onOpenChange(false)
      } catch (error) {
        console.error('Error creating category:', error)
      }
    },
  })

  // Shared form content
  const formContent = (
    <form
      onSubmit={e => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className={isMobile ? "flex flex-col h-full overflow-hidden" : "space-y-4"}
    >
      <div className={`space-y-4 ${isMobile ? "flex-1 overflow-y-auto p-4 overscroll-contain touch-pan-y" : ""}`}>
          <form.Field
            name="name"
            validators={{
              onChange: validateCategoryName,
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
                  maxLength={MAX_CATEGORY_NAME_LENGTH}
                />
                <div className="flex items-center justify-between">
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {field.state.value.length}/{MAX_CATEGORY_NAME_LENGTH}
                  </p>
                </div>
              </div>
            )}
          </form.Field>

          <form.Field 
            name="description"
            validators={{
              onChange: validateCategoryDescription,
            }}
          >
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
                  maxLength={MAX_CATEGORY_DESCRIPTION_LENGTH}
                />
                <div className="flex items-center justify-between">
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {field.state.value.length}/{MAX_CATEGORY_DESCRIPTION_LENGTH}
                  </p>
                </div>
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
                    accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                    onChange={handleImageChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={createCategoryMutation.isPending}
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
      </div>

      {/* Footer buttons - different layout for mobile vs desktop */}
      {isMobile ? (
        <div className="flex flex-col gap-2 pt-4 px-4 pb-4 border-t bg-background mt-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createCategoryMutation.isPending || !form.state.canSubmit}
            className="w-full"
          >
            {createCategoryMutation.isPending ? 'Criando...' : 'Criar Categoria'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createCategoryMutation.isPending}
            className="w-full md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createCategoryMutation.isPending || !form.state.canSubmit}
            className="w-full md:w-auto"
          >
            {createCategoryMutation.isPending ? 'Criando...' : 'Criar Categoria'}
          </Button>
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
            <DrawerTitle>Criar Nova Categoria</DrawerTitle>
            <DrawerDescription>
              Adicione os detalhes da categoria para organizar seus produtos.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione os detalhes da categoria para organizar seus produtos.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}

