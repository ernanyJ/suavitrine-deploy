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
import { Moon, Sun, Settings as SettingsIcon, Store, Upload, X, Crown } from 'lucide-react'
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

export const Route = createFileRoute('/_app/configuracoes')({
  component: ConfiguracoesPage,
})

function ConfiguracoesPage() {
  const { theme, toggleTheme } = useTheme()

  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()

  // Fetch current store data
  const { data: store, isLoading: isLoadingStore } = useStore(selectedStoreId)
  const updateStoreMutation = useUpdateStore()

  // Form state
  const [name, setName] = useState('')
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

  // Initialize form from store data
  useEffect(() => {
    if (store) {
      setName(store.name || '')
      setDescription(store.description || '')
      setStreet(store.address?.street || '')
      setCity(store.address?.city || '')
      setState(store.address?.state || '')
      setZipCode(store.address?.zipCode || '')
      setPhoneNumber(store.phoneNumber || '')
      setEmail(store.email || '')
      setInstagram(store.instagram || '')
      setFacebook(store.facebook || '')
      setLogoUrl(store.logoUrl || null)
    }
  }, [store])

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
        description: description || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        phoneNumber: phoneNumber || undefined,
        email: email || undefined,
        instagram: instagram || undefined,
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
          <div className="flex items-center gap-3">
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
          <div className="space-y-4">
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
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(00) 00000-0000"
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
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@sua_loja"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/sua-loja"
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
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateStoreMutation.isPending || !name.trim()}
            >
              {updateStoreMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência da interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {theme === 'dark' ? (
                  <Moon className="size-5" />
                ) : (
                  <Sun className="size-5" />
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Modo Escuro
                </Label>
                <p className="text-sm text-muted-foreground">
                  Alterne entre tema claro e escuro
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {theme === 'dark' ? (
                <Moon className="size-5" />
              ) : (
                <Sun className="size-5" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Tema atual: {theme === 'dark' ? 'Escuro' : 'Claro'}
              </p>
              <p className="text-sm text-muted-foreground">
                A preferência de tema é salva localmente e será aplicada em
                todas as páginas do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
