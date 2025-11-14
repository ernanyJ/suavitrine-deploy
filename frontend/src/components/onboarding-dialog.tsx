import { useState, useEffect, useRef } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateStore, useUserStores } from '@/lib/api/queries'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedStore } from '@/contexts/store-context'
import { storesApi } from '@/lib/api/stores'
import type { CreateStoreRequest } from '@/lib/api/stores'

// Constants for validation limits
const MAX_STORE_NAME_LENGTH = 100
const MAX_SLUG_LENGTH = 50
const MAX_STREET_LENGTH = 200
const MAX_CITY_LENGTH = 100
const MAX_EMAIL_LENGTH = 255
const MAX_INSTAGRAM_LENGTH = 30
const MAX_FACEBOOK_LENGTH = 100

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

// Função para formatar CEP no padrão 00000-000
function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '')
  const limited = numbers.slice(0, 8)
  
  if (limited.length <= 5) {
    return limited
  } else {
    return `${limited.slice(0, 5)}-${limited.slice(5)}`
  }
}

// Lista de estados do Brasil (UF)
const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

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
  const [slugError, setSlugError] = useState('')
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [currentSlug, setCurrentSlug] = useState('')
  const slugManuallyEdited = useRef(false)

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
        if (!value.slug.trim()) {
          setError('Por favor, digite o slug da loja')
          return
        }
        
        const slug = value.slug.trim()
        
        // Force verification if slug hasn't been checked yet or is being checked
        if (slug.length >= 3 && (slugAvailable === null || isCheckingSlug)) {
          // If already checking, wait for it
          if (isCheckingSlug) {
            setError('Aguarde a verificação do slug')
            return
          }
          
          // Force immediate verification
          setIsCheckingSlug(true)
          setError('')
          
          try {
            const available = await storesApi.checkSlugAvailability(slug)
            setSlugAvailable(available)
            if (!available) {
              setError('Este slug não está disponível')
              setIsCheckingSlug(false)
              return
            }
            setSlugError('')
          } catch (err) {
            console.error('Erro ao verificar disponibilidade do slug:', err)
            setError('Erro ao verificar disponibilidade do slug')
            setSlugAvailable(null)
            setIsCheckingSlug(false)
            return
          } finally {
            setIsCheckingSlug(false)
          }
        }
        
        // Final validation after forced check
        if (slugAvailable === false) {
          setError('Por favor, escolha um slug disponível')
          return
        }
        if (isCheckingSlug) {
          setError('Aguarde a verificação do slug')
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
      
      // Force slug verification if not checked yet
      const slug = value.slug.trim()
      if (slug.length >= 3 && (slugAvailable === null || isCheckingSlug)) {
        // If already checking, wait for it
        if (isCheckingSlug) {
          setError('Aguarde a verificação do slug')
          return
        }
        
        // Force immediate verification
        setIsCheckingSlug(true)
        setError('')
        
        try {
          const available = await storesApi.checkSlugAvailability(slug)
          setSlugAvailable(available)
          if (!available) {
            setError('Este slug não está disponível')
            setIsCheckingSlug(false)
            return
          }
          setSlugError('')
        } catch (err) {
          console.error('Erro ao verificar disponibilidade do slug:', err)
          setError('Erro ao verificar disponibilidade do slug')
          setSlugAvailable(null)
          setIsCheckingSlug(false)
          return
        } finally {
          setIsCheckingSlug(false)
        }
      }
      
      // Final validation after forced check
      if (slugAvailable === false) {
        setError('Por favor, escolha um slug disponível')
        return
      }
      if (isCheckingSlug) {
        setError('Aguarde a verificação do slug')
        return
      }
      
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
    const name = form.state.values.name?.trim()
    
    // Only auto-generate slug if it hasn't been manually edited
    if (!slugManuallyEdited.current && name) {
      const generatedSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      
      // Always update the slug to match the name
      form.setFieldValue('slug', generatedSlug)
      setCurrentSlug(generatedSlug)
      // Reset slug availability when slug changes
      setSlugAvailable(null)
      setSlugError('')
    } else if (!name && !slugManuallyEdited.current) {
      // Clear slug if name is empty and not manually edited
      form.setFieldValue('slug', '')
      setCurrentSlug('')
      setSlugAvailable(null)
      setSlugError('')
    }
  }, [form.state.values.name])

  // Sync currentSlug with form state when slug is manually edited
  useEffect(() => {
    if (slugManuallyEdited.current) {
      const formSlug = form.state.values.slug?.trim() || ''
      if (formSlug !== currentSlug) {
        setCurrentSlug(formSlug)
      }
    }
  }, [form.state.values.slug])

  // Debounce slug availability check
  useEffect(() => {
    const slug = currentSlug?.trim()
    
    // Reset if slug is empty
    if (!slug) {
      setSlugAvailable(null)
      setSlugError('')
      setIsCheckingSlug(false)
      return
    }

    // Don't check if slug is too short
    if (slug.length < 3) {
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
        const available = await storesApi.checkSlugAvailability(slug)
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
  }, [currentSlug])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      form.reset()
      setCurrentStep(1)
      setError('')
      setCnpjError('')
      setPhoneError('')
      setSlugError('')
      setSlugAvailable(null)
      setCurrentSlug('')
      slugManuallyEdited.current = false
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
                        onChange={(e) => {
                          const newName = e.target.value.slice(0, MAX_STORE_NAME_LENGTH)
                          field.handleChange(newName)
                          
                          // Auto-generate slug if not manually edited
                          if (!slugManuallyEdited.current && newName.trim()) {
                            const generatedSlug = newName
                              .toLowerCase()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                              .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
                              .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
                              .slice(0, MAX_SLUG_LENGTH)
                            
                            form.setFieldValue('slug', generatedSlug)
                            setCurrentSlug(generatedSlug)
                            setSlugAvailable(null)
                            setSlugError('')
                          } else if (!newName.trim() && !slugManuallyEdited.current) {
                            // Clear slug if name is empty
                            form.setFieldValue('slug', '')
                            setCurrentSlug('')
                            setSlugAvailable(null)
                            setSlugError('')
                          }
                        }}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending}
                        autoFocus
                        maxLength={MAX_STORE_NAME_LENGTH}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Este será o nome exibido para clientes e colaboradores
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {field.state.value.length}/{MAX_STORE_NAME_LENGTH}
                        </p>
                      </div>
                    </div>
                  )}
                </form.Field>

                <form.Field name="slug">
                  {(field) => (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="store-slug">URL da Loja (Slug)</Label>
                        <p className="text-xs text-muted-foreground">
                          O slug é a parte da URL que identifica sua loja. Use apenas letras minúsculas, números e hífens.
                        </p>
                      </div>
                      <Input
                        id="store-slug"
                        value={field.state.value}
                        onFocus={() => {
                          // When user focuses on slug field, mark as manually edited
                          slugManuallyEdited.current = true
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, MAX_SLUG_LENGTH)
                          field.handleChange(value)
                          setCurrentSlug(value)
                        }}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending || isCheckingSlug}
                        placeholder="minha-loja-exemplo"
                        maxLength={MAX_SLUG_LENGTH}
                      />
                      
                      {/* URL Preview */}
                      {field.state.value && (
                        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Preview da URL:</p>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground">https://suavitrine.com/lojas/</span>
                            <span className="text-xs font-mono font-semibold text-primary">
                              {field.state.value}
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
                      {!isCheckingSlug && !slugError && slugAvailable === true && field.state.value && (
                          <p className="text-xs text-green-600">
                          ✓ Slug disponível
                       </p>
                      )}
                      {!field.state.value && (
                        <p className="text-xs text-muted-foreground">
                          Digite o nome da loja para gerar automaticamente
                        </p>
                      )}
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
                        onChange={(e) => field.handleChange(e.target.value.slice(0, MAX_STREET_LENGTH))}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending}
                        autoFocus
                        maxLength={MAX_STREET_LENGTH}
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
                          onChange={(e) => field.handleChange(e.target.value.slice(0, MAX_CITY_LENGTH))}
                          onBlur={field.handleBlur}
                          disabled={createStoreMutation.isPending}
                          maxLength={MAX_CITY_LENGTH}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="state">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado (UF)</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => {
                            field.handleChange(value)
                            field.handleBlur()
                          }}
                          disabled={createStoreMutation.isPending}
                        >
                          <SelectTrigger id="state" className="w-full">
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRAZILIAN_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.value} - {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        placeholder="00000-000"
                        value={field.state.value}
                        onChange={(e) => {
                          const formatted = formatCEP(e.target.value)
                          field.handleChange(formatted)
                        }}
                        onBlur={field.handleBlur}
                        disabled={createStoreMutation.isPending}
                        maxLength={9}
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
                          onChange={(e) => field.handleChange(e.target.value.slice(0, MAX_EMAIL_LENGTH))}
                          onBlur={field.handleBlur}
                          disabled={createStoreMutation.isPending}
                          className="pl-9"
                          maxLength={MAX_EMAIL_LENGTH}
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
                          <span className="absolute left-9 top-1/2 -translate-y-1/2 text-primary font-medium text-sm pointer-events-none">@</span>
                          <Input
                            id="instagram"
                            placeholder="minhaloja"
                            value={field.state.value}
                            onChange={(e) => {
                              // Remove qualquer '@' que o usuário tentar inserir
                              const value = e.target.value.replace(/@/g, '').slice(0, MAX_INSTAGRAM_LENGTH)
                              field.handleChange(value)
                            }}
                            onBlur={field.handleBlur}
                            disabled={createStoreMutation.isPending}
                            className="pl-14"
                            maxLength={MAX_INSTAGRAM_LENGTH}
                          />
                        </div>
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
                            onChange={(e) => field.handleChange(e.target.value.slice(0, MAX_FACEBOOK_LENGTH))}
                            onBlur={field.handleBlur}
                            disabled={createStoreMutation.isPending}
                            className="pl-9"
                            maxLength={MAX_FACEBOOK_LENGTH}
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
              disabled={
                createStoreMutation.isPending || 
                isCheckingSlug || 
                slugAvailable === false ||
                (currentStep === 1 && !form.state.values.name.trim())
              }
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
