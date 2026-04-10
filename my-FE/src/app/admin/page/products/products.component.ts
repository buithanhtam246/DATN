import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface cho biến thể sản phẩm
interface Variant {
  id?: number;
  color_id: number | null;
  size_id: number | null;
  selected_sizes: number[];  // Array để chọn nhiều sizes
  price: number;
  price_sale: number;
  quantity: number;
  image?: string;
  image_previews?: string[];
  image_files?: File[];
}

// Interface cho sản phẩm - Đã thêm các thuộc tính bổ sung để fix lỗi build
interface Product {
  id?: number;
  name: string;
  category_id: number | null;
  brand_id: number | null;
  describ: string;
  variants: Variant[];
  image?: string;
  category_name?: string;
  brand_name?: string;
  price?: number;      // Thêm để fix lỗi TS2339
  price_sale?: number; // Thêm để fix lỗi TS2339
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  parentCategories: any[] = [];
  subCategories: any[] = [];
  allCategories: any[] = [];
  brands: any[] = [];
  colors: any[] = [];
  sizes: any[] = [];
  modalSizes: any[] = [];  // Sizes riêng cho modal
  // (debug removed)
  
  searchQuery: string = '';
  selectedCategoryFilter: string = '';
  selectedBrandFilter: string = '';
  
  showModal: boolean = false;
  editingProduct: Product | null = null;
  selectedFiles: File[] = [];
  selectedFilePreviews: string[] = [];
  isSubmitting: boolean = false;
  isDragOver: boolean = false;
  activeTab: string = 'info';
  
  // Detail modal state
  showDetailModal: boolean = false;
  detailProduct: Product | null = null;
  
  selectedParentCategory: number | null = null;
  isLoadingSubCategories: boolean = false;
  dataLoaded: boolean = false;
  
  @ViewChildren('variantFileInput') variantFileInputs!: QueryList<ElementRef>;
  
  newProduct: Product = this.getEmptyProduct();

  constructor(private productService: ProductService) {}

  ngOnInit(): void { 
    this.loadData(); 
  }

  onTabChange(tab: string) {
    // When moving to variants tab, ensure numeric fields are normalized
    if (tab === 'variants' && Array.isArray(this.newProduct?.variants)) {
      this.newProduct.variants.forEach((_, idx) => this.onVariantNumericBlur(idx));
    }
    this.activeTab = tab;
  }

  private getEmptyProduct(): Product {
    return {
      name: '', 
      category_id: null, 
      brand_id: null, 
      describ: '', 
      variants: [{ color_id: null, size_id: null, selected_sizes: [], price: 0, price_sale: 0, quantity: 0, image_previews: [], image_files: [] }]
    };
  }

  loadData() {
    this.dataLoaded = false;
    forkJoin({
      products: this.productService.getProducts().pipe(catchError((err) => {
        console.error('Load products failed:', err);
        return of([]);
      })),
      parentCategories: this.productService.getParentCategories().pipe(catchError((err) => {
        console.error('Load parent categories failed:', err);
        return of([]);
      })),
      allCategories: this.productService.getCategories().pipe(catchError((err) => {
        console.error('Load categories failed:', err);
        return of([]);
      })),
      brands: this.productService.getBrands().pipe(catchError((err) => {
        console.error('Load brands failed:', err);
        return of([]);
      })),
      colors: this.productService.getColors().pipe(catchError((err) => {
        console.error('Load colors failed:', err);
        return of([]);
      })),
      sizes: this.productService.getSizes().pipe(catchError((err) => {
        console.error('Load sizes failed:', err);
        return of([]);
      }))
    }).subscribe({
      next: (results: any) => {
        this.products = Array.isArray(results.products) ? results.products : (results.products?.data || []);
        this.parentCategories = Array.isArray(results.parentCategories) ? results.parentCategories : (results.parentCategories?.data || []);
        this.allCategories = Array.isArray(results.allCategories) ? results.allCategories : (results.allCategories?.data || []);
        this.brands = Array.isArray(results.brands) ? results.brands : (results.brands?.data || []);
        this.colors = Array.isArray(results.colors) ? results.colors : (results.colors?.data || []);
        this.sizes = Array.isArray(results.sizes) ? results.sizes : (results.sizes?.data || []);
        
        // Debug: Check variants
        console.log('📦 Products loaded:', this.products);
        console.log('🎨 First product variants:', this.products[0]?.variants);
        
        console.log('Sizes loaded:', this.sizes);
        this.applyFilters();
        this.dataLoaded = true;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.products = [];
        this.filteredProducts = [];
        this.dataLoaded = true;
      }
    });
  }

