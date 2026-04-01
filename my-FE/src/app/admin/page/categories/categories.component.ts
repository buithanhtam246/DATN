import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../services/category.service';

interface CategoryForm {
  name: string;
  gender: string;
  status: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  // Data
  categoriesList: Category[] = [];
  filteredCategories: Category[] = [];
  
  // UI State
  isLoading: boolean = true;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  searchText: string = '';
  selectedParentId: number | null = null;
  viewMode: 'parents' | 'children' = 'children'; // Tab selection
  showParentList: boolean = false; // For parent selector dropdown
  
  // Modal State
  showModal: boolean = false;
  editingCategory: Category | null = null;
  modalMode: 'add-parent' | 'add-child' | 'add-child-direct' | 'edit' = 'add-parent';
  
  // Form Data
  newCategory: CategoryForm = { name: '', gender: 'male', status: 'active' };
  
  // Computed
  parentCategories: Category[] = [];
  childCategories: Category[] = [];

  // Computed property for total children count
  get totalChildCategories(): number {
    return this.parentCategories.reduce((sum, parent) => sum + (parent.children?.length || 0), 0);
  }

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.categoriesList = res.data;
          this.parentCategories = res.data.filter((c: Category) => c.isParent);
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
    let filtered = [...this.categoriesList];

    if (this.searchText && this.searchText.trim()) {
      filtered = filtered.filter(cat => {
        const matchName = cat.name.toLowerCase().includes(this.searchText.toLowerCase());
        const matchChildren = cat.children?.some(child => 
          child.name.toLowerCase().includes(this.searchText.toLowerCase())
        );
        return matchName || matchChildren;
      });
    }

    this.filteredCategories = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedParentId = null;
    this.applyFilters();
  }

  // Filter by gender (for quick suggestions)
  filterByGender(gender: string): void {
    this.newCategory.gender = gender;
    this.applyFilters();
  }

  // View Mode Management
  switchViewMode(mode: 'parents' | 'children'): void {
    this.viewMode = mode;
    this.searchText = '';
    this.selectedParentId = null;
    this.applyFilters();
  }

  // Modal Management
  openAddParentModal(): void {
    this.showModal = true;
    this.modalMode = 'add-parent';
    this.editingCategory = null;
    this.newCategory = { name: '', gender: 'male', status: 'active' };
    this.selectedParentId = null;
    this.showParentList = false;
  }

  openAddChildModal(parent: Category): void {
    this.showModal = true;
    this.modalMode = 'add-child';
    this.selectedParentId = parent.id;
    this.editingCategory = null;
    this.newCategory = { name: '', gender: parent.gender, status: 'active' };
    this.showParentList = false;
  }

  openAddChildFromListModal(): void {
    this.showModal = true;
    this.modalMode = 'add-child-direct';
    this.selectedParentId = null;
    this.editingCategory = null;
    this.newCategory = { name: '', gender: 'male', status: 'active' };
    this.showParentList = false;
  }

  editCategory(category: Category): void {
    this.showModal = true;
    this.modalMode = 'edit';
    this.editingCategory = { ...category };
    this.newCategory = { 
      name: category.name, 
      gender: category.gender, 
      status: category.status 
    };
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.modalMode = 'add-parent';
    this.newCategory = { name: '', gender: 'male', status: 'active' };
    this.isSubmitting = false;
  }

  saveCategory(): void {
    if (!this.newCategory.name || !this.newCategory.name.trim()) {
      this.errorMessage = 'Tên danh mục không được để trống';
      return;
    }

    this.isSubmitting = true;

    if (this.editingCategory) {
      // Update
      this.categoryService.updateCategory(this.editingCategory.id, this.newCategory).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.errorMessage = '';
            alert('✅ Cập nhật thành công!');
            this.closeModal();
            this.loadCategories();
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
    } else if (this.modalMode === 'add-parent') {
      // Create Parent
      this.categoryService.createParentCategory(this.newCategory).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.errorMessage = '';
            alert('✅ Thêm danh mục thành công!');
            this.closeModal();
            this.loadCategories();
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi thêm danh mục';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create Child
      const childData = { ...this.newCategory, parentId: this.selectedParentId };
      this.categoryService.createSubCategory(childData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.errorMessage = '';
            alert('✅ Thêm danh mục con thành công!');
            this.closeModal();
            this.loadCategories();
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi thêm danh mục con';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteCategory(id: number): void {
    if (!confirm('Bạn chắc chắn muốn xóa danh mục này? (Danh mục con cũng sẽ bị xóa)')) {
      return;
    }

    this.categoryService.deleteCategory(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('✅ Xóa thành công!');
          this.loadCategories();
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi xóa danh mục';
        this.cdr.detectChanges();
      }
    });
  }

  // Helper methods
  getGenderLabel(gender: string): string {
    if (gender === 'male') return '👨 Nam';
    if (gender === 'female') return '👩 Nữ';
    return '🔄 Unisex';
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? '✅ Hoạt động' : '❌ Ẩn';
  }

  // Parent selector methods
  toggleParentList(): void {
    this.showParentList = !this.showParentList;
  }

  selectParent(parent: Category): void {
    this.selectedParentId = parent.id;
    this.showParentList = false;
  }

  getParentName(parentId: number | null): string {
    if (!parentId) return '';
    const parent = this.parentCategories.find(p => p.id === parentId);
    return parent ? parent.name : '';
  }

  getParentById(parentId: number | null): Category | null {
    if (!parentId) return null;
    return this.parentCategories.find(p => p.id === parentId) || null;
  }
}