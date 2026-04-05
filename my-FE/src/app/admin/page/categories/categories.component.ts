import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../services/category.service';

interface CategoryForm {
  name: string;
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
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  isSubmitting = signal(false);
  showModal = signal(false);
  editingCategory = signal<Category | null>(null);
  selectedParent = signal<Category | null>(null);
  modalMode = signal<'add-parent' | 'edit' | 'add-subcategory'>('add-parent');
  formData = signal<CategoryForm>({ name: '', status: 'active' });
  expandedParentIds = signal<Set<number>>(new Set());

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.categories.set(res.data);
          this.errorMessage.set('');
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.errorMessage.set('Loi ket noi server');
        this.isLoading.set(false);
      }
    });
  }

  openAddParentModal(): void {
    this.showModal.set(true);
    this.modalMode.set('add-parent');
    this.editingCategory.set(null);
    this.selectedParent.set(null);
    this.formData.set({ name: '', status: 'active' });
  }

  openAddSubcategoryModal(parent: Category): void {
    this.showModal.set(true);
    this.modalMode.set('add-subcategory');
    this.editingCategory.set(null);
    this.selectedParent.set(parent);
    this.formData.set({ name: '', status: 'active' });
  }

  editCategory(category: Category): void {
    this.showModal.set(true);
    this.modalMode.set('edit');
    this.editingCategory.set(category);
    this.formData.set({ name: category.name, status: category.status });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCategory.set(null);
    this.selectedParent.set(null);
    this.modalMode.set('add-parent');
    this.formData.set({ name: '', status: 'active' });
    this.isSubmitting.set(false);
  }

  saveCategory(): void {
    const form = this.formData();
    if (!form.name || !form.name.trim()) {
      this.errorMessage.set('Ten danh muc khong duoc de trong');
      return;
    }

    this.isSubmitting.set(true);
    const editing = this.editingCategory();

    if (editing) {
      this.categoryService.updateCategory(editing.id, form).subscribe({
        next: (res: any) => {
          if (res?.success) {
            alert('Cap nhat thanh cong!');
            this.closeModal();
            this.loadCategories();
          }
          this.isSubmitting.set(false);
        },
        error: (err: any) => {
          this.errorMessage.set(err.error?.message || 'Loi cap nhat');
          this.isSubmitting.set(false);
        }
      });
    } else if (this.modalMode() === 'add-parent') {
      this.categoryService.createParentCategory(form).subscribe({
        next: (res: any) => {
          if (res?.success) {
            alert('Them danh muc thanh cong!');
            this.closeModal();
            this.loadCategories();
          }
          this.isSubmitting.set(false);
        },
        error: (err: any) => {
          this.errorMessage.set(err.error?.message || 'Loi them danh muc');
          this.isSubmitting.set(false);
        }
      });
    } else {
      const parent = this.selectedParent();
      if (!parent?.id) {
        this.errorMessage.set('Vui long chon danh muc cha');
        this.isSubmitting.set(false);
        return;
      }

      this.categoryService.createSubCategory({
        parentId: parent.id,
        ...form
      }).subscribe({
        next: (res: any) => {
          if (res?.success) {
            alert('Them danh muc con thanh cong!');
            this.closeModal();
            this.loadCategories();
          }
          this.isSubmitting.set(false);
        },
        error: (err: any) => {
          this.errorMessage.set(err.error?.message || 'Loi them danh muc con');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  deleteCategory(id: number, hasChildren: boolean = false): void {
    const msg = hasChildren ? 'Danh muc con cung se bi xoa. Ban chac chan?' : 'Ban chac chan muon xoa?';
    if (!confirm(msg)) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          alert('Xoa thanh cong!');
          this.loadCategories();
        }
      },
      error: (err: any) => {
        this.errorMessage.set(err.error?.message || 'Loi xoa danh muc');
      }
    });
  }

  toggleParent(parentId: number): void {
    const expanded = this.expandedParentIds();
    const newSet = new Set(expanded);
    if (newSet.has(parentId)) {
      newSet.delete(parentId);
    } else {
      newSet.add(parentId);
    }
    this.expandedParentIds.set(newSet);
  }

  isParentExpanded(parentId: number): boolean {
    return this.expandedParentIds().has(parentId);
  }

  getStatusBadgeClass(status: string): string {
    return status === 'active' ? 'badge-success' : 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? 'Hoat dong' : 'An';
  }

  toggleVisibility(category: Category): void {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = newStatus === 'active' 
      ? `Bạn có muốn hiện danh mục "${category.name}" không?`
      : `Bạn có muốn ẩn danh mục "${category.name}" không?`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    this.isSubmitting.set(true);
    const updateData = {
      name: category.name,
      status: newStatus
    };

    this.categoryService.updateCategory(category.id, updateData).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const message = newStatus === 'active' 
            ? `Danh mục "${category.name}" đã được hiện!`
            : `Danh mục "${category.name}" đã bị ẩn!`;
          alert(message);
          this.errorMessage.set('');
          
          // Reload lại danh sách từ server để lấy dữ liệu mới nhất
          this.loadCategories();
        } else {
          this.errorMessage.set('Cập nhật trạng thái thất bại!');
        }
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.errorMessage.set('Lỗi kết nối server!');
        this.isSubmitting.set(false);
      }
    });
  }
}