import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/hooks/useTheme'
import { useStore, useUpdateStore } from '@/lib/api/queries'
import { useSelectedStore } from '@/contexts/store-context'
import { storesApi } from '@/lib/api/stores'
import { Moon, Sun, Settings as SettingsIcon, Store, Upload, X, Crown, Instagram } from 'lucide-react'
import type { UpdateStoreRequest, BannerImageRequest } from '@/lib/api/stores'

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

// Helper function to format phone number with mask
const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')
  
  // Apply mask based on length
  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : numbers
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  } else {
    // For 11 digits (cell phone)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

// Helper function to format zip code (CEP) with mask
const formatZipCode = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')
  
  // Limit to 8 digits (Brazilian CEP format)
  const limitedNumbers = numbers.slice(0, 8)
  
  // Apply mask: 00000-000
  if (limitedNumbers.length <= 5) {
    return limitedNumbers
  } else {
    return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5, 8)}`
  }
}

// Helper function to extract Facebook slug from URL
const extractFacebookSlug = (value: string): string | null => {
  if (!value.trim()) return null
  
  // Remove leading/trailing whitespace
  const trimmed = value.trim()
  
  // Check if it's a URL pattern (contains facebook.com)
  const facebookUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?facebook\.com\/([^\/\s?]+)/i
  const match = trimmed.match(facebookUrlPattern)
  
  if (match && match[1]) {
    return match[1]
  }
  
  return null
}

export const Route = createFileRoute('/_app/configuracoes')({
  component: ConfiguracoesPage,
})

function ConfiguracoesPage() {
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()

  // Fetch current store data
  const { data: store, isLoading: isLoadingStore } = useStore(selectedStoreId)
  const updateStoreMutation = useUpdateStore()

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')

  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Slug availability state
  const [slugError, setSlugError] = useState('')
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  // Initialize form from store data
  useEffect(() => {
    if (store) {
      setName(store.name || '')
      setSlug(store.slug || '')
      setDescription(store.description || '')
      setStreet(store.address?.street || '')
      setCity(store.address?.city || '')
      setState(store.address?.state || '')
      setZipCode(store.address?.zipCode ? formatZipCode(store.address.zipCode) : '')
      setPhoneNumber(store.phoneNumber ? formatPhoneNumber(store.phoneNumber) : '')
      setEmail(store.email || '')
      setInstagram(store.instagram ? store.instagram.replace(/@/g, '') : '')
      setFacebook(store.facebook || '')
      setLogoUrl(store.logoUrl || null)
      // Reset slug availability when loading store data
      setSlugAvailable(null)
      setSlugError('')
    }
  }, [store])

  // Debounce slug availability check
  useEffect(() => {
    const currentSlug = slug?.trim()
    const originalSlug = store?.slug?.trim()
    
    // Reset if slug is empty
    if (!currentSlug) {
      setSlugAvailable(null)
      setSlugError('')
      setIsCheckingSlug(false)
      return
    }

    // Don't check if slug hasn't changed from original
    if (currentSlug === originalSlug) {
      setSlugAvailable(true)
      setSlugError('')
      setIsCheckingSlug(false)
      return
    }

    // Don't check if slug is too short
    if (currentSlug.length < 3) {
      setSlugAvailable(null)
      setSlugError('')
      setIsCheckingSlug(false)
      return
    }

    // Clear any previous error
    setSlugError('')
    setIsCheckingSlug(false)

    // Debounce: wait 500ms after user stops typing
    const timeoutId = setTimeout(async () => {
      // Set checking state only when we're about to make the request
      setIsCheckingSlug(true)
      
      try {
        const available = await storesApi.checkSlugAvailability(currentSlug)
        setSlugAvailable(available)
        if (!available) {
          setSlugError('Este slug não está disponível')
        } else {
          setSlugError('')
        }
      } catch (err) {
        console.error('Erro ao verificar disponibilidade do slug:', err)
        setSlugAvailable(null)
        setSlugError('Erro ao verificar disponibilidade do slug')
      } finally {
        setIsCheckingSlug(false)
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      // Don't reset isCheckingSlug here to avoid flickering
    }
  }, [slug, store?.slug])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }

      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoUrl(store?.logoUrl || null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const getPlanBadgeVariant = (plan?: string) => {
    switch (plan) {
      case 'PRO':
        return 'default'
      case 'BASIC':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getPlanLabel = (plan?: string) => {
    switch (plan) {
      case 'PRO':
        return 'PRO'
      case 'BASIC':
        return 'BÁSICO'
      default:
        return 'GRÁTIS'
    }
  }

  const handleSave = async () => {
    if (!selectedStoreId) {
      toast.error('Nenhuma loja selecionada')
      return
    }

    if (!slug.trim()) {
      toast.error('O slug da loja é obrigatório')
      return
    }

    if (slugAvailable === false) {
      toast.error('Por favor, escolha um slug disponível')
      return
    }

    if (isCheckingSlug) {
      toast.error('Aguarde a verificação do slug')
      return
    }

    try {
      let logoData: BannerImageRequest | undefined = undefined

      // Process logo if uploaded
      if (logoFile) {
        const base64Image = await fileToBase64(logoFile)
        logoData = {
          base64Image,
          fileName: logoFile.name,
          contentType: getContentType(logoFile),
        }
      }

      const data: UpdateStoreRequest = {
        name: name || undefined,
        slug: slug || undefined,
        description: description || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode ? zipCode.replace(/\D/g, '') : undefined,
        phoneNumber: phoneNumber ? phoneNumber.replace(/\D/g, '') : undefined,
        email: email || undefined,
        instagram: instagram.trim() ? `@${instagram.trim().replace('@', '')}` : undefined,
        facebook: facebook || undefined,
        logo: logoData,
      }

      await updateStoreMutation.mutateAsync({
        storeId: selectedStoreId,
        data,
      })

      toast.success('Dados da loja atualizados com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar loja:', error)
      toast.error('Erro ao atualizar os dados da loja')
    }
  }

  if (isLoadingStore) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua loja e preferências do sistema
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5" />
            Plano da Loja
          </CardTitle>
          <CardDescription>
            Informações sobre o plano atual da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mt-4">
            <Badge variant={getPlanBadgeVariant(store?.activePlan)}>
              {getPlanLabel(store?.activePlan)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {store?.activePlan === 'FREE' && 'Plano gratuito com recursos básicos'}
              {store?.activePlan === 'BASIC' && 'Plano básico com recursos adicionais'}
              {store?.activePlan === 'PRO' && 'Plano profissional com todos os recursos'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Store Data Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5" />
            Dados da Loja
          </CardTitle>
          <CardDescription>
            Edite as informações básicas da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Loja *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da sua loja"
              />
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="slug">Slug da Loja *</Label>
                <p className="text-xs text-muted-foreground">
                  O slug é a parte da URL que identifica sua loja. Use apenas letras minúsculas, números e hífens.
                </p>
              </div>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="slug-da-loja"
                disabled={isCheckingSlug}
              />
              
              {/* URL Preview */}
              {slug && (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Preview da URL:</p>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground">https://suavitrine.com/lojas/</span>
                    <span className="text-xs font-mono font-semibold text-primary">
                      {slug}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Status messages */}
              {isCheckingSlug && (
                <p className="text-xs text-muted-foreground">
                  Verificando disponibilidade...
                </p>
              )}
              {slugError && (
                <p className="text-xs text-destructive">{slugError}</p>
              )}
              {!isCheckingSlug && !slugError && slugAvailable === true && slug && slug !== store?.slug && (
                <p className="text-xs text-green-600">
                   ✓ Slug disponível
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da sua loja"
                rows={3}
              />
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt="Logo da loja"
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 size-6"
                    onClick={handleRemoveLogo}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  {logoUrl ? 'Alterar Logo' : 'Adicionar Logo'}
                </Button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou GIF. Máximo 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Informações de Contato</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefone</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@loja.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                  <span className="absolute left-9 top-1/2 -translate-y-1/2 text-primary font-medium text-sm pointer-events-none">@</span>
                  <Input
                    id="instagram"
                    value={instagram.replace(/@/g, '')}
                    onChange={(e) => {
                      // Remove qualquer '@' que o usuário tentar inserir
                      const value = e.target.value.replace(/@/g, '')
                      setInstagram(value)
                    }}
                    placeholder="sua_loja"
                    className="pl-14"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => {
                    const value = e.target.value
                    setFacebook(value)
                  }}
                  onBlur={(e) => {
                    const value = e.target.value
                    const extractedSlug = extractFacebookSlug(value)
                    if (extractedSlug) {
                      setFacebook(extractedSlug)
                      toast.info('URL do Facebook formatada. Apenas o nome da página foi salvo.')
                    }
                  }}
                  placeholder="minha-loja"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Endereço</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rua, número"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateStoreMutation.isPending || !name.trim() || !slug.trim() || isCheckingSlug || slugAvailable === false}
            >
              {updateStoreMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
