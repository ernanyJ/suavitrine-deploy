export type ThemeMode = 'LIGHT' | 'DARK';
export type RoundedLevel = 'NONE' | 'SMALL' | 'MEDIUM' | 'LARGE';
export type BackgroundType = 'NONE' | 'STRIPED' | 'DOT' | 'GRID' | 'FLICKERING_GRID' | 'LIGHT_RAYS';

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ProductImage {
  id: string;
  url: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  promotionalPrice?: number;
  showPromotionBadge?: boolean;
  description?: string;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithProducts {
  id: string | null;
  name: string;
  description?: string;
  imageUrl?: string;
  storeId: string;
  products: Product[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  address: Address;
  phoneNumber?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  primaryColor: string;
  themeMode: ThemeMode;
  primaryFont: string;
  secondaryFont: string;
  roundedLevel: RoundedLevel;
  productCardShadow: string;
  bannerDesktopUrl?: string;
  bannerTabletUrl?: string;
  bannerMobileUrl?: string;
  backgroundType?: BackgroundType;
  backgroundEnabled?: boolean;
  backgroundOpacity?: number;
  backgroundColor?: string;
  backgroundConfigJson?: string;
  categories: CategoryWithProducts[];
  createdAt: string;
  updatedAt: string;
}