  onParentCategoryChange(parentId: any) {
    const id = parentId ? Number(parentId) : null;
    this.selectedParentCategory = id;
    this.newProduct.category_id = null;
    this.subCategories = [];
    
    if (id) {
      this.isLoadingSubCategories = true;
      
      // Get parent category to determine gender (backend returns no 'gender' field)
      const parentCat = this.parentCategories.find(c => c.id === id);
      // Derive gender from parent category name (e.g., 'Nam' -> male, 'Nữ' -> female)
      let gender: string | undefined = undefined;
      if (parentCat && parentCat.name) {
        const n = String(parentCat.name).toLowerCase();
        if (n.includes('nam')) gender = 'male';
        else if (n.includes('nữ') || n.includes('nu')) gender = 'female';
      }

      console.log('Parent category:', parentCat);
      console.log('Derived gender:', gender);
      
      // Load sub categories
      this.productService.getSubCategories(id).subscribe({
        next: (res: any) => {
          this.subCategories = Array.isArray(res) ? res : (res.data || []);
          this.isLoadingSubCategories = false;
        },
        error: () => this.isLoadingSubCategories = false
      });
      
      // Determine sizes to show based on parent category gender
      if (gender === 'male') {
        // Male: sizes 38..48
        const start = 38, end = 48;
        const arr: any[] = [];
        for (let v = start; v <= end; v++) {
          arr.push({ id: v, size: v });
        }
        this.modalSizes = arr;
      } else if (gender === 'female') {
        // Female: sizes 34..44
        const start = 34, end = 44;
        const arr: any[] = [];
        for (let v = start; v <= end; v++) {
          arr.push({ id: v, size: v });
        }
        this.modalSizes = arr;
      } else {
        // Fallback: use global sizes (dedupe by numeric value and sort ascending)
        const allSizes = Array.isArray(this.sizes) ? this.sizes.slice() : [];
        const mapped = allSizes.map((s: any) => ({ ...(s || {}), size: Number((s || {}).size) }));
        const uniqueByValue: Map<number, any> = new Map();
        mapped.forEach((s: any) => {
          if (!Number.isFinite(s.size)) return;
          if (!uniqueByValue.has(s.size)) uniqueByValue.set(s.size, s);
        });
        this.modalSizes = Array.from(uniqueByValue.values()).sort((a: any, b: any) => a.size - b.size);
      }
      console.log('Final modalSizes (by parent gender):', this.modalSizes);
    }
  }

