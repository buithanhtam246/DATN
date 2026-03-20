import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../core/services';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  price: string;
  imageUrl: string;
}

/**
 * Products Section Component
 * 
 * Responsibility: Display products grid section
 * - Show product listings in grid layout
 * - Navigate to product details
 */
@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSectionComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  products: ProductItem[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    // Load all products from JSON via ProductService for home page
    this.productService.getProducts().subscribe(data => {
      console.log('Total products loaded from JSON:', data.length);
      // Display all products (8 items from JSON, or more if added)
      this.products = data.map(p => ({
        id: p.id || '',
        title: p.title,
        category: p.category || p.brand || 'Giày',
        price: p.price,
        imageUrl: p.imageUrl || ''
      }));
      console.log('Products displayed on home page:', this.products.length);
      console.log('First product:', this.products[0]);
    });
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
