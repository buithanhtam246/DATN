import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';

/**
 * ProductCard Component - Product Page variant
 * 
 * Hiển thị: ảnh sản phẩm, tên, danh mục/thương hiệu, giá VND
 * Click vào card để xem chi tiết
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() showActions: boolean = false;
  @Input() selectedColor?: string;

  @Output() productClicked = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() colorSelected = new EventEmitter<string>();

  get displayPrice(): string {
    const price = this.product.minPriceSale ?? this.product.minPrice ?? 0;
    return price.toLocaleString('vi-VN') + ' VNĐ';
  }

  get originalPrice(): string | null {
    if (this.product.minPriceSale && this.product.minPrice && this.product.minPriceSale < this.product.minPrice) {
      return this.product.minPrice.toLocaleString('vi-VN') + ' VNĐ';
    }
    return null;
  }

  get categoryLabel(): string {
    const parts: string[] = [];
    if (this.product.brand?.name) parts.push(this.product.brand.name.toUpperCase());
    if (this.product.category?.name) parts.push(this.product.category.name);
    return parts.join(' / ') || '';
  }

  get uniqueColors(): string[] {
    const colorSet = new Set<string>();
    this.product.variants.forEach(v => {
      if (v.color?.tableColor) colorSet.add(v.color.tableColor);
    });
    return Array.from(colorSet);
  }

  get productImage(): string {
    return this.product.image || '/assets/images/placeholder.png';
  }

  onCardClick(): void {
    this.productClicked.emit(this.product);
  }

  onColorClick(event: Event, color: string): void {
    event.stopPropagation();
    this.colorSelected.emit(color);
  }

  onWishlistClick(event: Event): void {
    event.stopPropagation();
    this.addToWishlist.emit(this.product);
  }
}
