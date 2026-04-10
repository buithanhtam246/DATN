import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

interface CartItem {
  id?: number;
  name: string;
  price: number;
  priceSale?: number;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
  variant_id?: number;
  selected?: boolean | null; // Thêm field để track chọn/không chọn (null = not selected)
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  cart = signal<CartItem[]>([]);
  
  // Lưu thông tin tồn kho từ backend
  inventory = signal<Map<number, number>>(new Map());
  
  subtotal = computed(() => {
    return this.cart().reduce((sum, item) => {
      const displayPrice = item.priceSale || item.price;
      return sum + displayPrice * item.quantity;
    }, 0);
  });

  shipping = signal(100000);
  
  total = computed(() => {
    return this.subtotal();
  });

  ngOnInit() {
    // Initialize cart from storage and mark all items as selected by default
    const storedCart = this.cartService.getCartFromStorage();
    const normalizedCart = this.normalizeCartItems(storedCart);
    this.cart.set(normalizedCart);
    
    // Listen to cart updates from CartService
    this.cartService.cartItems$.subscribe((items: any[]) => {
      if (Array.isArray(items) && items.length > 0) {
        const normalizedItems = this.normalizeCartItems(items);
        this.cart.set(normalizedItems);
      }
    });
    
    // Lấy tồn kho cho tất cả sản phẩm trong giỏ
    this.loadInventory();
  }

  /**
   * Normalize cart items từ backend để đảm bảo tất cả fields có giá trị đúng
   */
  private normalizeCartItems(items: any[]): CartItem[] {
    return items.map(item => ({
      id: item.id,
      name: item.product_name || item.name || 'Sản phẩm',
      price: Number(item.original_price || item.price || 0),
      priceSale: item.priceSale ? Number(item.priceSale) : undefined,
      image: item.image || item.product_image || '/assets/placeholder.png',
      color: item.color || undefined,
      size: item.size || undefined,
      quantity: Number(item.quantity || 0),
      variant_id: item.variant_id || item.variantId,
      // Default to null (not selected) unless item.selected === true
      selected: item.selected === true ? true : null
    }));
  }

