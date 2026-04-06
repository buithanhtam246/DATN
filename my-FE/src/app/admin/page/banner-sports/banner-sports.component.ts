import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BannerService } from '../../../services/banner.service';
import { CategoryService } from '../../../services/category.service';

interface SportBannerItem {
  id: number;
  category_id: number;
  title: string;
  imageUrl: string;
  sport: string;
  linkUrl: string;
  note: string;
  status: 'active' | 'inactive';
}

interface ChildCategoryItem {
  id: number;
  name: string;
  parentName: string;
}

@Component({
  selector: 'app-banner-sports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './banner-sports.component.html',
  styleUrl: './banner-sports.component.scss'
})
export class BannerSportsComponent implements OnInit {
  private bannerService = inject(BannerService);
  private categoryService = inject(CategoryService);

  banners = signal<SportBannerItem[]>([]);
  childCategories = signal<ChildCategoryItem[]>([]);

  searchQuery = signal('');
  loading = signal(false);
  submitting = signal(false);
  togglingBannerId = signal<number | null>(null);

  showAddModal = signal(false);
  showEditModal = signal(false);
  editingBannerId: number | null = null;

  selectedCategoryId: number | null = null;
  formNote = '';
  formStatus: 'active' | 'inactive' = 'active';
  selectedImageFile: File | null = null;
  selectedImagePreview = '';

  ngOnInit(): void {
    this.loadChildCategories();
    this.loadSportBanners();
  }

  loadChildCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        const raw = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        const children: ChildCategoryItem[] = [];

        raw.forEach((category: any) => {
          const parentName = category?.name || 'Danh mục cha';
          if (Array.isArray(category?.children) && category.children.length > 0) {
            category.children.forEach((child: any) => {
              children.push({
                id: Number(child.id),
                name: child.name || `Danh mục #${child.id}`,
                parentName
              });
            });
            return;
          }

          if (category?.parent_id) {
            children.push({
              id: Number(category.id),
              name: category.name || `Danh mục #${category.id}`,
              parentName: 'Danh mục cha'
            });
          }
        });

        const uniqueById = Array.from(new Map(children.map((item) => [item.id, item])).values());
        this.childCategories.set(uniqueById);
      },
      error: () => {
        this.childCategories.set([]);
      }
    });
  }

  loadSportBanners(): void {
    this.loading.set(true);
    this.bannerService.getSportBanners().subscribe({
      next: (response) => {
        const raw = Array.isArray(response?.data) ? response.data : [];
        this.banners.set(
          raw.map((item: any) => ({
            id: Number(item.id),
            category_id: Number(item.category_id),
            title: item.title || `Banner ${item.category_name || ''}`,
            imageUrl: item.image_url || '',
            sport: item.category_name || 'Danh mục con',
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

  openEditModal(banner: SportBannerItem): void {
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

  getDisplayedChildCategories(): ChildCategoryItem[] {
    const normalizeText = (value: any): string =>
      (value || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const uniqueByName = new Map<string, ChildCategoryItem>();
    this.childCategories().forEach((category) => {
      const key = normalizeText(category.name);
      if (!uniqueByName.has(key)) {
        uniqueByName.set(key, category);
      }
    });

    return Array.from(uniqueByName.values());
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

    const formData = new FormData();
    formData.append('category_id', String(this.selectedCategoryId));
    formData.append('image', this.selectedImageFile);
    formData.append('status', this.formStatus);
    formData.append('note', this.formNote.trim());

    this.submitting.set(true);
    this.bannerService.createSportBanner(formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAddModal();
        this.loadSportBanners();
      },
      error: (error) => {
        this.submitting.set(false);
        alert(error?.error?.message || 'Không thể thêm banner thể thao');
      }
    });
  }

  submitUpdateBanner(): void {
    if (!this.editingBannerId) {
      return;
    }

    const formData = new FormData();
    formData.append('status', this.formStatus);
    formData.append('note', this.formNote.trim());
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.submitting.set(true);
    this.bannerService.updateSportBanner(this.editingBannerId, formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeEditModal();
        this.loadSportBanners();
      },
      error: (error) => {
        this.submitting.set(false);
        alert(error?.error?.message || 'Không thể cập nhật banner thể thao');
      }
    });
  }

  toggleBannerStatus(banner: SportBannerItem): void {
    const nextStatus: 'active' | 'inactive' = banner.status === 'active' ? 'inactive' : 'active';
    const formData = new FormData();
    formData.append('status', nextStatus);

    this.togglingBannerId.set(banner.id);
    this.bannerService.updateSportBanner(banner.id, formData).subscribe({
      next: () => {
        this.banners.update((items) =>
          items.map((item) => (item.id === banner.id ? { ...item, status: nextStatus } : item))
        );
        this.togglingBannerId.set(null);
      },
      error: (error) => {
        this.togglingBannerId.set(null);
        alert(error?.error?.message || 'Không thể cập nhật trạng thái banner');
      }
    });
  }

  deleteBanner(id: number): void {
    if (!confirm('Bạn có chắc muốn xóa banner thể thao này?')) {
      return;
    }

    this.bannerService.deleteSportBanner(id).subscribe({
      next: () => {
        this.banners.update((items) => items.filter((item) => item.id !== id));
      },
      error: (error) => {
        alert(error?.error?.message || 'Không thể xóa banner thể thao');
      }
    });
  }

  filteredBanners = computed(() => {
    const keyword = this.searchQuery().trim().toLowerCase();
    if (!keyword) {
      return this.banners();
    }

    return this.banners().filter((banner) =>
      banner.title.toLowerCase().includes(keyword) ||
      banner.sport.toLowerCase().includes(keyword) ||
      banner.linkUrl.toLowerCase().includes(keyword) ||
      banner.note.toLowerCase().includes(keyword)
    );
  });

  private resetForm(): void {
    this.editingBannerId = null;
    this.selectedCategoryId = null;
    this.formNote = '';
    this.formStatus = 'active';
    this.selectedImageFile = null;
    this.selectedImagePreview = '';
  }
}
