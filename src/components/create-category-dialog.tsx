import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Upload, X } from 'lucide-react'
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
import { useCreateCategory } from '@/lib/api/queries'

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione os detalhes da categoria para organizar seus produtos.
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCategoryMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || !form.state.canSubmit}
            >
              {createCategoryMutation.isPending ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