  onSubCategoryChange(subCategoryId: any) {
    this.newProduct.category_id = subCategoryId ? Number(subCategoryId) : null;
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((p: Product) => {
      const nameMatch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const idMatch = p.id?.toString().includes(this.searchQuery);
      const matchesSearch = nameMatch || idMatch;
      
      const matchesCategory = !this.selectedCategoryFilter || 
                              p.category_id?.toString() === this.selectedCategoryFilter;
      
      const matchesBrand = !this.selectedBrandFilter || 
                           p.brand_id?.toString() === this.selectedBrandFilter;
      
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }

  onSearchChange() { this.applyFilters(); }
  onFilterChange() { this.applyFilters(); }
  resetFilters() {
    this.searchQuery = '';
    this.selectedCategoryFilter = '';
    this.selectedBrandFilter = '';
    this.applyFilters();
  }

  openAddProductModal() {
    this.releaseAllPreviewUrls();
    this.editingProduct = null;
    this.newProduct = this.getEmptyProduct();
    this.selectedParentCategory = null;
    this.subCategories = [];
    this.selectedFiles = [];
    this.selectedFilePreviews = [];
    this.activeTab = 'info';
    this.showModal = true;
    
    // Reset modal sizes - buộc chọn danh mục cha trước
    this.modalSizes = [];
  }

  editProduct(product: Product) {
    this.releaseAllPreviewUrls();
    this.editingProduct = product;
    this.newProduct = JSON.parse(JSON.stringify(product));
    
    // Initialize selected_sizes for all variants if not present
    if (this.newProduct.variants && Array.isArray(this.newProduct.variants)) {
      this.newProduct.variants = this.newProduct.variants.map(v => ({
        ...v,
        selected_sizes: Array.isArray(v.selected_sizes) && v.selected_sizes.length
          ? v.selected_sizes.map((sizeId: any) => Number(sizeId)).filter((sizeId: number) => Number.isFinite(sizeId))
          : (v.size_id ? [Number(v.size_id)] : []),
        image_previews: [],
        image_files: []
      }));
    }
    
    // Ensure brand is set on the form
    this.newProduct.brand_id = product.brand_id ?? null;

    // Robustly determine and pre-select parent and sub category
    const currentCat = this.allCategories.find((c: any) => c.id == product.category_id);
    if (currentCat) {
      // If this category has a parent, select the parent
      if (currentCat.parent_id) {
        const parentId = Number(currentCat.parent_id);
        this.selectedParentCategory = parentId;
        this.onParentCategoryChange(parentId);
        this.newProduct.category_id = Number(product.category_id);
      } else {
        // Category has no parent (it is a parent). Select it as parent so subcategories load (if any)
        const parentId = Number(currentCat.id);
        this.selectedParentCategory = parentId;
        this.onParentCategoryChange(parentId);
        // Keep the category_id as-is (product may be assigned to a parent category)
        this.newProduct.category_id = Number(product.category_id);
      }
    } else {
      // Fallback: if category not found (possible type mismatch), try to coerce and search again
      const prodCatId = Number(product.category_id);
      if (Number.isFinite(prodCatId) && prodCatId > 0) {
        const fallbackCat = this.allCategories.find((c: any) => Number(c.id) === prodCatId);
        if (fallbackCat) {
          const parentId = Number(fallbackCat.parent_id || fallbackCat.id);
          this.selectedParentCategory = parentId;
          this.onParentCategoryChange(parentId);
          this.newProduct.category_id = prodCatId;
        }
      }
    }

    this.selectedFiles = [];
    this.selectedFilePreviews = [];
    this.activeTab = 'info';
    this.showModal = true;
  }

  closeModal() {
    this.releaseAllPreviewUrls();
    this.selectedFiles = [];
    this.selectedFilePreviews = [];
    this.showModal = false;
    this.isSubmitting = false;
  }

  addVariant() {
    // Lấy giá trị từ biến thể trước đó (nếu có)
    const lastVariant = this.newProduct.variants[this.newProduct.variants.length - 1];
    
    // Tạo biến thể mới với giá trị copy từ biến thể trước
    const newVariant: Variant = {
      color_id: null,
      size_id: null,
      selected_sizes: [],
      price: lastVariant?.price || 0,
      price_sale: lastVariant?.price_sale || 0,
      quantity: lastVariant?.quantity || 0,
      image_previews: [],
      image_files: []
    };
    
    this.newProduct.variants.push(newVariant);
  }

  removeVariant(index: number) {
    if (this.newProduct.variants.length > 1) {
      this.revokePreviewList(this.newProduct.variants[index]?.image_previews);
      this.newProduct.variants.splice(index, 1);
    }
  }

  triggerVariantFileInput(variantIndex: number) {
    const inputIndex = variantIndex - 1;
    const inputRef = this.variantFileInputs?.get(inputIndex);
    if (inputRef) {
      (inputRef.nativeElement as HTMLInputElement).click();
    }
  }

  onVariantImageSelected(event: Event, variantIndex: number) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const variant = this.newProduct.variants[variantIndex];
    if (!variant.image_files) variant.image_files = [];
    if (!variant.image_previews) variant.image_previews = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      variant.image_files.push(file);
      variant.image_previews.push(URL.createObjectURL(file));
    }

    input.value = '';
  }

