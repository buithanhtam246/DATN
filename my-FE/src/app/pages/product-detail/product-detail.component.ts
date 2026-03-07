import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, CartService } from '../../core/services';
import { Product, Color } from '../../core/models';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, ProductCardComponent],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productService = inject(ProductService);
    private cartService = inject(CartService);

    // States
    public product = signal<Product | null>(null);
    public selectedColorId = signal<number | null>(null);
    public selectedSizeId = signal<number | null>(null);
    public quantity = signal<number>(1);
    public currentImageIndex = signal<number>(0);
    public isLoading = signal<boolean>(true);
    public relatedProducts = signal<Product[]>([]);

    // Computed data
    public activeColorObj = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        if (!p || !cId) return null;
        const variant = p.variants.find(v => v.colorId === cId);
        return variant?.color || null;
    });

    public availableSizesForColor = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        if (!p || !cId) return [];

        // Tìm các sizes thuộc về màu này
        return p.variants
            .filter(v => v.colorId === cId && v.size)
            .map(v => v.size!)
            // Xóa trùng lặp (nếu có)
            .filter((size, index, self) => index === self.findIndex(t => t.id === size.id))
            .sort((a, b) => parseInt(a.bangSize) - parseInt(b.bangSize));
    });

    public currentVariantPrice = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        const sId = this.selectedSizeId();

        if (!p) return { price: 0, salePrice: undefined };

        // Nếu chọn đủ màu và size
        if (cId && sId) {
            const variant = p.variants.find(v => v.colorId === cId && v.sizeId === sId);
            if (variant) {
                return { price: variant.price, salePrice: variant.priceSale };
            }
        }
        // Trả về mức giá min/max chung
        return { price: p.minPrice || 0, salePrice: p.minPriceSale };
    });

    ngOnInit(): void {
        // Lắng nghe thay đổi ID trên URL (để hỗ trợ navigate qua Related Products trên cùng trang)
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

        const p = this.productService.getProductById(id);

        if (p) {
            this.product.set(p);
            this.currentImageIndex.set(0); // Reset ảnh
            this.quantity.set(1); // Reset số lượng

            // Auto select first color
            if (p.variants && p.variants.length > 0) {
                const uniqueColorIds = [...new Set(p.variants.map(v => v.colorId))];
                if (uniqueColorIds.length > 0) {
                    const firstColorId = uniqueColorIds[0];
                    this.selectColor(firstColorId);
                }
            }
            this.isLoading.set(false);

            // Load related products
            this.relatedProducts.set(this.productService.getRelatedProducts(id));

        } else {
            // Xử lý Not Found
            this.isLoading.set(false);
            this.router.navigate(['/products']);
        }
    }

    // Actions
    selectColor(colorId: number): void {
        this.selectedColorId.set(colorId);

        // Reset size chọn trước đó do mỗi màu có thể có kho size khác nhau
        this.selectedSizeId.set(null);

        // Auto-select size đầu tiên nếu mảng có sẵn
        const sizes = this.availableSizesForColor();
        if (sizes.length > 0) {
            this.selectedSizeId.set(sizes[0].id);
        }
    }

    selectSize(sizeId: number): void {
        this.selectedSizeId.set(sizeId);
    }

    selectImage(index: number): void {
        this.currentImageIndex.set(index);
    }

    incrementQuantity(): void {
        this.quantity.update(q => q + 1);
    }

    decrementQuantity(): void {
        this.quantity.update(q => (q > 1 ? q - 1 : 1));
    }

    addToCart(): void {
        const p = this.product();
        if (!p) return;

        if (!this.selectedColorId() || !this.selectedSizeId()) {
            alert('Vui lòng chọn màu sắc và kích cỡ!');
            return;
        }

        // Call API (hoặc Service)
        const colorCode = this.activeColorObj()?.tableColor || undefined;
        this.cartService.addProductToCart(p, this.quantity(), colorCode);
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    }

    // Utilities
    getUniqueColors(variants: any[]): Color[] {
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
