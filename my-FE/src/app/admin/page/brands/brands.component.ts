import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService, Brand } from '../../../services/brand.service';

interface BrandForm {
  name: string;
  status: string;
}

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss'
})
export class BrandsComponent implements OnInit {
  listBrands: Brand[] = [];
  filteredBrands: Brand[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  
  showModal: boolean = false;
  editingBrand: Brand | null = null;
  newBrand: BrandForm = { name: '', status: 'active' };
  
  searchText: string = '';

  constructor(
    private brandService: BrandService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading = true;
    this.brandService.getAllBrands().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.listBrands = res.data;
          this.applyFilters();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi API:', err);
        this.errorMessage = 'Lỗi kết nối server.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.listBrands];

    if (this.searchText && this.searchText.trim()) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    this.filteredBrands = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchText = '';
    this.applyFilters();
  }

  openAddModal(): void {
    this.showModal = true;
    this.editingBrand = null;
    this.newBrand = { name: '', status: 'active' };
  }

  editBrand(brand: Brand): void {
    this.showModal = true;
    this.editingBrand = { ...brand };
    this.newBrand = { name: brand.name, status: brand.status };
  }

  closeModal(): void {
    this.showModal = false;
    this.editingBrand = null;
    this.newBrand = { name: '', status: 'active' };
    this.isSubmitting = false;
  }

  saveBrand(): void {
    if (!this.newBrand.name || !this.newBrand.name.trim()) {
      this.errorMessage = 'Vui lòng nhập tên thương hiệu';
      return;
    }

    this.isSubmitting = true;

    if (this.editingBrand) {
      // Update
      this.brandService.updateBrand(this.editingBrand.id, this.newBrand).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.errorMessage = '';
            alert('✅ Cập nhật thành công!');
            this.closeModal();
            this.loadBrands();
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi cập nhật thương hiệu';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create
      this.brandService.createBrand(this.newBrand).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.errorMessage = '';
            alert('✅ Thêm thành công!');
            this.closeModal();
            this.loadBrands();
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi thêm thương hiệu';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteBrand(id: number): void {
    if (!confirm('Bạn chắc chắn muốn xóa thương hiệu này?')) {
      return;
    }

    this.brandService.deleteBrand(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('✅ Xóa thành công!');
          this.loadBrands();
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi xóa thương hiệu';
        this.cdr.detectChanges();
      }
    });
  }
}