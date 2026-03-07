import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../core/services';
import { Product } from '../core/models';

/**
 * Collection Component
 * 
 * Responsibility: Display new collection section
 * - Show collection header
 * - Display product carousel/grid
 * - Handle navigation between products
 */
@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionComponent implements OnInit {
  private readonly productService = inject(ProductService);

  public currentSlide = signal<number>(0);
  public products = signal<Product[]>([]);

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    // TODO: Load từ API
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Jordan Jumpman MVP',
        minPrice: 4000000,
        image: '/assets/images/jordan-jumpman.jpg',
        brand: { id: 3, name: 'JORDAN' },
        category: { id: 1, name: 'Giày Nam' },
        variants: [
          { id: 101, productId: 1, colorId: 1, sizeId: 5, price: 4000000, quantity: 10, color: { id: 1, tableColor: '#FF6B35' }, size: { id: 5, bangSize: '40' } },
          { id: 102, productId: 1, colorId: 2, sizeId: 6, price: 4000000, quantity: 10, color: { id: 2, tableColor: '#F7B731' }, size: { id: 6, bangSize: '41' } },
        ]
      },
      {
        id: 2,
        name: 'Grand Court Cloudfoam',
        minPrice: 3500000,
        image: '/assets/images/adidas-grand-court.jpg',
        brand: { id: 2, name: 'ADIDAS' },
        category: { id: 1, name: 'Giày Nam' },
        variants: [
          { id: 103, productId: 2, colorId: 1, sizeId: 5, price: 3500000, quantity: 10, color: { id: 1, tableColor: '#E91E63' }, size: { id: 5, bangSize: '40' } },
          { id: 104, productId: 2, colorId: 2, sizeId: 6, price: 3500000, quantity: 10, color: { id: 2, tableColor: '#3B82F6' }, size: { id: 6, bangSize: '41' } },
        ]
      }
    ];
    this.products.set(mockProducts);
  }

  previousSlide(): void {
    const current = this.currentSlide();
    this.currentSlide.set(current > 0 ? current - 1 : 0);
  }

  nextSlide(): void {
    const current = this.currentSlide();
    const maxSlides = Math.ceil(this.products().length / 2) - 1;
    this.currentSlide.set(current < maxSlides ? current + 1 : maxSlides);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }
}
