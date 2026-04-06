<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BannerService } from '../services/banner.service';
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284

/**
 * Featured Collections Component
 * 
 * Responsibility: Display featured collection cards
 * - Show Kids, School, and Football collections
 * - Handle navigation to collection pages
 */
@Component({
  selector: 'app-featured-collections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-collections.component.html',
  styleUrl: './featured-collections.component.scss'
})
<<<<<<< HEAD
export class FeaturedCollectionsComponent implements OnInit {
  private bannerService = inject(BannerService);
  private router = inject(Router);

  banners = signal<any[]>([]);

  ngOnInit(): void {
    this.bannerService.getCategoryBanners().subscribe({
      next: (response) => {
        const raw = Array.isArray(response?.data) ? response.data : [];
        const activeBanners = raw.filter((item: any) => item.status === 'active').slice(0, 3);
        this.banners.set(activeBanners);
      },
      error: () => {
        this.banners.set([]);
      }
    });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${this.bannerService.categoryBannerImgBaseUrl}${imageUrl}`;
  }

  getCardClass(index: number): string {
    const classes = ['card-kids', 'card-school', 'card-football'];
    return classes[index % classes.length];
  }

  getCollectionLabel(): string {
    return 'Bộ Sưu Tập';
  }

  getCategoryName(item: any): string {
    return (item?.category_name || 'Danh mục').trim();
  }

  getNote(item: any): string {
    const note = (item?.note || '').trim();
    return note || `Khám phá bộ sưu tập nổi bật dành cho ${this.getCategoryName(item)}.`;
  }

  openBanner(item: any): void {
    const parentCategoryId = Number(item?.category_id);
    const categoryName = this.getCategoryName(item);

    this.router.navigate(['/products'], {
      queryParams: {
        ...(Number.isFinite(parentCategoryId) && parentCategoryId > 0 ? { parentCategory: parentCategoryId } : {}),
        ...(categoryName ? { categoryName } : {})
      }
    });
  }
}
=======
export class FeaturedCollectionsComponent {
  // Component logic here
}
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