  removeVariantImage(variantIndex: number, imageIndex: number) {
    const variant = this.newProduct.variants[variantIndex];
    if (!variant.image_files || !variant.image_previews) return;

    const previewUrl = variant.image_previews[imageIndex];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    variant.image_files.splice(imageIndex, 1);
    variant.image_previews.splice(imageIndex, 1);
  }

  setVariantPrimaryImage(variantIndex: number, imageIndex: number) {
    const variant = this.newProduct.variants[variantIndex];
    if (!variant.image_files || !variant.image_previews) return;
    if (imageIndex <= 0 || imageIndex >= variant.image_files.length) return;

    const [selectedFile] = variant.image_files.splice(imageIndex, 1);
    const [selectedPreview] = variant.image_previews.splice(imageIndex, 1);

    variant.image_files.unshift(selectedFile);
    variant.image_previews.unshift(selectedPreview);
  }

  private getVariantSelectedSizeIds(variantIndex: number): number[] {
    const variant = this.newProduct?.variants?.[variantIndex];
    if (!variant) return [];

    const selectedSizes = Array.isArray(variant.selected_sizes)
      ? variant.selected_sizes
      : (variant.size_id ? [variant.size_id] : []);

    return Array.from(new Set(
      selectedSizes
        .map((sizeId: any) => Number(sizeId))
        .filter((sizeId: number) => Number.isFinite(sizeId) && sizeId > 0)
    ));
  }

  getAvailableSizesForVariant(variantIndex: number): any[] {
    const variant = this.newProduct?.variants?.[variantIndex];
    if (!variant) return [];
    const modalList = this.getModalSizesForDisplay();
    if (!Array.isArray(modalList) || modalList.length === 0) return [];

    const currentColorId = variant.color_id;
    if (!currentColorId) return modalList;

    const selectedByCurrentVariant = new Set(this.getVariantSelectedSizeIds(variantIndex));
    const usedBySameColorOtherVariants = new Set<number>();

    this.newProduct.variants.forEach((item, index) => {
      if (index === variantIndex) return;
      if (item.color_id !== currentColorId) return;

      this.getVariantSelectedSizeIds(index).forEach((sizeId) => {
        usedBySameColorOtherVariants.add(sizeId);
      });
    });

    const filtered = modalList.filter((size: any) => {
      const sizeId = Number(size.id);
      return !usedBySameColorOtherVariants.has(sizeId) || selectedByCurrentVariant.has(sizeId);
    });

    if ((!filtered || filtered.length === 0) && modalList.length > 0) {
      // Fallback: return full modalList to ensure admin can pick sizes
      return modalList;
    }

    return filtered;
  }

  private pruneUnavailableSizes(variantIndex: number) {
    const variant = this.newProduct?.variants?.[variantIndex];
    if (!variant) return;

    const availableSizeIds = new Set(
      this.getAvailableSizesForVariant(variantIndex)
        .map((size: any) => Number(size.id))
        .filter((sizeId: number) => Number.isFinite(sizeId) && sizeId > 0)
    );

    const selectedSizes = this.getVariantSelectedSizeIds(variantIndex);
    variant.selected_sizes = selectedSizes.filter((sizeId) => availableSizeIds.has(sizeId));
  }

  onVariantColorChange(variantIndex: number, colorId: any) {
    const variant = this.newProduct?.variants?.[variantIndex];
    if (!variant) return;

    variant.color_id = colorId ? Number(colorId) : null;
    this.pruneUnavailableSizes(variantIndex);
  }

