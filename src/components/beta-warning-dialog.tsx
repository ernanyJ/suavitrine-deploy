import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, MessageCircle, Mail } from 'lucide-react'

interface BetaWarningDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}


export function BetaWarningDialog({ 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: BetaWarningDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined

  const open = isControlled ? controlledOpen! : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing through the button, not by clicking outside or pressing ESC
    if (!newOpen) {
      // Prevent closing from outside interactions
      return
    }
    // Allow opening
    if (isControlled) {
      controlledOnOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const handleWhatsAppSupport = () => {
    const phoneNumber = '5595991304809'
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleEmailSupport = () => {
    window.location.href = 'mailto:julioernany@gmail.com?subject=Reporte de Bug - SuaVitrine'
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-lg"
        showCloseButton={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-yellow-500" />
            <DialogTitle className="text-xl">Plataforma em Fase de Testes</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3">
            <p className="text-base">
              Olá! Bem-vindo à <strong>SuaVitrine</strong>. Estamos muito felizes em tê-lo conosco nesta jornada.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">⚠️ Informações Importantes:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>A plataforma está em <strong>fase de testes (Beta)</strong></li>
                <li>Os dados serão <strong>resetados no lançamento oficial</strong></li>
                <li>Podem ocorrer <strong>bugs e instabilidades</strong></li>
                <li>Estamos trabalhando constantemente para melhorar a experiência</li>
              </ul>
            </div>
            <div className="space-y-2 pt-2">
              <p className="font-semibold text-foreground">📧 Como Reportar Problemas:</p>
              <p className="text-sm">
                Encontrou um bug ou tem alguma sugestão? Entre em contato conosco:
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="default"
            className="w-full justify-start gap-2 bg-[#0D7A6B] hover:bg-[#0A5D52] text-white font-medium"
            onClick={handleWhatsAppSupport}
          >
            <MessageCircle className="size-4" />
            <span className="font-semibold">Falar com o suporte no WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleEmailSupport}
          >
            <Mail className="size-4" />
            <span>Enviar email: julioernany@gmail.com</span>
          </Button>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleClose} variant="default">
            Entendi, continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