  private loadInventory() {
    // Lấy danh sách variant_id từ cart
    const variantIds = this.cart()
      .filter(item => item.variant_id)
      .map(item => Number(item.variant_id));

    if (variantIds.length === 0) return;

    this.apiService.getVariantsInventory(Array.from(new Set(variantIds))).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const inv = new Map<number, number>();
          response.data.forEach((item: any) => {
            inv.set(Number(item.variant_id), Number(item.quantity || 0));
          });
          this.inventory.set(inv);
          // After inventory loaded, auto-deselect out-of-stock items so user cannot checkout them
          this.deselectOutOfStockItems(inv);
        }
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
      }
    });
  }

  private deselectOutOfStockItems(inv: Map<number, number>) {
    const updated = [...this.cart()];
    const removed: string[] = [];

    updated.forEach((item, idx) => {
      const vid = Number(item.variant_id || 0);
      if (vid && (inv.get(vid) || 0) <= 0) {
        if (item.selected) {
          updated[idx] = { ...item, selected: false };
          removed.push(item.name || 'Sản phẩm');
        }
      }
    });

    if (removed.length > 0) {
      this.cart.set(updated);
      this.cartService.setCartToStorage(updated);
      // Notify user which items were deselected due to no stock
      alert('Một số sản phẩm đã hết hàng và được bỏ chọn:\n' + removed.map(n => `- ${n}`).join('\n'));
    }
  }

  getAvailableQuantity(variantId?: number): number {
    if (!variantId) return 0;
    return this.inventory().get(variantId) || 0;
  }

  isOutOfStock(item: CartItem): boolean {
    if (!item?.variant_id) return false;
    return this.getAvailableQuantity(Number(item.variant_id)) <= 0;
  }

  removeItem(index: number) {
    const item = this.cart()[index];
    // If the item has an id (persisted on server), call backend to remove it first
    if (item && item.id) {
      this.cartService.removeFromCart(Number(item.id)).subscribe({
        next: () => {
          const updatedCart = this.cart().filter((_, i) => i !== index);
          this.cart.set(updatedCart);
          this.cartService.setCartToStorage(updatedCart);
          // Refresh server cart to keep state consistent
          try { this.cartService.getCart(); } catch (e) {}
          this.loadInventory();
        },
        error: (err) => {
          console.error('Failed to remove item from server cart:', err);
          alert('Xóa sản phẩm thất bại. Vui lòng thử lại.');
        }
      });
      return;
    }

    // Fallback for local-only items (no server id)
    const updatedCart = this.cart().filter((_, i) => i !== index);
    this.cart.set(updatedCart);
    this.cartService.setCartToStorage(updatedCart);
    this.loadInventory();
  }

  increaseQty(index: number) {
    const item = this.cart()[index];
    const availableStock = this.getAvailableQuantity(item.variant_id);

    // Kiểm tra xem có thể tăng không
    if (item.quantity >= availableStock) {
      alert(`Không thể tăng thêm. Tồn kho chỉ còn: ${availableStock} sản phẩm`);
      return;
    }

    const updatedCart = [...this.cart()];
    updatedCart[index].quantity++;
    this.cart.set(updatedCart);
    this.cartService.setCartToStorage(updatedCart);
  }

  decreaseQty(index: number) {
    const updatedCart = [...this.cart()];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity--;
      this.cart.set(updatedCart);
      this.cartService.setCartToStorage(updatedCart);
    }
  }

  getDisplayPrice(item: CartItem): number {
    return item.priceSale || item.price;
  }

  getOriginalPrice(item: CartItem): number {
    return item.price;
  }

  hasDiscount(item: CartItem): boolean {
    return !!(item.priceSale && item.priceSale < item.price);
  }

  // ========== Chọn sản phẩm ==========
  // Chọn/bỏ chọn một sản phẩm
  toggleSelectItem(index: number) {
    const updatedCart = [...this.cart()];
    updatedCart[index].selected = !updatedCart[index].selected;
    this.cart.set(updatedCart);
    this.cartService.setCartToStorage(updatedCart);
  }

  // Chọn tất cả sản phẩm
  selectAllItems() {
    const updatedCart = this.cart().map(item => ({
      ...item,
      selected: true
    }));
    this.cart.set(updatedCart);
    this.cartService.setCartToStorage(updatedCart);
  }

  // Bỏ chọn tất cả sản phẩm
  deselectAllItems() {
    const updatedCart = this.cart().map(item => ({
      ...item,
      selected: false
    }));
    this.cart.set(updatedCart);
    this.cartService.setCartToStorage(updatedCart);
  }

  // Check xem tất cả có được chọn không
  get areAllSelected(): boolean {
    return this.cart().length > 0 && this.cart().every(item => item.selected);
  }

  // Đếm số sản phẩm được chọn
  get selectedCount(): number {
    return this.cart().filter(item => item.selected).length;
  }

  // Lấy giỏ hàng chỉ gồm sản phẩm được chọn
  get selectedCart(): CartItem[] {
    return this.cart().filter(item => item.selected);
  }

  // Tính subtotal chỉ cho sản phẩm được chọn
  get selectedSubtotal(): number {
    return this.selectedCart.reduce((sum, item) => {
      const displayPrice = item.priceSale || item.price;
      return sum + displayPrice * item.quantity;
    }, 0);
  }

  // Xóa tất cả sản phẩm được chọn
  removeSelectedItems() {
    const selected = this.cart().filter(item => item.selected);
    if (selected.length === 0) return;

    // Separate server-backed items (have id) and local-only items
    const serverIds = selected.map(s => s.id).filter(Boolean) as number[];

    if (serverIds.length > 0) {
      // Call backend to remove all server items, then update local storage
      const calls = serverIds.map(id => this.cartService.removeFromCart(Number(id)));
      forkJoin(calls).subscribe({
        next: () => {
          const updatedCart = this.cart().filter(item => !item.selected);
          this.cart.set(updatedCart);
          this.cartService.setCartToStorage(updatedCart);
          try { this.cartService.getCart(); } catch (e) {}
          this.loadInventory();
        },
        error: (err) => {
          console.error('Failed to remove selected items from server cart:', err);
          alert('Xóa một số sản phẩm thất bại. Vui lòng thử lại.');
        }
      });
      return;
    }

    // Fallback: all selected items are local-only
    const updatedCart = this.cart().filter(item => !item.selected);
    this.cart.set(updatedCart);
    this.cartService.setCartToStorage(updatedCart);
    this.loadInventory();
  }

  // Lưu chỉ sản phẩm được chọn vào localStorage trước khi checkout
  saveSelectedToCart() {
    const selectedItems = this.selectedCart;
    // Save selected items into a temporary checkout key (do not overwrite main cart)
    this.cartService.setTempCheckoutItems(selectedItems);
  }

  proceedToCheckout() {
    if (this.selectedCount === 0) {
      return;
    }

    const selectedItems = this.selectedCart;
    const selectedVariantIds = Array.from(new Set(
      selectedItems
        .filter(item => item.variant_id)
        .map(item => Number(item.variant_id))
    ));

    if (selectedVariantIds.length === 0) {
      alert('Không tìm thấy biến thể sản phẩm để kiểm tra tồn kho.');
      return;
    }

    this.apiService.getVariantsInventory(selectedVariantIds).subscribe({
      next: (response: any) => {
        if (!response?.success || !Array.isArray(response?.data)) {
          alert('Không thể kiểm tra tồn kho lúc này. Vui lòng thử lại.');
          return;
        }

        const stockMap = new Map<number, number>();
        response.data.forEach((item: any) => {
          stockMap.set(Number(item.variant_id), Number(item.quantity || 0));
        });
        this.inventory.set(stockMap);

        const shortages = selectedItems
          .map(item => {
            const variantId = Number(item.variant_id || 0);
            const available = stockMap.get(variantId) || 0;
            if (item.quantity > available) {
              const variantLabel = [item.color, item.size ? `Size ${item.size}` : '']
                .filter(Boolean)
                .join(' / ');
              const label = variantLabel ? `${item.name} (${variantLabel})` : item.name;
              return `- ${label}: còn ${available}, yêu cầu ${item.quantity}`;
            }
            return '';
          })
          .filter(Boolean);

        if (shortages.length > 0) {
          alert(`Một số sản phẩm không đủ tồn kho:\n${shortages.join('\n')}`);
          return;
        }

        this.saveSelectedToCart();
        // Mark that checkout was initiated from Cart with selected items
        try {
          sessionStorage.setItem('checkout_selected', '1');
        } catch (e) {
          // ignore if sessionStorage unavailable
        }
        this.router.navigate(['/checkout']);
      },
      error: (error) => {
        console.error('Error checking inventory before checkout:', error);
        alert('Kiểm tra tồn kho thất bại. Vui lòng thử lại.');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }
}