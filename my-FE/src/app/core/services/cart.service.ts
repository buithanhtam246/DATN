import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem, Cart } from '../models';
import { ICartOperations, IStatefulService } from '../interfaces/service.interface';

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

  public readonly cart = computed<Cart>(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 100000; // Phí ship cố định
    const discount = items.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
    const total = subtotal + shipping;

    return {
      items,
      subtotal,
      shipping,
      discount,
      total
    };
  });

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addToCart(productId: string, quantity: number = 1): void {
    // Interface implementation - use addItem() instead
  }

  /**
   * Thêm item vào giỏ hàng
   */
  addItem(item: CartItem): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      i => i.product.id === item.product.id && 
           i.selectedColor === item.selectedColor && 
           i.selectedSize === item.selectedSize
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += item.quantity;
      this.cartItems.set(updatedItems);
    } else {
      this.cartItems.set([...currentItems, item]);
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeFromCart(itemId: string): void {
    const currentItems = this.cartItems();
    const filteredItems = currentItems.filter(item => item.id !== itemId);
    this.cartItems.set(filteredItems);
  }

  /**
   * Cập nhật số lượng
   */
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const currentItems = this.cartItems();
    const itemIndex = currentItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex].quantity = quantity;
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
   * Lấy tổng giá trị giỏ hàng
   */
  getTotalPrice(): number {
    return this.cartItems().reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

}
