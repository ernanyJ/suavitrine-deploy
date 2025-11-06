import { apiClient } from './axios-config';

export interface CategoryImageRequest {
  base64Image: string;
  fileName: string;
  contentType: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  storeId: string;
  image?: CategoryImageRequest;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image?: CategoryImageRequest;
}

export const categoriesApi = {
  /**
   * Get all categories for a specific store
   */
  async getCategoriesByStore(storeId: string): Promise<CategoryResponse[]> {
    const response = await apiClient.get<CategoryResponse[]>(
      `/api/v1/categories/store/${storeId}`
    );
    return response.data;
  },

  /**
   * Get a specific category by ID
   */
  async getCategory(categoryId: string): Promise<CategoryResponse> {
    const response = await apiClient.get<CategoryResponse>(
      `/api/v1/categories/${categoryId}`
    );
    return response.data;
  },

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    const response = await apiClient.post<CategoryResponse>(
      '/api/v1/categories',
      data
    );
    return response.data;
  },

  /**
   * Update a category
   */
  async updateCategory(
    categoryId: string,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse> {
    const response = await apiClient.put<CategoryResponse>(
      `/api/v1/categories/${categoryId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`/api/v1/categories/${categoryId}`);
  },
};

