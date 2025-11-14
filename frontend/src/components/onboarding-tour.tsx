import { useState, useEffect, useRef, useCallback } from 'react'
import Joyride, { STATUS, EVENTS } from 'react-joyride'
import type { Step } from 'react-joyride'
import { useRouter } from '@tanstack/react-router'
import { logger } from '@/utils/logger'

const ONBOARDING_TOUR_STORAGE_KEY = 'onboarding-tour-completed'

export function OnboardingTour() {
  const [runTour, setRunTour] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [waitingForCategoryDialogClose, setWaitingForCategoryDialogClose] = useState(false)
  const [waitingForProductDialogClose, setWaitingForProductDialogClose] = useState(false)
  const router = useRouter()

  // Refs para armazenar timeouts e evitar memory leaks
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isComponentMounted = useRef(true)

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: '👋 Bem-vindo! Vamos te mostrar rapidamente como usar o sistema.',
      disableBeacon: true,
    },
    {
      target: '.app-sidebar',
      content: 'Aqui está a barra lateral com todas as opções principais!',
      placement: 'right',
    },
    {
      target: '.navigate-category',
      content: 'Clique aqui para navegar para a página de categorias!',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.open-category-btn',
      content: 'Clique aqui para abrir o modal de criação de categoria!',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.navigate-product',
      content: 'Agora vamos para a página de produtos! Clique aqui para navegar.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.open-product-btn',
      content: 'Clique aqui para abrir o modal de criação de produto!',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.navigate-personalizacao',
      content: 'Agora vamos para a página de personalização! Clique aqui para navegar.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: 'body',
      placement: 'center',
      content: 'Aqui você pode personalizar as cores, fontes e estilos visuais da sua vitrine! 🎨',
      disableBeacon: true,
    },
    {
      target: '.ver-vitrine-btn',
      content: 'Por fim, clique aqui para visualizar sua vitrine! 🚀',
      placement: 'bottom',
      disableBeacon: true,
    },
  ]

  // Verifica se o tour já foi completado ao montar o componente
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(ONBOARDING_TOUR_STORAGE_KEY) === 'true'
    
    if (!hasCompletedTour) {
      logger.log('🎯 Tour não foi completado ainda, iniciando onboarding')
      setRunTour(true)
    } else {
      logger.log('✅ Tour já foi completado anteriormente, não será exibido')
      setRunTour(false)
    }
  }, [])

  // Limpa todos os timeouts ao desmontar
  useEffect(() => {
    isComponentMounted.current = true
    
    return () => {
      isComponentMounted.current = false
      
      // Limpa todos os timeouts pendentes
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current.clear()
      
      // Limpa o interval se existir
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Função auxiliar melhorada para criar timeouts rastreados
  const createTrackedTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      if (isComponentMounted.current) {
        callback()
      }
      timeoutRefs.current.delete(timeout)
    }, delay)
    
    timeoutRefs.current.add(timeout)
    return timeout
  }, [])

  // Função auxiliar melhorada para esperar por um elemento
  const waitForElementAndShowStep = useCallback((
    selector: string, 
    stepIdx: number, 
    elementName: string
  ) => {
    let retryCount = 0
    const maxRetries = 10
    
    const checkElement = () => {
      // Verifica se o componente ainda está montado
      if (!isComponentMounted.current) {
        logger.log(`⚠️ Componente desmontado, cancelando busca por ${elementName}`)
        return
      }

      const element = document.querySelector(selector)
      logger.log(`🔍 Procurando ${elementName} (${selector}), tentativa:`, retryCount, 'encontrado:', !!element)
      
      if (element) {
        logger.log(`✅ ${elementName} encontrado! Mostrando step ${stepIdx + 1}`)
        setStepIndex(stepIdx)
        createTrackedTimeout(() => {
          setRunTour(true)
        }, 100)
      } else if (retryCount < maxRetries) {
        retryCount++
        createTrackedTimeout(checkElement, 200)
      } else {
        logger.warn(`❌ ${elementName} não encontrado após ${maxRetries} tentativas`)
      }
    }
    
    checkElement()
  }, [createTrackedTimeout])

  // Monitora mudanças na URL - OTIMIZADO
  useEffect(() => {
    // Se não estiver esperando por nenhum dialog, não precisa monitorar
    if (!waitingForCategoryDialogClose && !waitingForProductDialogClose) {
      return
    }

    logger.log('⚙️ Configurando listener do histórico')
    
    const handleHistoryChange = () => {
      if (!isComponentMounted.current) return

      const currentHash = window.location.hash.replace('#', '')
      const currentPathname = window.location.pathname
    
      // Detecta quando o dialog de categoria é fechado
      if (waitingForCategoryDialogClose && currentPathname === '/categorias' && currentHash === '') {
        logger.log('✅ Dialog de categoria fechado! Mostrando step 5')
        setWaitingForCategoryDialogClose(false)
        
        createTrackedTimeout(() => {
          waitForElementAndShowStep('.navigate-product', 4, '📦 Botão de produtos')
        }, 300)
      }
      
      // Detecta quando o dialog de produto é fechado
      if (waitingForProductDialogClose && currentPathname === '/produtos' && currentHash === '') {
        logger.log('✅ Dialog de produto fechado! Mostrando step 7')
        setWaitingForProductDialogClose(false)
        
        createTrackedTimeout(() => {
          waitForElementAndShowStep('.navigate-personalizacao', 6, '🎨 Botão de personalização')
        }, 300)
      }
    }
    
    window.addEventListener('popstate', handleHistoryChange)
    window.addEventListener('hashchange', handleHistoryChange)
    
    // Verificação periódica APENAS quando necessário
    intervalRef.current = setInterval(() => {
      if (isComponentMounted.current) {
        handleHistoryChange()
      }
    }, 500)
    
    return () => {
      window.removeEventListener('popstate', handleHistoryChange)
      window.removeEventListener('hashchange', handleHistoryChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [waitingForCategoryDialogClose, waitingForProductDialogClose, createTrackedTimeout, waitForElementAndShowStep])

  // Função auxiliar para navegar e esperar por um elemento
  const navigateAndWaitForElement = useCallback(async (
    path: string,
    selector: string,
    nextStepIdx: number,
    elementName: string
  ) => {
    setRunTour(false)
    
    await router.navigate({ to: path as any })
    
    createTrackedTimeout(() => {
      waitForElementAndShowStep(selector, nextStepIdx, elementName)
    }, 300)
  }, [router, createTrackedTimeout, waitForElementAndShowStep])

  // Reseta estados se o tour for pulado ou finalizado e salva no localStorage
  const resetTourStates = useCallback(() => {
    setWaitingForCategoryDialogClose(false)
    setWaitingForProductDialogClose(false)
    setRunTour(false)
    setStepIndex(0)
    
    // Salva a flag no localStorage indicando que o tour foi completado
    localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, 'true')
    logger.log('💾 Flag de tour completado salva no localStorage')
  }, [])

  const handleJoyrideCallback = useCallback((data: any) => {
    const { status, type, index } = data
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status)
    
    // Se o botão X (fechar) foi clicado, trata como pular o tour
    // O react-joyride dispara 'tooltip:close' quando o X é clicado
    if (type === 'tooltip:close' || (type === EVENTS.TOUR_STATUS && status === STATUS.SKIPPED)) {
      resetTourStates()
      return
    }
    
    // Se o tour foi finalizado/pulado, reseta todos os estados
    if (finished) {
      resetTourStates()
      return
    }
    
    // Step 3 (index 2): Navegar para categorias
    if (type === EVENTS.STEP_AFTER && index === 2) {
      navigateAndWaitForElement(
        '/categorias',
        '.open-category-btn',
        3,
        '➕ Botão de adicionar categoria'
      )
      return
    }
    
    // Step 4 (index 3): Abrir modal de categoria
    if (type === EVENTS.STEP_AFTER && index === 3) {
      router.navigate({ 
        to: '/categorias',
        hash: 'criar',
        replace: true 
      })
      setRunTour(false)
      setWaitingForCategoryDialogClose(true)
      return
    }
    
    // Step 5 (index 4): Navegar para produtos
    if (type === EVENTS.STEP_AFTER && index === 4) {
      navigateAndWaitForElement(
        '/produtos',
        '.open-product-btn',
        5,
        '➕ Botão de adicionar produto'
      )
      return
    }
    
    // Step 6 (index 5): Abrir modal de produto
    if (type === EVENTS.STEP_AFTER && index === 5) {
      router.navigate({ 
        to: '/produtos',
        hash: 'criar',
        replace: true 
      })
      setRunTour(false)
      setWaitingForProductDialogClose(true)
      return
    }
    
    // Step 7 (index 6): Navegar para personalização
    if (type === EVENTS.STEP_AFTER && index === 6) {
      setRunTour(false)
      
      router.navigate({ to: '/personalizacao' }).then(() => {
        createTrackedTimeout(() => {
          setStepIndex(7)
          createTrackedTimeout(() => {
            setRunTour(true)
          }, 100)
        }, 300)
      })
      return
    }
    
    // Atualiza o stepIndex normalmente para steps que não precisam de navegação especial
    if (type === EVENTS.STEP_AFTER && ![2, 3, 4, 5, 6].includes(index)) {
      setStepIndex(index + 1)
    }
  }, [router, navigateAndWaitForElement, createTrackedTimeout, resetTourStates])

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress={false}
      hideBackButton
      hideCloseButton
      disableScrolling={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#4B733C', // Cor primária do projeto
        },
        spotlight: {
          borderRadius: '0.75rem', // Border radius padrão do projeto
        },
        tooltip: {
          backgroundColor: '#ffffff', // Card branco
          borderRadius: '0.75rem', // Border radius padrão
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.04)', // Sombras sutis do projeto
          border: '1px solid #E2E5E3', // Border color do projeto
          color: '#1E1E1E', // Foreground color
          fontSize: '0.9375rem', // ~15px
          lineHeight: '1.5',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          maxWidth: '400px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          color: '#1E1E1E',
          fontSize: '1.125rem', // ~18px
          fontWeight: '600',
          marginBottom: '0.5rem',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        tooltipContent: {
          padding: '0.5rem 0',
          color: '#6B6B6B', // Muted foreground
          fontSize: '0.9375rem',
          lineHeight: '1.5',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        buttonNext: {
          backgroundColor: '#4B733C', // Primary color
          color: '#ffffff',
          borderRadius: '0.5rem', // Border radius menor para botões
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
        },
        buttonSkip: {
          color: '#6B6B6B',
          fontSize: '0.875rem',
          fontWeight: '500',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      }}
      locale={{
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  )
}
