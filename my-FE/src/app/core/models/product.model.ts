/**
 * Product-related interfaces
 * Mapping database tables: products, variant, categories, brand, color, size
 */

export interface Category {
  id: number;
  name: string;
  status?: number;
}

export interface Brand {
  id: number;
  name: string;
  status?: number;
}

export interface Color {
  id: number;
  tableColor: string; // maps to table_color in DB
  name?: string;
}

export interface Size {
  id: number;
  bangSize: string; // maps to bang_size in DB
}

export interface Variant {
  id: number;
  productId: number;
  colorId: number;
  sizeId: number;
  price: number;
  priceSale?: number;
  quantity: number;
  image?: string;
  color?: Color;
  size?: Size;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  description?: string;
  images?: string[];
  material?: string;
  dateAdd?: string;
  categoryId?: number;
  brandId?: number;
  category?: Category;
  brand?: Brand;
  variants: Variant[];
  // Computed fields for display
  minPrice?: number;
  minPriceSale?: number;
  colors?: string[];
}

export interface FilterOptions {
  categories: Category[];
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  priceRange: { min: number; max: number };
}

export interface ActiveFilters {
  categoryIds: number[];
  brandIds: number[];
  colorIds: number[];
  sizeIds: number[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
