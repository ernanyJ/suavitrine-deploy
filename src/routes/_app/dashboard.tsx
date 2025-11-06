import { createFileRoute } from '@tanstack/react-router'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  TrendingUp, 
  DollarSign, 
  Eye,
  MousePointer,
  RefreshCw
} from 'lucide-react'
import { useStoreMetrics } from '@/lib/api/queries'
import { useSelectedStore } from '@/contexts/store-context'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()
  
  const { data: metrics, isLoading: isLoadingMetrics, refetch: refetchMetrics, isRefetching } = useStoreMetrics(selectedStoreId, 30)
  const isLoading = isLoadingMetrics

  const handleRefresh = async () => {
    await refetchMetrics()
  }

  // Calcular taxa de conversão
  const conversionRate = metrics && metrics.totalProductClicks > 0
    ? ((metrics.totalProductConversions / metrics.totalProductClicks) * 100).toFixed(2)
    : '0.00'

  // Configuração do gráfico
  const chartConfig = {
    accesses: {
      label: 'Acessos',
    },
  } satisfies ChartConfig

  // Gerar array dos últimos 30 dias sempre
  const generateLast30Days = () => {
    const days: Array<{ date: string; accesses: number }> = []
    const today = new Date()
    
    // Criar um mapa dos dados existentes por data
    const dataMap = new Map<string, number>()
    metrics?.dailyMetrics?.forEach((day) => {
      // Normalizar a data para comparar apenas dia/mês/ano
      const dateKey = new Date(day.date).toISOString().split('T')[0]
      dataMap.set(dateKey, day.accesses)
    })
    
    // Gerar os últimos 30 dias
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0) // Normalizar para meia-noite
      
      const dateKey = date.toISOString().split('T')[0]
      const dateString = date.toISOString()
      
      days.push({
        date: dateString,
        accesses: dataMap.get(dateKey) || 0,
      })
    }
    
    return days
  }

  // Transformar dados para o formato do gráfico (sempre 30 dias)
  const chartData = generateLast30Days()

  const stats = [
    {
      title: 'Acessos Totais',
      value: isLoading ? '...' : metrics?.totalAccesses.toLocaleString() || '0',
      description: 'Acessos nos últimos 30 dias',
      icon: Eye,
    },
    {
      title: 'Cliques em Produtos',
      value: isLoading ? '...' : metrics?.totalProductClicks.toLocaleString() || '0',
      description: 'Interações com produtos',
      icon: MousePointer,
    },
    {
      title: 'Conversões',
      value: isLoading ? '...' : metrics?.totalProductConversions.toLocaleString() || '0',
      description: 'Produtos convertidos',
      icon: DollarSign,
    },
    {
      title: 'Taxa de Conversão',
      value: isLoading ? '...' : `${conversionRate}%`,
      description: 'Eficiência de conversão',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho da sua loja
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefetching || isLoading}
          title="Atualizar dados"
        >
          <RefreshCw className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products and Categories Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Clicados</CardTitle>
            <CardDescription>
              Produtos mais populares nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : metrics?.topProductsByClicks && metrics.topProductsByClicks.length > 0 ? (
              <div className="space-y-4">
                {metrics.topProductsByClicks.slice(0, 5).map((product, i) => (
                  <div key={product.productId} className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{product.productTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.clicks} cliques
                      </p>
                    </div>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ 
                          width: `${Math.min((product.clicks / (metrics.topProductsByClicks[0]?.clicks || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum dado de produto disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias Mais Acessadas</CardTitle>
            <CardDescription>
              Categorias mais visitadas nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : metrics?.topCategoriesByClicks && metrics.topCategoriesByClicks.length > 0 ? (
              <div className="space-y-4">
                {metrics.topCategoriesByClicks.slice(0, 5).map((category, i) => (
                  <div key={category.categoryId} className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{category.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.clicks} cliques
                      </p>
                    </div>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ 
                          width: `${Math.min((category.clicks / (metrics.topCategoriesByClicks[0]?.clicks || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum dado de categoria clicada disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Acessos Diários</CardTitle>
          <CardDescription>
            Acompanhe os acessos diários nos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <TrendingUp className="size-12 mx-auto mb-3 text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('pt-BR', {
                      month: '2-digit',
                      day: '2-digit',
                    })
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="accesses"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      }}
                    />
                  }
                />
                <Bar dataKey="accesses" fill="var(--chart-1)" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
