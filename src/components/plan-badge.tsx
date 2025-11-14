import { Badge } from '@/components/ui/badge'
import type { PayingPlan } from '@/lib/api/stores'
import { cn } from '@/lib/utils'

interface PlanBadgeProps {
  plan?: PayingPlan | null
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  if (!plan) {
    plan = 'FREE'
  }

  const planConfig = {
    FREE: {
      label: 'FREE',
      className: 'bg-muted text-muted-foreground border-border',
    },
    BASIC: {
      label: 'BASIC',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
    },
    PRO: {
      label: 'PRO',
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30',
    },
  }

  const config = planConfig[plan] || planConfig.FREE

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

