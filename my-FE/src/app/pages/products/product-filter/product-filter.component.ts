import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOptions, ActiveFilters } from '../../../core/models/product.model';

/**
 * Product Filter Sidebar Component
 * 
 * Hiển thị bộ lọc: danh mục, thương hiệu, màu sắc, kích cỡ, khoảng giá
 */
@Component({
    selector: 'app-product-filter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-filter.component.html',
    styleUrl: './product-filter.component.scss'
})
export class ProductFilterComponent {
    @Input({ required: true }) filterOptions!: FilterOptions;
    @Input({ required: true }) activeFilters!: ActiveFilters;

    @Output() filtersChanged = new EventEmitter<ActiveFilters>();

    // Section collapse state
    categoriesOpen = true;
    brandsOpen = true;
    colorsOpen = true;
    sizesOpen = true;
    priceOpen = true;

    // Price range inputs
    priceMin: number | null = null;
    priceMax: number | null = null;

    toggleSection(section: string): void {
        switch (section) {
            case 'categories': this.categoriesOpen = !this.categoriesOpen; break;
            case 'brands': this.brandsOpen = !this.brandsOpen; break;
            case 'colors': this.colorsOpen = !this.colorsOpen; break;
            case 'sizes': this.sizesOpen = !this.sizesOpen; break;
            case 'price': this.priceOpen = !this.priceOpen; break;
        }
    }

    isSelected(type: 'category' | 'brand' | 'color' | 'size', id: number): boolean {
        switch (type) {
            case 'category': return this.activeFilters.categoryIds.includes(id);
            case 'brand': return this.activeFilters.brandIds.includes(id);
            case 'color': return this.activeFilters.colorIds.includes(id);
            case 'size': return this.activeFilters.sizeIds.includes(id);
        }
    }

    toggleFilter(type: 'category' | 'brand' | 'color' | 'size', id: number): void {
        const updated = { ...this.activeFilters };
        let arr: number[];

        switch (type) {
            case 'category':
                arr = [...updated.categoryIds];
                break;
            case 'brand':
                arr = [...updated.brandIds];
                break;
            case 'color':
                arr = [...updated.colorIds];
                break;
            case 'size':
                arr = [...updated.sizeIds];
                break;
        }

        const index = arr.indexOf(id);
        if (index > -1) {
            arr.splice(index, 1);
        } else {
            arr.push(id);
        }

        switch (type) {
            case 'category': updated.categoryIds = arr; break;
            case 'brand': updated.brandIds = arr; break;
            case 'color': updated.colorIds = arr; break;
            case 'size': updated.sizeIds = arr; break;
        }

        this.filtersChanged.emit(updated);
    }

    applyPriceFilter(): void {
        const updated = { ...this.activeFilters };
        updated.minPrice = this.priceMin ?? undefined;
        updated.maxPrice = this.priceMax ?? undefined;
        this.filtersChanged.emit(updated);
    }

    clearAllFilters(): void {
        this.priceMin = null;
        this.priceMax = null;
        this.filtersChanged.emit({
            categoryIds: [],
            brandIds: [],
            colorIds: [],
            sizeIds: [],
        });
    }

    get hasActiveFilters(): boolean {
        return (
            this.activeFilters.categoryIds.length > 0 ||
            this.activeFilters.brandIds.length > 0 ||
            this.activeFilters.colorIds.length > 0 ||
            this.activeFilters.sizeIds.length > 0 ||
            this.activeFilters.minPrice !== undefined ||
            this.activeFilters.maxPrice !== undefined
        );
    }
}
