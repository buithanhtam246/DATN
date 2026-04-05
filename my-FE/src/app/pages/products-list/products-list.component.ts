import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  // Data - Use signals
  allProducts = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  parentCategories = signal<any[]>([]);
  childCategories = signal<any[]>([]);
  brands = signal<any[]>([]);
  
  // Loading states
  productsLoaded = signal(false);
  categoriesLoaded = signal(false);
  
  // Filter & Search
  searchQuery: string = '';
  selectedParentCategory: string = '';
  selectedChildCategory: string = '';
  selectedCategoryKeyword: string = '';
  selectedBrandFilter: string = '';
  selectedMinPrice: number = 0;
  selectedMaxPrice: number = 10000000;
  showSaleOnly: boolean = false; // Filter for sale products
  sortBy: string = 'newest'; // newest, price-low, price-high, popular
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  
  // Loading
  isLoading: boolean = true;
  
  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.applyQueryParams(params);

      if (this.productsLoaded() && this.categoriesLoaded()) {
        this.currentPage = 1;
        this.applyFiltersAndSort();
      }
    });

    this.applyQueryParams(this.route.snapshot.queryParamMap);
    this.loadData();
  }

  private applyQueryParams(params: ParamMap): void {
    const parentCategoryParam = params.get('parentCategory') || '';
    this.selectedParentCategory = parentCategoryParam && /^\d+$/.test(parentCategoryParam) ? parentCategoryParam : '';

    const childCategoryParam =
      params.get('childCategory') ||
      params.get('categoryId') ||
      params.get('category_id') ||
      '';
    this.selectedChildCategory = childCategoryParam && /^\d+$/.test(childCategoryParam) ? childCategoryParam : '';

    const categoryNameParam = params.get('categoryName') || params.get('category') || '';
    this.selectedCategoryKeyword = categoryNameParam && !this.selectedParentCategory
      ? categoryNameParam.trim().toLowerCase()
      : '';

    const brandParam = params.get('brand') || params.get('brandId') || '';
    this.selectedBrandFilter = brandParam;
  }

  // ========== DATA LOADING ==========
  loadData() {
    this.isLoading = true;
    
    // Load Products
    console.log('Starting to load products...');
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        console.log('Raw API response:', res);
        console.log('Response type:', typeof res);
        console.log('Is array?', Array.isArray(res));
        
        let products: any[] = [];
        if (Array.isArray(res)) {
          products = res;
        } else if (res && res.data && Array.isArray(res.data)) {
          products = res.data;
        } else if (res && typeof res === 'object') {
          // Handle case where response might be wrapped differently
          products = Object.values(res).find((val: any) => Array.isArray(val)) || [];
        }
        
        console.log('Final products array:', products);
        console.log('Products count:', products.length);
        
        this.allProducts.set(products);
        this.productsLoaded.set(true);
        
        // Apply filters only if categories are loaded
        if (this.categoriesLoaded()) {
          this.applyFiltersAndSort();
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
    
    // Load Categories
    this.productService.getCategories().subscribe({
      next: (res: any) => {
        console.log('Raw categories response:', res);
        let allCategories = Array.isArray(res) ? res : (res.data || []);
        console.log('All categories (before flatten):', allCategories);
        
        // Flatten nested structure: parent categories have children array
        const flattened: any[] = [];
        allCategories.forEach((cat: any) => {
          // Add parent
          flattened.push(cat);
          // Add children if they exist
          if (cat.children && Array.isArray(cat.children)) {
            flattened.push(...cat.children);
          }
        });
        
        console.log('All categories (after flatten):', flattened);
        
        const parentCats = flattened.filter((cat: any) => cat.isParent);
        const childCats = flattened.filter((cat: any) => !cat.isParent);
        
        console.log('Parent categories:', parentCats);
        console.log('Child categories:', childCats);
        
        this.parentCategories.set(parentCats);
        this.childCategories.set(childCats);
        
        this.categoriesLoaded.set(true);
        
        // Apply filters only if products are loaded
        if (this.productsLoaded()) {
          this.applyFiltersAndSort();
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
    
    // Load Brands
    this.productService.getBrands().subscribe({
      next: (res: any) => {
        const loadedBrands = Array.isArray(res) ? res : (res.data || []);
        this.brands.set(loadedBrands);

        if (this.selectedBrandFilter && isNaN(Number(this.selectedBrandFilter))) {
          const matchedBrand = loadedBrands.find((brand: any) => (brand.name || '').toLowerCase() === this.selectedBrandFilter.toLowerCase());
          if (matchedBrand) {
            this.selectedBrandFilter = matchedBrand.id.toString();
          }
        }

        if (this.productsLoaded()) {
          this.applyFiltersAndSort();
        }
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

  onParentCategoryChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onChildCategoryChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedParentCategory = '';
    this.selectedChildCategory = '';
    this.selectedCategoryKeyword = '';
    this.selectedBrandFilter = '';
    this.selectedMinPrice = 0;
    this.selectedMaxPrice = 10000000;
    this.showSaleOnly = false;
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    console.log('=== APPLY FILTERS ===');
    console.log('selectedParentCategory:', this.selectedParentCategory);
    console.log('selectedChildCategory:', this.selectedChildCategory);
    console.log('allProducts count:', this.allProducts().length);
    console.log('parentCategories count:', this.parentCategories().length);
    console.log('childCategories count:', this.childCategories().length);
    
    // Apply filters
    const filtered = this.allProducts().filter((product: any) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.id.toString().includes(this.searchQuery);

      const normalizeText = (value: any): string =>
        (value || '')
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

      const selectedChild = this.childCategories().find(
        (cat: any) => cat.id?.toString() === this.selectedChildCategory
      );
      const selectedChildName = normalizeText(selectedChild?.name);
      
      // Filter by parent category - get all child categories of parent and check if product is in them
      let matchesParentCategory = true;
      if (this.selectedParentCategory) {
        const parentId = parseInt(this.selectedParentCategory);
        console.log('Filter by parent category:', this.selectedParentCategory, 'parsed as:', parentId);
        const childCatsOfParent = this.childCategories().filter((c: any) => c.parent_id === parentId);
        console.log('Child categories of parent:', childCatsOfParent);
        const childCatIds = childCatsOfParent.map((c: any) => c.id);
        console.log('Child category IDs:', childCatIds);
        console.log('Product category_id:', product.category_id, 'Is included?', childCatIds.includes(product.category_id));
        matchesParentCategory = childCatIds.length > 0
          ? childCatIds.includes(product.category_id)
          : product.category_id?.toString() === this.selectedParentCategory;
      }
      
      // Filter by child category
      const productCategoryName = normalizeText(product.category_name || product.category || '');
      const matchesChildCategory = !this.selectedChildCategory ||
        product.category_id?.toString() === this.selectedChildCategory ||
        (!!selectedChildName && productCategoryName.includes(selectedChildName));

      const matchesCategoryKeyword = !this.selectedCategoryKeyword ||
        normalizeText(product.category_name || product.category || '').includes(normalizeText(this.selectedCategoryKeyword));
      
      const matchesBrand = 
        !this.selectedBrandFilter || (() => {
          const brandFilter = this.selectedBrandFilter.trim().toLowerCase();
          if (/^\d+$/.test(brandFilter)) {
            return product.brand_id?.toString() === brandFilter;
          }

          const productBrandName = (product.brand_name || product.brand || '').toString().toLowerCase();
          return productBrandName === brandFilter || productBrandName.includes(brandFilter);
        })();
      
      const productPrice = this.getDisplayPrice(product);
      const matchesPrice = productPrice >= this.selectedMinPrice && productPrice <= this.selectedMaxPrice;
      
      // Filter by sale status - check variants for sale price
      let hasSale = false;
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0];
        const priceSale = variant.price_sale ? parseFloat(variant.price_sale) : 0;
        const price = variant.price ? parseFloat(variant.price) : 0;
        hasSale = priceSale > 0 && priceSale < price;
      }
      const matchesSale = !this.showSaleOnly || hasSale;
      
      return matchesSearch && matchesParentCategory && matchesChildCategory && matchesCategoryKeyword && matchesBrand && matchesPrice && matchesSale;
    });

    console.log('Filtered products count:', filtered.length);
    this.filteredProducts.set(filtered);
    
    // Apply sorting
    this.sortProducts();
    
    console.log('Final filtered products count:', this.filteredProducts().length);
    console.log('=== END APPLY FILTERS ===');
    this.totalPages = Math.ceil(this.filteredProducts().length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  sortProducts() {
    const products = this.filteredProducts();
    
    // Filter for sale products if selected
    if (this.sortBy === 'sale') {
      const saleProducts = products.filter((product: any) => {
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants[0];
          const priceSale = variant.price_sale ? parseFloat(variant.price_sale) : 0;
          const price = variant.price ? parseFloat(variant.price) : 0;
          return priceSale > 0 && priceSale < price;
        }
        return false;
      });
      this.filteredProducts.set(saleProducts);
      return;
    }

    switch (this.sortBy) {
      case 'price-low':
        products.sort((a: any, b: any) => {
          const priceA = this.getDisplayPrice(a);
          const priceB = this.getDisplayPrice(b);
          return priceA - priceB;
        });
        break;
      case 'price-high':
        products.sort((a: any, b: any) => {
          const priceA = this.getDisplayPrice(a);
          const priceB = this.getDisplayPrice(b);
          return priceB - priceA;
        });
        break;
      case 'popular':
        // Assuming products have a popularity field or we can use sales count
        products.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
        break;
      case 'newest':
      default:
        products.sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
        break;
    }
    
    this.filteredProducts.set(products);
  }

  // ========== PAGINATION ==========
  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts().slice(start, end);
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
    this.router.navigate(['/products', product.id]);
  }

  // ========== UTILITY FUNCTIONS ==========
  getParentCategoryId(childCategoryId: number): number {
    // Find the parent category ID for a given child category
    const childCat = this.childCategories().find((c: any) => c.id === childCategoryId);
    return childCat ? childCat.parent_id : 0;
  }

  getCategoryName(categoryId: number): string {
    // First check if product has category_name field (from API)
    // This is passed from the view, but we need to handle it differently
    // For now, return the category_name if available in the response
    return 'N/A'; // This will be overridden by template usage
  }

  getChildCategoriesByParent(parentId: string): any[] {
    if (!parentId) {
      return [];
    }
    const parentIdNum = parseInt(parentId);
    return this.childCategories().filter((c: any) => c.parent_id === parentIdNum);
  }

  getDisplayedChildCategories(): any[] {
    const normalizeText = (value: any): string =>
      (value || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    if (!this.selectedParentCategory) {
      const uniqueByName = new Map<string, any>();
      this.childCategories().forEach((category: any) => {
        const key = normalizeText(category.name);
        if (!uniqueByName.has(key)) {
          uniqueByName.set(key, category);
        }
      });
      return Array.from(uniqueByName.values());
    }

    const parentIdNum = parseInt(this.selectedParentCategory);
    const parentChildren = this.childCategories().filter((c: any) => c.parent_id === parentIdNum);
    const uniqueByName = new Map<string, any>();
    parentChildren.forEach((category: any) => {
      const key = normalizeText(category.name);
      if (!uniqueByName.has(key)) {
        uniqueByName.set(key, category);
      }
    });
    return Array.from(uniqueByName.values());
  }

  getBrandName(brandId: number): string {
    const brand = this.brands().find((b: any) => b.id === brandId);
    return brand ? brand.name : 'N/A';
  }

  getDiscountPercent(product: any): number {
    // Get prices from variant (first variant)
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      const price = variant.price ? parseFloat(variant.price) : 0;
      const priceSale = variant.price_sale ? parseFloat(variant.price_sale) : 0;
      
      if (!priceSale || !price || priceSale >= price) return 0;
      return Math.round(((price - priceSale) / price) * 100);
    }
    
    // Fallback to product level price
    const price = product.price ? parseFloat(product.price) : 0;
    const priceSale = product.price_sale ? parseFloat(product.price_sale) : 0;
    
    if (!priceSale || !price || priceSale >= price) return 0;
    return Math.round(((price - priceSale) / price) * 100);
  }

  getProductImage(product: any): string {
    try {
      let imageArray: any[] = [];
      
      // Handle images field - could be string (JSON) or array
      if (product.images) {
        if (typeof product.images === 'string') {
          imageArray = JSON.parse(product.images);
        } else if (Array.isArray(product.images)) {
          imageArray = product.images;
        }
      }
      
      // Get first image or fallback to main image field
      if (imageArray && imageArray.length > 0) {
        const imageName = imageArray[0];
        return `http://localhost:3000/public/images/products/${imageName}`;
      }
      
      if (product.image) {
        return `http://localhost:3000/public/images/products/${product.image}`;
      }
      
      return 'https://via.placeholder.com/300x300?text=No+Image';
    } catch (error) {
      console.error('Error parsing images:', error);
      // Fallback to image field
      if (product.image) {
        return `http://localhost:3000/public/images/products/${product.image}`;
      }
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }
  }

  getDisplayPrice(product: any): number {
    // First try to get price from product variants
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      const priceSale = firstVariant.price_sale ? parseFloat(firstVariant.price_sale) : 0;
      const price = firstVariant.price ? parseFloat(firstVariant.price) : 0;
      
      if (priceSale > 0) {
        return priceSale;
      }
      return price;
    }
    
    // Fallback to product level price
    const priceSale = product.price_sale ? parseFloat(product.price_sale) : 0;
    const price = product.price ? parseFloat(product.price) : 0;
    
    if (priceSale > 0) {
      return priceSale;
    }
    return price;
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
