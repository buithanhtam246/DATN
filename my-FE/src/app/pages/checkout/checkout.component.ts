import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

type PaymentMethod = 'cod' | 'bank' | 'momo';
const ORDER_API_URL = 'http://localhost:5001/api/orders';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  public readonly cart = this.cartService.cart;
  public readonly isEmpty = computed(() => this.cart().items.length === 0);

  public readonly fullName = signal('');
  public readonly phone = signal('');
  public readonly email = signal('');
  public readonly address = signal('');
  public readonly city = signal('');
  public readonly district = signal('');
  public readonly note = signal('');
  public readonly paymentMethod = signal<PaymentMethod>('cod');
  public readonly agreedPolicy = signal(false);
  public readonly isSubmitting = signal(false);

  public readonly canPlaceOrder = computed(() => {
    return (
      !this.isEmpty() &&
      this.fullName().trim().length > 1 &&
      this.phone().trim().length >= 9 &&
      this.address().trim().length > 5 &&
      this.city().trim().length > 1 &&
      this.district().trim().length > 1 &&
      this.agreedPolicy()
    );
  });

  formatPrice(price: number): string {
    return `${price.toLocaleString('vi-VN')} đ`;
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }

  async placeOrder(): Promise<void> {
    if (!this.canPlaceOrder()) {
      alert('Vui long dien day du thong tin bat buoc de dat hang.');
      return;
    }

    this.isSubmitting.set(true);

    const cart = this.cart();
    const orderPayload = {
      customer: {
        fullName: this.fullName().trim(),
        phone: this.phone().trim(),
        email: this.email().trim(),
        address: this.address().trim(),
        city: this.city().trim(),
        district: this.district().trim(),
        note: this.note().trim()
      },
      paymentMethod: this.paymentMethod(),
      items: cart.items,
      summary: {
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total
      }
    };

    try {
      await firstValueFrom(this.http.post(ORDER_API_URL, orderPayload));
      alert('Dat hang thanh cong! Don hang da duoc luu.');
      this.cartService.clearCart();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Loi dat hang:', error);
      alert('Khong the dat hang luc nay. Vui long thu lai.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
