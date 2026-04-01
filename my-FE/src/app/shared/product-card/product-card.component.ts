import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { ColorSelectorComponent } from '../color-selector/color-selector.component';

/**
 * ProductCard Component
 * 
 * Responsibility: Display product information (SRP)
 * - Shows product title, price, edition badge
 * - Emits events for user interactions
 * - Does NOT contain business logic
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, ColorSelectorComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() selectedColor?: string;
  
  @Output() colorSelected = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<void>();
  @Output() addToWishlist = new EventEmitter<void>();
  
  onColorSelect(color: string): void {
    this.colorSelected.emit(color);
  }
  
  onAddToCart(): void {
    this.addToCart.emit();
  }
  
  onAddToWishlist(): void {
    this.addToWishlist.emit();
  }
}