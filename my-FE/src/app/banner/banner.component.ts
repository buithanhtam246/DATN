import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, CartService } from '../core/services';
import { Product } from '../core/models';
import { BANNER_CONTENT } from '../core/constants';
import { ProductCardComponent } from '../shared/product-card/product-card.component';

/**
 * Banner Component (Refactored)
 * 
 * Responsibilities (Following SRP):
 * - Display banner layout
 * - Coordinate child components
 * - Handle scroll interactions
 * 
 * SOLID Principles Applied:
 * - SRP: Delegates product display to ProductCardComponent
 * - OCP: Extensible through composition
 * - DIP: Depends on service abstractions
 */
@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent implements OnInit {
  // Dependency Injection
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  // Reactive state
  public product = signal<Product | null>(null);
  public selectedColor = signal<string | undefined>(undefined);
  public readonly bannerContent = BANNER_CONTENT;

  ngOnInit(): void {
    this.loadFeaturedProduct();
  }

  /**
   * Load featured product từ service
   */
  private loadFeaturedProduct(): void {
    const product = this.productService.getFeaturedProduct();
    this.product.set(product);
    // Set màu đầu tiên làm mặc định
    if (product.colors && product.colors.length > 0) {
      this.selectedColor.set(product.colors[0]);
    }
  }

  /**
   * Handle color selection from ProductCard
   */
  onColorSelected(color: string): void {
    this.selectedColor.set(color);
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  onAddToCart(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      this.cartService.addProductToCart(
        currentProduct,
        1,
        this.selectedColor()
      );
      console.log('Product added to cart:', currentProduct.name);
      // TODO: Show notification or feedback to user
    }
  }

  /**
   * Thêm vào danh sách yêu thích
   */
  onAddToWishlist(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      console.log('Product added to wishlist:', currentProduct.name);
      // TODO: Implement wishlist functionality
    }
  }

  /**
   * Scroll to next section
   */
  onScrollDown(): void {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  }
}
