import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  // Data
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  
  // Filter & Search
  searchQuery: string = '';
  selectedCategoryFilter: string = '';
  selectedBrandFilter: string = '';
  selectedMinPrice: number = 0;
  selectedMaxPrice: number = 10000000;
  sortBy: string = 'newest'; // newest, price-low, price-high, popular
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  
  // Loading
  isLoading: boolean = true;
  
  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ========== DATA LOADING ==========
  loadData() {
    this.isLoading = true;
    
    // Load Products
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.allProducts = Array.isArray(res) ? res : (res.data || []);
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
    
    // Load Categories
    this.productService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
    
    // Load Brands
    this.productService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });
  }

  // ========== SEARCH & FILTER ==========
  onSearchChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onSortChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategoryFilter = '';
    this.selectedBrandFilter = '';
    this.selectedMinPrice = 0;
    this.selectedMaxPrice = 10000000;
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    // Apply filters
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.id.toString().includes(this.searchQuery);
      
      const matchesCategory = 
        !this.selectedCategoryFilter || 
        product.category_id?.toString() === this.selectedCategoryFilter;
      
      const matchesBrand = 
        !this.selectedBrandFilter || 
        product.brand_id?.toString() === this.selectedBrandFilter;
      
      const productPrice = product.price_sale || product.price || 0;
      const matchesPrice = productPrice >= this.selectedMinPrice && productPrice <= this.selectedMaxPrice;
      
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Apply sorting
    this.sortProducts();
    
    // Calculate pagination
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  sortProducts() {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => 
          (a.price_sale || a.price || 0) - (b.price_sale || b.price || 0)
        );
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => 
          (b.price_sale || b.price || 0) - (a.price_sale || a.price || 0)
        );
        break;
      case 'popular':
        // Assuming products have a popularity field or we can use sales count
        this.filteredProducts.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'newest':
      default:
        this.filteredProducts.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
    }
  }

  // ========== PAGINATION ==========
  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // ========== PRODUCT ACTIONS ==========
  viewProductDetail(product: any) {
    // Navigate to product detail page
    this.router.navigate(['/product', product.id]);
  }

  // ========== UTILITY FUNCTIONS ==========
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  }

  getBrandName(brandId: number): string {
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : 'N/A';
  }

  getDiscountPercent(product: any): number {
    if (!product.price_sale || !product.price) return 0;
    return Math.round(((product.price - product.price_sale) / product.price) * 100);
  }

  getProductImage(product: any): string {
    // Assuming product has images array
    if (product.images && product.images.length > 0) {
      return `http://localhost:3000/${product.images[0]}`;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }

  getDisplayPrice(product: any): number {
    return product.price_sale || product.price || 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }

  // ========== PAGINATION HELPERS ==========
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
