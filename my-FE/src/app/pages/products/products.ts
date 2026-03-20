import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services';
import { Product } from '../../core/models';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private productService = inject(ProductService);

  // State
  public allProducts = signal<Product[]>([]);
  public isLoading = signal<boolean>(true);
  public selectedCategory = signal<string | null>(null);
  public selectedBrand = signal<string | null>(null);
  public sortBy = signal<string>('default');
  public showFilters = signal<boolean>(false);

  // Computed filtered and sorted products
  public displayProducts = computed(() => {
    let products = [...this.allProducts()];

    // Filter by category
    if (this.selectedCategory()) {
      products = products.filter(p => p.category?.includes(this.selectedCategory()!));
    }

    // Filter by brand
    if (this.selectedBrand()) {
      products = products.filter(p => p.brand === this.selectedBrand());
    }

    // Sort
    switch (this.sortBy()) {
      case 'price-asc':
        products.sort((a, b) => this.getPrice(a) - this.getPrice(b));
        break;
      case 'price-desc':
        products.sort((a, b) => this.getPrice(b) - this.getPrice(a));
        break;
      case 'name':
        products.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
    }

    return products;
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading.set(false);
      }
    });
  }

  private getPrice(product: Product): number {
    if (typeof product.minPriceSale === 'number') return product.minPriceSale;
    if (typeof product.minPrice === 'number') return product.minPrice;
    // Parse price string
    const priceStr = product.price || '0';
    return parseFloat(priceStr.replace(/[^0-9]/g, '')) || 0;
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  onCategoryChange(category: string | null): void {
    this.selectedCategory.set(category);
  }

  onBrandChange(brand: string | null): void {
    this.selectedBrand.set(brand);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy.set(select.value);
  }

  clearFilters(): void {
    this.selectedCategory.set(null);
    this.selectedBrand.set(null);
    this.sortBy.set('default');
  }
}