  // Normalize numeric fields (price, price_sale, quantity) for a variant
  onVariantNumericBlur(variantIndex: number) {
    const variant = this.newProduct?.variants?.[variantIndex];
    if (!variant) return;

    variant.price = this.coerceToInteger(variant.price);
    variant.price_sale = this.coerceToInteger(variant.price_sale);
    variant.quantity = this.coerceToInteger(variant.quantity);
  }

  private coerceToInteger(value: any): number {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
    if (value == null) return 0;
    // Remove any non digit or minus sign characters (thousand separators, currency symbols, spaces)
    const s = String(value);
    const cleaned = s.replace(/[^0-9-]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }

  /**
   * Return sizes to display in modal: prefer `modalSizes` (set by parent category),
   * otherwise fall back to global `this.sizes` (deduped and sorted).
   */
  getModalSizesForDisplay(): any[] {
    if (Array.isArray(this.modalSizes) && this.modalSizes.length > 0) return this.modalSizes;

    const allSizes = Array.isArray(this.sizes) ? this.sizes.slice() : [];
    const mapped = allSizes.map((s: any) => {
      const raw = s || {};
      const rawValue = raw.size ?? raw.name ?? raw.value ?? raw;
      const numeric = Number(rawValue);
      return {
        ...raw,
        id: raw.id ?? raw.size ?? rawValue,
        // keep both numeric sort key and label for display
        size: Number.isFinite(numeric) ? numeric : rawValue,
        _sizeLabel: String(rawValue)
      };
    });
    const uniqueByLabel: Map<string, any> = new Map();
    mapped.forEach((s: any) => {
      const label = String(s.size);
      if (!uniqueByLabel.has(label)) uniqueByLabel.set(label, s);
    });
    return Array.from(uniqueByLabel.values()).sort((a: any, b: any) => {
      const na = Number(a.size);
      const nb = Number(b.size);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return String(a._sizeLabel).localeCompare(String(b._sizeLabel));
    });
  }

  // UI debug payload for template
  // (debug helper removed)

  toggleSizeSelection(variantIndex: number, sizeId: number) {
    const variant = this.newProduct.variants[variantIndex];
    const numericSizeId = Number(sizeId);
    const availableSizeIds = new Set(
      this.getAvailableSizesForVariant(variantIndex)
        .map((size: any) => Number(size.id))
        .filter((id: number) => Number.isFinite(id) && id > 0)
    );
    
    // Initialize selected_sizes if not present
    if (!Array.isArray(variant.selected_sizes)) {
      variant.selected_sizes = [];
    }

    variant.selected_sizes = variant.selected_sizes
      .map((id: any) => Number(id))
      .filter((id: number) => Number.isFinite(id) && id > 0);

    if (!availableSizeIds.has(numericSizeId) && !variant.selected_sizes.includes(numericSizeId)) {
      return;
    }
    
    const index = variant.selected_sizes.indexOf(numericSizeId);
    
    if (index > -1) {
      // Remove size if already selected
      variant.selected_sizes.splice(index, 1);
    } else {
      // Add size if not selected
      variant.selected_sizes.push(numericSizeId);
    }
  }

  isSizeSelected(variantIndex: number, sizeId: number): boolean {
    const variant = this.newProduct?.variants?.[variantIndex];
    if (!variant || !Array.isArray(variant.selected_sizes)) {
      return false;
    }
    return variant.selected_sizes.includes(sizeId);
  }

  onFileSelected(event: any) {
    this.addFilesToSelection(event.target.files);
  }

  addFilesToSelection(files: FileList | null) {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        this.selectedFiles.push(file);
        this.selectedFilePreviews.push(URL.createObjectURL(file));
      }
    }
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragOver = true; }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.isDragOver = false; }
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    if (e.dataTransfer?.files) this.addFilesToSelection(e.dataTransfer.files);
  }

  // Xóa ảnh khỏi danh sách đã chọn
  removeImage(index: number) {
    const previewUrl = this.selectedFilePreviews[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    this.selectedFiles.splice(index, 1);
    this.selectedFilePreviews.splice(index, 1);
  }

  // Đặt ảnh làm ảnh đại diện (đưa lên vị trí đầu tiên)
  setPrimaryImage(index: number) {
    if (index <= 0 || index >= this.selectedFiles.length) return;

    const [selectedImage] = this.selectedFiles.splice(index, 1);
    const [selectedPreview] = this.selectedFilePreviews.splice(index, 1);
    this.selectedFiles.unshift(selectedImage);
    this.selectedFilePreviews.unshift(selectedPreview);
  }

  private revokePreviewList(previewUrls?: string[]) {
    if (!previewUrls?.length) return;
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }

  private releaseAllPreviewUrls() {
    this.revokePreviewList(this.selectedFilePreviews);
    this.newProduct?.variants?.forEach((variant) => this.revokePreviewList(variant.image_previews));
  }

  getDiscountPercent(product: Product): number {
    const originalPrice = product.variants?.[0]?.price || product.price || 0;
    const salePrice = product.price_sale || 0;
    if (originalPrice === 0 || salePrice === 0 || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  hasValidSalePrice(originalPrice: number | null | undefined, salePrice: number | null | undefined): boolean {
    const original = Number(originalPrice || 0);
    const sale = Number(salePrice || 0);
    return original > 0 && sale > 0 && sale < original;
  }

  getDisplayedPrice(originalPrice: number | null | undefined, salePrice: number | null | undefined): number {
    const original = Number(originalPrice || 0);
    const sale = Number(salePrice || 0);
    return this.hasValidSalePrice(original, sale) ? sale : original;
  }

  formatPriceRange(values: number[]): string {
    const uniqueValues = Array.from(new Set(values.filter((value) => Number.isFinite(value) && value > 0)));

    if (uniqueValues.length === 0) return '-';
    if (uniqueValues.length === 1) return uniqueValues[0].toLocaleString('vi-VN') + ' đ';

    const sortedValues = uniqueValues.sort((left, right) => left - right);
    return `${sortedValues[0].toLocaleString('vi-VN')} đ - ${sortedValues[sortedValues.length - 1].toLocaleString('vi-VN')} đ`;
  }

  /**
   * Format a number as Vietnamese Dong (VND) with thousands separators and trailing 'đ'
   */
  formatVnd(value: any): string {
    const num = Number(value || 0);
    if (!Number.isFinite(num) || num === 0) return '0 đ';
    return num.toLocaleString('vi-VN') + ' đ';
  }

  getGroupOriginalPrices(group: any): number[] {
    return group.variants.map((variant: any) => Number(variant.price || 0));
  }

  getGroupDisplayedPrices(group: any): number[] {
    return group.variants.map((variant: any) => this.getDisplayedPrice(variant.price, variant.price_sale));
  }

  getGroupedVariants(product: Product | null): any[] {
    if (!product?.variants?.length) return [];

    const groupMap = new Map<string, any>();

    product.variants.forEach((variant: any) => {
      const colorId = variant.color_id ?? null;
      const colorData = colorId ? this.colors.find((color: any) => color.id === colorId) : null;
      const sizeLabel = this.getSizeName(variant.size_id);
      const originalPrice = Number(variant.price || 0);
      const salePrice = Number(variant.price_sale || 0);
      const groupKey = `${colorId ?? 'no-color'}-${originalPrice}-${salePrice}`;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          color_id: colorId,
          color_name: colorData?.name || 'N/A',
          color_code: colorData?.hex_code || '#000000',
          image: this.getVariantImage(variant, product),
          sizes: [],
          quantity: 0,
          originalPrice,
          salePrice,
          variants: []
        });
      }

      const group = groupMap.get(groupKey)!;
      group.variants.push(variant);
      group.quantity += Number(variant.quantity || 0);
      group.originalPrice = originalPrice;
      group.salePrice = salePrice;

      if (sizeLabel && !group.sizes.includes(sizeLabel)) {
        group.sizes.push(sizeLabel);
      }

      if (!group.image) {
        group.image = this.getVariantImage(variant, product);
      }
    });

    return Array.from(groupMap.values()).map((group) => ({
      ...group,
      sizes: group.sizes.sort((left: any, right: any) => Number(left) - Number(right))
    })).map((group) => {
      // compute per-variant quantity if all variants in the group share the same stock value
      const quantities = (group.variants || []).map((v: any) => Number(v.quantity || 0));
      const allSame = quantities.length > 0 && quantities.every((q: number) => q === quantities[0]);
      return {
        ...group,
        perQuantity: allSame ? quantities[0] : undefined
      };
    });
  }

  submitProduct() {
    if (!this.newProduct.name || !this.newProduct.category_id || !this.newProduct.brand_id) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('category_id', String(this.newProduct.category_id));
    formData.append('brand_id', String(this.newProduct.brand_id));
    formData.append('describ', this.newProduct.describ || '');
    
    // Tạo variants - 1 variant = 1 color + 1 size combo
    const variants: any[] = [];
    
    this.newProduct.variants.forEach((v, colorIndex) => {
      const primaryImageFile = v.image_files?.[0] || null;
      const extraImageFiles = Array.isArray(v.image_files) ? v.image_files.slice(1) : [];
      const selectedSizes = Array.isArray(v.selected_sizes) ? v.selected_sizes : [];
      variants.push({
        color_id: v.color_id,
        selected_sizes: selectedSizes,
        size_id: selectedSizes.length === 0 ? (v.size_id ?? null) : null,
        price: v.price,
        price_sale: v.price_sale,
        quantity: v.quantity,
        image: v.image || ''
      });

      if (primaryImageFile) {
        formData.append(`variant_group_image_${colorIndex}`, primaryImageFile);
      }

      extraImageFiles.forEach((file, extraIndex) => {
        formData.append(`variant_group_extra_image_${colorIndex}_${extraIndex}`, file);
      });
    });
    
    formData.append('variants', JSON.stringify(variants));
    
    console.log('📸 Selected files count:', this.selectedFiles.length);
    console.log('📸 Selected files:', this.selectedFiles);
    this.selectedFiles.forEach((file, index) => {
      console.log(`📸 Appending image ${index}:`, file.name, file.size, file.type);
      formData.append('images', file);
    });
    
    console.log('📦 FormData entries:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`  - ${key}: [File] ${value.name}`);
      } else {
        console.log(`  - ${key}: ${value}`);
      }
    });

    const request = this.editingProduct 
      ? this.productService.updateProduct(this.editingProduct.id!, formData)
      : this.productService.addProduct(formData);

    request.subscribe({
      next: () => {
        alert(this.editingProduct ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Submit error:', err);
        alert('Lỗi: ' + (err.error?.message || 'Không thể lưu sản phẩm'));
        this.isSubmitting = false;
      }
    });
  }

  deleteProduct(id: any) {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert('Đã xóa sản phẩm');
          this.loadData();
        },
        error: (err) => alert('Lỗi khi xóa: ' + err.message)
      });
    }
  }

  viewProductDetail(p: Product) {
    this.detailProduct = JSON.parse(JSON.stringify(p));
    this.showDetailModal = true;
    console.log('Viewing product detail:', this.detailProduct);
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.detailProduct = null;
  }

  // Lấy các màu unique từ variants
  getUniqueColors(product: Product): any[] {
    const colorMap = new Map<number, any>();
    
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v: any) => {
        if (v.color_id && !colorMap.has(v.color_id)) {
          // Tìm màu trong danh sách colors
          const colorData = this.colors.find((c: any) => c.id === v.color_id);
          colorMap.set(v.color_id, {
            id: v.color_id,
            color_name: colorData?.name || 'Unknown',
            color_code: colorData?.hex_code || '#000000'
          });
        }
      });
    }
    
    return Array.from(colorMap.values());
  }

  // Lấy tên màu từ color_id
  getColorName(colorId: number | null, product: Product): string {
    if (!colorId || !product.variants) return 'N/A';
    const colorData = this.colors.find((c: any) => c.id === colorId);
    return colorData?.name || 'N/A';
  }

  // Lấy tên kích cỡ từ size_id
  getSizeName(sizeId: number | null): string {
    if (sizeId == null) return '-';
    // Normalize
    const sidNum = Number(sizeId);
    // Try to find by record id OR by size value (some variants store the numeric size as size_id)
    const sizeData = this.sizes.find((s: any) => {
      if (!s) return false;
      // compare numeric ids when possible
      const sId = s.id != null ? Number(s.id) : NaN;
      const sSize = s.size != null ? Number(s.size) : NaN;
      if (Number.isFinite(sId) && Number.isFinite(sidNum) && sId === sidNum) return true;
      if (Number.isFinite(sSize) && Number.isFinite(sidNum) && sSize === sidNum) return true;
      // fallback string compare for names/labels
      if (String(s.id) === String(sizeId) || String(s.size) === String(sizeId) || String(s.name) === String(sizeId)) return true;
      return false;
    });
    return sizeData ? (sizeData.size?.toString() || sizeData.name || String(sizeId)) : String(sizeId);
  }

  getVariantImage(variant: any, product: Product | null): string {
    const productImage = product?.image || '';
    const variantImage = variant?.image || '';
    const imageName = (variantImage && variantImage !== productImage)
      ? variantImage
      : this.getColorRepresentativeImage(variant?.color_id, product);
    return this.normalizeProductImageUrl(imageName);
  }

  normalizeProductImageUrl(imageName: string | null | undefined): string {
    if (!imageName) return '';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }

    if (imageName.includes('/public/images/products/') || imageName.includes('/images/products/')) {
      return imageName;
    }

    return `${this.productService.imgBaseUrl}${imageName}`;
  }

  getColorRepresentativeImage(colorId: number | null, product: Product | null): string {
    if (!colorId || !product?.variants?.length) return '';

    const sameColorVariants = product.variants.filter((item: any) => item.color_id === colorId);
    const productImage = product?.image || '';
    const imageCounts = new Map<string, number>();

    sameColorVariants.forEach((item: any) => {
      const imageName = item?.image || '';
      if (!imageName || imageName === productImage) return;

      imageCounts.set(imageName, (imageCounts.get(imageName) || 0) + 1);
    });

    if (imageCounts.size > 0) {
      return Array.from(imageCounts.entries())
        .sort((left, right) => right[1] - left[1])[0][0];
    }

    const variantWithImage = sameColorVariants.find((item: any) => item.image);
    return variantWithImage?.image || productImage || '';
  }

  // Lấy các kích cỡ unique từ variants
  getUniqueSizes(product: Product): string[] {
    const sizeSet = new Set<string>();

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v: any) => {
        const raw = v.size_id ?? v.selected_sizes?.[0] ?? null;
        if (raw == null) return;
        const sidNum = Number(raw);

        // Find matching size record by id or by numeric size value
        const sizeData = this.sizes.find((s: any) => {
          if (!s) return false;
          const sId = s.id != null ? Number(s.id) : NaN;
          const sSize = s.size != null ? Number(s.size) : NaN;
          if (Number.isFinite(sId) && Number.isFinite(sidNum) && sId === sidNum) return true;
          if (Number.isFinite(sSize) && Number.isFinite(sidNum) && sSize === sidNum) return true;
          if (String(s.id) === String(raw) || String(s.size) === String(raw) || String(s.name) === String(raw)) return true;
          return false;
        });

        if (sizeData) {
          sizeSet.add(sizeData.size?.toString() || sizeData.name || String(raw));
        } else {
          // fallback: use raw value as label
          sizeSet.add(String(raw));
        }
      });
    }

    return Array.from(sizeSet);
  }

  trackById(index: number, item: Product): number {
    return item.id || index;
  }
}