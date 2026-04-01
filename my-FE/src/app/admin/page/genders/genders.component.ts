import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenderService, Gender } from '../../../services/gender.service';

interface GenderForm {
  name: string;
  code: string;
  icon: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-genders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './genders.component.html',
  styleUrl: './genders.component.scss'
})
export class GendersComponent implements OnInit {
  // Data
  gendersList: Gender[] = [];
  filteredGenders: Gender[] = [];

  // UI State
  isLoading: boolean = true;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  searchText: string = '';

  // Modal State
  showModal: boolean = false;
  editingGender: Gender | null = null;

  // Form Data
  newGender: GenderForm = { name: '', code: '', icon: '🔄', description: '', status: 'active' };

  constructor(
    private genderService: GenderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGenders();
  }

  loadGenders(): void {
    this.isLoading = true;
    this.genderService.getAllGenders().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.gendersList = res.data;
          this.applyFilters();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error:', err);
        this.errorMessage = 'Lỗi kết nối server';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.gendersList];

    if (this.searchText && this.searchText.trim()) {
      filtered = filtered.filter(gender =>
        gender.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        gender.code.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    this.filteredGenders = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchText = '';
    this.applyFilters();
  }

  // Modal Management
  openAddGenderModal(): void {
    this.showModal = true;
    this.editingGender = null;
    this.newGender = { name: '', code: '', icon: '🔄', description: '', status: 'active' };
  }

  editGender(gender: Gender): void {
    this.editingGender = gender;
    this.newGender = { ...gender };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingGender = null;
    this.isSubmitting = false;
  }

  saveGender(): void {
    if (!this.newGender.name || !this.newGender.code) {
      this.errorMessage = 'Tên và Code không được để trống';
      return;
    }

    this.isSubmitting = true;

    if (this.editingGender) {
      // Update
      this.genderService.updateGender(this.editingGender.id, this.newGender).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.errorMessage = '';
            alert('✅ Cập nhật thành công!');
            this.closeModal();
            this.loadGenders();
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi cập nhật';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create
      this.genderService.createGender(this.newGender).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.errorMessage = '';
            alert('✅ Thêm giới tính thành công!');
            this.closeModal();
            this.loadGenders();
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi thêm giới tính';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteGender(id: number): void {
    if (!confirm('Bạn chắc chắn muốn xóa giới tính này?')) {
      return;
    }

    this.genderService.deleteGender(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('✅ Xóa thành công!');
          this.loadGenders();
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi xóa giới tính';
        this.cdr.detectChanges();
      }
    });
  }

  // Helper methods
  get activeGendersCount(): number {
    return this.gendersList.filter(g => g.status === 'active').length;
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? '✅ Hoạt động' : '❌ Ẩn';
  }
}
