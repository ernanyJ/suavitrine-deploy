import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

export const Route = createFileRoute('/_app/categorias')({
  component: CategoriasPage,
})

function CategoriasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryResponse | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  const handleImageError = (categoryId: string) => {
    setFailedImages(prev => new Set(prev).add(categoryId))
  }
  
  // Get selected store ID from context
  const { selectedStoreId } = useSelectedStore()
  
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

    try {
      // If multiple categories are selected, delete them all
      if (selectedCategories.size > 0) {
        await handleDeleteMultiple()
        setDeleteDialogOpen(false)
      } else if (categoryToDelete) {
        // Otherwise, delete the single category
        await deleteCategoryMutation.mutateAsync(categoryToDelete.id)
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      }
    } catch (error) {
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

    try {
      // Delete all selected categories
      await Promise.all(
        Array.from(selectedCategories).map(categoryId => 
          deleteCategoryMutation.mutateAsync(categoryId)
        )
      )
      setSelectedCategories(new Set())
      setDeleteDialogOpen(false)
    } catch (error) {
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
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias dos seus produtos
          </p>
        </div>
        {selectedCategories.size === 0 ? (
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Adicionar Categoria
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedCategories.size} {selectedCategories.size === 1 ? 'item selecionado' : 'itens selecionados'}
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
                setCategoryToDelete({ id: '', name: `${selectedCategories.size} categorias` })
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="size-4" />
              Excluir ({selectedCategories.size})
            </Button>
          </div>
        )}
      </div>

      {/* Loading State - Skeleton Table */}
      {isLoading && (
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
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar categorias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table View */}
      {!isLoading && !error && (
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
                        <Tag className="size-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchQuery 
                            ? 'Nenhuma categoria encontrada' 
                            : 'Nenhuma categoria cadastrada'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchQuery 
                            ? 'Tente ajustar sua busca ou adicione novas categorias'
                            : 'Comece adicionando suas primeiras categorias'}
                        </p>
                        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
                          <Plus className="size-4" />
                          Adicionar Categoria
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

      {/* Create Category Dialog */}
      {selectedStoreId && (
        <CreateCategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
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

