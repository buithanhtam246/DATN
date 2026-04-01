import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';

interface Size {
  id?: number;
  size: number;
  gender: 'male' | 'female';
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-sizes-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sizes-simple.component.html',
  styleUrls: ['./sizes-simple.component.scss']
})
export class SizesSimpleComponent implements OnInit {
  sizes: Size[] = [];
  filteredSizes: Size[] = [];
  
  searchText: string = '';
  activeTab: 'all' | 'male' | 'female' = 'all';
  isSubmitting: boolean = false;
  showModal: boolean = false;
  
  maleCount: number = 0;
  femaleCount: number = 0;
  
  newSize: any = { size: undefined, gender: undefined };
  editingSize: Size | null = null;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSizes();
  }

  /**
   * Load all sizes
   */
  loadSizes(): void {
    this.productService.getSizes().subscribe({
      next: (data: any) => {
        this.sizes = data;
        this.maleCount = this.sizes.filter(s => s.gender === 'male').length;
        this.femaleCount = this.sizes.filter(s => s.gender === 'female').length;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi tải danh sách size:', err);
        alert('❌ Lỗi tải danh sách size');
      }
    });
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    let filtered = [...this.sizes];
    
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(s => s.gender === this.activeTab);
    }
    
    if (this.searchText.trim()) {
      const search = this.searchText.trim();
      filtered = filtered.filter(s => s.size.toString().includes(search));
    }
    
    this.filteredSizes = filtered.sort((a, b) => a.size - b.size);
    this.cdr.detectChanges();
  }

  /**
   * Open add modal
   */
  openAddSizeModal(): void {
    this.editingSize = null;
    this.newSize = { size: undefined, gender: undefined };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Edit size
   */
  editSize(size: Size): void {
    this.editingSize = { ...size };
    this.newSize = { size: size.size, gender: size.gender };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Save size
   */
  saveSize(): void {
    if (!this.newSize.size || !this.newSize.gender) {
      alert('❌ Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.isSubmitting = true;

    if (this.editingSize?.id) {
      // Update
      this.productService.updateSize(this.editingSize.id, this.newSize).subscribe({
        next: () => {
          alert('✅ Cập nhật size thành công!');
          this.loadSizes();
          this.closeModal();
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Lỗi không xác định';
          alert('❌ Lỗi: ' + msg);
          this.isSubmitting = false;
        }
      });
    } else {
      // Add new
      this.productService.addSize(this.newSize).subscribe({
        next: () => {
          alert('✅ Thêm size thành công!');
          this.loadSizes();
          this.closeModal();
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Lỗi không xác định';
          alert('❌ Lỗi: ' + msg);
          this.isSubmitting = false;
        }
      });
    }
  }

  /**
   * Delete size
   */
  deleteSize(id: number): void {
    if (!confirm('Bạn có chắc muốn xóa size này?')) {
      return;
    }

    this.isSubmitting = true;

    this.productService.deleteSize(id).subscribe({
      next: () => {
        alert('✅ Xóa size thành công!');
        this.loadSizes();
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Lỗi không xác định';
        alert('❌ Lỗi: ' + msg);
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModal = false;
    this.editingSize = null;
    this.newSize = { size: undefined, gender: undefined };
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }
}
