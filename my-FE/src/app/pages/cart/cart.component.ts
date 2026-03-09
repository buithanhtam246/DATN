import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { CartItem, Product } from '../../core/models';

/**
 * Cart Page Component
 * 
 * Responsibility: Display shopping cart with items and summary
 * - Show cart items list
 * - Update quantity
 * - Remove items
 * - Display order summary
 * - Checkout button
 * - Show recommended products
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  public readonly cart = this.cartService.cart;
  public readonly isEmpty = computed(() => this.cart().items.length === 0);
  public readonly recommendedProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.loadRecommendations();
  }

  /**
   * Load sản phẩm gợi ý
   */
  private loadRecommendations(): void {
    this.productService.getRecommendedProducts(4).subscribe({
      next: (products) => {
        this.recommendedProducts.set(products);
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
      }
    });
  }

  /**
   * Format giá tiền
   */
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + ' đ';
  }

  /**
   * Tăng số lượng
   */
  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  /**
   * Giảm số lượng
   */
  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

  /**
   * Xóa item khỏi giỏ hàng
   */
  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  /**
   * Thanh toán
   */
  checkout(): void {
    // TODO: Navigate to checkout page
    this.router.navigate(['/checkout']);
  }

  /**
   * Tiếp tục mua sắm
   */
  continueShopping(): void {
    this.router.navigate(['/']);
  }

  /**
   * Xem chi tiết sản phẩm
   */
  viewProduct(productId: string | undefined): void {
    if (productId) {
      // TODO: Navigate to product detail page
      // this.router.navigate(['/product', productId]);
    }
  }
}
