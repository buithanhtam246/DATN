
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, CartService } from '../core/services';
import { Product } from '../core/models';

interface Variant {
  id: number;
  colorId: number;
  sizeId: number;
  color?: Color;
  size?: Size;
  price: number;
  priceSale?: number;
}

interface Color {
  id: number;
  tableColor: string;
  name?: string;
}

interface Size {
  id: number;
  bangSize: string;
  name?: string;
}

interface DisplaySize {
    id: number;
    bangSize: string;
}

interface ProductWithVariants extends Product {
  variants: Variant[];
  minPrice?: number;
  minPriceSale?: number;
}

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productService = inject(ProductService);
    private cartService = inject(CartService);

    // States
    public product = signal<ProductWithVariants | null>(null);
    public selectedColorId = signal<number | null>(null);
    public selectedSizeId = signal<number | null>(null);
    public quantity = signal<number>(1);
    public currentImageIndex = signal<number>(0);
    public isLoading = signal<boolean>(true);
    public relatedProducts = signal<ProductWithVariants[]>([]);
    public isDescriptionOpen = signal<boolean>(false);
    public isDeliveryOpen = signal<boolean>(false);
    public isReviewsOpen = signal<boolean>(false);
    public showSizeGuideModal = signal<boolean>(false);
    public sizeGuideImage = signal<string | null>(null);
    public isLoadingGuide = signal<boolean>(false);
    
    // Zoom trạng thái hover trên ảnh chính
    public isImageHovering = signal<boolean>(false);
    public zoomOrigin = signal<string>('50% 50%');
    public readonly zoomScale = 2.2;

    // Computed data
    public activeColorObj = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        if (!p || !cId) return null;
        const variant = p.variants.find((v: Variant) => v.colorId === cId);
        return variant?.color || null;
    });

    // Ảnh hiện tại dựa trên currentImageIndex
    public currentImage = computed(() => {
        const p = this.product();
        const index = this.currentImageIndex();
        if (!p || !p.images || p.images.length === 0) {
            return p?.imageUrl || '';
        }
        return p.images[index] || p.images[0];
    });

    // Danh sách màu cố định (4 màu)
    public displayColors = computed(() => {
        const p = this.product();
        if (!p || !p.variants) return [];
        
        // Lấy tối đa 4 màu unique từ variants
        const uniqueColors = new Map<number, Color>();
        p.variants.forEach((v: Variant) => {
            if (v.color && uniqueColors.size < 4 && !uniqueColors.has(v.colorId)) {
                uniqueColors.set(v.colorId, v.color);
            }
        });
        return Array.from(uniqueColors.values());
    });

    // Lấy size từ variants của sản phẩm thay vì hardcode
    public displaySizes = computed<DisplaySize[]>(() => {
        const p = this.product();
        if (!p || !p.variants) return [];

        const uniqueSizes = new Map<number, string>();
        p.variants.forEach((v: Variant) => {
            if (v.sizeId && v.size?.bangSize && !uniqueSizes.has(v.sizeId)) {
                uniqueSizes.set(v.sizeId, v.size.bangSize);
            }
        });

        return Array.from(uniqueSizes.entries())
            .map(([id, bangSize]) => ({ id, bangSize }))
            .sort((a, b) => parseInt(a.bangSize, 10) - parseInt(b.bangSize, 10));
    });

    // Check xem size có available cho màu đã chọn không
    public isSizeAvailable(sizeId: number): boolean {
        const p = this.product();
        const cId = this.selectedColorId();
        if (!p || !cId) return false;

        // Tìm variant có màu và size này
        return p.variants.some((v: Variant) => v.colorId === cId && v.sizeId === sizeId);
    }

    public currentVariantPrice = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        const sId = this.selectedSizeId();

        if (!p) return { price: 0, salePrice: undefined };

        // Nếu chọn đủ màu và size
        if (cId && sId) {
            const variant = p.variants.find((v: Variant) => v.colorId === cId && v.sizeId === sId);
            if (variant) {
                return { price: variant.price, salePrice: variant.priceSale };
            }
        }
        // Trả về mức giá min/max chung
        return { price: p.minPrice || 0, salePrice: p.minPriceSale };
    });

    ngOnInit(): void {
        // Lắng nghe thay đổi ID trên URL
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                this.loadProductDetails(parseInt(idParam, 10));
            }
        });
    }

    private loadProductDetails(id: number): void {
        this.isLoading.set(true);
        // Cuộn lên đầu trang mỗi lần đổi sản phẩm
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.productService.getProductById(id.toString()).subscribe(p => {
            if (p) {
                this.product.set(p as ProductWithVariants);
                this.currentImageIndex.set(0); // Reset ảnh về đầu
                this.quantity.set(1); // Reset số lượng

                // Auto select first color
                const productWithVariants = p as ProductWithVariants;
                if (productWithVariants.variants && productWithVariants.variants.length > 0) {
                    const uniqueColorIds = [...new Set(productWithVariants.variants.map((v: Variant) => v.colorId))];
                    if (uniqueColorIds.length > 0) {
                        const firstColorId = uniqueColorIds[0] as number;
                        this.selectColor(firstColorId);
                    }
                }
                this.isLoading.set(false);

                // Load related products
                this.productService.getRecommendedProducts(4).subscribe((related: Product[]) => {
                    this.relatedProducts.set(related as ProductWithVariants[]);
                });
            } else {
                // Xử lý Not Found
                this.isLoading.set(false);
                this.router.navigate(['/products']);
            }
        });
    }

    // Actions
    selectColor(colorId: number): void {
        this.selectedColorId.set(colorId);

        // Reset size chọn trước đó do mỗi màu có thể có kho size khác nhau
        this.selectedSizeId.set(null);

        // Auto-select size đầu tiên có sẵn
        const firstAvailableSize = this.displaySizes().find(s => this.isSizeAvailable(s.id));
        if (firstAvailableSize) {
            this.selectedSizeId.set(firstAvailableSize.id);
        }
    }

    selectSize(sizeId: number): void {
        this.selectedSizeId.set(sizeId);
    }

    isLightColor(hexColor: string): boolean {
        // Convert hex to RGB and calculate luminance
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.6;
    }

    toggleDescription(): void {
        this.isDescriptionOpen.set(!this.isDescriptionOpen());
    }

    toggleDelivery(): void {
        this.isDeliveryOpen.set(!this.isDeliveryOpen());
    }

    toggleReviews(): void {
        this.isReviewsOpen.set(!this.isReviewsOpen());
    }

    openSizeGuideModal(): void {
        const p = this.product();
        if (!p || !p.category) return;

        this.showSizeGuideModal.set(true);
        this.isLoadingGuide.set(true);

        // Giả sử category là ID hoặc có thể lấy từ categories array
        // Tạm thời lấy category ID từ tên (tìm trong categories array)
        const categoryId = (p as any).categoryId || 1; // Placeholder - cần update logic thực tế
        
        if (!categoryId) {
            this.isLoadingGuide.set(false);
            return;
        }

        // Load size guide from backend
        this.productService.getSizeGuideByCategory(categoryId).subscribe({
            next: (res: any) => {
                if (res.data?.size_guide_image_url) {
                    this.sizeGuideImage.set(`http://localhost:3000/${res.data.size_guide_image_url}`);
                } else {
                    this.sizeGuideImage.set(null);
                }
                this.isLoadingGuide.set(false);
            },
            error: (err: any) => {
                console.error('Error loading size guide:', err);
                this.sizeGuideImage.set(null);
                this.isLoadingGuide.set(false);
            }
        });
    }

    closeSizeGuideModal(): void {
        this.showSizeGuideModal.set(false);
        this.sizeGuideImage.set(null);
    }

    selectImage(index: number): void {
        const p = this.product();
        if (!p || !p.images) return;
        
        // Đảm bảo index hợp lệ
        if (index >= 0 && index < p.images.length) {
            this.currentImageIndex.set(index);
        }
    }

    incrementQuantity(): void {
        this.quantity.update(q => q + 1);
    }

    decrementQuantity(): void {
        this.quantity.update(q => (q > 1 ? q - 1 : 1));
    }

    onImageEnter(): void {
        // Tránh zoom trên thiết bị nhỏ/touch để không bị giật
        if (window.innerWidth <= 1024) return;
        this.isImageHovering.set(true);
    }

    onImageLeave(): void {
        this.isImageHovering.set(false);
        this.zoomOrigin.set('50% 50%');
    }

    onImageHover(event: MouseEvent): void {
        if (!this.isImageHovering()) return;

        const target = event.currentTarget as HTMLElement | null;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

        const clampedX = Math.max(0, Math.min(100, xPercent));
        const clampedY = Math.max(0, Math.min(100, yPercent));
        this.zoomOrigin.set(`${clampedX}% ${clampedY}%`);
    }

    addToCart(): void {
        const p = this.product();
        if (!p) return;

        if (!this.selectedColorId() || !this.selectedSizeId()) {
            alert('Vui lòng chọn màu sắc và kích cỡ!');
            return;
        }

        // Call API (hoặc Service)
        const selectedSizeId = this.selectedSizeId();
        const priceInfo = this.currentVariantPrice();

        const selectedVariant = p.variants.find(
            (v: Variant) => v.colorId === this.selectedColorId() && v.sizeId === selectedSizeId
        );
        const selectedColor =
            selectedVariant?.color?.name ||
            selectedVariant?.color?.tableColor ||
            this.activeColorObj()?.name ||
            this.activeColorObj()?.tableColor ||
            '';
        const selectedSizeValue = Number.parseInt(selectedVariant?.size?.bangSize || '', 10);
        const cartSize = Number.isNaN(selectedSizeValue) ? (selectedSizeId || 0) : selectedSizeValue;
        
        const cartItem = {
            id: `${p.id}_${this.selectedColorId()}_${selectedSizeId}`,
            product: {
                id: p.id || '',
                title: p.title,
                imageUrl: p.imageUrl || '',
                brand: p.brand
            },
            selectedColor,
            selectedSize: cartSize,
            quantity: this.quantity(),
            price: priceInfo.salePrice || priceInfo.price,
            originalPrice: priceInfo.salePrice ? priceInfo.price : undefined
        };
        
        this.cartService.addItem(cartItem);
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    }

    // Utilities
    getUniqueColors(variants: Variant[]): Color[] {
        const uniqueIds = new Set();
        const result: Color[] = [];
        for (const v of variants) {
            if (v.color && !uniqueIds.has(v.color.id)) {
                uniqueIds.add(v.color.id);
                result.push(v.color);
            }
        }
        return result;
    }
}