import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductFilterComponent } from './product-filter/product-filter.component';
import {
    Product, ActiveFilters, SortOption, PaginatedResult, FilterOptions
} from '../../core/models/product.model';

/**
 * Products Page Component
 *
 * Trang danh sách sản phẩm theo thiết kế Figma:
 * - Header: tiêu đề + số lượng, nút lọc, sort dropdown
 * - Sidebar: bộ lọc (ẩn/hiện)
 * - Main: product grid 4 cột + phân trang
 */
@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule, ProductCardComponent, ProductFilterComponent],
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss'
})
export class ProductsComponent {
    private readonly productService = inject(ProductService);

    // State
    filterOptions: FilterOptions = this.productService.getFilterOptions();
    activeFilters = signal<ActiveFilters>({
        categoryIds: [],
        brandIds: [],
        colorIds: [],
        sizeIds: [],
    });
    currentSort = signal<SortOption>('newest');
    currentPage = signal<number>(1);
    pageSize = 12;
    showFilter = signal<boolean>(true);

    // Computed results
    result = computed<PaginatedResult<Product>>(() => {
        return this.productService.getProducts(
            this.activeFilters(),
            this.currentSort(),
            this.currentPage(),
            this.pageSize
        );
    });

    products = computed(() => this.result().items);
    totalItems = computed(() => this.result().totalItems);
    totalPages = computed(() => this.result().totalPages);

    // Pages array for pagination
    pagesArray = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages: number[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push(-1); // ellipsis
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            if (current < total - 2) pages.push(-1); // ellipsis
            pages.push(total);
        }

        return pages;
    });

    // Sort options for dropdown
    sortOptions = [
        { value: 'newest' as SortOption, label: 'Mới nhất' },
        { value: 'price_asc' as SortOption, label: 'Giá: Thấp → Cao' },
        { value: 'price_desc' as SortOption, label: 'Giá: Cao → Thấp' },
    ];

    // Methods
    toggleFilter(): void {
        this.showFilter.update(v => !v);
    }

    onFiltersChanged(filters: ActiveFilters): void {
        this.activeFilters.set(filters);
        this.currentPage.set(1); // Reset page khi filter thay đổi
    }

    onSortChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value as SortOption;
        this.currentSort.set(value);
        this.currentPage.set(1);
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
        this.currentPage.set(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onProductClick(product: Product): void {
        // TODO: Navigate to product detail page
        console.log('Navigate to product:', product.id, product.name);
    }

    onAddToWishlist(product: Product): void {
        // TODO: Add to wishlist
        console.log('Add to wishlist:', product.id, product.name);
    }
}
