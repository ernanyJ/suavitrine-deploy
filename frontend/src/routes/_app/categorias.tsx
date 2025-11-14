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
  Tag,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Search,
  Check,
  X,
  Grid3x3,
  Table as TableIcon,
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
import { 
  useStoreCategories, 
  useDeleteCategory 
} from '@/lib/api/queries'
import { useSelectedStore } from '@/contexts/store-context'
import { CreateCategoryDialog } from '@/components/create-category-dialog'
import { EditCategoryDialog } from '@/components/edit-category-dialog'
import type { CategoryResponse } from '@/lib/api/categories'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/_app/categorias')({
  component: CategoriasPage,
})

type ViewMode = 'grid' | 'table'

function CategoriasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Load view mode preference from localStorage
  // Force grid mode on mobile devices
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Check if we're on mobile
    const isMobile = window.innerWidth < 768
    if (isMobile) return 'grid'
    
    const saved = localStorage.getItem('categoriesViewMode')
    return (saved === 'grid' || saved === 'table') ? saved : 'table'
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
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryResponse | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [isDesktop, setIsDesktop] = useState(false)

  // Detect desktop on mount and resize
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (isDesktop) {
      localStorage.setItem('categoriesViewMode', viewMode)
    }
  }, [viewMode, isDesktop])

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

  const handleImageError = (categoryId: string) => {
    setFailedImages(prev => new Set(prev).add(categoryId))
  }
  
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()
  
  // Query client for optimistic updates
  const queryClient = useQueryClient()
  
  // Fetch categories for the selected store
  const { data: categories = [], isLoading, error } = useStoreCategories(selectedStoreId)
  
  // Delete category mutation
  const deleteCategoryMutation = useDeleteCategory(selectedStoreId)

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete && selectedCategories.size === 0) return

    // If multiple categories are selected, delete them all
    if (selectedCategories.size > 0) {
      await handleDeleteMultiple()
      return
    }
    
    // Otherwise, delete the single category with optimistic update
    if (!categoryToDelete) return

    const categoryId = categoryToDelete.id
    
    // Close dialog immediately
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)

    // Get current categories from cache
    const queryKey = ['categories', selectedStoreId]
    const previousCategories = queryClient.getQueryData<CategoryResponse[]>(queryKey)

    try {
      // Optimistically remove the category from UI
      queryClient.setQueryData<CategoryResponse[]>(queryKey, (old) => {
        return old?.filter(c => c.id !== categoryId) ?? []
      })

      // Execute the actual deletion
      await deleteCategoryMutation.mutateAsync(categoryId)
      
      // Show success toast
      toast.success('Categoria excluída com sucesso')
    } catch (error) {
      // Revert the optimistic update on error
      if (previousCategories) {
        queryClient.setQueryData(queryKey, previousCategories)
      }
      
      // Show error toast
      toast.error('Erro ao excluir categoria', {
        description: 'Não foi possível excluir a categoria. Tente novamente.',
      })
      
      console.error('Error deleting category:', error)
    }
  }

  const handleEditClick = (category: CategoryResponse) => {
    setCategoryToEdit(category)
    setEditDialogOpen(true)
  }

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!categories) return []
    
    let filtered = categories
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [categories, searchQuery])

  // Selection handlers
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(filteredCategories.map(c => c.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedCategories(new Set())
  }

  const handleDeleteMultiple = async () => {
    if (selectedCategories.size === 0) return

    const categoryIds = Array.from(selectedCategories)
    
    // Close dialog immediately
    setDeleteDialogOpen(false)
    setSelectedCategories(new Set())

    // Get current categories from cache
    const queryKey = ['categories', selectedStoreId]
    const previousCategories = queryClient.getQueryData<CategoryResponse[]>(queryKey)

    try {
      // Optimistically remove the categories from UI
      queryClient.setQueryData<CategoryResponse[]>(queryKey, (old) => {
        return old?.filter(c => !categoryIds.includes(c.id)) ?? []
      })

      // Delete all selected categories
      await Promise.all(
        categoryIds.map(categoryId => 
          deleteCategoryMutation.mutateAsync(categoryId)
        )
      )
      
      // Show success toast
      toast.success(`${categoryIds.length} ${categoryIds.length === 1 ? 'categoria excluída' : 'categorias excluídas'} com sucesso`)
    } catch (error) {
      // Revert the optimistic update on error
      if (previousCategories) {
        queryClient.setQueryData(queryKey, previousCategories)
      }
      
      // Show error toast
      toast.error('Erro ao excluir categorias', {
        description: 'Não foi possível excluir as categorias. Tente novamente.',
      })
      
      console.error('Error deleting categories:', error)
    }
  }

  // Table columns definition
  const columns = useMemo<ColumnDef<CategoryResponse>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <button
            onClick={handleSelectAll}
            className="flex items-center justify-center"
          >
            {selectedCategories.size === filteredCategories.length && filteredCategories.length > 0 ? (
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
            onClick={() => handleSelectCategory(row.original.id)}
            className="flex items-center justify-center"
          >
            {selectedCategories.has(row.original.id) ? (
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
        accessorKey: 'name',
        header: 'Categoria',
        cell: ({ row }) => {
          const imageUrl = row.original.imageUrl
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                {imageUrl && !failedImages.has(row.original.id) ? (
                  <img
                    src={imageUrl}
                    alt={row.original.name}
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
                <div className="font-medium">{row.original.name}</div>
                {row.original.description && (
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {row.original.description}
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Criada em',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString('pt-BR')}
            </div>
          )
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Atualizada em',
        cell: ({ row }) => {
          const date = new Date(row.original.updatedAt)
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString('pt-BR')}
            </div>
          )
        },
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
                onClick={() => handleDeleteClick(row.original.id, row.original.name)}
                disabled={deleteCategoryMutation.isPending}
              >
                <Trash2 className="size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deleteCategoryMutation.isPending, failedImages, selectedCategories, filteredCategories.length]
  )

  const table = useReactTable({
    data: filteredCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-4 p-4 pt-16 md:pt-6 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Categorias</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Gerencie as categorias dos seus produtos
          </p>
        </div>
        {selectedCategories.size === 0 ? (
          <Button 
            className="gap-2 w-full md:w-auto open-category-btn" 
            onClick={() => handleDialogOpenChange(true)}
          >
            <Plus className="size-4" />
            <span className="hidden md:inline">Adicionar Categoria</span>
            <span className="md:hidden">Adicionar</span>
          </Button>
        ) : (
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <span className="text-sm text-muted-foreground text-center md:text-left">
              {selectedCategories.size} {selectedCategories.size === 1 ? 'item selecionado' : 'itens selecionados'}
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
                  setCategoryToDelete({ id: '', name: `${selectedCategories.size} categorias` })
                  setDeleteDialogOpen(true)
                }}
                className="flex-1 md:flex-initial"
              >
                <Trash2 className="size-4" />
                <span className="hidden md:inline">Excluir ({selectedCategories.size})</span>
                <span className="md:hidden">Excluir</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State - Skeleton Grid or Table */}
      {isLoading && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
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
        </>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Tag className="size-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Erro ao carregar categorias
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {!isLoading && !error && (
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar categorias..."
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid View */}
      {!isLoading && !error && viewMode === 'grid' && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => {
            const imageUrl = category.imageUrl
            return (
              <Card 
                key={category.id} 
                className={`relative overflow-hidden transition-all ${
                  selectedCategories.has(category.id) ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute left-2 top-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectCategory(category.id)
                    }}
                    className="flex items-center justify-center rounded-md bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
                  >
                    {selectedCategories.has(category.id) ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-primary bg-primary text-primary-foreground">
                        <Check className="size-4" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-background bg-background/90 backdrop-blur-sm">
                      </div>
                    )}
                  </button>
                </div>

                {/* Category Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  {imageUrl && !failedImages.has(category.id) ? (
                    <img
                      src={imageUrl}
                      alt={category.name}
                      className="h-full w-full object-cover p-2 rounded-md"
                      onError={() => handleImageError(category.id)}
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
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => handleDeleteClick(category.id, category.name)}
                          disabled={deleteCategoryMutation.isPending}
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
                    <CardTitle className="text-base line-clamp-2 md:text-lg">
                      {category.name}
                    </CardTitle>
                    {category.description && (
                      <CardDescription className="text-xs md:text-sm line-clamp-2">
                        {category.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    <div>
                      Criada em: {new Date(category.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      Atualizada em: {new Date(category.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Categories Table View */}
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
                        <Tag className="size-10 text-muted-foreground mb-4 md:size-12" />
                        <h3 className="text-base font-semibold mb-2 md:text-lg">
                          {searchQuery 
                            ? 'Nenhuma categoria encontrada' 
                            : 'Nenhuma categoria cadastrada'}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4 md:text-sm max-w-md">
                          {searchQuery 
                            ? 'Tente ajustar sua busca ou adicione novas categorias'
                            : 'Comece adicionando suas primeiras categorias'}
                        </p>
                        <Button className="gap-2 w-full md:w-auto open-category-btn" onClick={() => handleDialogOpenChange(true)}>
                          <Plus className="size-4" />
                          <span className="hidden md:inline">Adicionar Categoria</span>
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
      {!isLoading && !error && filteredCategories.length === 0 && viewMode === 'grid' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
            <Tag className="size-10 text-muted-foreground mb-4 md:size-12" />
            <h3 className="text-base font-semibold mb-2 text-center md:text-lg">
              {searchQuery 
                ? 'Nenhuma categoria encontrada' 
                : 'Nenhuma categoria cadastrada'}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 text-center md:text-sm max-w-md">
              {searchQuery 
                ? 'Tente ajustar sua busca ou adicione novas categorias'
                : 'Comece adicionando suas primeiras categorias'}
            </p>
            <Button className="gap-2 w-full md:w-auto" onClick={() => handleDialogOpenChange(true)}>
              <Plus className="size-4" />
              <span className="hidden md:inline">Adicionar Categoria</span>
              <span className="md:hidden">Adicionar</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Category Dialog */}
      {selectedStoreId && (
        <CreateCategoryDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          storeId={selectedStoreId}
        />
      )}

      {/* Edit Category Dialog */}
      {selectedStoreId && categoryToEdit && (
        <EditCategoryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          storeId={selectedStoreId}
          category={categoryToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCategories.size > 0 
                ? 'Excluir Categorias' 
                : 'Excluir Categoria'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategories.size > 0 ? (
                <>
                  Tem certeza que deseja excluir <strong>{selectedCategories.size} categorias</strong>?
                  Esta ação não pode ser desfeita.
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir a categoria &quot;{categoryToDelete?.name}&quot;?
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteCategoryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategoryMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

