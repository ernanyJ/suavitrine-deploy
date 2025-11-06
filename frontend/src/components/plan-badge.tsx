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
      className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
    BASIC: {
      label: 'BASIC',
      className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    },
    PRO: {
      label: 'PRO',
      className: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    },
  }

  const config = planConfig[plan] || planConfig.FREE

  return (
    <Badge
      variant="outline"
      className={cn(
        'border font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

