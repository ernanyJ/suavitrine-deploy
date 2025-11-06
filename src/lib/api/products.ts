import { apiClient } from './axios-config';

export interface ProductImageResponse {
  id: string;
  url: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariationResponse {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: string;
  title: string;
  price: number;
  promotionalPrice?: number;
  showPromotionBadge?: boolean;
  description?: string;
  storeId: string;
  category: CategoryResponse;
  available?: boolean;
  images: ProductImageResponse[];
  variations: ProductVariationResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageRequest {
  base64Image: string;
  fileName: string;
  contentType: string;
  displayOrder?: number;
}

export interface CreateProductRequest {
  title: string;
  price: number;
  promotionalPrice?: number;
  showPromotionBadge?: boolean;
  description?: string;
  storeId: string;
  categoryId: string;
  available?: boolean;
  images?: ProductImageRequest[];
  variations?: ProductVariationRequest[];
}

export interface UpdateProductRequest {
  title?: string;
  price?: number;
  promotionalPrice?: number;
  showPromotionBadge?: boolean;
  description?: string;
  categoryId?: string;
  available?: boolean;
  images?: ProductImageRequest[];
  variations?: ProductVariationRequest[];
}

export interface ProductVariationRequest {
  title: string;
  imageUrl: string;
}

export const productsApi = {
  /**
   * Get all products for a specific store
   */
  async getProductsByStore(storeId: string): Promise<ProductResponse[]> {
    const response = await apiClient.get<ProductResponse[]>(
      `/api/v1/products/store/${storeId}`
    );
    return response.data;
  },

  /**
   * Get all products for a specific category
   */
  async getProductsByCategory(categoryId: string): Promise<ProductResponse[]> {
    const response = await apiClient.get<ProductResponse[]>(
      `/api/v1/products/category/${categoryId}`
    );
    return response.data;
  },

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(
      `/api/v1/products/${productId}`
    );
    return response.data;
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    const response = await apiClient.post<ProductResponse>(
      '/api/v1/products',
      data
    );
    return response.data;
  },

  /**
   * Update a product
   */
  async updateProduct(
    productId: string,
    data: UpdateProductRequest
  ): Promise<ProductResponse> {
    const response = await apiClient.put<ProductResponse>(
      `/api/v1/products/${productId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/api/v1/products/${productId}`);
  },

  /**
   * Update products order for a category
   */
  async updateProductsOrder(categoryId: string, productIds: string[]): Promise<void> {
    await apiClient.put(`/api/v1/products/category/${categoryId}/order`, productIds);
  },

  /**
   * Toggle product availability
   */
  async toggleAvailability(productId: string): Promise<ProductResponse> {
    const response = await apiClient.patch<ProductResponse>(
      `/api/v1/products/${productId}/toggle-availability`
    );
    return response.data;
  },
};

