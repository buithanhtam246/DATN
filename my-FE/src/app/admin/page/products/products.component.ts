import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// Interface cho biến thể sản phẩm
interface Variant {
  color_id: number | null;
  size_id: number | null;
  selected_sizes: number[];  // Array để chọn nhiều sizes
  price: number;
  price_sale: number;
  quantity: number;
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
  
  searchQuery: string = '';
  selectedCategoryFilter: string = '';
  selectedBrandFilter: string = '';
  
  showModal: boolean = false;
  editingProduct: Product | null = null;
  selectedFiles: File[] = [];
  isSubmitting: boolean = false;
  isDragOver: boolean = false;
  activeTab: string = 'info';
  
  selectedParentCategory: number | null = null;
  isLoadingSubCategories: boolean = false;
  dataLoaded: boolean = false;
  
  newProduct: Product = this.getEmptyProduct();

  constructor(private productService: ProductService) {}

  ngOnInit(): void { 
    this.loadData(); 
  }

  private getEmptyProduct(): Product {
    return {
      name: '', 
      category_id: null, 
      brand_id: null, 
      describ: '', 
      variants: [{ color_id: null, size_id: null, selected_sizes: [], price: 0, price_sale: 0, quantity: 0 }]
    };
  }

  loadData() {
    this.dataLoaded = false;
    forkJoin({
      products: this.productService.getProducts(),
      parentCategories: this.productService.getParentCategories(),
      allCategories: this.productService.getCategories(),
      brands: this.productService.getBrands(),
      colors: this.productService.getColors(),
      sizes: this.productService.getSizes()
    }).subscribe({
      next: (results: any) => {
        this.products = Array.isArray(results.products) ? results.products : (results.products?.data || []);
        this.parentCategories = Array.isArray(results.parentCategories) ? results.parentCategories : (results.parentCategories?.data || []);
        this.allCategories = Array.isArray(results.allCategories) ? results.allCategories : (results.allCategories?.data || []);
        this.brands = Array.isArray(results.brands) ? results.brands : (results.brands?.data || []);
        this.colors = Array.isArray(results.colors) ? results.colors : (results.colors?.data || []);
        this.sizes = Array.isArray(results.sizes) ? results.sizes : (results.sizes?.data || []);
        
        console.log('Sizes loaded:', this.sizes);
        this.applyFilters();
        this.dataLoaded = true;
      },
      error: (err) => {
        console.error('Error loading data:', err);
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
      
      // Get parent category to find its gender
      const parentCat = this.parentCategories.find(c => c.id === id);
      const gender = parentCat?.gender;
      
      // Load sub categories
      this.productService.getSubCategories(id).subscribe({
        next: (res: any) => {
          this.subCategories = Array.isArray(res) ? res : (res.data || []);
          this.isLoadingSubCategories = false;
        },
        error: () => this.isLoadingSubCategories = false
      });
      
      // Load sizes based on parent category gender
      if (gender) {
        this.productService.getSizesByGender(gender).subscribe({
          next: (res: any) => {
            this.sizes = Array.isArray(res) ? res : (res.data || []);
            console.log('Sizes loaded for gender', gender, ':', this.sizes);
          },
          error: (err) => {
            console.error('Error loading sizes for gender:', err);
            // Fallback to all sizes
            this.productService.getSizes().subscribe({
              next: (res: any) => {
                this.sizes = Array.isArray(res) ? res : (res.data || []);
              }
            });
          }
        });
      }
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
    this.editingProduct = null;
    this.newProduct = this.getEmptyProduct();
    this.selectedParentCategory = null;
    this.subCategories = [];
    this.selectedFiles = [];
    this.activeTab = 'info';
    this.showModal = true;
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.newProduct = JSON.parse(JSON.stringify(product));
    
    const currentCat = this.allCategories.find(c => c.id === product.category_id);
    if (currentCat && currentCat.parent_id) {
      this.selectedParentCategory = currentCat.parent_id;
      this.onParentCategoryChange(currentCat.parent_id);
      setTimeout(() => this.newProduct.category_id = product.category_id, 150);
    }

    this.selectedFiles = [];
    this.activeTab = 'info';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isSubmitting = false;
  }

  addVariant() {
    this.newProduct.variants.push({ color_id: null, size_id: null, selected_sizes: [], price: 0, price_sale: 0, quantity: 0 });
  }

  removeVariant(index: number) {
    if (this.newProduct.variants.length > 1) {
      this.newProduct.variants.splice(index, 1);
    }
  }

  toggleSizeSelection(variantIndex: number, sizeId: number) {
    const variant = this.newProduct.variants[variantIndex];
    const index = variant.selected_sizes.indexOf(sizeId);
    
    if (index > -1) {
      // Remove size if already selected
      variant.selected_sizes.splice(index, 1);
    } else {
      // Add size if not selected
      variant.selected_sizes.push(sizeId);
    }
  }

  isSizeSelected(variantIndex: number, sizeId: number): boolean {
    return this.newProduct.variants[variantIndex].selected_sizes.includes(sizeId);
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

  getDiscountPercent(product: Product): number {
    const originalPrice = product.variants?.[0]?.price || product.price || 0;
    const salePrice = product.price_sale || 0;
    if (originalPrice === 0 || salePrice === 0 || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
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
    
    // Convert selected_sizes to size_id for backward compatibility
    const variants = this.newProduct.variants.map(v => ({
      color_id: v.color_id,
      size_id: v.selected_sizes.length > 0 ? v.selected_sizes[0] : null, // Use first selected size
      price: v.price,
      price_sale: v.price_sale,
      quantity: v.quantity
    }));
    
    formData.append('variants', JSON.stringify(variants));
    this.selectedFiles.forEach(file => formData.append('images', file));

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

  viewProductDetail(p: Product) { console.log('Detail:', p); }
}