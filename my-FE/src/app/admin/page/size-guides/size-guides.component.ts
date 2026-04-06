import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';

interface SizeGuide {
  category_id: number;
  image_url: string | null;
}

@Component({
  selector: 'app-size-guides',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './size-guides.component.html',
  styleUrls: ['./size-guides.component.scss']
})
export class SizeGuidesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  parentCategories: Category[] = [];
  allCategories: Category[] = []; // Includes both parent and children
  filteredCategories: Category[] = [];
  categoryGuides: Map<number, SizeGuide> = new Map();

  searchText: string = '';
  isSubmitting: boolean = false;
  showUploadModal: boolean = false;
  selectedCategory: Category | null = null;
  selectedFile: File | null = null;
  filePreview: string | null = null;

  // Base URL for images
  sizeGuideImgUrl = 'http://localhost:3000/uploads/size-guides/';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllGuides();
  }

  /**
   * Load parent categories and their children
   */
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: any) => {
        // Get all categories (parent + children)
        const allData = Array.isArray(data) ? data : (data?.data ? data.data : []);
        this.parentCategories = allData;
        
        // Flatten to get all categories (parent + children)
        this.allCategories = [];
        allData.forEach((parent: Category) => {
          this.allCategories.push(parent);
          if (parent.children && Array.isArray(parent.children)) {
            this.allCategories.push(...parent.children);
          }
        });
        
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi tải danh mục:', err);
        this.allCategories = [];
        alert('❌ Lỗi tải danh mục');
      }
    });
  }

  /**
   * Load all size guides for categories
   */
  loadAllGuides(): void {
    // Use allCategories instead of parentCategories
    setTimeout(() => {
      const categories = Array.isArray(this.allCategories) ? this.allCategories : [];
      categories.forEach((category) => {
        if (category.id) {
          this.productService.getSizeGuideByCategory(category.id).subscribe({
            next: (res: any) => {
              if (res && res.image_url) {
                this.categoryGuides.set(category.id!, {
                  category_id: category.id!,
                  image_url: res.image_url
                });
              }
              this.cdr.detectChanges();
            },
            error: (err) => {
              // Guide doesn't exist, which is fine
              console.log(`Không có guide cho category ${category.id}`);
            }
          });
        }
      });
    }, 500); // Wait for categories to load
  }

  /**
   * Apply search filter - Only show parent categories
   */
  applyFilters(): void {
    // Filter only parent categories (without parent_id)
    const parentCategories = Array.isArray(this.allCategories) 
      ? this.allCategories.filter(cat => !cat.parent_id)
      : [];
    
    if (!this.searchText.trim()) {
      this.filteredCategories = [...parentCategories];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredCategories = parentCategories.filter((category) =>
        category.name?.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Open upload modal
   */
  openUploadModal(category: Category): void {
    this.selectedCategory = category;
    this.selectedFile = null;
    this.filePreview = null;
    this.showUploadModal = true;
  }

  /**
   * Close upload modal
   */
  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedCategory = null;
    this.selectedFile = null;
    this.filePreview = null;
    this.cdr.detectChanges();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('❌ Hình ảnh quá lớn! Tối đa 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Chỉ chấp nhận JPG, PNG, WebP');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Upload guide
   */
  uploadGuide(): void {
    if (!this.selectedFile || !this.selectedCategory?.id) {
      alert('❌ Vui lòng chọn hình ảnh và danh mục');
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.isSubmitting = true;

    this.productService.uploadSizeGuideByCategory(this.selectedCategory.id, formData).subscribe({
      next: (res: any) => {
        alert('✅ Upload hướng dẫn size thành công!');
        
        // Update map with new guide
        this.categoryGuides.set(this.selectedCategory!.id!, {
          category_id: this.selectedCategory!.id!,
          image_url: res.image_url
        });

        this.closeUploadModal();
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Không xác định';
        alert('❌ Lỗi upload: ' + errorMsg);
        this.isSubmitting = false;
        console.error('Upload error:', err);
      }
    });
  }

  /**
   * Delete guide
   */
  deleteGuide(category: Category): void {
    const categoryName = category.name || 'Category';
    
    if (!confirm(`Bạn có chắc muốn xóa hướng dẫn size của "${categoryName}"?`)) {
      return;
    }

    if (!category.id) {
      alert('❌ ID danh mục không hợp lệ');
      return;
    }

    this.isSubmitting = true;

    this.productService.deleteSizeGuideByCategory(category.id).subscribe({
      next: () => {
        alert('✅ Xóa hướng dẫn size thành công!');
        this.categoryGuides.delete(category.id!);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Không xác định';
        alert('❌ Lỗi xóa: ' + errorMsg);
        this.isSubmitting = false;
        console.error('Delete error:', err);
      }
    });
  }
}
