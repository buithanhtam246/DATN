
import { Component, OnInit, computed, inject, signal, viewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, CartService, FavoritesService } from '../core/services';
import { CartService as CartApiService } from '../services/cart.service';
import { ApiService } from '../services/api.service';
import { Product } from '../core/models';
import { environment } from '../../environments/environment';

interface Review {
  id: number;
  rating: number;
  comment: string;
  customerName?: string;
  created_at?: string;
}

interface Variant {
  id: number;
  colorId: number;
  sizeId: number;
  color?: Color;
  size?: Size;
  price: number;
  priceSale?: number;
  image?: string;
    images?: string[];
  quantity: number;
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

interface ColorVariantPreview {
    id: number;
    name: string;
    imageUrl: string;
    colorCode: string;
    isOutOfStock: boolean;
}

interface ProductWithVariants extends Product {
  variants: Variant[];
  minPrice?: number;
  minPriceSale?: number;
    imagesByColor?: Record<string, string[]>;
    mainColorId?: number;
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
    private cartApiService = inject(CartApiService);
    private apiService = inject(ApiService);
    private favoritesService = inject(FavoritesService);
    private cdr = inject(ChangeDetectorRef);
    public favoriteCount = signal<number>(0);
    
    productTitleRef = viewChild<ElementRef>('productTitleRef');

    // States
    public product = signal<ProductWithVariants | null>(null);
    public selectedColorId = signal<number | null>(null);
    public selectedSizeId = signal<number | null>(null);
    public quantity = signal<number>(1);
    public currentImageIndex = signal<number>(0);
    public isLoading = signal<boolean>(true);
    public isFavorited = signal<boolean>(false);
    public relatedProducts = signal<ProductWithVariants[]>([]);
    public isDescriptionOpen = signal<boolean>(false);
    public isDeliveryOpen = signal<boolean>(false);
    public isReviewsOpen = signal<boolean>(false);
    public showSizeGuideModal = signal<boolean>(false);
    public sizeGuideImage = signal<string | null>(null);
    public isLoadingGuide = signal<boolean>(false);
    public reviews = signal<Review[]>([]);
    public isReviewsLoading = signal<boolean>(false);
    public sizeLookup = signal<Record<number, string>>({});
    
    // Zoom trạng thái hover trên ảnh chính
    public isImageHovering = signal<boolean>(false);
    public zoomOrigin = signal<string>('50% 50%');
    public readonly zoomScale = 2.2;
    
    // Image transition animation
    public imageOpacity = signal<number>(1);
    
    // Signal lưu ảnh được hiển thị
    public displayedImage = signal<string>('');

    // Constructor - setup effects
    constructor() {
        // Trigger change detection khi currentImageIndex thay đổi
        effect(() => {
            const variantImg = this.variantImage();
            const currentImg = this.currentImage();
            const newImage = currentImg || variantImg || '';
            console.log('📸 Effect triggered - setting displayedImage to:', newImage);
            this.displayedImage.set(newImage);
            this.cdr.markForCheck();
        });

        // Subscribe to counts updates to keep count reactive while on page
        this.favoritesService.counts$.subscribe(() => {
            const p = this.product();
            if (p && p.id) {
                this.favoriteCount.set(this.favoritesService.getCount(p.id));
                this.cdr.markForCheck();
            }
        });
    }

    private resolveProductImageUrl(imageName?: string | null): string {
        if (!imageName) return '';

        const raw = String(imageName).trim();
        if (!raw) return '';

        if (raw.startsWith('http://') || raw.startsWith('https://')) {
            return raw;
        }

        if (raw.includes('/public/images/products/') || raw.includes('/images/products/')) {
            return raw;
        }

        return `http://localhost:3000/public/images/products/${raw}`;
    }

    private normalizeImageKey(imageUrl?: string | null): string {
        if (!imageUrl) return '';

        const raw = String(imageUrl).trim();
        if (!raw) return '';

        const marker = '/public/images/products/';
        const markerIndex = raw.indexOf(marker);
        if (markerIndex >= 0) {
            return raw.substring(markerIndex + marker.length).toLowerCase();
        }

        return (raw.split('/').pop() || raw).toLowerCase();
    }

