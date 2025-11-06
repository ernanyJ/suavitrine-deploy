import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Rocket, Sparkles, Loader2, ExternalLink, Copy, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { billingApi, type PayingPlan, type PlanDuration, type BillingResponse } from '@/lib/api/billing'
import { storesApi, type PayingPlan as StorePayingPlan } from '@/lib/api/stores'
import { toast } from 'sonner'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string | null
}

// Tipo para planos pagos (excluindo FREE)
type PaidPlan = Exclude<PayingPlan, 'FREE'>

export function UpgradeDialog({ open, onOpenChange, storeId }: UpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan>('BASIC')
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('MONTHLY')
  const [isCreating, setIsCreating] = useState(false)
  const [billingResponse, setBillingResponse] = useState<BillingResponse | null>(null)
  const [step, setStep] = useState<'select' | 'payment'>('select')
  const [activePlan, setActivePlan] = useState<StorePayingPlan | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)

  // Buscar plano ativo quando o dialog abre e storeId muda
  useEffect(() => {
    if (open && storeId) {
      setIsLoadingPlan(true)
      storesApi
        .getStore(storeId)
        .then((store) => {
          setActivePlan(store.activePlan || null)
        })
        .catch((error) => {
          console.error('Erro ao buscar informações da loja:', error)
          toast.error('Erro ao carregar informações da loja')
        })
        .finally(() => {
          setIsLoadingPlan(false)
        })
    } else if (!open) {
      // Reset quando fecha
      setActivePlan(null)
    }
  }, [open, storeId])

  // Preços base em centavos
  // Para anual: preço mensal * 12 * 0.8 (desconto de 20%)
  // Para mensal: preço mensal
  const planPrices: Record<PaidPlan, { monthly: number; yearly: number }> = {
    BASIC: {
      monthly: 2900, // R$ 29,00 em centavos
      yearly: Math.round(2900 * 12 * 0.8), // R$ 278,40 em centavos (12 meses com 20% de desconto)
    },
    PRO: {
      monthly: 4900, // R$ 49,00 em centavos
      yearly: Math.round(4900 * 12 * 0.8), // R$ 470,40 em centavos (12 meses com 20% de desconto)
    },
  } as const

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const getPlanPrice = (plan: PaidPlan) => {
    // Retorna o preço do plano baseado na duração selecionada
    // O backend calcula o preço final com desconto, mas este é apenas para preview
    return selectedDuration === 'MONTHLY'
      ? planPrices[plan].monthly
      : planPrices[plan].yearly
  }

  const getYearlySavings = (plan: PaidPlan) => {
    // Calcula quanto economiza no plano anual (comparado com 12 meses mensais)
    const monthlyTotal = planPrices[plan].monthly * 12
    const yearlyPrice = planPrices[plan].yearly
    return monthlyTotal - yearlyPrice
  }

  const handleCreateBilling = async () => {
    if (!storeId) {
      toast.error('Nenhuma loja selecionada')
      return
    }

    // Verificar se já existe plano ativo (verificação adicional de segurança)
    if (activePlan && activePlan !== 'FREE') {
      toast.error('Você já possui um plano ativo. Não é possível criar uma nova solicitação de pagamento.')
      return
    }

    setIsCreating(true)
    try {
      const response = await billingApi.createBillingRequest(storeId, {
        payingPlan: selectedPlan,
        planDuration: selectedDuration,
      })
      setBillingResponse(response)
      setStep('payment')
    } catch (error: any) {
      console.error('Erro ao criar solicitação de billing:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Falha ao criar solicitação de pagamento. Tente novamente.'
      toast.error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = () => {
    if (billingResponse?.paymentUrl) {
      navigator.clipboard.writeText(billingResponse.paymentUrl)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  const handleOpenLink = () => {
    if (billingResponse?.paymentUrl) {
      window.open(billingResponse.paymentUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state when closing
    setTimeout(() => {
      setStep('select')
      setBillingResponse(null)
      setSelectedPlan('BASIC')
      setSelectedDuration('MONTHLY')
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'select' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Escolha seu plano</DialogTitle>
              <DialogDescription>
                Selecione o plano e a duração que melhor se adequa ao seu negócio
              </DialogDescription>
            </DialogHeader>

            {/* Active Plan Alert */}
            {isLoadingPlan ? (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-border mb-6">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Verificando plano ativo...</span>
              </div>
            ) : activePlan && activePlan !== 'FREE' ? (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Plano ativo detectado
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Você já possui um plano <strong>{activePlan}</strong> ativo. Não é possível criar uma nova solicitação de pagamento enquanto houver um plano ativo.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Duration Selection */}
            <div className={cn(
              "flex gap-3 mb-6",
              activePlan && activePlan !== 'FREE' && "opacity-50 pointer-events-none"
            )}>
              <Button
                variant={selectedDuration === 'MONTHLY' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  selectedDuration === 'MONTHLY' && 'bg-primary'
                )}
                onClick={() => setSelectedDuration('MONTHLY')}
              >
                Mensal
              </Button>
              <Button
                variant={selectedDuration === 'YEARLY' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  selectedDuration === 'YEARLY' && 'bg-primary'
                )}
                onClick={() => setSelectedDuration('YEARLY')}
              >
                Anual
                {selectedDuration === 'YEARLY' && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                    Economize 20%
                  </span>
                )}
              </Button>
            </div>

            {/* Plan Selection */}
            <div className={cn(
              "grid md:grid-cols-2 gap-4 mb-6",
              activePlan && activePlan !== 'FREE' && "opacity-50 pointer-events-none"
            )}>
              {/* BASIC Plan */}
              <div
                className={cn(
                  'relative rounded-2xl p-6 border-2 cursor-pointer transition-all',
                  selectedPlan === 'BASIC'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                )}
                onClick={() => setSelectedPlan('BASIC')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  {selectedPlan === 'BASIC' && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">Basic</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Perfeito para começar
                </p>
                <div className="mb-4">
                  <div className="text-3xl font-bold">
                    {formatPrice(getPlanPrice('BASIC'))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedDuration === 'MONTHLY' ? '/mês' : '/ano'}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Produtos ilimitados</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Personalização avançada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Suporte prioritário</span>
                  </div>
                </div>
              </div>

              {/* PRO Plan */}
              <div
                className={cn(
                  'relative rounded-2xl p-6 border-2 cursor-pointer transition-all overflow-visible',
                  selectedPlan === 'PRO'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                )}
                onClick={() => setSelectedPlan('PRO')}
              >
                <div className="absolute -top-2 -right-2 z-10">
                  <span className={cn(
                    "inline-flex items-center text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-full font-medium shadow-lg transition-transform",
                    selectedPlan === 'PRO' ? 'transform rotate-12 hover:rotate-6' : ''
                  )}>
                    Popular
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  {selectedPlan === 'PRO' && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Para negócios em crescimento
                </p>
                <div className="mb-4">
                  <div className="text-3xl font-bold">
                    {formatPrice(getPlanPrice('PRO'))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedDuration === 'MONTHLY' ? '/mês' : '/ano'}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Tudo do Basic</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Dashboard de analytics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Domínio personalizado</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Suporte dedicado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isCreating || isLoadingPlan}
              >
                {activePlan && activePlan !== 'FREE' ? 'Fechar' : 'Cancelar'}
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateBilling}
                disabled={isCreating || !storeId || isLoadingPlan || (!!activePlan && activePlan !== 'FREE')}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processando...
                  </>
                ) : activePlan && activePlan !== 'FREE' ? (
                  'Plano ativo detectado'
                ) : (
                  'Continuar para pagamento'
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Pagamento</DialogTitle>
              <DialogDescription>
                Seu link de pagamento está pronto
              </DialogDescription>
            </DialogHeader>

            {billingResponse && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Resumo do pedido</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plano:</span>
                      <span className="font-medium">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duração:</span>
                      <span className="font-medium">
                        {selectedDuration === 'MONTHLY' ? 'Mensal' : 'Anual'}
                      </span>
                    </div>
                    {selectedDuration === 'YEARLY' && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sem desconto (12x mensal):</span>
                          <span className="text-muted-foreground line-through">
                            {formatPrice(planPrices[selectedPlan].monthly * 12)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Desconto de 20%:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            -{formatPrice(getYearlySavings(selectedPlan))}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground font-medium">Valor total:</span>
                      <span className="font-bold text-lg">
                        {formatPrice(billingResponse.price)}
                      </span>
                    </div>
                    {selectedDuration === 'YEARLY' && (
                      <div className="flex justify-between text-sm bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                        <span className="text-green-700 dark:text-green-300">Equivale a:</span>
                        <span className="font-medium text-green-700 dark:text-green-300">
                          {formatPrice(Math.round(billingResponse.price / 12))}/mês
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Link */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Link de pagamento</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted rounded-lg px-4 py-3 border border-border overflow-hidden">
                      <p className="text-sm truncate text-muted-foreground">
                        {billingResponse.paymentUrl}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      title="Copiar link"
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleOpenLink}
                  >
                    <ExternalLink className="mr-2 size-4" />
                    Abrir página de pagamento
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Próximos passos:</strong> Clique no botão acima para abrir a página de pagamento em uma nova aba. Após concluir o pagamento, seu plano será ativado automaticamente.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                >
                  Fechar
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

