import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartId = new BehaviorSubject<number | null>(localStorage.getItem('cartId') ? parseInt(localStorage.getItem('cartId')!) : null);
  public cartId$ = this.cartId.asObservable();

  private cartItems = new BehaviorSubject<any[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  constructor(private apiService: ApiService) {
    this.loadCart();
  }

  createCart(userId: number) {
    this.apiService.createCart(userId).subscribe({
      next: (response: any) => {
        if (response.success) {
          const newCartId = response.data.cart_id;
          localStorage.setItem('cartId', newCartId.toString());
          this.cartId.next(newCartId);
        }
      }
    });
  }

  addToCart(variantId: number, quantity: number) {
    const cartId = this.cartId.value;
    if (!cartId) {
      console.error('Cart ID not found');
      return;
    }
    return this.apiService.addToCart(cartId, variantId, quantity);
  }

  getCart() {
    const cartId = this.cartId.value;
    if (!cartId) return;
    return this.apiService.getCart(cartId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cartItems.next(response.data.items || []);
        }
      }
    });
  }

  updateCartItem(itemId: number, quantity: number) {
    return this.apiService.updateCartItem(itemId, quantity);
  }

  removeFromCart(itemId: number) {
    return this.apiService.removeFromCart(itemId);
  }

  clearCart() {
    const cartId = this.cartId.value;
    if (!cartId) return;
    return this.apiService.clearCart(cartId);
  }

  getCartTotal() {
    const cartId = this.cartId.value;
    if (!cartId) return;
    return this.apiService.getCartTotal(cartId);
  }

  private loadCart() {
    this.getCart();
  }
}
