import { Component, ElementRef, HostListener, ViewChild, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../core/services';
import { Product } from '../core/models';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Collection Component
 * 
 * Responsibility: Display new collection section
 * - Show collection header
 * - Display product carousel/grid
 * - Support horizontal drag scrolling
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
  private readonly router = inject(Router);
  @ViewChild('productTrack') private productTrack?: ElementRef<HTMLDivElement>;
  
  public products = signal<Product[]>([]);
  public currentSlide = signal<number>(0);
  public isDragging = signal<boolean>(false);
  public slideCount = computed(() => Math.max(1, Math.ceil(this.products().length / 2)));

  private dragStartX = 0;
  private initialScrollLeft = 0;
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  private loadProducts(): void {
    forkJoin({
      productsResponse: this.productService.getProducts({ limit: 8, sort: 'newest' }).pipe(catchError(() => of([]))),
      sizesResponse: this.productService.getSizes().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ productsResponse, sizesResponse }) => {
        const source = Array.isArray(productsResponse) ? productsResponse : (productsResponse?.data || []);
        if (!Array.isArray(source) || source.length === 0) {
          this.loadMockProducts();
          return;
        }

        const rawSizes = Array.isArray(sizesResponse) ? sizesResponse : (sizesResponse?.data || []);
        const sizeMap = this.buildSizeMap(rawSizes);

        const products = source.map((item: any) => {
          const prices = (item.variants || []).map((variant: any) => ({
            price: parseFloat(variant.price) || 0,
            price_sale: parseFloat(variant.price_sale) || 0
          }));

          const minPrice = prices.length > 0 ? Math.min(...prices.map((priceItem: any) => priceItem.price)) : 0;
          const salePrices = prices
            .map((priceItem: any) => priceItem.price_sale)
            .filter((value: number) => value > 0);
          const minPriceSale = salePrices.length > 0 ? Math.min(...salePrices) : 0;

          const displayPrice = minPriceSale > 0
            ? `${minPriceSale.toLocaleString('vi-VN')} VND`
            : `${minPrice.toLocaleString('vi-VN')} VND`;

          const sizes = this.getProductSizes(item.variants || [], sizeMap);

          return {
            id: item.id?.toString() || '',
            title: item.name || 'Product',
            price: displayPrice,
            imageUrl: item.image ? `http://localhost:3000/public/images/products/${item.image}` : '/assets/images/placeholder.jpg',
            brand: item.brand_name || 'BRAND',
            colors: [],
            sizes
          };
        });

        this.products.set(products.slice(0, 8));
        this.currentSlide.set(0);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loadMockProducts();
      }
    });
  }

  private buildSizeMap(sizes: any[]): Map<number, number> {
    const sizeMap = new Map<number, number>();

    sizes.forEach((sizeItem: any) => {
      const sizeId = Number(sizeItem?.id ?? sizeItem?.size_id ?? 0);
      const sizeValueRaw = sizeItem?.size ?? sizeItem?.bang_size ?? sizeItem?.name;
      const sizeValue = Number(sizeValueRaw);

      if (sizeId > 0 && Number.isFinite(sizeValue) && sizeValue > 0) {
        sizeMap.set(sizeId, sizeValue);
      }
    });

    return sizeMap;
  }

  private getProductSizes(variants: any[], sizeMap: Map<number, number>): number[] {
    const sizes = variants
      .map((variant: any) => {
        const sizeId = Number(variant?.size_id ?? 0);
        if (sizeId <= 0) {
          return null;
        }

        return sizeMap.get(sizeId) ?? sizeId;
      })
      .filter((value: number | null): value is number => value !== null && Number.isFinite(value) && value > 0);

    return Array.from(new Set(sizes)).sort((first, second) => first - second);
  }

  private loadMockProducts(): void {
    // Mock data fallback
    const mockProducts: Product[] = [
      {
        id: '1',
        title: 'Jordan Jumpman MVP',
        price: '4.000.000 VND',
        imageUrl: '/assets/images/products/mvp.jpg',
        brand: 'JORDAN',
        colors: ['#FF6B35', '#F7B731', '#E91E63', '#3B82F6'],
        sizes: [40, 41, 42, 43]
      },
      {
        id: '2',
        title: 'Grand Court Cloudfoam',
        price: '3.500.000 VND',
        imageUrl: '/assets/images/products/superstar.jpg',
        brand: 'ADIDAS',
        colors: ['#FF6B35', '#F7B731', '#E91E63', '#3B82F6'],
        sizes: [40, 41, 42, 43]
      }
    ];
    this.products.set(mockProducts);
    this.currentSlide.set(0);
  }

  previousSlide(): void {
    this.scrollToSlide(this.currentSlide() - 1);
  }

  nextSlide(): void {
    this.scrollToSlide(this.currentSlide() + 1);
  }

  goToSlide(index: number): void {
    this.scrollToSlide(index);
  }

  getSlideIndexes(): number[] {
    return Array.from({ length: this.slideCount() }, (_, index) => index);
  }

  private scrollToSlide(index: number): void {
    const track = this.productTrack?.nativeElement;
    if (!track) {
      return;
    }

    const maxSlide = this.slideCount() - 1;
    const validIndex = Math.max(0, Math.min(index, maxSlide));
    const targetCard = track.children.item(validIndex * 2) as HTMLElement | null;

    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    this.currentSlide.set(validIndex);
  }

  onTrackPointerDown(event: PointerEvent): void {
    const track = this.productTrack?.nativeElement;
    if (!track) {
      return;
    }

    this.isDragging.set(true);
    this.dragStartX = event.clientX;
    this.initialScrollLeft = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  }

  onTrackPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }

    const track = this.productTrack?.nativeElement;
    if (!track) {
      return;
    }

    const deltaX = event.clientX - this.dragStartX;
    track.scrollLeft = this.initialScrollLeft - deltaX;
  }

  stopDragging(): void {
    this.isDragging.set(false);
  }

  @HostListener('document:pointerup')
  onDocumentPointerUp(): void {
    this.stopDragging();
  }

  @HostListener('document:pointercancel')
  onDocumentPointerCancel(): void {
    this.stopDragging();
  }

  viewProductDetail(productId: string): void {
    if (!productId) {
      return;
    }

    this.router.navigate(['/products', productId]);
  }
}