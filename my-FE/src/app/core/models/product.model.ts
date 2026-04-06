export interface Product {
  id?: string;
  title: string;
  price: string;
  edition?: string;
  colors: string[];
  description?: string;
  imageUrl?: string;
<<<<<<< HEAD
  images?: string[]; // Mảng ảnh cho gallery
  brand?: string;
  category?: string;
  sizes?: number[];
  variants?: any[];
  minPrice?: number;
  minPriceSale?: number;
}
=======
  brand?: string;
  sizes?: number[];
}
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
