import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductService } from '../core/services';

interface SpotlightProduct {
  id: number;
  name: string;
  imageUrl: string;
  brandKey?: string;
  categoryKey?: string;
  createdAtMs?: number;
  raw: any;
}

/**
 * Spotlight Component
 * 
 * Responsibility: Display spotlight products
 * - Show products in spotlight grid layout
 * - Show newest products and diversify by brand/category
 */
@Component({
  selector: 'app-spotlight',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotlight.component.html',
  styleUrl: './spotlight.component.scss'
})
export class SpotlightComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  products: SpotlightProduct[] = [];

  private readonly totalItems = 16;

  ngOnInit(): void {
    this.loadSpotlightProducts();
  }

  private loadSpotlightProducts(): void {
    this.productService
      .getProducts()
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (allProducts) => {
          const allRaw = this.extractArray(allProducts);
          if (!allRaw.length) {
            this.products = [];
            return;
          }

          const normalizedAll = this.normalizeProducts(allRaw);
          this.products = this.selectNewestDiversified(normalizedAll, this.totalItems);
        },
        error: () => {
          this.products = [];
        }
      });
  }

  private selectNewestDiversified(allProducts: SpotlightProduct[], totalCount: number): SpotlightProduct[] {
    const sortedNewest = [...allProducts].sort((a, b) => {
      const dateB = Number(b.createdAtMs || 0);
      const dateA = Number(a.createdAtMs || 0);
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });

    const selected = new Map<number, SpotlightProduct>();

    // 1) Newest by brand
    this.pushUniqueByKey(selected, sortedNewest, (p) => p.brandKey, totalCount);

    // 2) Then newest by category
    if (selected.size < totalCount) {
      const remaining = sortedNewest.filter((p) => !selected.has(p.id));
      this.pushUniqueByKey(selected, remaining, (p) => p.categoryKey, totalCount);
    }

    // 3) Fill remaining purely by newest
    if (selected.size < totalCount) {
      this.pushUnique(selected, sortedNewest, totalCount);
    }

    return Array.from(selected.values()).slice(0, totalCount);
  }

  private getDateValue(product: any): Date | null {
    const rawDate = product?.created_at || product?.createdAt || product?.updated_at || product?.updatedAt || product?.sale_date;
    if (!rawDate) {
      return null;
    }

    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private getNumberValue(value: any): number {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private pushUnique(target: Map<number, SpotlightProduct>, source: SpotlightProduct[], limit: number): void {
    for (const item of source) {
      if (target.size >= limit) {
        return;
      }
      if (!target.has(item.id)) {
        target.set(item.id, item);
      }
    }
  }

  private pushUniqueByKey(
    target: Map<number, SpotlightProduct>,
    source: SpotlightProduct[],
    getKey: (item: SpotlightProduct) => string | undefined,
    limit: number
  ): void {
    const seen = new Set<string>();
    for (const item of source) {
      if (target.size >= limit) return;
      const key = getKey(item);
      if (!key) continue;
      if (seen.has(key)) continue;
      if (target.has(item.id)) continue;
      seen.add(key);
      target.set(item.id, item);
    }
  }

  private normalizeProducts(source: any[]): SpotlightProduct[] {
    const mapped = source.map((product: any) => {
      const productId = Number(product?.id || 0);
      const productName = (product?.name || product?.title || '').toString().trim();
      const date = this.getDateValue(product);

      return {
        id: productId,
        name: productName,
        imageUrl: this.buildImageUrl(product),
        brandKey: this.getBrandKey(product),
        categoryKey: this.getCategoryKey(product),
        createdAtMs: date?.getTime() || 0,
        raw: product
      } as SpotlightProduct;
    });

    return mapped.filter((item) => item.id > 0 && item.name.length > 0 && item.imageUrl.length > 0);
  }

  private getBrandKey(product: any): string | undefined {
    const name = (product?.brand_name || product?.brandName || product?.brand || '').toString().trim();
    if (name) return name.toUpperCase();
    const id = product?.brand_id ?? product?.brandId ?? product?.brandID;
    if (id !== undefined && id !== null && String(id).trim() !== '') return `ID:${String(id)}`;
    return undefined;
  }

  private getCategoryKey(product: any): string | undefined {
    const name = (product?.category_name || product?.categoryName || product?.category || '').toString().trim();
    if (name) return name.toUpperCase();
    const id = product?.category_id ?? product?.categoryId ?? product?.categoryID;
    if (id !== undefined && id !== null && String(id).trim() !== '') return `ID:${String(id)}`;
    return undefined;
  }

  private buildImageUrl(product: any): string {
    let imagePath = '';

    if (product?.image) {
      imagePath = product.image;
    } else if (Array.isArray(product?.variants) && product.variants.length > 0 && product.variants[0]?.image) {
      imagePath = product.variants[0].image;
    } else if (Array.isArray(product?.images) && product.images.length > 0) {
      imagePath = product.images[0];
    } else if (typeof product?.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imagePath = parsed[0];
        }
      } catch {
      }
    }

    if (!imagePath) {
      return '';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `http://localhost:3000/public/images/products/${imagePath}`;
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  }

  selectCategory(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}