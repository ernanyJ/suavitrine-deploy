import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/_app/produtos')({
  component: ProdutosPage,
})

type ViewMode = 'grid' | 'table'

function ProdutosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  
  // Load view mode preference from localStorage
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('productsViewMode')
    return (saved === 'grid' || saved === 'table') ? saved : 'grid'
  })
  
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

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
  }
  
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()
  
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

    try {
      // If multiple products are selected, delete them all
      if (selectedProducts.size > 0) {
        await handleDeleteMultiple()
        setDeleteDialogOpen(false)
      } else if (productToDelete) {
        // Otherwise, delete the single product
        await deleteProductMutation.mutateAsync(productToDelete.id)
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      }
    } catch (error) {
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

    try {
      // Delete all selected products
      await Promise.all(
        Array.from(selectedProducts).map(productId => 
          deleteProductMutation.mutateAsync(productId)
        )
      )
      setSelectedProducts(new Set())
      setDeleteDialogOpen(false)
    } catch (error) {
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
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos da sua loja
          </p>
        </div>
        {selectedProducts.size === 0 ? (
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Adicionar Produto
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedProducts.size} {selectedProducts.size === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
            >
              <X className="size-4" />
              Limpar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setProductToDelete({ id: '', title: `${selectedProducts.size} produtos` })
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="size-4" />
              Excluir ({selectedProducts.size})
            </Button>
          </div>
        )}
      </div>

      {/* Loading State - Skeleton Grid */}
      {isLoading && viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="size-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Erro ao carregar produtos
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {!isLoading && !error && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
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
                  <Button variant="outline">Filtros</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          {categories.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {selectedCategoryId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCategory}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-background"
                    >
                      Limpar filtro
                    </Button>
                  )}
                  <ButtonGroup>
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
                  </ButtonGroup>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Products Grid or Table View */}
      {!isLoading && !error && viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const imageUrl = product.images?.[0]?.url
            return (
            <Card 
              key={product.id} 
              className={`overflow-hidden transition-all ${
                selectedProducts.has(product.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute left-2 top-2 z-10">
                <button
                  onClick={() => handleSelectProduct(product.id)}
                  className="flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm"
                >
                  {selectedProducts.has(product.id) ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded border bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded border bg-background/80 backdrop-blur-sm">
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
                    className="h-full w-full object-cover"
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
                      <Button variant="secondary" size="icon" className="size-8">
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

              <CardHeader className="pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {product.category?.name || 'Sem categoria'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      R$ {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.available ?? true}
                        onCheckedChange={() => {
                          handleToggleAvailability(product.id)
                        }}
                        disabled={toggleAvailabilityMutation.isPending}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge variant={product.available ? "default" : "secondary"}>
                        {product.available ? "Disponível" : "Indisponível"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="size-4 text-muted-foreground" />
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
                      <div className="flex flex-col items-center justify-center py-8">
                        <Package className="size-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchQuery 
                            ? 'Nenhum produto encontrado' 
                            : 'Nenhum produto cadastrado'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchQuery 
                            ? 'Tente ajustar sua busca ou adicione novos produtos'
                            : 'Comece adicionando seus primeiros produtos à loja'}
                        </p>
                        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
                          <Plus className="size-4" />
                          Adicionar Produto
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
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery 
                ? 'Nenhum produto encontrado' 
                : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? 'Tente ajustar sua busca ou adicione novos produtos'
                : 'Comece adicionando seus primeiros produtos à loja'}
            </p>
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              Adicionar Produto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Product Dialog */}
      {selectedStoreId && (
        <CreateProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
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