    // Computed data
    public activeColorObj = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        if (!p || !cId) return null;
        const variant = p.variants.find((v: Variant) => v.colorId === cId);
        return variant?.color || null;
    });

    // Ảnh hiện tại dựa trên currentImageIndex
    public galleryImages = computed<string[]>(() => {
        const p = this.product();
        if (!p) return [];

        const baseImages = Array.isArray(p.images) ? p.images.filter((image) => !!image) : [];
        const selectedColor = this.selectedColorId();

        if (!selectedColor) {
            const uniqueBaseImages = Array.from(new Set(baseImages));
            return uniqueBaseImages.length > 0 ? uniqueBaseImages : (p.imageUrl ? [p.imageUrl] : []);
        }

        const colorVariantImages = p.variants
            .filter((variant: Variant) => variant.colorId === selectedColor)
            .flatMap((variant: Variant) => {
                const variantImages = Array.isArray(variant.images) && variant.images.length > 0
                    ? variant.images
                    : (variant.image ? [variant.image] : []);
                return variantImages.filter((image) => !!image);
            });

        const colorImagesFromProduct = Array.isArray(p.imagesByColor?.[String(selectedColor)])
            ? p.imagesByColor![String(selectedColor)].filter((image) => !!image)
            : [];

        const isMainColor = p.mainColorId !== undefined && p.mainColorId !== null && selectedColor === p.mainColorId;

        const colorImages = Array.from(new Set([
            ...colorVariantImages,
            ...colorImagesFromProduct
        ].filter((image) => !!image)));

        if (colorImages.length > 0) {
            if (isMainColor) {
                const mergedWithCommon = Array.from(new Set([
                    ...colorImages,
                    ...baseImages
                ].filter((image) => !!image)));
                return mergedWithCommon.length > 0 ? mergedWithCommon : colorImages;
            }

            return colorImages;
        }

        const uniqueBaseImages = Array.from(new Set(baseImages));
        return uniqueBaseImages.length > 0 ? uniqueBaseImages : (p.imageUrl ? [p.imageUrl] : []);
    });

    public currentImage = computed(() => {
        const p = this.product();
        const index = this.currentImageIndex();
        const images = this.galleryImages();

        if (!p || images.length === 0) {
            return p?.imageUrl || '';
        }

        return images[index] || images[0];
    });

    // Danh sách biến thể màu kèm ảnh đại diện
    public colorVariants = computed<ColorVariantPreview[]>(() => {
        const p = this.product();
        if (!p || !p.variants) return [];

        const fallbackImage = p.images?.[0] || p.imageUrl || '';
        const uniqueColors = new Map<number, ColorVariantPreview>();

        p.variants.forEach((v: Variant) => {
            if (!v.color || uniqueColors.has(v.colorId)) {
                return;
            }

            const totalQuantityByColor = p.variants
                .filter((variant: Variant) => variant.colorId === v.colorId)
                .reduce((sum: number, variant: Variant) => sum + (variant.quantity || 0), 0);

            uniqueColors.set(v.colorId, {
                id: v.colorId,
                name: v.color.name || `Màu ${v.colorId}`,
                imageUrl: (Array.isArray(v.images) && v.images.length > 0
                    ? v.images[0]
                    : (p.imagesByColor?.[String(v.colorId)]?.[0] || v.image)) || fallbackImage,
                colorCode: v.color.tableColor || '#f5f5f5',
                isOutOfStock: totalQuantityByColor <= 0
            });
        });

        return Array.from(uniqueColors.values());
    });

    // Lấy size từ variants của sản phẩm thay vì hardcode
    public displaySizes = computed<DisplaySize[]>(() => {
        const p = this.product();
        if (!p || !p.variants) return [];

        const uniqueSizes = new Map<number, string>();
        p.variants.forEach((v: Variant) => {
            if (!v.sizeId || uniqueSizes.has(v.sizeId)) {
                return;
            }

            const label = this.getVariantSizeLabel(v);
            if (!label) {
                return;
            }

            uniqueSizes.set(v.sizeId, label);
        });

        return Array.from(uniqueSizes.entries())
            .map(([id, bangSize]) => ({ id, bangSize }))
            .sort((a, b) => {
                const aNum = Number.parseFloat(a.bangSize);
                const bNum = Number.parseFloat(b.bangSize);
                const bothNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);
                return bothNumeric ? aNum - bNum : a.bangSize.localeCompare(b.bangSize);
            });
    });

    // Check xem size có available cho màu đã chọn không
    public isSizeAvailable(sizeId: number): boolean {
        const p = this.product();
        const cId = this.selectedColorId();
        if (!p || !cId) return false;

        // Size khả dụng khi tồn tại biến thể đúng màu + size và còn tồn kho
        return p.variants.some((v: Variant) =>
            v.colorId === cId &&
            v.sizeId === sizeId &&
            Number(v.quantity || 0) > 0
        );
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

    // Lấy image của variant được chọn
    public variantImage = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        const sId = this.selectedSizeId();

        if (!p || !cId || !sId) return undefined;

        // Tìm variant có màu và size này
        const variant = p.variants.find((v: Variant) => v.colorId === cId && v.sizeId === sId);
        return variant?.image;
    });

    // Lấy ảnh hiển thị - ưu tiên variant image, nếu không có thì dùng current image
    public displayImage = computed(() => {
        // Nếu người dùng chọn cả màu và size, hiển thị ảnh variant
        const variantImg = this.variantImage();
        if (variantImg) {
            return variantImg;
        }
        // Nếu không, hiển thị ảnh từ thumbnail được chọn
        return this.currentImage();
    });

    // Lấy số lượng tồn kho của variant được chọn
    public availableQuantity = computed(() => {
        const p = this.product();
        const cId = this.selectedColorId();
        const sId = this.selectedSizeId();

        if (!p || !cId || !sId) return 0;

        // Tìm variant có màu và size này
        const variant = p.variants.find((v: Variant) => v.colorId === cId && v.sizeId === sId);
        return variant?.quantity || 0;
    });

    public shouldDimProductImages = computed(() => {
        const p = this.product();
        if (!p || !p.variants || p.variants.length === 0) {
            return false;
        }

        const selectedColorId = this.selectedColorId();
        const selectedSizeId = this.selectedSizeId();

        if (selectedColorId && selectedSizeId) {
            const selectedVariant = p.variants.find(
                (variant: Variant) => variant.colorId === selectedColorId && variant.sizeId === selectedSizeId
            );
            return (selectedVariant?.quantity || 0) <= 0;
        }

        if (selectedColorId) {
            const totalColorStock = p.variants
                .filter((variant: Variant) => variant.colorId === selectedColorId)
                .reduce((sum: number, variant: Variant) => sum + (variant.quantity || 0), 0);
            return totalColorStock <= 0;
        }

        const totalProductStock = p.variants.reduce(
            (sum: number, variant: Variant) => sum + (variant.quantity || 0),
            0
        );
        return totalProductStock <= 0;
    });

    ngOnInit(): void {
        this.loadSizeLookup();

        // Lắng nghe thay đổi ID trên URL
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            console.log('🔗 Route param id:', idParam);
            if (idParam) {
                const idNumber = parseInt(idParam, 10);
                console.log('🔗 Parsed ID:', idNumber);
                this.loadProductDetails(idNumber);
            }
        });
    }

    private loadSizeLookup(): void {
        this.productService.getSizes().subscribe({
            next: (response: any) => {
                const rawSizes = Array.isArray(response)
                    ? response
                    : (Array.isArray(response?.data) ? response.data : []);

                const lookup = rawSizes.reduce((acc: Record<number, string>, item: any) => {
                    const id = Number(item?.id);
                    const sizeValue = item?.size;

                    if (Number.isFinite(id) && sizeValue !== undefined && sizeValue !== null) {
                        acc[id] = String(sizeValue).trim();
                    }

                    return acc;
                }, {});

                this.sizeLookup.set(lookup);
            },
            error: () => {
                this.sizeLookup.set({});
            }
        });
    }

    private getVariantSizeLabel(variant: Variant): string {
        const directLabel = (variant.size?.bangSize || '').toString().trim();
        if (directLabel) {
            return directLabel;
        }

        const lookupLabel = this.sizeLookup()[variant.sizeId];
        if (lookupLabel) {
            return lookupLabel;
        }

        return variant.sizeId ? String(variant.sizeId) : '';
    }

    private loadProductDetails(id: number): void {
        this.isLoading.set(true);
        // Cuộn lên đầu trang mỗi lần đổi sản phẩm
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.productService.getProductById(id.toString()).subscribe({
            next: (response: any) => {
                console.log('📦 API Response:', response);
                
                // API trả về { success, message, data: product }
                const p = response.data || response;
                
                console.log('📊 Product data:', p);
                console.log('📊 Variants:', p?.variants);
                console.log('📊 Images:', p?.images);
                
                if (p) {
                    // Xử lý images array - chuyển thành full URLs
                    let imagesArray: string[] = [];
                    
                    // Nếu API trả về images (JSON array)
                    if (p.images) {
                        try {
                            // Nếu images là string, parse nó
                            const parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                            if (Array.isArray(parsedImages)) {
                                imagesArray = parsedImages.map((img: string) => 
                                    this.resolveProductImageUrl(img)
                                ).filter((img: string) => !!img);
                            }
                        } catch (e) {
                            console.warn('Failed to parse images:', e);
                            // Fallback: sử dụng ảnh chính
                            if (p.image) {
                                const fallbackImage = this.resolveProductImageUrl(p.image);
                                imagesArray = fallbackImage ? [fallbackImage] : [];
                            }
                        }
                    } else if (p.image) {
                        // Fallback: nếu không có images, dùng image chính
                        const fallbackImage = this.resolveProductImageUrl(p.image);
                        imagesArray = fallbackImage ? [fallbackImage] : [];
                    }

                    let imagesByColor: Record<string, string[]> = {};
                    const rawImagesByColor = p.images_by_color;

                    if (rawImagesByColor) {
                        let parsedByColor = rawImagesByColor;
                        if (typeof parsedByColor === 'string') {
                            try {
                                parsedByColor = JSON.parse(parsedByColor);
                            } catch {
                                parsedByColor = {};
                            }
                        }

                        if (parsedByColor && typeof parsedByColor === 'object') {
                            imagesByColor = Object.entries(parsedByColor).reduce((acc: Record<string, string[]>, [colorKey, value]) => {
                                const imageList = Array.isArray(value) ? value : [];
                                const normalized = imageList
                                    .map((image) => this.resolveProductImageUrl(image as string))
                                    .filter((image) => !!image);

                                if (normalized.length > 0) {
                                    acc[colorKey] = Array.from(new Set(normalized));
                                }

                                return acc;
                            }, {});
                        }
                    }

                    const normalizedProductImageKey = this.normalizeImageKey(this.resolveProductImageUrl(p.image));
                    const mainVariant = (p.variants || []).find((variant: any) => {
                        const candidateImages = Array.isArray(variant.images) && variant.images.length > 0
                            ? variant.images
                            : (variant.image ? [variant.image] : []);

                        return candidateImages.some((image: string) => this.normalizeImageKey(this.resolveProductImageUrl(image)) === normalizedProductImageKey);
                    });

                    const mainColorId = mainVariant?.color_id ?? (p.variants?.[0]?.color_id ?? null);
                    
                    // Map dữ liệu từ API sang component data
                    const productData: ProductWithVariants = {
                        ...p,
                        title: p.title || p.name,  // Map name → title nếu title không có
                        description: (p.description ?? p.describ ?? p.describtion ?? p.descrip ?? '') || undefined,
                        imageUrl: this.resolveProductImageUrl(p.image),
                        images: imagesArray.length > 0 ? imagesArray : [this.resolveProductImageUrl(p.image)].filter((img: string) => !!img),
                        imagesByColor,
                        mainColorId,
                        variants: (p.variants || []).map((v: any) => {
                            const rawVariantImages = Array.isArray(v.images)
                                ? v.images
                                : (typeof v.images === 'string'
                                    ? (() => {
                                        try {
                                            const parsed = JSON.parse(v.images);
                                            return Array.isArray(parsed) ? parsed : [v.images];
                                        } catch {
                                            return [v.images];
                                        }
                                    })()
                                    : []);

                            const normalizedVariantImages = rawVariantImages
                                .map((image: string) => this.resolveProductImageUrl(image))
                                .filter((image: string) => !!image);

                            const normalizedPrimaryVariantImage = this.resolveProductImageUrl(v.image) || '';
                            const mergedVariantImages = Array.from(new Set([
                                ...normalizedVariantImages,
                                ...([normalizedPrimaryVariantImage].filter((image: string) => !!image))
                            ]));

                            return {
                                id: v.id,
                                colorId: v.color_id,
                                sizeId: v.size_id,
                                price: parseFloat(v.price),
                                priceSale: v.price_sale ? parseFloat(v.price_sale) : undefined,
                                quantity: v.quantity || 0,
                                image: normalizedPrimaryVariantImage || mergedVariantImages[0] || undefined,
                                images: mergedVariantImages,
                                color: {
                                    id: v.color_id,
                                    tableColor: v.color_code || '#000000',
                                    name: v.color_name || 'Unknown Color'
                                },
                                size: {
                                    id: v.size_id,
                                    bangSize: (v.size_name ?? v.size ?? v.bang_size ?? '').toString().trim()
                                }
                            };
                        })
                    };
                    
                    // Tính giá min/max
                    if (productData.variants.length > 0) {
                        const prices = productData.variants.map(v => v.price);
                        const salePrices = productData.variants.filter(v => v.priceSale).map(v => v.priceSale!);
                        productData.minPrice = Math.min(...prices);
                        productData.minPriceSale = salePrices.length > 0 ? Math.min(...salePrices) : undefined;
                    }
                    
                    this.product.set(productData);
                    console.log('✅ Product set:', productData);
                    console.log('🎨 Color Variants:', this.colorVariants());
                    console.log('📏 Display Sizes:', this.displaySizes());
                    this.currentImageIndex.set(0);
                    this.quantity.set(1);

                                        // Set favorite state and count for this product
                                        try {
                                            const pid = productData.id as number | string;
                                            this.isFavorited.set(this.favoritesService.isFavorite(pid));
                                            this.favoriteCount.set(this.favoritesService.getCount(pid));
                                        } catch (e) {
                                            this.isFavorited.set(false);
                                            this.favoriteCount.set(0);
                                        }

                    // Auto select first color
                    if (productData.variants && productData.variants.length > 0) {
                        const uniqueColorIds = [...new Set(productData.variants.map((v: Variant) => v.colorId))];
                        if (uniqueColorIds.length > 0) {
                            const firstColorId = uniqueColorIds[0] as number;
                            this.selectColor(firstColorId);
                        }
                    }
                    this.isLoading.set(false);

                    // Load size guide based on product category parent
                    this.loadSizeGuide(productData);

                    // Load related products: cùng danh mục con + mới nhất
                    const currentCategoryId = Number((productData as any).category_id || 0);
                    const currentProductId = Number(productData.id || 0);

                    this.productService.getRecommendedProducts(8, currentCategoryId, currentProductId).subscribe((relatedResponse: any) => {
                        const relatedList = relatedResponse.data || relatedResponse || [];

                        const mappedList = relatedList
                            .map((relatedProduct: any) => {
                                const variants = Array.isArray(relatedProduct.variants) ? relatedProduct.variants : [];
                                const variantPrices = variants
                                    .map((variant: any) => Number(variant.price || 0))
                                    .filter((price: number) => price > 0);
                                const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;

                                const resolvedImage = this.resolveProductImageUrl(relatedProduct.image)
                                    || relatedProduct.imageUrl
                                    || '/assets/placeholder.png';

                                return {
                                    ...relatedProduct,
                                    title: relatedProduct.title || relatedProduct.name || 'Sản phẩm',
                                    brand: relatedProduct.brand || relatedProduct.brand_name || 'Thương hiệu',
                                    price: relatedProduct.price || minVariantPrice || 0,
                                    imageUrl: resolvedImage
                                };
                            })
                            .filter((relatedProduct: any) => Number(relatedProduct.id) !== currentProductId)
                            .slice(0, 4);

                        this.relatedProducts.set(mappedList as ProductWithVariants[]);
                    });

                    // Load reviews for this variant
                    if (productData.variants && productData.variants.length > 0) {
                        const firstVariant = productData.variants[0];
                        this.loadReviews(firstVariant.id);
                    }
                } else {
                    this.isLoading.set(false);
                    this.router.navigate(['/products']);
                }
            },
            error: (err) => {
                console.error('Error loading product:', err);
                this.isLoading.set(false);
                this.router.navigate(['/products']);
            }
        });
    }

    // Load size guide image based on product's parent category
    private loadSizeGuide(product: ProductWithVariants): void {
        // Get parent category ID from product
        // parent_id comes from categories table via API
        const parentId = (product as any).parent_id;
        
        console.log('🔍 Loading size guide - parent_id:', parentId, 'product:', product.title);
        
        if (!parentId) {
            console.log('⚠️ No parent category found for product, trying with category_id');
            // Fallback: if no parent_id, use category_id as is
            const categoryId = (product as any).category_id;
            if (!categoryId) {
                console.log('❌ No category_id found either');
                return;
            }
            this.loadGuideForCategory(categoryId);
            return;
        }

        this.loadGuideForCategory(parentId);
    }

    private loadGuideForCategory(categoryId: number): void {
        console.log('📍 Fetching size guide for category:', categoryId);
        this.isLoadingGuide.set(true);
        
        this.productService.getSizeGuideByCategory(categoryId).subscribe({
            next: (res: any) => {
                console.log('✅ Size guide response:', res);
                if (res && res.data && res.data.image_url) {
                    const baseUrl = environment.apiUrl.replace('/api', '');
                    const imageUrl = `${baseUrl}/uploads/size-guides/${res.data.image_url}`;
                    this.sizeGuideImage.set(imageUrl);
                    console.log('✅ Size guide loaded:', imageUrl);
                } else {
                    console.log('⚠️ No image_url in response');
                    this.sizeGuideImage.set(null);
                }
                this.isLoadingGuide.set(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.log('❌ Error loading size guide:', err);
                this.sizeGuideImage.set(null);
                this.isLoadingGuide.set(false);
                this.cdr.markForCheck();
            }
        });
    }

    // Actions
    selectColor(colorId: number): void {
        const previousSizeId = this.selectedSizeId();

        this.selectedColorId.set(colorId);
        this.currentImageIndex.set(0);

        // Giữ size đã chọn nếu size đó vẫn còn ở màu mới
        if (previousSizeId && this.isSizeAvailable(previousSizeId)) {
            this.selectedSizeId.set(previousSizeId);
        } else {
            // Auto-select size đầu tiên có sẵn
            const firstAvailableSize = this.displaySizes().find(s => this.isSizeAvailable(s.id));
            this.selectedSizeId.set(firstAvailableSize ? firstAvailableSize.id : null);
        }

        const nextImages = this.galleryImages();
        if (nextImages.length > 0) {
            this.displayedImage.set(nextImages[0]);
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

    loadReviews(variantId: number): void {
        this.isReviewsLoading.set(true);
        this.apiService.getProductReviews(variantId).subscribe({
            next: (response: any) => {
                if (response.success && response.data && response.data.reviews) {
                    this.reviews.set(response.data.reviews);
                }
                this.isReviewsLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading reviews:', err);
                this.reviews.set([]);
                this.isReviewsLoading.set(false);
            }
        });
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
        const images = this.galleryImages();
        console.log('🖼️ selectImage called:', index);
        console.log('🖼️ gallery images:', images);
        console.log('🖼️ gallery images length:', images.length);
        
        if (!images.length) {
            console.warn('❌ No gallery images');
            return;
        }
        
        // Đảm bảo index hợp lệ
        if (index >= 0 && index < images.length) {
            console.log('✅ Index valid, setting opacity to 0');
            // Fade out
            this.imageOpacity.set(0);
            
            // Delay để fade out hoàn thành, sau đó đổi ảnh
            setTimeout(() => {
                console.log('✅ Setting currentImageIndex to:', index);
                this.currentImageIndex.set(index);
                
                // Get the new image URL
                const newImage = images[index];
                console.log('✅ New image:', newImage);
                this.displayedImage.set(newImage);
                
                // Also update DOM directly
                const imgElement = document.querySelector('.main-img') as HTMLImageElement;
                if (imgElement) {
                    imgElement.src = newImage;
                    console.log('✅ Updated IMG src directly');
                }
                
                // Fade in
                console.log('✅ Setting opacity to 1');
                this.imageOpacity.set(1);
            }, 150);
        } else {
            console.warn('❌ Index invalid:', index, 'length:', images.length);
        }
    }

    incrementQuantity(): void {
        this.quantity.update(q => q + 1);
    }

    decrementQuantity(): void {
        this.quantity.update(q => (q > 1 ? q - 1 : 1));
    }

    onQuantityInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const parsedValue = Number(input.value);

        if (!Number.isFinite(parsedValue)) {
            this.quantity.set(1);
            return;
        }

        this.quantity.set(Math.max(1, Math.floor(parsedValue)));
    }

    canIncrementQuantity(): boolean {
        return this.quantity() < this.availableQuantity();
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

        const selectedSizeId = this.selectedSizeId();
        const selectedColorId = this.selectedColorId();
        const priceInfo = this.currentVariantPrice();
        const availableStock = this.availableQuantity();
        const requestedQuantity = this.quantity();

        const selectedVariant = p.variants.find(
            (v: Variant) => v.colorId === selectedColorId && v.sizeId === selectedSizeId
        );

        if (!selectedVariant) {
            alert('Biến thể sản phẩm không tồn tại!');
            return;
        }

        // Kiểm tra số lượng có đủ không
        if (requestedQuantity > availableStock) {
            alert(`Số lượng không đủ!\nSố lượng yêu cầu: ${requestedQuantity}\nTồn kho: ${availableStock}`);
            return;
        }

        // Gọi API backend để thêm vào giỏ và giảm tồn kho
        const addToCartRequest = this.cartApiService.addToCart(selectedVariant.id, requestedQuantity);

        addToCartRequest.subscribe({
            next: (response: any) => {
                if (response.success) {
                    // Chuẩn bị dữ liệu để lưu vào localStorage
                    const selectedColor =
                        selectedVariant?.color?.name ||
                        selectedVariant?.color?.tableColor ||
                        this.activeColorObj()?.name ||
                        this.activeColorObj()?.tableColor ||
                        '';
                    const selectedSizeValue = Number.parseInt(selectedVariant?.size?.bangSize || '', 10);
                    const cartSize = Number.isNaN(selectedSizeValue) ? (selectedSizeId || 0) : selectedSizeValue;
                    
                    // Get variant image if available
                    const variantImage = selectedVariant?.image || p.imageUrl;
                    
                    // Lấy tên từ product.title
                    let productName = p.title || 'Sản phẩm không tên';
                    if (!p.title && this.productTitleRef()) {
                        const headingText = this.productTitleRef()?.nativeElement?.textContent?.trim();
                        productName = headingText || 'Sản phẩm không tên';
                    }
                    
                    const priceInfo = this.currentVariantPrice();
                    
                    const cartItem = {
                        id: `${p.id}_${selectedColorId}_${selectedSizeId}`,
                        variant_id: selectedVariant.id,
                        name: productName,
                        price: priceInfo.price,
                        priceSale: priceInfo.salePrice,
                        image: variantImage,
                        color: selectedColor,
                        size: cartSize,
                        quantity: requestedQuantity
                    };
                    
                    // Lưu vào localStorage theo user hiện tại
                    const cart = this.cartApiService.getCartFromStorage();
                    const existingIndex = cart.findIndex((item: any) => item.id === cartItem.id);
                    
                    if (existingIndex > -1) {
                        // Replace quantity with the user's requested quantity instead of incrementing.
                        // This avoids surprising increases when backend/cart already had a different quantity.
                        cart[existingIndex].quantity = cartItem.quantity;
                    } else {
                        cart.push(cartItem);
                    }
                    
                    this.cartApiService.setCartToStorage(cart);
                    // Refresh server-backed cart view (will fetch real quantities from backend)
                    try { this.cartApiService.getCart(); } catch (e) { /* ignore */ }
                    
                    alert('Đã thêm sản phẩm vào giỏ hàng!');
                    this.quantity.set(1); // Reset quantity
                    
                    // Reload product details để cập nhật tồn kho từ backend
                    const productId = this.product()?.id;
                    if (productId) {
                        this.loadProductDetails(parseInt(productId.toString(), 10));
                    }
                } else {
                    alert('Lỗi: ' + (response.message || 'Không thể thêm vào giỏ hàng'));
                }
            },
            error: (error: any) => {
                console.error('Error adding to cart:', error);
                alert('Lỗi: ' + (error.error?.message || 'Không thể thêm vào giỏ hàng'));
            }
        });
    }

    onToggleFavorite(): void {
        const p = this.product();
        if (!p) return;

        const favItem = {
            id: (p.id ?? '') as number | string,
            name: p.title || 'Sản phẩm',
            image: p.imageUrl || (Array.isArray(p.images) && p.images[0]) || '',
            price: this.currentVariantPrice().salePrice ?? this.currentVariantPrice().price ?? 0
        };

        try {
            const result = this.favoritesService.toggle(favItem);
            this.isFavorited.set(!!result);
            // Optional: simple alert to user
            if (result) {
                // added
                // Using window.alert for now; the project has a NotificationService that can be used later
                // window.alert('Đã thêm vào yêu thích');
            } else {
                // window.alert('Đã bỏ yêu thích');
            }
        } catch (e) {
            console.error('Error toggling favorite', e);
        }
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