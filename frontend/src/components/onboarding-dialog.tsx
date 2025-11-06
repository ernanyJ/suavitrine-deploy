import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Store, Loader2, Sparkles, ChevronRight, ChevronLeft, Phone, Mail, Instagram, Facebook } from 'lucide-react'
import { cnpj } from 'cpf-cnpj-validator'
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
import { useCreateStore, useUserStores } from '@/lib/api/queries'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedStore } from '@/contexts/store-context'
import type { CreateStoreRequest } from '@/lib/api/stores'

interface OnboardingDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface StoreFormData {
  name: string
  slug: string
  street: string
  city: string
  state: string
  zipCode: string
  phoneNumber: string
  email: string
  instagram: string
  facebook: string
  cnpj: string
}

// Função para formatar telefone no padrão (00) 00000-0000
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  const limited = numbers.slice(0, 11)
  
  if (limited.length <= 2) {
    return limited.length > 0 ? `(${limited}` : ''
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }
}

// Função para validar telefone
function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '')
  // Deve ter exatamente 11 dígitos (DDD + 9 dígitos)
  return numbers.length === 11
}

export function OnboardingDialog({ 
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange 
}: OnboardingDialogProps = {}) {
  const { userId: authUserId } = useAuth()
  const userId = authUserId ?? null
  const { data: stores = [], isLoading } = useUserStores(userId ?? null)
  const { setSelectedStoreId } = useSelectedStore()
  const [internalOpen, setInternalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [cnpjError, setCnpjError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const createStoreMutation = useCreateStore(userId)

  // Use controlled or internal state
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      email: '',
      instagram: '',
      facebook: '',
      cnpj: '',
    } as StoreFormData,
    onSubmit: async ({ value }) => {
      if (currentStep === 1) {
        // Validate step 1 and go to next step
        if (!value.name.trim()) {
          setError('Por favor, digite o nome da loja')
          return
        }
        setCurrentStep(2)
        return
      }

      if (currentStep === 2) {
        // Validate step 2 and go to next step
        if (!value.street.trim() || !value.city.trim() || !value.state.trim() || !value.zipCode.trim()) {
          setError('Por favor, preencha todos os campos de endereço')
          return
        }
        setCurrentStep(3)
        return
      }

      // Step 3 - Create store
      setError('')
      
      // Validate CNPJ if provided
      if (value.cnpj.trim()) {
        const cnpjNumbers = value.cnpj.replace(/\D/g, '')
        if (!cnpj.isValid(cnpjNumbers)) {
          setError('CNPJ inválido. Por favor, verifique o número digitado.')
          return
        }
      }
      
      // Validate phone if provided
      if (value.phoneNumber.trim()) {
        if (!isValidPhone(value.phoneNumber)) {
          setError('Telefone inválido. Use o formato (00) 00000-0000')
          return
        }
      }
      
      try {
        const requestData: CreateStoreRequest = {
          name: value.name.trim(),
          slug: (value.slug || value.name.trim()) || '',
          street: value.street.trim(),
          city: value.city.trim(),
          state: value.state.trim(),
          zipCode: value.zipCode.trim(),
          phoneNumber: value.phoneNumber.trim() ? value.phoneNumber.replace(/\D/g, '') : undefined,
          email: value.email.trim() || undefined,
          instagram: value.instagram.trim() ? `@${value.instagram.trim().replace('@', '')}` : undefined,
          facebook: value.facebook.trim() || undefined,
          cnpj: value.cnpj.trim() ? value.cnpj.replace(/\D/g, '') : undefined,
        }
        
        const newStore = await createStoreMutation.mutateAsync(requestData)
        setOpen(false)
        // Select the newly created store
        if (newStore?.id) {
          setSelectedStoreId(newStore.id)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao criar loja')
      }
    },
  })

  // Auto-open dialog if user has no stores (uncontrolled mode)
  useEffect(() => {
    if (!isControlled && !isLoading && !stores.length && userId) {
      setOpen(true)
    }
  }, [isLoading, stores.length, userId, isControlled, setOpen])

  // Close dialog when stores load (uncontrolled mode)
  useEffect(() => {
    if (!isControlled && stores.length > 0 && open) {
      setOpen(false)
    }
  }, [isControlled, stores.length, open, setOpen])

  // Generate slug from store name
  useEffect(() => {
    const name = form.state.values.name
    if (name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      form.setFieldValue('slug', slug)
    }
  }, [form.state.values.name, form])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      form.reset()
      setCurrentStep(1)
      setError('')
      setCnpjError('')
      setPhoneError('')
    }
  }

  const handleBack = () => {
    setError('')
    setCnpjError('')
    setPhoneError('')
    if (currentStep === 3) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  // Don't render if not authenticated
  if (!userId) {
    return null
  }

  // In uncontrolled mode, don't render if loading
  if (!isControlled && isLoading) {
    return null
  }

  // In uncontrolled mode, don't render if user has stores
  if (!isControlled && stores.length > 0) {
    return null
  }

  // Determine if this is onboarding (first store) or adding a new store
  const isOnboarding = stores.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {isOnboarding ? (
                <Sparkles className="size-6 text-primary" />
              ) : (
                <Store className="size-6 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl">
                {isOnboarding ? 'Bem-vindo ao SuaVitrine! 🎉' : 'Criar nova loja'}
              </DialogTitle>
              <DialogDescription>
                {isOnboarding
                  ? 'Vamos começar criando sua primeira loja'
                  : 'Adicione uma nova loja ao seu perfil'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 pb-4">
          <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex-1 h-2 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="space-y-4 py-4 min-h-[300px]">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <>
                <form.Field name="name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Nome da Loja</Label>
                      <Input
                        id="store-name"
                        placeholder="Minha Loja Exemplo"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending}
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Este será o nome exibido para clientes e colaboradores
                      </p>
                    </div>
                  )}
                </form.Field>

                <form.Field name="slug">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="store-slug">URL da Loja (Slug)</Label>
                      <Input
                        id="store-slug"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending}
                        placeholder="minha-loja-exemplo"
                      />
                      <p className="text-xs text-muted-foreground">
                        {field.state.value 
                          ? `https://suavitrine.com/lojas/${field.state.value}`
                          : 'Digite o nome da loja para gerar automaticamente'}
                      </p>
                    </div>
                  )}
                </form.Field>
              </>
            )}

            {currentStep === 2 && (
              <>
                <form.Field name="street">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="street">Rua e Número</Label>
                      <Input
                        id="street"
                        placeholder="Rua dos Exemplos, 123"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending}
                        autoFocus
                      />
                    </div>
                  )}
                </form.Field>

                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="city">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          placeholder="São Paulo"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={createStoreMutation.isPending}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="state">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado (UF)</Label>
                        <Input
                          id="state"
                          placeholder="SP"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                          onBlur={field.handleBlur}
                          maxLength={2}
                          disabled={createStoreMutation.isPending}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field name="zipCode">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        placeholder="01234-567"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending}
                      />
                    </div>
                  )}
                </form.Field>
              </>
            )}

            {currentStep === 3 && (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Adicione informações de contato e redes sociais (opcional)
                </p>

                <form.Field name="cnpj">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={field.state.value}
                        onChange={(e) => {
                          // Remove tudo que não é número
                          const value = e.target.value.replace(/\D/g, '')
                          // Limita a 14 dígitos
                          const limitedValue = value.slice(0, 14)
                          // Formata usando a biblioteca
                          const formatted = limitedValue ? cnpj.format(limitedValue) : ''
                          field.handleChange(formatted)
                          // Limpa erro ao digitar
                          if (cnpjError) {
                            setCnpjError('')
                          }
                        }}
                        onBlur={(e) => {
                          field.handleBlur()
                          // Valida CNPJ quando o campo perde o foco
                          const cnpjValue = e.target.value.replace(/\D/g, '')
                          if (cnpjValue && cnpjValue.length === 14) {
                            if (!cnpj.isValid(cnpjValue)) {
                              setCnpjError('CNPJ inválido')
                            } else {
                              setCnpjError('')
                            }
                          } else if (cnpjValue && cnpjValue.length > 0) {
                            setCnpjError('CNPJ deve ter 14 dígitos')
                          } else {
                            setCnpjError('')
                          }
                        }}
                        disabled={createStoreMutation.isPending}
                        autoFocus
                      />
                      {cnpjError && (
                        <p className="text-xs text-destructive">{cnpjError}</p>
                      )}
                      {!cnpjError && (
                        <p className="text-xs text-muted-foreground">
                          Digite apenas números (opcional)
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="phoneNumber">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="phoneNumber"
                          placeholder="(11) 99999-9999"
                          value={field.state.value}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value)
                            field.handleChange(formatted)
                            // Limpa erro ao digitar
                            if (phoneError) {
                              setPhoneError('')
                            }
                          }}
                          onBlur={(e) => {
                            field.handleBlur()
                            // Valida telefone quando o campo perde o foco
                            const phoneValue = e.target.value.trim()
                            if (phoneValue) {
                              if (!isValidPhone(phoneValue)) {
                                setPhoneError('Telefone deve ter o formato (00) 00000-0000')
                              } else {
                                setPhoneError('')
                              }
                            } else {
                              setPhoneError('')
                            }
                          }}
                          disabled={createStoreMutation.isPending}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                      {phoneError && (
                        <p className="text-xs text-destructive">{phoneError}</p>
                      )}
                      {!phoneError && (
                        <p className="text-xs text-muted-foreground">
                          Digite apenas números (opcional)
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="contato@minhaloja.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={createStoreMutation.isPending}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  )}
                </form.Field>

                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="instagram">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                          <span className="absolute left-9 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                          <Input
                            id="instagram"
                            placeholder="minhaloja"
                            value={field.state.value}
                            onChange={(e) => {
                              // Remove o '@' se o usuário tentar digitar
                              const value = e.target.value.replace('@', '')
                              field.handleChange(value)
                            }}
                            onBlur={field.handleBlur}
                            disabled={createStoreMutation.isPending}
                            className="pl-14"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          O @ já está incluído
                        </p>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="facebook">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="facebook"
                            placeholder="minhaloja"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            disabled={createStoreMutation.isPending}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    )}
                  </form.Field>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={createStoreMutation.isPending}
              >
                <ChevronLeft className="size-4" />
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              disabled={createStoreMutation.isPending}
              className="flex-1"
            >
              {createStoreMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando loja...
                </>
              ) : currentStep === 1 || currentStep === 2 ? (
                <>
                  Próximo
                  <ChevronRight className="size-4" />
                </>
              ) : (
                <>
                  <Store className="size-4" />
                  {isOnboarding ? 'Criar minha primeira loja' : 'Criar loja'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
