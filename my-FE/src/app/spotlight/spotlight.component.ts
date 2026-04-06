import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductService } from '../core/services';

interface SpotlightProduct {
  id: number;
  name: string;
  imageUrl: string;
  raw: any;
}

/**
 * Spotlight Component
 * 
 * Responsibility: Display spotlight products
 * - Show products in spotlight grid layout
 * - Select products by ratio: 60% Bestseller, 20% New Arrival, 20% Strategic
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
  private readonly strategicBrands = new Set(['NIKE', 'ADIDAS', 'JORDAN']);

  ngOnInit(): void {
    this.loadSpotlightProducts();
  }

  private loadSpotlightProducts(): void {
    forkJoin({
      allProducts: this.productService.getProducts().pipe(catchError(() => of([]))),
      topSelling: this.productService.getTopSellingProducts(50).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ allProducts, topSelling }) => {
        const allRaw = this.extractArray(allProducts);
        const topRaw = this.extractArray(topSelling);

        if (!allRaw.length) {
          this.products = [];
          return;
        }

        const normalizedAll = this.normalizeProducts(allRaw);
        const normalizedTop = this.normalizeProducts(topRaw.length ? topRaw : normalizedAll.map((item) => item.raw));

        this.products = this.selectByMix(normalizedAll, normalizedTop, this.totalItems);
      },
      error: () => {
        this.products = [];
      }
    });
  }

  private selectByMix(allProducts: SpotlightProduct[], topSellingProducts: SpotlightProduct[], totalCount: number): SpotlightProduct[] {
    const bestSellerCount = Math.max(1, Math.round(totalCount * 0.6));
    const newArrivalCount = Math.max(1, Math.round(totalCount * 0.2));
    const strategicCount = Math.max(1, totalCount - bestSellerCount - newArrivalCount);

    const selected = new Map<number, SpotlightProduct>();

    const bestSellerCandidates = this.rankBestSellers(topSellingProducts);
    this.pushUnique(selected, bestSellerCandidates, bestSellerCount);

    const remainingAfterBest = allProducts.filter((item) => !selected.has(item.id));
    const newArrivalCandidates = this.rankNewArrivals(remainingAfterBest);
    this.pushUnique(selected, newArrivalCandidates, bestSellerCount + newArrivalCount);

    const remainingAfterNew = allProducts.filter((item) => !selected.has(item.id));
    const strategicCandidates = this.rankStrategic(remainingAfterNew);
    this.pushUnique(selected, strategicCandidates, bestSellerCount + newArrivalCount + strategicCount);

    if (selected.size < totalCount) {
      const fallback = this.rankBestSellers(allProducts);
      this.pushUnique(selected, fallback, totalCount);
    }

    return Array.from(selected.values()).slice(0, totalCount);
  }

  private rankBestSellers(products: SpotlightProduct[]): SpotlightProduct[] {
    const aged = products.filter((item) => this.isWithinDayRange(this.getDateValue(item.raw), 14, 30));
    const scoredAged = [...aged].sort((a, b) => this.getBestSellerScore(b.raw) - this.getBestSellerScore(a.raw));

    if (scoredAged.length >= 6) {
      return scoredAged;
    }

    const fallback = [...products]
      .filter((item) => !aged.some((agedItem) => agedItem.id === item.id))
      .sort((a, b) => this.getBestSellerScore(b.raw) - this.getBestSellerScore(a.raw));

    return [...scoredAged, ...fallback];
  }

  private rankNewArrivals(products: SpotlightProduct[]): SpotlightProduct[] {
    const recent = products.filter((item) => this.isWithinLastDays(this.getDateValue(item.raw), 14));
    const source = recent.length > 0 ? recent : products;

    return [...source].sort((a, b) => {
      const dateB = this.getDateValue(b.raw)?.getTime() || 0;
      const dateA = this.getDateValue(a.raw)?.getTime() || 0;
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return Number(b.id) - Number(a.id);
    });
  }

  private rankStrategic(products: SpotlightProduct[]): SpotlightProduct[] {
    return [...products].sort((a, b) => this.getStrategicScore(b.raw) - this.getStrategicScore(a.raw));
  }

  private getBestSellerScore(product: any): number {
    const sold = Number(product?.sold || product?.sold_count || product?.total_sold || 0);
    const views = Number(product?.views || product?.view_count || 0);
    const cartAdds = Number(product?.add_to_cart || product?.cart_count || 0);
    return sold * 10 + views * 0.1 + cartAdds * 0.5;
  }

  private getStrategicScore(product: any): number {
    const stock = this.getStockQuantity(product);
    const margin = this.getMarginRatio(product);
    const brandName = (product?.brand_name || product?.brand || '').toString().toUpperCase();
    const campaignBoost = this.strategicBrands.has(brandName) ? 1 : 0;
    const isCampaign = Number(product?.is_campaign || product?.is_featured || 0) > 0 ? 1 : 0;

    return margin * 55 + stock * 0.35 + campaignBoost * 18 + isCampaign * 27;
  }

  private getMarginRatio(product: any): number {
    const basePrice = this.getNumberValue(product?.price || product?.base_price || product?.variants?.[0]?.price);
    const salePrice = this.getNumberValue(product?.price_sale || product?.sale_price || product?.variants?.[0]?.price_sale);

    if (basePrice <= 0) {
      return 0;
    }

    if (salePrice > 0 && salePrice < basePrice) {
      return (basePrice - salePrice) / basePrice;
    }

    return 0.18;
  }

  private getStockQuantity(product: any): number {
    const directStock = this.getNumberValue(product?.stock || product?.inventory || product?.quantity);
    if (directStock > 0) {
      return directStock;
    }

    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      return product.variants.reduce((sum: number, variant: any) => sum + this.getNumberValue(variant?.quantity), 0);
    }

    return 0;
  }

  private getDateValue(product: any): Date | null {
    const rawDate = product?.created_at || product?.createdAt || product?.updated_at || product?.updatedAt || product?.sale_date;
    if (!rawDate) {
      return null;
    }

    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private isWithinLastDays(date: Date | null, days: number): boolean {
    if (!date) {
      return false;
    }

    const now = Date.now();
    const diffDays = (now - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= days;
  }

  private isWithinDayRange(date: Date | null, minDays: number, maxDays: number): boolean {
    if (!date) {
      return false;
    }

    const now = Date.now();
    const diffDays = (now - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= minDays && diffDays <= maxDays;
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

  private normalizeProducts(source: any[]): SpotlightProduct[] {
    const mapped = source.map((product: any) => {
      const productId = Number(product?.id || 0);
      const productName = (product?.name || product?.title || '').toString().trim();

      return {
        id: productId,
        name: productName,
        imageUrl: this.buildImageUrl(product),
        raw: product
      } as SpotlightProduct;
    });

    return mapped.filter((item) => item.id > 0 && item.name.length > 0 && item.imageUrl.length > 0);
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