import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private getCartIdStorageKey(): string {
    const userId = localStorage.getItem('userId');
    return userId ? `cartId_${userId}` : 'cartId_guest';
  }

  private getLegacyCartId(): number | null {
    const legacy = localStorage.getItem('cartId');
    return legacy ? parseInt(legacy, 10) : null;
  }

  private readCartIdFromStorage(): number | null {
    const key = this.getCartIdStorageKey();
    const value = localStorage.getItem(key);
    if (value) return parseInt(value, 10);

    // migrate legacy key -> per-user key
    const userId = localStorage.getItem('userId');
    const legacy = this.getLegacyCartId();
    if (userId && legacy) {
      localStorage.setItem(key, legacy.toString());
      return legacy;
    }

    return null;
  }

  private cartId = new BehaviorSubject<number | null>(this.readCartIdFromStorage());
  public cartId$ = this.cartId.asObservable();

  private cartItems = new BehaviorSubject<any[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  constructor(private apiService: ApiService) {
    this.loadCart();
  }

  private ensureCartId$(): Observable<number> {
    const existing = this.cartId.value;
    if (existing) return of(existing);

    const userIdRaw = localStorage.getItem('userId');
    const userId = userIdRaw ? Number(userIdRaw) : 0;

    return this.apiService.createCart(userId).pipe(
      map((response: any) => {
        if (!response?.success || !response?.data?.cart_id) {
          throw new Error(response?.message || 'Không thể tạo/lấy giỏ hàng');
        }
        return Number(response.data.cart_id);
      }),
      tap((cartId) => this.setCartIdForCurrentUser(cartId))
    );
  }

  /** Key lưu cart items theo user để tránh dùng chung giữa nhiều tài khoản */
  getCartStorageKey(): string {
    const userId = localStorage.getItem('userId');
    return userId ? `cart_${userId}` : 'cart_guest';
  }

  /** Migrate legacy `cart` -> `cart_{userId}` nếu cần */
  private migrateLegacyCartItemsIfNeeded(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const newKey = this.getCartStorageKey();
    if (localStorage.getItem(newKey)) return;
    const legacy = localStorage.getItem('cart');
    if (legacy) {
      localStorage.setItem(newKey, legacy);
    }
  }

  getCartFromStorage(): any[] {
    this.migrateLegacyCartItemsIfNeeded();
    return JSON.parse(localStorage.getItem(this.getCartStorageKey()) || '[]');
  }

  setCartToStorage(items: any[]): void {
    localStorage.setItem(this.getCartStorageKey(), JSON.stringify(items));
  }

  /** Temporary storage for checkout-selected items (do not overwrite main cart) */
  private getTempCheckoutStorageKey(): string {
    const userId = localStorage.getItem('userId');
    return userId ? `checkout_${userId}` : 'checkout_guest';
  }

  setTempCheckoutItems(items: any[]): void {
    localStorage.setItem(this.getTempCheckoutStorageKey(), JSON.stringify(items));
  }

  getTempCheckoutItems(): any[] {
    return JSON.parse(localStorage.getItem(this.getTempCheckoutStorageKey()) || '[]');
  }

  clearTempCheckoutItems(): void {
    localStorage.removeItem(this.getTempCheckoutStorageKey());
  }

  /** Gọi khi user login/logout để service đọc đúng cart theo user hiện tại */
  refreshForCurrentUser(): void {
    const id = this.readCartIdFromStorage();
    this.cartId.next(id);
    this.getCart();
  }

  createCart(userId: number): Observable<number> {
    return this.apiService.createCart(userId).pipe(
      map((response: any) => {
        if (!response?.success || !response?.data?.cart_id) {
          throw new Error(response?.message || 'Không thể tạo giỏ hàng');
        }
        return Number(response.data.cart_id);
      }),
      tap((newCartId) => this.setCartIdForCurrentUser(newCartId))
    );
  }

  addToCart(variantId: number, quantity: number) {
    return this.ensureCartId$().pipe(
      switchMap((cartId) => this.apiService.addToCart(cartId, variantId, quantity)),
      tap(() => this.getCart())
    );
  }

  getCart() {
    const cartId = this.cartId.value;
    if (!cartId) return;
    return this.apiService.getCart(cartId).subscribe({
      next: (response: any) => {
        if (response.success) {
          const items = response.data.items || [];
          // Ensure all items have selected property and normalized image URL (default to true)
          const itemsWithSelection = items.map((item: any) => ({
            ...item,
            // Normalize image field to a full URL so browser won't try to resolve a bare filename
            image: normalizeImageUrl(item.image || item.product_image || ''),
            // Ensure color and size are present
            color: item.color || undefined,
            size: item.size || undefined,
            // Default selected to null (not selected) unless server explicitly marks selected === true
            selected: item.selected === true ? true : null
          }));
          this.cartItems.next(itemsWithSelection);
          // IMPORTANT: Also update storage when fetching from server
          this.setCartToStorage(itemsWithSelection);
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

  getCartId(): number | null {
    return this.cartId.value;
  }

  setCartIdForCurrentUser(cartId: number): void {
    const key = this.getCartIdStorageKey();
    localStorage.setItem(key, cartId.toString());
    this.cartId.next(cartId);
  }

  private loadCart() {
    this.migrateLegacyCartItemsIfNeeded();
    // Nếu đã login nhưng chưa có cartId theo user, gọi backend lấy/tạo
    if (localStorage.getItem('authToken') && !this.cartId.value) {
      const userIdRaw = localStorage.getItem('userId');
      const userId = userIdRaw ? Number(userIdRaw) : 0;
      this.createCart(userId).subscribe({
        next: () => this.getCart(),
        error: () => this.getCart()
      });
      return;
    }

    this.getCart();
  }
}

/**
 * Normalize backend-provided image path into a full URL the browser can load.
 * Handles absolute URLs, uploads/public paths, or bare filenames.
 */
function normalizeImageUrl(imagePath: any): string {
  if (!imagePath) return '/assets/placeholder.png';
  const s = String(imagePath);
  // Already absolute
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//')) return s;

  // If path contains uploads or public folder, prefix with assetsBaseUrl
  if (s.includes('/uploads/') || s.includes('/public/')) {
    return `${environment.assetsBaseUrl}${s.startsWith('/') ? '' : '/'}${s}`;
  }

  // If it's a simple filename (no slashes) assume stored under /public/images/products/
  if (!s.includes('/')) {
    return `${environment.assetsBaseUrl}/public/images/products/${s}`;
  }

  // Otherwise prefix with assetsBaseUrl
  return `${environment.assetsBaseUrl}${s.startsWith('/') ? '' : '/'}${s}`;
}
