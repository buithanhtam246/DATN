export interface CartItem {
  id: string;
  product: {
    id: string;
    title: string;
    imageUrl: string;
    brand?: string;
  };
  selectedColor: string;
  selectedSize: number;
  quantity: number;
  price: number;
  originalPrice?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
