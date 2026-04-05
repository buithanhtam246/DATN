import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BannerService } from '../../../services/banner.service';
import { CategoryService } from '../../../services/category.service';

interface CategoryBannerItem {
  id: number;
  category_id: number;
  title: string;
  imageUrl: string;
  category: string;
  linkUrl: string;
  note: string;
  status: 'active' | 'inactive';
}

interface ParentCategoryItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-banner-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './banner-categories.component.html',
  styleUrl: './banner-categories.component.scss'
})
export class BannerCategoriesComponent implements OnInit {
  readonly maxActiveBanners = 3;

  private bannerService = inject(BannerService);
  private categoryService = inject(CategoryService);

  banners = signal<CategoryBannerItem[]>([]);
  parentCategories = signal<ParentCategoryItem[]>([]);

  searchQuery = signal('');
  loading = signal(false);
  submitting = signal(false);
  showAddModal = signal(false);
  showEditModal = signal(false);
  togglingBannerId = signal<number | null>(null);
  editingBannerId: number | null = null;

  selectedCategoryId: number | null = null;
  formNote = '';
  formStatus: 'active' | 'inactive' = 'active';
  selectedImageFile: File | null = null;
  selectedImagePreview = '';

  activeBannerCount = computed(() => this.banners().filter((banner) => banner.status === 'active').length);

  filteredBanners = computed(() => {
    const keyword = this.searchQuery().trim().toLowerCase();
    if (!keyword) {
      return this.banners();
    }

    return this.banners().filter((banner) =>
      banner.title.toLowerCase().includes(keyword) ||
      banner.category.toLowerCase().includes(keyword) ||
      banner.linkUrl.toLowerCase().includes(keyword) ||
      banner.note.toLowerCase().includes(keyword)
    );
  });

  ngOnInit(): void {
    this.loadParentCategories();
    this.loadCategoryBanners();
  }

  loadParentCategories(): void {
    this.categoryService.getParentCategories().subscribe({
      next: (response) => {
        const categories = Array.isArray(response?.data) ? response.data : [];
        this.parentCategories.set(
          categories.map((item: any) => ({
            id: Number(item.id),
            name: item.name || `Danh mục #${item.id}`
          }))
        );
      },
      error: () => {
        this.parentCategories.set([]);
      }
    });
  }

  loadCategoryBanners(): void {
    this.loading.set(true);
    this.bannerService.getCategoryBanners().subscribe({
      next: (response) => {
        const raw = Array.isArray(response?.data) ? response.data : [];
        this.banners.set(
          raw.map((item: any) => ({
            id: Number(item.id),
            category_id: Number(item.category_id),
            title: item.title || 'Banner danh mục',
            imageUrl: item.image_url || '',
            category: item.category_name || 'Chưa rõ',
            linkUrl: item.link_url || '',
            note: item.note || '',
            status: item.status === 'inactive' ? 'inactive' : 'active'
          }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.banners.set([]);
        this.loading.set(false);
      }
    });
  }

  getDisplayImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${this.bannerService.categoryBannerImgBaseUrl}${imageUrl}`;
  }

  openAddModal(): void {
    this.resetForm();
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.resetForm();
  }

  openEditModal(banner: CategoryBannerItem): void {
    this.resetForm();
    this.editingBannerId = banner.id;
    this.selectedCategoryId = banner.category_id;
    this.formNote = banner.note || '';
    this.formStatus = banner.status;
    this.selectedImagePreview = this.getDisplayImageUrl(banner.imageUrl);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.resetForm();
  }

  onCategoryChange(value: string): void {
    this.selectedCategoryId = value ? Number(value) : null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedImageFile = file;
    this.selectedImagePreview = file ? URL.createObjectURL(file) : '';
  }

  submitCreateBanner(): void {
    if (!this.selectedCategoryId || !this.selectedImageFile) {
      return;
    }

    if (this.formStatus === 'active' && !this.canActivateForAdd()) {
      return;
    }

    const formData = new FormData();
    formData.append('category_id', String(this.selectedCategoryId));
    formData.append('image', this.selectedImageFile);
    formData.append('status', this.formStatus);

    if (this.formNote.trim()) {
      formData.append('note', this.formNote.trim());
    }

    this.submitting.set(true);
    this.bannerService.createCategoryBanner(formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAddModal();
        this.loadCategoryBanners();
      },
      error: (error) => {
        this.submitting.set(false);
        alert(error?.error?.message || 'Không thể lưu banner');
      }
    });
  }

  submitUpdateBanner(): void {
    if (!this.editingBannerId) {
      return;
    }

    if (this.formStatus === 'active' && !this.canActivateForEdit()) {
      return;
    }

    const formData = new FormData();
    formData.append('category_id', String(this.editingBannerId));
    formData.append('note', this.formNote.trim());
    formData.append('status', this.formStatus);

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.submitting.set(true);
    this.bannerService.updateCategoryBanner(this.editingBannerId, formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeEditModal();
        this.loadCategoryBanners();
      },
      error: (error) => {
        this.submitting.set(false);
        alert(error?.error?.message || 'Không thể cập nhật banner');
      }
    });
  }

  canActivateForAdd(): boolean {
    return this.activeBannerCount() < this.maxActiveBanners;
  }

  canActivateForEdit(): boolean {
    if (!this.editingBannerId) {
      return this.canActivateForAdd();
    }

    const editingBanner = this.banners().find((item) => item.id === this.editingBannerId);
    if (!editingBanner) {
      return this.canActivateForAdd();
    }

    if (editingBanner.status === 'active') {
      return true;
    }

    return this.activeBannerCount() < this.maxActiveBanners;
  }

  canActivateBanner(banner: CategoryBannerItem): boolean {
    if (banner.status === 'active') {
      return true;
    }
    return this.activeBannerCount() < this.maxActiveBanners;
  }

  toggleBannerVisibility(banner: CategoryBannerItem): void {
    const nextStatus: 'active' | 'inactive' = banner.status === 'active' ? 'inactive' : 'active';

    if (nextStatus === 'active' && !this.canActivateBanner(banner)) {
      return;
    }

    const formData = new FormData();
    formData.append('status', nextStatus);

    this.togglingBannerId.set(banner.id);
    this.bannerService.updateCategoryBanner(banner.id, formData).subscribe({
      next: () => {
        this.banners.update((items) =>
          items.map((item) => (item.id === banner.id ? { ...item, status: nextStatus } : item))
        );
        this.togglingBannerId.set(null);
      },
      error: (error) => {
        this.togglingBannerId.set(null);
        alert(error?.error?.message || 'Không thể thay đổi trạng thái hiển thị');
      }
    });
  }

  deleteBanner(id: number): void {
    const accepted = confirm('Bạn có chắc chắn muốn xóa banner này?');
    if (!accepted) {
      return;
    }

    this.bannerService.deleteCategoryBanner(id).subscribe({
      next: () => {
        this.banners.update((items) => items.filter((item) => item.id !== id));
      }
    });
  }

  private resetForm(): void {
    this.editingBannerId = null;
    this.selectedCategoryId = null;
    this.formNote = '';
    this.formStatus = 'active';
    this.selectedImageFile = null;
    this.selectedImagePreview = '';
  }
}
