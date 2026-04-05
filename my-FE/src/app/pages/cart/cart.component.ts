import { Component, computed, signal, inject, OnInit } from '@angular/core';
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
  selected?: boolean; // Thêm field để track chọn/không chọn
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
  cart = signal<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'));
  
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
    // Lấy tồn kho cho tất cả sản phẩm trong giỏ
    this.loadInventory();
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
        }
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
      }
    });
  }

  getAvailableQuantity(variantId?: number): number {
    if (!variantId) return 0;
    return this.inventory().get(variantId) || 0;
  }

  removeItem(index: number) {
    const updatedCart = this.cart().filter((_, i) => i !== index);
    this.cart.set(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
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
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  decreaseQty(index: number) {
    const updatedCart = [...this.cart()];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity--;
      this.cart.set(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
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
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  // Chọn tất cả sản phẩm
  selectAllItems() {
    const updatedCart = this.cart().map(item => ({
      ...item,
      selected: true
    }));
    this.cart.set(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  // Bỏ chọn tất cả sản phẩm
  deselectAllItems() {
    const updatedCart = this.cart().map(item => ({
      ...item,
      selected: false
    }));
    this.cart.set(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
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
    const updatedCart = this.cart().filter(item => !item.selected);
    this.cart.set(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    this.loadInventory();
  }

  // Lưu chỉ sản phẩm được chọn vào localStorage trước khi checkout
  saveSelectedToCart() {
    const selectedItems = this.selectedCart;
    localStorage.setItem('cart', JSON.stringify(selectedItems));
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