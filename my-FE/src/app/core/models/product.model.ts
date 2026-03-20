export interface Product {
  id?: string;
  title: string;
  price: string;
  edition?: string;
  colors: string[];
  description?: string;
  imageUrl?: string;
  images?: string[]; // Mảng ảnh cho gallery
  brand?: string;
  category?: string;
  sizes?: number[];
  variants?: any[];
  minPrice?: number;
  minPriceSale?: number;
}
