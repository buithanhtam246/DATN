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
        id: '1',
        title: 'Jordan Jumpman MVP',
        price: '4.000.000 VND',
        imageUrl: '/assets/images/jordan-jumpman.jpg',
        brand: 'JORDAN',
        colors: ['#FF6B35', '#F7B731', '#E91E63', '#3B82F6'],
        sizes: [40, 41, 42, 43]
      },
      {
        id: '2',
        title: 'Grand Court Cloudfoam',
        price: '3.500.000 VND',
        imageUrl: '/assets/images/adidas-grand-court.jpg',
        brand: 'ADIDAS',
        colors: ['#FF6B35', '#F7B731', '#E91E63', '#3B82F6'],
        sizes: [40, 41, 42, 43]
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
