import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi, type UpdateThemeConfigRequest, type UpdateStoreRequest } from './stores';
import { productsApi, type CreateProductRequest, type UpdateProductRequest, type ProductResponse } from './products';
import { categoriesApi, type CreateCategoryRequest, type UpdateCategoryRequest } from './categories';
import { metricsApi } from './metrics';
import type { CreateStoreRequest } from './stores';

/**
 * Hook to get user stores
 */
export function useUserStores(userId: string | null) {
  return useQuery({
    queryKey: ['stores', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return storesApi.getUserStores(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to get a specific store
 */
export function useStore(storeId: string | null) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => {
      if (!storeId) throw new Error('Store ID is required');
      return storesApi.getStore(storeId);
    },
    enabled: !!storeId,
  });
}

/**
 * Hook to create a new store
 */
export function useCreateStore(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreRequest) => storesApi.createStore(data),
    onSuccess: () => {
      // Invalidate stores query to refetch the list
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['stores', userId] });
      }
    },
  });
}

/**
 * Hook to get products for a specific store
 */
export function useStoreProducts(storeId: string | null) {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: () => {
      if (!storeId) throw new Error('Store ID is required');
      return productsApi.getProductsByStore(storeId);
    },
    enabled: !!storeId,
  });
}

/**
 * Hook to get a specific product
 */
export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required');
      return productsApi.getProduct(productId);
    },
    enabled: !!productId,
  });
}

/**
 * Hook to create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.createProduct(data),
    onSuccess: (_, variables) => {
      // Invalidate products query for the store
      queryClient.invalidateQueries({ queryKey: ['products', variables.storeId] });
    },
  });
}

/**
 * Hook to update a product
 */
export function useUpdateProduct(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) =>
      productsApi.updateProduct(productId, data),
    onSuccess: () => {
      // Invalidate products query for the store
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['products', storeId] });
      }
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsApi.deleteProduct(productId),
    onSuccess: () => {
      // Invalidate products query for the store
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['products', storeId] });
      }
    },
  });
}

/**
 * Hook to toggle product availability
 */
export function useToggleProductAvailability(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsApi.toggleAvailability(productId),
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products', storeId] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<ProductResponse[]>(['products', storeId]);

      // Optimistically update the cache
      if (previousProducts && storeId) {
        queryClient.setQueryData<ProductResponse[]>(['products', storeId], (old) => {
          if (!old) return old;
          return old.map((product) =>
            product.id === productId
              ? { ...product, available: !product.available }
              : product
          );
        });
      }

      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (_err, _productId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts && storeId) {
        queryClient.setQueryData(['products', storeId], context.previousProducts);
      }
    },
    onSuccess: (updatedProduct) => {
      // Update the cache with the actual response from the server
      if (storeId) {
        queryClient.setQueryData<ProductResponse[]>(['products', storeId], (old) => {
          if (!old) return old;
          return old.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          );
        });
      }
    },
  });
}

/**
 * Hook to get categories for a specific store
 */
export function useStoreCategories(storeId: string | null) {
  return useQuery({
    queryKey: ['categories', storeId],
    queryFn: () => {
      if (!storeId) throw new Error('Store ID is required');
      return categoriesApi.getCategoriesByStore(storeId);
    },
    enabled: !!storeId,
  });
}

/**
 * Hook to update a store
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: UpdateStoreRequest }) =>
      storesApi.updateStore(storeId, data),
    onSuccess: (_, variables) => {
      // Invalidate store query
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
      // Also invalidate user stores to update the list
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * Hook to update theme configuration for a store
 */
export function useUpdateThemeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: UpdateThemeConfigRequest }) =>
      storesApi.updateThemeConfig(storeId, data),
    onSuccess: (_, variables) => {
      // Invalidate store query
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
    },
  });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.createCategory(data),
    onSuccess: () => {
      // Invalidate categories query
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      }
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryRequest }) =>
      categoriesApi.updateCategory(categoryId, data),
    onSuccess: () => {
      // Invalidate categories query
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      }
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesApi.deleteCategory(categoryId),
    onSuccess: () => {
      // Invalidate categories query
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      }
    },
  });
}

/**
 * Hook to get products for a specific category
 */
export function useCategoryProducts(categoryId: string | null) {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => {
      if (!categoryId) throw new Error('Category ID is required');
      return productsApi.getProductsByCategory(categoryId);
    },
    enabled: !!categoryId,
  });
}

/**
 * Hook to update products order for a category
 */
export function useUpdateProductsOrder(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, productIds }: { categoryId: string; productIds: string[] }) =>
      productsApi.updateProductsOrder(categoryId, productIds),
    onSuccess: (_, variables) => {
      // Invalidate products queries
      queryClient.invalidateQueries({ queryKey: ['products', 'category', variables.categoryId] });
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['products', storeId] });
      }
    },
  });
}

/**
 * Hook to get store metrics
 */
export function useStoreMetrics(storeId: string | null, days: number = 30) {
  return useQuery({
    queryKey: ['metrics', storeId, days],
    queryFn: () => {
      if (!storeId) throw new Error('Store ID is required');
      return metricsApi.getStoreMetrics(storeId, days);
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5, // 5 minutes - métricas não mudam tão rapidamente
  });
}

