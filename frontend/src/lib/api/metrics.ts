import { apiClient } from './axios-config';

export interface DailyMetrics {
  date: string;
  accesses: number;
  productClicks: number;
  productConversions: number;
  categoryClicks: number;
  categoryAccesses: number;
}

export interface ProductMetrics {
  productId: string;
  productTitle: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

export interface CategoryMetrics {
  categoryId: string;
  categoryName: string;
  clicks: number;
  accesses: number;
}

export interface StoreMetricsResponse {
  storeId: string;
  storeName: string;
  startDate: string;
  endDate: string;
  totalAccesses: number;
  totalProductClicks: number;
  totalProductConversions: number;
  totalCategoryClicks: number;
  totalCategoryAccesses: number;
  dailyMetrics: DailyMetrics[];
  topProductsByClicks: ProductMetrics[];
  topProductsByConversions: ProductMetrics[];
  topCategoriesByClicks: CategoryMetrics[];
  topCategoriesByAccesses: CategoryMetrics[];
}

export interface StoreEventRequest {
  eventType: 'STORE_ACCESS' | 'PRODUCT_CLICK' | 'PRODUCT_CONVERSION' | 'CATEGORY_CLICK' | 'CATEGORY_ACCESS';
  entityId?: string;
  entityType?: 'STORE' | 'PRODUCT' | 'CATEGORY';
  metadata?: string;
}

export const metricsApi = {
  /**
   * Get store metrics for a specific period
   */
  async getStoreMetrics(storeId: string, days: number = 30): Promise<StoreMetricsResponse> {
    const response = await apiClient.get<StoreMetricsResponse>(
      `/api/v1/metrics/store/${storeId}?days=${days}`
    );
    return response.data;
  },

  /**
   * Get daily metrics (last 30 days)
   */
  async getDailyMetrics(storeId: string): Promise<StoreMetricsResponse> {
    const response = await apiClient.get<StoreMetricsResponse>(
      `/api/v1/metrics/store/${storeId}/daily`
    );
    return response.data;
  },

  /**
   * Create a generic metric event
   */
  async createEvent(data: StoreEventRequest): Promise<void> {
    await apiClient.post(`/api/v1/metrics/events`, data);
  },

  /**
   * Record store access
   */
  async recordStoreAccess(): Promise<void> {
    await apiClient.post(`/api/v1/metrics/events/store-access`);
  },

  /**
   * Record product click
   */
  async recordProductClick(productId: string): Promise<void> {
    await apiClient.post(`/api/v1/metrics/events/product-click/${productId}`);
  },

  /**
   * Record product conversion
   */
  async recordProductConversion(productId: string, conversionData?: string): Promise<void> {
    await apiClient.post(`/api/v1/metrics/events/product-conversion/${productId}`, conversionData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * Record category click
   */
  async recordCategoryClick(categoryId: string): Promise<void> {
    await apiClient.post(`/api/v1/metrics/events/category-click/${categoryId}`);
  },

  /**
   * Record category access
   */
  async recordCategoryAccess(categoryId: string): Promise<void> {
    await apiClient.post(`/api/v1/metrics/events/category-access/${categoryId}`);
  },
};

