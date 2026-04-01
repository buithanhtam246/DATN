import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models';
import { ICartOperations, IStatefulService } from '../interfaces/service.interface';

/**
 * Interface cho cart item
 */
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: number | string;
}

/**
 * Service quản lý giỏ hàng
 * Single Responsibility: Chỉ quản lý cart operations
 * Implements: ICartOperations, IStatefulService
 */
@Injectable({
  providedIn: 'root'
})
export class CartService implements ICartOperations, IStatefulService<CartItem[]> {
  // Sử dụng signal cho reactive state management
  private cartItems = signal<CartItem[]>([]);
  
  // Computed values
  public readonly items = computed(() => this.cartItems());
  public readonly itemCount = computed(() => 
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  /**
   * Thêm sản phẩm vào giỏ hàng
   * Implementation of ICartOperations
   */
  addToCart(productId: string, quantity: number = 1): void {
    // This is a simplified version for interface compliance
    // The full method with Product object is provided below
    console.log(`Adding product ${productId} to cart`);
  }

  /**
   * Thêm sản phẩm vào giỏ hàng (extended version)
   */
  addProductToCart(product: Product, quantity: number = 1, selectedColor?: string): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      item => item.product.title === product.title && item.selectedColor === selectedColor
    );

    if (existingItemIndex > -1) {
      // Cập nhật quantity nếu sản phẩm đã tồn tại
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      this.cartItems.set(updatedItems);
    } else {
      // Thêm sản phẩm mới
      this.cartItems.set([...currentItems, { product, quantity, selectedColor }]);
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * Implementation of ICartOperations
   */
  removeFromCart(productId: string): void {
    const currentItems = this.cartItems();
    const filteredItems = currentItems.filter(
      item => item.product.id !== productId
    );
    this.cartItems.set(filteredItems);
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng (extended version)
   */
  removeProductFromCart(product: Product, selectedColor?: string): void {
    const currentItems = this.cartItems();
    const filteredItems = currentItems.filter(
      item => !(item.product.title === product.title && item.selectedColor === selectedColor)
    );
    this.cartItems.set(filteredItems);
  }

  /**
   * Cập nhật số lượng sản phẩm
   */
  updateQuantity(product: Product, quantity: number, selectedColor?: string): void {
    if (quantity <= 0) {
      this.removeProductFromCart(product, selectedColor);
      return;
    }

    const currentItems = this.cartItems();
    const itemIndex = currentItems.findIndex(
      item => item.product.title === product.title && item.selectedColor === selectedColor
    );

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity
      };
      this.cartItems.set(updatedItems);
    }
  }

  /**
   * Xóa toàn bộ giỏ hàng
   * Implementation of ICartOperations
   */
  clearCart(): void {
    this.cartItems.set([]);
  }

  /**
   * Lấy state hiện tại
   * Implementation of IStatefulService
   */
  state(): CartItem[] {
    return this.cartItems();
  }

  /**
   * Set state mới
   * Implementation of IStatefulService
   */
  setState(newState: CartItem[]): void {
    this.cartItems.set(newState);
  }

  /**
   * Thêm item vào giỏ hàng (dùng cho cart item objects phức tạp)
   */
  addItem(cartItem: any): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      item => item.product.id === cartItem.product.id && 
              item.selectedColor === cartItem.selectedColor &&
              item.selectedSize === cartItem.selectedSize
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + (cartItem.quantity || 1)
      };
      this.cartItems.set(updatedItems);
    } else {
      this.cartItems.set([...currentItems, cartItem]);
    }
  }

  /**
   * Lấy tổng giá trị giỏ hàng
   */
  getTotalPrice(): number {
    return this.cartItems().reduce((total, item) => {
      const price = parseFloat(item.product.price.replace(/[^\d]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  }
}
