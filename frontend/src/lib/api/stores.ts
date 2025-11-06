import { apiClient } from './axios-config';

export interface StoreUserResponse {
  id: string;
  storeId: string;
  storeName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'OWNER' | 'MANAGER' | 'EMPLOYEE';
  createdAt: string;
}

export interface CreateStoreRequest {
  name: string;
  slug: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  cnpj?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  slug?: string;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  logo?: BannerImageRequest;
}

export type ThemeMode = 'LIGHT' | 'DARK';
export type RoundedLevel = 'NONE' | 'SMALL' | 'MEDIUM' | 'LARGE';
export type BackgroundType = 'NONE' | 'STRIPED' | 'DOT' | 'GRID' | 'FLICKERING_GRID' | 'LIGHT_RAYS';
export type PayingPlan = 'FREE' | 'BASIC' | 'PRO';

export interface AddressResponse {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface StoreResponse {
  id: string;
  name: string;
  description?: string;
  slug: string;
  address?: AddressResponse;
  phoneNumber?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  logoUrl?: string;
  primaryColor?: string;
  themeMode?: ThemeMode;
  primaryFont?: string;
  secondaryFont?: string;
  roundedLevel?: RoundedLevel;
  productCardShadow?: string;
  bannerDesktopUrl?: string;
  bannerTabletUrl?: string;
  bannerMobileUrl?: string;
  backgroundType?: BackgroundType;
  backgroundEnabled?: boolean;
  backgroundOpacity?: number;
  backgroundColor?: string;
  backgroundConfigJson?: string;
  activePlan?: PayingPlan;
  createdAt: string;
  updatedAt: string;
}

export interface BannerImageRequest {
  base64Image: string;
  fileName: string;
  contentType: string;
}

export interface UpdateThemeConfigRequest {
  name?: string;
  slug?: string;
  description?: string;
  primaryColor?: string;
  themeMode?: ThemeMode;
  primaryFont?: string;
  secondaryFont?: string;
  roundedLevel?: RoundedLevel;
  productCardShadow?: string;
  logo?: BannerImageRequest;
  bannerDesktop?: BannerImageRequest;
  bannerTablet?: BannerImageRequest;
  bannerMobile?: BannerImageRequest;
  backgroundType?: BackgroundType;
  backgroundEnabled?: boolean;
  backgroundOpacity?: number;
  backgroundColor?: string;
  backgroundConfigJson?: string;
}

export const storesApi = {
  /**
   * Get all stores for a specific user
   */
  async getUserStores(userId: string): Promise<StoreUserResponse[]> {
    const response = await apiClient.get<StoreUserResponse[]>(
      `/api/v1/stores/user/${userId}`
    );
    return response.data;
  },

  /**
   * Get a specific store by ID
   */
  async getStore(storeId: string): Promise<StoreResponse> {
    const response = await apiClient.get<StoreResponse>(
      `/api/v1/stores/${storeId}`
    );
    return response.data;
  },

  /**
   * Create a new store
   */
  async createStore(data: CreateStoreRequest): Promise<StoreResponse> {
    const response = await apiClient.post<StoreResponse>(
      '/api/v1/stores',
      data
    );
    return response.data;
  },

  /**
   * Update a store
   */
  async updateStore(
    storeId: string,
    data: UpdateStoreRequest
  ): Promise<StoreResponse> {
    const response = await apiClient.put<StoreResponse>(
      `/api/v1/stores/${storeId}`,
      data
    );
    return response.data;
  },

  /**
   * Update theme configuration for a store
   */
  async updateThemeConfig(
    storeId: string,
    data: UpdateThemeConfigRequest
  ): Promise<StoreResponse> {
    const response = await apiClient.put<StoreResponse>(
      `/api/v1/stores/${storeId}/theme`,
      data
    );
    return response.data;
  },
};

