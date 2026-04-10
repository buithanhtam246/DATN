import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout-return',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-return.component.html',
  styleUrls: ['./checkout-return.component.scss']
})
export class CheckoutReturnComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly http = inject(HttpClient);

  isSuccess = false;
  title = 'Thanh toán chưa thành công';
  message = 'Giao dịch không thành công hoặc đã bị hủy.';
  orderRef = '';
  amount = 0;
  provider: 'VNPay' | 'MoMo' | 'Unknown' = 'VNPay';

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;

    // Detect provider and canonicalize response code / txnRef / amount
    const vnpResponse = query.get('vnp_ResponseCode');
    const vnpTxnRef = query.get('vnp_TxnRef');
    const vnpAmount = query.get('vnp_Amount');

    const momoResponse = query.get('resultCode');
    const momoOrderId = query.get('orderId') || query.get('requestId');
    const momoAmount = query.get('amount');
    const partner = query.get('partnerCode');

    if (partner && partner.toLowerCase().includes('momo')) {
      this.provider = 'MoMo';
    } else if (vnpResponse !== null || vnpTxnRef) {
      this.provider = 'VNPay';
    } else {
      this.provider = 'Unknown';
    }

    // responseCode normalized to VNPay-style '00' for success
    let responseCode = '';
    if (vnpResponse !== null) {
      responseCode = vnpResponse;
      this.orderRef = vnpTxnRef || '';
      const amountRaw = Number(vnpAmount || 0);
      this.amount = amountRaw > 0 ? amountRaw / 100 : 0;
    } else if (momoResponse !== null) {
      // MoMo uses resultCode === 0 for success
      responseCode = Number(momoResponse) === 0 ? '00' : String(momoResponse);
      this.orderRef = momoOrderId || '';
      this.amount = Number(momoAmount || 0) || 0;
    } else {
      // fallback: try generic params
      this.orderRef = query.get('orderId') || query.get('txnRef') || '';
      this.amount = Number(query.get('amount') || 0) || 0;
    }

    this.isSuccess = responseCode === '00';

    if (this.isSuccess) {
      this.title = 'Thanh toán thành công';
      this.message = 'Cảm ơn bạn. Đơn hàng đã được ghi nhận và đang chờ xử lý.';
      // Attempt to remove only the purchased items/quantities from the cart
      // If we have an orderRef (VNPay/MoMo), try to resolve the order and remove matching items.
      const resolvedOrderId = this.extractOrderIdFromRef(this.orderRef);
      if (resolvedOrderId) {
        // Fetch order details (requires auth). If fails, fallback to clearing cart.
        this.http.get<any>(`http://localhost:3000/api/orders/${resolvedOrderId}`).subscribe({
          next: (orderResp: any) => {
            try {
              const order = orderResp?.data || orderResp;
              const details = order?.orderDetails || order?.order_details || [];

              if (!Array.isArray(details) || details.length === 0) {
                // nothing to subtract — fallback to clear
                this.doFullCartClearWithNotification();
                return;
              }

              // Ensure we have latest server cart items first
              try { this.cartService.getCart(); } catch (e) { /* ignore */ }

              // small delay to let cartService populate storage
              setTimeout(() => {
                const serverCartItems = this.cartService.getCartFromStorage() || [];

                // For each order detail, find matching cart item and decrement/remove
                details.forEach((d: any) => {
                  const variantId = Number(d.variant_id || d.variantId || 0);
                  const qtyOrdered = Number(d.quantity || 0);
                  if (!variantId || qtyOrdered <= 0) return;

                  // Find cart items matching this variant (could be multiple entries)
                  const matches = serverCartItems.filter((ci: any) => Number(ci.variant_id) === variantId);
                  matches.forEach((ci: any) => {
                    try {
                      const remaining = Number(ci.quantity || 0) - qtyOrdered;
                      if (remaining > 0) {
                        // update quantity on server
                        this.cartService.updateCartItem(ci.id, remaining)?.subscribe?.({
                          next: () => {},
                          error: (err: any) => console.error('Error updating cart item after payment:', err)
                        });
                      } else {
                        // remove item from cart
                        this.cartService.removeFromCart(ci.id)?.subscribe?.({
                          next: () => {},
                          error: (err: any) => console.error('Error removing cart item after payment:', err)
                        });
                      }
                    } catch (e) {
                      console.error('Error processing cart item cleanup:', e);
                    }
                  });
                });

                // Also clear local storage cart and temp checkout selection
                try { localStorage.removeItem('cart'); } catch (e) {}
                try { this.cartService.clearTempCheckoutItems(); } catch (e) {}

                // Refresh server cart and local view
                try { this.cartService.getCart(); } catch (e) {}
                this.notificationService.showSuccess('Giỏ hàng đã được cập nhật sau khi thanh toán.');
              }, 250);
            } catch (e) {
              console.error('Error parsing order response for cart cleanup:', e);
              this.doFullCartClearWithNotification();
            }
          },
          error: (err: any) => {
            console.error('Error fetching order for cart cleanup:', err);
            // fallback to full clear
            this.doFullCartClearWithNotification();
          }
        });
      } else {
        // No order id available from provider return — fallback to full clear
        this.doFullCartClearWithNotification();
      }
    }
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  /**
   * Extract numeric order id from provider return reference. Handles cases like "123" and "123-<ts>".
   */
  private extractOrderIdFromRef(ref: string): number | null {
    if (!ref) return null;
    // If contains dash (MoMo unique id), take leading numeric part
    const first = String(ref).split('-')[0];
    const parsed = parseInt(first, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;

    // Try to find any number sequence inside the ref
    const m = String(ref).match(/(\d+)/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > 0) return n;
    }
    return null;
  }

  private doFullCartClearWithNotification(): void {
    try { localStorage.removeItem('cart'); } catch (e) {}
    try { this.cartService.setCartToStorage([]); } catch (e) {}

    const cartId = this.cartService.getCartId();
    if (cartId) {
      try {
        this.cartService.clearCart()?.subscribe?.({
          next: () => {
            try { this.notificationService.showSuccess('Giỏ hàng đã được đặt lại.'); } catch (e) {}
          },
          error: (err: any) => {
            console.error('Error clearing server cart on payment return:', err);
            try { this.notificationService.showError('Không thể xóa giỏ hàng trên server, nhưng đã xóa cục bộ.'); } catch (e) {}
          }
        });
      } catch (e) {
        console.error('clearCart call failed', e);
      }
    } else {
      try { this.notificationService.showSuccess('Giỏ hàng đã được đặt lại.'); } catch (e) {}
    }
  }
}