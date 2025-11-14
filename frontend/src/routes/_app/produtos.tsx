import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Grid3x3,
  Table as TableIcon,
  Check,
  X,
} from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useStoreProducts, useDeleteProduct, useStoreCategories, useToggleProductAvailability } from '@/lib/api/queries'
import { useSelectedStore } from '@/contexts/store-context'
import { CreateProductDialog } from '@/components/create-product-dialog'
import { EditProductDialog } from '@/components/edit-product-dialog'
import type { ProductResponse } from '@/lib/api/products'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/_app/produtos')({
  component: ProdutosPage,
})

type ViewMode = 'grid' | 'table'

function ProdutosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  
  // Load view mode preference from localStorage
  // Force grid mode on mobile devices
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Check if we're on mobile
    const isMobile = window.innerWidth < 768
    if (isMobile) return 'grid'
    
    const saved = localStorage.getItem('productsViewMode')
    return (saved === 'grid' || saved === 'table') ? saved : 'grid'
  })
  
  // Update view mode to grid when window is resized to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode !== 'grid') {
        setViewModeState('grid')
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])
  
  const location = useLocation()
  const navigate = useNavigate()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null)
  const [productToEdit, setProductToEdit] = useState<ProductResponse | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  const handleImageError = (productId: string) => {
    setFailedImages(prev => new Set(prev).add(productId))
    console.error(`Failed to load image for product: ${productId}`)
  }

  const resetFailedImages = () => {
    setFailedImages(new Set())
  }

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('productsViewMode', viewMode)
  }, [viewMode])

  // Check hash on mount and when location changes
  useEffect(() => {
    const hash = location.hash
    if (hash === 'criar' && !dialogOpen) {
      setDialogOpen(true)
    }
  }, [location.hash, dialogOpen])

  // Update hash when dialog opens/closes
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (open) {
      navigate({ hash: 'criar', replace: true })
    } else {
      navigate({ hash: '', replace: true })
    }
  }

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
  }
  
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()
  
  // Query client for optimistic updates
  const queryClient = useQueryClient()
  
  // Fetch products for the selected store
  const { data: products = [], isLoading, error } = useStoreProducts(selectedStoreId)
  
  // Fetch categories for the selected store
  const { data: categories = [] } = useStoreCategories(selectedStoreId)
  
  // Delete product mutation
  const deleteProductMutation = useDeleteProduct(selectedStoreId)
  
  // Toggle availability mutation
  const toggleAvailabilityMutation = useToggleProductAvailability(selectedStoreId)

  const handleDeleteClick = (productId: string, productTitle: string) => {
    setProductToDelete({ id: productId, title: productTitle })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete && selectedProducts.size === 0) return

    // If multiple products are selected, delete them all
    if (selectedProducts.size > 0) {
      await handleDeleteMultiple()
      return
    }
    
    // Otherwise, delete the single product with optimistic update
    if (!productToDelete) return

    const productId = productToDelete.id
    
    // Close dialog immediately
    setDeleteDialogOpen(false)
    setProductToDelete(null)

    // Get current products from cache
    const queryKey = ['products', selectedStoreId]
    const previousProducts = queryClient.getQueryData<ProductResponse[]>(queryKey)

    try {
      // Optimistically remove the product from UI
      queryClient.setQueryData<ProductResponse[]>(queryKey, (old) => {
        return old?.filter(p => p.id !== productId) ?? []
      })

      // Execute the actual deletion
      await deleteProductMutation.mutateAsync(productId)
      
      // Show success toast
      toast.success('Produto excluído com sucesso')
    } catch (error) {
      // Revert the optimistic update on error
      if (previousProducts) {
        queryClient.setQueryData(queryKey, previousProducts)
      }
      
      // Show error toast
      toast.error('Erro ao excluir produto', {
        description: 'Não foi possível excluir o produto. Tente novamente.',
      })
      
      console.error('Error deleting product:', error)
    }
  }

  const handleEditClick = (product: ProductResponse) => {
    setProductToEdit(product)
    setEditDialogOpen(true)
  }

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    if (!products) return []
    
    let filtered = products
    
    // Filter by category if selected
    if (selectedCategoryId) {
      filtered = filtered.filter(
        (product) => product.category?.id === selectedCategoryId
      )
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [products, searchQuery, selectedCategoryId])

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null)
    } else {
      setSelectedCategoryId(categoryId)
    }
  }

  const handleClearCategory = () => {
    setSelectedCategoryId(null)
  }

  // Selection handlers
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedProducts(new Set())
  }

  const handleDeleteMultiple = async () => {
    if (selectedProducts.size === 0) return

    const productIds = Array.from(selectedProducts)
    
    // Close dialog immediately
    setDeleteDialogOpen(false)
    setSelectedProducts(new Set())

    // Get current products from cache
    const queryKey = ['products', selectedStoreId]
    const previousProducts = queryClient.getQueryData<ProductResponse[]>(queryKey)

    try {
      // Optimistically remove the products from UI
      queryClient.setQueryData<ProductResponse[]>(queryKey, (old) => {
        return old?.filter(p => !productIds.includes(p.id)) ?? []
      })

      // Delete all selected products
      await Promise.all(
        productIds.map(productId => 
          deleteProductMutation.mutateAsync(productId)
        )
      )
      
      // Show success toast
      toast.success(`${productIds.length} ${productIds.length === 1 ? 'produto excluído' : 'produtos excluídos'} com sucesso`)
    } catch (error) {
      // Revert the optimistic update on error
      if (previousProducts) {
        queryClient.setQueryData(queryKey, previousProducts)
      }
      
      // Show error toast
      toast.error('Erro ao excluir produtos', {
        description: 'Não foi possível excluir os produtos. Tente novamente.',
      })
      
      console.error('Error deleting products:', error)
    }
  }

  const handleToggleAvailability = async (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    try {
      await toggleAvailabilityMutation.mutateAsync(productId)
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  // Helper function to format price (from cents to BRL format)
  const formatPrice = (priceInCents: number) => {
    const reais = priceInCents / 100
    // Format as BRL with comma for decimals and dots for thousands
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Debug: Log products to see image URLs
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('Products loaded:', products)
      products.forEach(product => {
        const imageUrl = product.images?.[0]?.url
        console.log(`Product: ${product.title}, ImageURL: ${imageUrl}`)
      })
    }
  }, [products])

  // Reset failed images when products change
  useEffect(() => {
    if (products && products.length > 0) {
      resetFailedImages()
    }
  }, [products.length])

  // Table columns definition
  const columns = useMemo<ColumnDef<ProductResponse>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <button
            onClick={handleSelectAll}
            className="flex items-center justify-center"
          >
            {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? (
              <div className="flex h-4 w-4 items-center justify-center rounded border bg-primary text-primary-foreground">
                <Check className="size-3" />
              </div>
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded border" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => handleSelectProduct(row.original.id)}
            className="flex items-center justify-center"
          >
            {selectedProducts.has(row.original.id) ? (
              <div className="flex h-4 w-4 items-center justify-center rounded border bg-primary text-primary-foreground">
                <Check className="size-3" />
              </div>
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded border" />
            )}
          </button>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Produto',
        cell: ({ row }) => {
          const imageUrl = row.original.images?.[0]?.url
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                {imageUrl && !failedImages.has(row.original.id) ? (
                  <img
                    src={imageUrl}
                    alt={row.original.title}
                    className="h-full w-full object-cover"
                    onError={() => handleImageError(row.original.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="size-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium">{row.original.title}</div>
                <div className="text-sm text-muted-foreground">
                  {row.original.category?.name || 'Sem categoria'}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'price',
        header: 'Preço',
        cell: ({ row }) => (
          <span className="text-lg font-semibold">
            R$ {formatPrice(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: 'variations',
        header: 'Variações',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <span className="text-sm">{row.original.variations?.length || 0}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.available ?? true}
              onCheckedChange={() => handleToggleAvailability(row.original.id)}
              disabled={toggleAvailabilityMutation.isPending}
            />
            <Badge variant={row.original.available ? "default" : "secondary"}>
              {row.original.available ? "Disponível" : "Indisponível"}
            </Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Eye className="size-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2"
                onClick={() => handleEditClick(row.original)}
              >
                <Edit className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 text-destructive"
                onClick={() => handleDeleteClick(row.original.id, row.original.title)}
                disabled={deleteProductMutation.isPending}
              >
                <Trash2 className="size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deleteProductMutation.isPending, toggleAvailabilityMutation.isPending, failedImages, selectedProducts, filteredProducts.length, handleToggleAvailability]
  )

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-4 p-4 pt-16 md:pt-6 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Produtos</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Gerencie o catálogo de produtos da sua loja
          </p>
        </div>
        {selectedProducts.size === 0 ? (
          <Button 
            className="gap-2 w-full md:w-auto open-product-btn" 
            onClick={() => handleDialogOpenChange(true)}
          >
            <Plus className="size-4" />
            <span className="hidden md:inline">Adicionar Produto</span>
            <span className="md:hidden">Adicionar</span>
          </Button>
        ) : (
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <span className="text-sm text-muted-foreground text-center md:text-left">
              {selectedProducts.size} {selectedProducts.size === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="flex-1 md:flex-initial"
              >
                <X className="size-4" />
                <span className="hidden md:inline">Limpar</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setProductToDelete({ id: '', title: `${selectedProducts.size} produtos` })
                  setDeleteDialogOpen(true)
                }}
                className="flex-1 md:flex-initial"
              >
                <Trash2 className="size-4" />
                <span className="hidden md:inline">Excluir ({selectedProducts.size})</span>
                <span className="md:hidden">Excluir</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State - Skeleton Grid */}
      {isLoading && viewMode === 'grid' && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              {/* Skeleton Image */}
              <div className="aspect-square w-full">
                <Skeleton className="h-full w-full" />
              </div>
              
              {/* Skeleton Content */}
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Loading State - Skeleton Table */}
      {isLoading && viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
            <Package className="size-10 text-destructive mb-4 md:size-12" />
            <h3 className="text-base font-semibold mb-2 text-center md:text-lg">
              Erro ao carregar produtos
            </h3>
            <p className="text-xs text-muted-foreground mb-4 text-center md:text-sm max-w-md">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {!isLoading && !error && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle - Hidden on mobile */}
                  <div className="hidden md:flex items-center gap-2">
                    <ButtonGroup>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3x3 className="size-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                      >
                        <TableIcon className="size-4" />
                      </Button>
                    </ButtonGroup>
                  </div>
                  <Button variant="outline" size="sm" className="w-full md:w-auto">
                    Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          {categories.length > 0 && (
            <Card>
              <CardContent className="py-3 md:py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
                  {selectedCategoryId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCategory}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground w-full md:w-auto"
                    >
                      Limpar filtro
                    </Button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCategoryClick(category.id)}
                        className={
                          selectedCategoryId === category.id
                            ? ''
                            : 'hover:bg-accent'
                        }
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Products Grid or Table View */}
      {!isLoading && !error && viewMode === 'grid' && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const imageUrl = product.images?.[0]?.url
            return (
            <Card 
              key={product.id} 
              className={`relative overflow-hidden transition-all ${
                selectedProducts.has(product.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute left-2 top-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectProduct(product.id)
                  }}
                  className="flex items-center justify-center rounded-md bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
                >
                  {selectedProducts.has(product.id) ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-primary bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-background bg-background/90 backdrop-blur-sm">
                    </div>
                  )}
                </button>
              </div>

              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {imageUrl && !failedImages.has(product.id) ? (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover p-2 rounded-md"
                    onError={() => handleImageError(product.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="size-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute right-2 top-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="size-8 bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="size-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2 text-destructive"
                        onClick={() => handleDeleteClick(product.id, product.title)}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardHeader className="p-4 pb-3 md:p-6 md:pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base line-clamp-2 md:text-lg">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {product.category?.name || 'Sem categoria'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <span className="text-xl font-bold md:text-2xl">
                      R$ {formatPrice(product.price)}
                    </span>
                    <div className="flex flex-col  gap-2 md:flex-row md:items-center md:justify-between">
                      <Switch
                        checked={product.available ?? true}
                        onCheckedChange={() => {
                          handleToggleAvailability(product.id)
                        }}
                        disabled={toggleAvailabilityMutation.isPending}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                      />
                      <Badge 
                        variant={product.available ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {product.available ? "Disponível" : "Indisponível"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Package className="size-3 md:size-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Variações:{' '}
                      <span className="font-medium">
                        {product.variations?.length || 0}
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
          })}
        </div>
      )}

      {/* Products Table View */}
      {!isLoading && !error && viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center justify-center py-8 px-4">
                        <Package className="size-10 text-muted-foreground mb-4 md:size-12" />
                        <h3 className="text-base font-semibold mb-2 md:text-lg">
                          {searchQuery 
                            ? 'Nenhum produto encontrado' 
                            : 'Nenhum produto cadastrado'}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4 md:text-sm max-w-md">
                          {searchQuery 
                            ? 'Tente ajustar sua busca ou adicione novos produtos'
                            : 'Comece adicionando seus primeiros produtos à loja'}
                        </p>
                        <Button className="gap-2 w-full md:w-auto" onClick={() => handleDialogOpenChange(true)}>
                          <Plus className="size-4" />
                          <span className="hidden md:inline">Adicionar Produto</span>
                          <span className="md:hidden">Adicionar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Only show in grid mode */}
      {!isLoading && !error && filteredProducts.length === 0 && viewMode === 'grid' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
            <Package className="size-10 text-muted-foreground mb-4 md:size-12" />
            <h3 className="text-base font-semibold mb-2 text-center md:text-lg">
              {searchQuery 
                ? 'Nenhum produto encontrado' 
                : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 text-center md:text-sm max-w-md">
              {searchQuery 
                ? 'Tente ajustar sua busca ou adicione novos produtos'
                : 'Comece adicionando seus primeiros produtos à loja'}
            </p>
            <Button className="gap-2 w-full md:w-auto" onClick={() => handleDialogOpenChange(true)}>
              <Plus className="size-4" />
              <span className="hidden md:inline">Adicionar Produto</span>
              <span className="md:hidden">Adicionar</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Product Dialog */}
      {selectedStoreId && (
        <CreateProductDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          storeId={selectedStoreId}
        />
      )}

      {/* Edit Product Dialog */}
      {selectedStoreId && productToEdit && (
        <EditProductDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          storeId={selectedStoreId}
          product={productToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedProducts.size > 0 
                ? 'Excluir Produtos' 
                : 'Excluir Produto'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProducts.size > 0 ? (
                <>
                  Tem certeza que deseja excluir <strong>{selectedProducts.size} produtos</strong>?
                  Esta ação não pode ser desfeita.
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir o produto &quot;{productToDelete?.title}&quot;?
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProductMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteProductMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
