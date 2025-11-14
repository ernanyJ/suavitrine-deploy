import { useState, useCallback, useEffect, useMemo } from 'react'
import Joyride, { type CallBackProps, type Step, STATUS, EVENTS, ACTIONS } from 'react-joyride'
import { useLocation } from '@tanstack/react-router'
import { useStoreCategories, useStoreProducts } from '@/lib/api/queries'
import { useSelectedStore } from '@/contexts/store-context'

interface AppOnboardingProps {
  run?: boolean
  onComplete?: () => void
}

// Estado do onboarding
type OnboardingStep = 
  | 'welcome'
  | 'navigate-categories'
  | 'add-category-button'
  | 'create-category-form'
  | 'category-created'
  | 'navigate-products'
  | 'add-product-button'
  | 'create-product-form'
  | 'product-created'
  | 'complete'

export function AppOnboarding({ run = false, onComplete }: AppOnboardingProps) {
  const [isRunning, setIsRunning] = useState(run)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [onboardingState, setOnboardingState] = useState<OnboardingStep>('welcome')
  const location = useLocation()
  const { selectedStoreId } = useSelectedStore()
  
  // Monitorar categorias e produtos para detectar criação
  const { data: categories = [] } = useStoreCategories(selectedStoreId)
  const { data: products = [] } = useStoreProducts(selectedStoreId)
  
  const [initialCategoriesCount, setInitialCategoriesCount] = useState(categories.length)
  const [initialProductsCount, setInitialProductsCount] = useState(products.length)

  useEffect(() => {
    if (run) {
      setCurrentStepIndex(0)
      setInitialCategoriesCount(categories.length)
      setInitialProductsCount(products.length)
      // Sempre começar do início do fluxo
      setOnboardingState('welcome')
      setIsRunning(true)
    } else {
      // Resetar estado quando parar
      setIsRunning(false)
      setOnboardingState('welcome')
      setCurrentStepIndex(0)
    }
  }, [run, categories.length, products.length])

  // Detectar quando categoria é criada
  useEffect(() => {
    if (onboardingState === 'create-category-form' && categories.length > initialCategoriesCount) {
      setOnboardingState('category-created')
      // Avançar para próximo step após um pequeno delay
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1)
      }, 1000)
    }
  }, [categories.length, initialCategoriesCount, onboardingState])

  // Detectar quando produto é criado
  useEffect(() => {
    if (onboardingState === 'create-product-form' && products.length > initialProductsCount) {
      setOnboardingState('product-created')
      // Avançar para próximo step após um pequeno delay
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1)
      }, 1000)
    }
  }, [products.length, initialProductsCount, onboardingState])

  // Detectar navegação para /categorias
  useEffect(() => {
    if (onboardingState === 'navigate-categories' && location.pathname === '/categorias') {
      setTimeout(() => {
        setOnboardingState('add-category-button')
        setCurrentStepIndex(0)
      }, 500)
    }
  }, [location.pathname, onboardingState])

  // Detectar navegação para /produtos
  useEffect(() => {
    if (onboardingState === 'navigate-products' && location.pathname === '/produtos') {
      setTimeout(() => {
        setOnboardingState('add-product-button')
        setCurrentStepIndex(0)
      }, 500)
    }
  }, [location.pathname, onboardingState])

  // Detectar cliques nos botões para avançar automaticamente
  useEffect(() => {
    if (!isRunning) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Verificar se clicou no link de navegação para categorias
      if (onboardingState === 'navigate-categories') {
        const navLink = target.closest('[data-onboarding="nav-categorias"]')
        if (navLink) {
          // Não fazer nada aqui - o useEffect de navegação vai detectar
          return
        }
      }

      // Verificar se clicou no link de navegação para produtos
      if (onboardingState === 'navigate-products') {
        const navLink = target.closest('[data-onboarding="nav-produtos"]')
        if (navLink) {
          // Não fazer nada aqui - o useEffect de navegação vai detectar
          return
        }
      }
      
      // Verificar se clicou no botão de adicionar categoria
      if (onboardingState === 'add-category-button') {
        const addButton = target.closest('[data-onboarding="add-category-button"]')
        if (addButton) {
          setTimeout(() => {
            setOnboardingState('create-category-form')
            setCurrentStepIndex(0)
          }, 500)
        }
      }

      // Verificar se clicou no botão de adicionar produto
      if (onboardingState === 'add-product-button') {
        const addButton = target.closest('[data-onboarding="add-product-button"]')
        if (addButton) {
          setTimeout(() => {
            setOnboardingState('create-product-form')
            setCurrentStepIndex(0)
          }, 500)
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [isRunning, onboardingState])

  // Steps dinâmicos baseados no estado
  const onboardingSteps: Step[] = useMemo(() => {
    const steps: Step[] = []

    if (onboardingState === 'welcome') {
      steps.push({
        target: 'body',
        content: (
          <div>
            <h3 className="font-semibold text-lg mb-2">Bem-vindo ao SuaVitrine! 🎉</h3>
            <p>Vamos te guiar para criar sua primeira categoria e produto.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      })
    }

    if (onboardingState === 'navigate-categories') {
      // Verificar se já está na página de categorias
      if (location.pathname === '/categorias') {
        steps.push({
          target: '[data-onboarding="add-category-button"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Adicionar Categoria</h3>
              <p>Clique no botão "Adicionar Categoria" para criar sua primeira categoria.</p>
            </div>
          ),
          placement: 'bottom',
        })
      } else {
        steps.push({
          target: '[data-onboarding="nav-categorias"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Primeiro passo: Criar uma Categoria</h3>
              <p>Clique em "Categorias" no menu lateral para começar.</p>
            </div>
          ),
          placement: 'right',
        })
      }
    }

    if (onboardingState === 'add-category-button') {
      // Se não estiver na página de categorias, mostrar mensagem para navegar
      if (location.pathname !== '/categorias') {
        steps.push({
          target: '[data-onboarding="nav-categorias"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Primeiro passo: Criar uma Categoria</h3>
              <p>Clique em "Categorias" no menu lateral para começar.</p>
            </div>
          ),
          placement: 'right',
        })
      } else {
        steps.push({
          target: '[data-onboarding="add-category-button"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Adicionar Categoria</h3>
              <p>Clique no botão "Adicionar Categoria" para criar sua primeira categoria.</p>
            </div>
          ),
          placement: 'bottom',
        })
      }
    }

    if (onboardingState === 'create-category-form') {
      steps.push({
        target: '[data-onboarding="create-category-submit"]',
        content: (
          <div>
            <h3 className="font-semibold text-lg mb-2">Preencher e Criar</h3>
            <p>Preencha o nome da categoria e clique em "Criar Categoria" para finalizar.</p>
          </div>
        ),
        placement: 'top',
      })
    }

    if (onboardingState === 'category-created') {
      steps.push({
        target: 'body',
        content: (
          <div>
            <h3 className="font-semibold text-lg mb-2">Ótimo! Categoria criada! ✅</h3>
            <p>Agora vamos criar seu primeiro produto.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      })
    }

    if (onboardingState === 'navigate-products') {
      // Verificar se já está na página de produtos
      if (location.pathname === '/produtos') {
        steps.push({
          target: '[data-onboarding="add-product-button"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Adicionar Produto</h3>
              <p>Clique no botão "Adicionar Produto" para criar seu primeiro produto.</p>
            </div>
          ),
          placement: 'bottom',
        })
      } else {
        steps.push({
          target: '[data-onboarding="nav-produtos"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Agora vamos criar um Produto</h3>
              <p>Clique em "Produtos" no menu lateral.</p>
            </div>
          ),
          placement: 'right',
        })
      }
    }

    if (onboardingState === 'add-product-button') {
      // Se não estiver na página de produtos, mostrar mensagem para navegar
      if (location.pathname !== '/produtos') {
        steps.push({
          target: '[data-onboarding="nav-produtos"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Agora vamos criar um Produto</h3>
              <p>Clique em "Produtos" no menu lateral.</p>
            </div>
          ),
          placement: 'right',
        })
      } else {
        steps.push({
          target: '[data-onboarding="add-product-button"]',
          content: (
            <div>
              <h3 className="font-semibold text-lg mb-2">Adicionar Produto</h3>
              <p>Clique no botão "Adicionar Produto" para criar seu primeiro produto.</p>
            </div>
          ),
          placement: 'bottom',
        })
      }
    }

    if (onboardingState === 'create-product-form') {
      steps.push({
        target: '[data-onboarding="product-category-select"]',
        content: (
          <div>
            <h3 className="font-semibold text-lg mb-2">Selecionar Categoria</h3>
            <p>Primeiro, selecione a categoria que você acabou de criar. Depois preencha os campos obrigatórios (nome, preço) e clique em "Criar Produto".</p>
          </div>
        ),
        placement: 'top',
      })
    }

    if (onboardingState === 'product-created') {
      steps.push({
        target: 'body',
        content: (
          <div>
            <h3 className="font-semibold text-lg mb-2">Parabéns! 🎉</h3>
            <p>Você criou sua primeira categoria e produto! Agora você está pronto para começar a usar o SuaVitrine.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      })
    }

    // Garantir que sempre há pelo menos um step
    if (steps.length === 0) {
      steps.push({
        target: 'body',
        content: (
          <div>
            <h3 className="font-semibold text-lg mb-2">Bem-vindo ao SuaVitrine! 🎉</h3>
            <p>Vamos te guiar para criar sua primeira categoria e produto.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      })
    }

    return steps
  }, [onboardingState, location.pathname])

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, status, type } = data

      // Detectar cliques em elementos específicos
      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        // Verificar se o usuário clicou em um elemento específico
        if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
          setIsRunning(false)
          onComplete?.()
          return
        }
      }

      // Avançar automaticamente quando o usuário clica em "Próximo" em steps específicos
      // (apenas para steps que não requerem ação do usuário)
      if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
        if (onboardingState === 'welcome') {
          // Aguardar o usuário navegar - não avançar automaticamente
          setOnboardingState('navigate-categories')
          setCurrentStepIndex(0)
        } else if (onboardingState === 'category-created') {
          // Aguardar o usuário navegar - não avançar automaticamente
          setOnboardingState('navigate-products')
          setCurrentStepIndex(0)
        } else if (onboardingState === 'product-created') {
          setIsRunning(false)
          onComplete?.()
        }
        // Para outros estados, não avançar automaticamente - aguardar ação do usuário
      }

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setIsRunning(false)
        onComplete?.()
      }
    },
    [onComplete, onboardingState]
  )

  // Não renderizar se não houver steps ou se não estiver rodando
  if (!isRunning || onboardingSteps.length === 0) {
    return null
  }

  return (
    <Joyride
      steps={onboardingSteps}
      run={isRunning}
      stepIndex={currentStepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose={false}
      disableScrolling={false}
      disableCloseOnEsc={false}
      spotlightClicks={true}
      callback={handleJoyrideCallback}
      floaterProps={{
        disableAnimation: false,
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '8px',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: '6px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--foreground))',
          marginRight: '10px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
        open: 'Abrir o diálogo',
        nextLabelWithProgress: 'Próximo (Passo {step} de {steps})',
      }}
    />
  )
}

