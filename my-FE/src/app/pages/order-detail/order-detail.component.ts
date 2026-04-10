import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderHistoryService } from '../../services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  isLoading = false;
  orderId: number = 0;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset order data khi component khởi tạo để tránh hiển thị dữ liệu cũ
    this.order = null;
    this.orderId = 0;
    
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError('Vui lòng đăng nhập để xem chi tiết đơn hàng');
      this.router.navigate(['/login']);
      return;
    }

    this.route.params.subscribe(params => {
      this.orderId = parseInt(params['id'], 10);
      if (this.orderId) {
        this.loadOrderDetail();
      } else {
        this.notificationService.showError('ID đơn hàng không hợp lệ');
        this.router.navigate(['/orders']);
      }
    });
  }

  loadOrderDetail() {
    this.isLoading = true;
    this.orderHistoryService.getOrderDetail(this.orderId).subscribe({
      next: (response: any) => {
        console.log('Order detail response:', response);
        if (response.success) {
          // Backend returns {order: {...}, items: [...]}
          // Normalize items: ensure numeric quantities and normalized price fields
          const rawOrder = response.data.order || {};
          const rawItems = Array.isArray(response.data.items) ? response.data.items : (response.data.items?.data || []);
          const normItems = rawItems.map((it: any) => {
            // consider nested variant object responses
            const variantObj = it.variant ?? it.v ?? null;
            const variantPriceFromNested = variantObj ? (variantObj.price ?? variantObj.v_price ?? variantObj.variant_price) : undefined;
            const variantSaleFromNested = variantObj ? (variantObj.price_sale ?? variantObj.v_price_sale ?? variantObj.variant_price_sale) : undefined;

            return {
              ...it,
              quantity: Number(it.quantity ?? it.qty ?? 0),
              // keep original price fields but also normalize common alternate names
              price: it.price ?? it.od_price ?? it.original_price ?? it.unit_price ?? it.cost ?? 0,
              variant_price: it.variant_price ?? it.v_price ?? variantPriceFromNested ?? it.price ?? 0,
              variant_price_sale: it.variant_price_sale ?? it.v_price_sale ?? variantSaleFromNested ?? it.price_sale ?? it.priceSale ?? 0
            };
          });

          this.order = {
            ...rawOrder,
            items: normItems
          };
          console.log('Order loaded:', this.order);
          console.log('Normalized order items:', normItems);
        } else {
          this.notificationService.showError(response.message || 'Không thể tải chi tiết đơn hàng');
          this.router.navigate(['/orders']);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading order detail:', err);
        if (err.status === 401) {
          this.notificationService.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          this.authService.logout();
        } else {
          this.notificationService.showError(err.error?.message || 'Không thể tải chi tiết đơn hàng');
        }
        this.router.navigate(['/orders']);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipped: 'Đang vận chuyển',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "pending":
        return "pending";
      case "confirmed":
        return "confirmed";
      case "shipped":
        return "shipped";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  }

  calculateOrderTotal(): number {
    if (!this.order || !this.order.items) return 0;
    let itemsTotal = 0;
    this.order.items.forEach((item: any) => {
      itemsTotal += this.getItemPrice(item) * (Number(item.quantity) || 0);
    });
    const deliveryCost = this.parsePrice(this.order.delivery_cost) || 0;
    return itemsTotal + deliveryCost;
  }

  getOrderItemsTotal(): number {
    if (!this.order || !this.order.items) return 0;
    return this.order.items.reduce((sum: number, item: any) => {
      return sum + (this.getItemPrice(item) * (Number(item.quantity) || 0));
    }, 0);
  }

  /**
   * Get the correct price for an order item
   * Prioritizes sale price if available, otherwise uses regular price
   */
  getItemPrice(item: any): number {
    // Check multiple possible fields returned by backend (different endpoints use different names)
    const candidates = [
      'variant_price_sale', 'variant_price_sale', 'v_price_sale', 'price_sale', 'priceSale',
      'variant_price', 'v_price', 'variant_price', 'price', 'original_price', 'unit_price', 'cost'
    ];

    for (const key of candidates) {
      const val = item?.[key];
      const p = this.parsePrice(val);
      if (p > 0) {
        item._computedPrice = p;
        return p;
      }
    }

    // As a last resort, traverse object fields to find any numeric-like value
    if (typeof item === 'object') {
      const queue: any[] = [item];
      const seen = new Set();
      while (queue.length) {
        const cur = queue.shift();
        if (!cur || seen.has(cur)) continue;
        seen.add(cur);
        if (typeof cur === 'string' || typeof cur === 'number') {
          const p = this.parsePrice(cur);
          if (p > 0) {
            item._computedPrice = p;
            return p;
          }
        } else if (typeof cur === 'object') {
          for (const k of Object.keys(cur)) {
            try { queue.push(cur[k]); } catch (e) { /* ignore */ }
          }
        }
      }
    }

    // Debug: attach computed price 0 so we can inspect item in console
    item._computedPrice = 0;
    console.warn('Unable to determine item price, item data:', item);
    return 0;
  }

  /**
   * Parse price values coming from backend which may be strings
   * with thousand separators (e.g. "30,000" or "30.000").
   * Returns a numeric value in VND.
   */
  parsePrice(value: any): number {
    if (value == null) return 0;
    if (typeof value === 'number') return value;

    let s = String(value).trim();
    if (!s) return 0;

    // Remove currency symbols, letters and spaces; keep digits, commas, dots and minus
    s = s.replace(/[^\d.,-]/g, '');
    // fallback: keep only 0-9 , . - if previous left empty
    if (!s) s = String(value).replace(/[^0-9.,-]/g, '');
    try { console.debug('parsePrice input:', value, 'cleaned:', s); } catch (e) {}

    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');

    // Both dot and comma present -> the rightmost is the decimal separator
    if (lastDot > -1 && lastComma > -1) {
      if (lastDot > lastComma) {
        // dot is decimal separator, remove commas (thousands)
        s = s.replace(/,/g, '');
        return parseFloat(s) || 0;
      } else {
        // comma is decimal separator, remove dots (thousands) and convert comma to dot
        s = s.replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(s) || 0;
      }
    }

    // Only comma present
    if (lastComma > -1) {
      const decimals = s.length - lastComma - 1;
      if (decimals === 2) {
        // comma used as decimal separator
        s = s.replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(s) || 0;
      }
      // otherwise comma is a thousands separator
      s = s.replace(/,/g, '');
      return parseFloat(s) || 0;
    }

    // Only dot present
    if (lastDot > -1) {
      const decimals = s.length - lastDot - 1;
      if (decimals === 2) {
        // dot used as decimal separator
        s = s.replace(/,/g, '');
        return parseFloat(s) || 0;
      }
      // otherwise dot is a thousands separator
      s = s.replace(/\./g, '');
      return parseFloat(s) || 0;
    }

    // Plain number string with no separators
    return parseFloat(s) || 0;
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.includes('uploads') || imagePath.includes('public')) {
      return `http://localhost:3000/${imagePath}`;
    }
    
    return `http://localhost:3000/images/products/${imagePath}`;
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}
