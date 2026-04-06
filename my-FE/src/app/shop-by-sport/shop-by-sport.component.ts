<<<<<<< HEAD
import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BannerService } from '../services/banner.service';

interface Sport {
  id: number;
  categoryId: number;
=======
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Sport {
  id: string;
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  name: string;
  imageUrl: string;
}

/**
 * Shop By Sport Component
 * 
 * Responsibility: Display sports categories carousel
 * - Show sport categories with images
 * - Navigate through sports carousel
 * - Select active sport category
 */
@Component({
  selector: 'app-shop-by-sport',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-by-sport.component.html',
  styleUrl: './shop-by-sport.component.scss'
})
export class ShopBySportComponent implements OnInit {
<<<<<<< HEAD
  private bannerService = inject(BannerService);
  private router = inject(Router);

  sports: Sport[] = [];
  currentIndex = 0;
  activeSportId: number | null = null;
  itemsPerView = 3;
  isDragging = false;

  private dragStartX = 0;
  private dragDeltaX = 0;
  private readonly swipeThreshold = 60;
=======
  sports: Sport[] = [];
  currentIndex = 0;
  activeSportId = 'football';
  itemsPerView = 3;
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  
  get slideWidth(): number {
    return 100 / this.itemsPerView;
  }

  ngOnInit(): void {
    this.loadSports();
    this.updateItemsPerView();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateItemsPerView();
  }

  private updateItemsPerView(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.itemsPerView = 1;
    } else if (width < 1024) {
      this.itemsPerView = 2;
    } else {
      this.itemsPerView = 3;
    }
<<<<<<< HEAD

    this.clampCurrentIndex();
  }

  private loadSports(): void {
    this.bannerService.getSportBanners().subscribe({
      next: (response) => {
        const raw = Array.isArray(response?.data) ? response.data : [];
        const activeBanners = raw.filter((item: any) => item.status === 'active');

        this.sports = activeBanners.map((item: any) => ({
          id: Number(item.id),
          categoryId: Number(item.category_id),
          name: (item.category_name || 'Danh mục con').trim(),
          imageUrl: this.getImageUrl(item.image_url)
        }));

        this.currentIndex = 0;
        this.activeSportId = this.sports.length > 0 ? this.sports[0].id : null;
        this.clampCurrentIndex();
      },
      error: () => {
        this.sports = [];
        this.currentIndex = 0;
        this.activeSportId = null;
      }
    });
  }

  openSportBanner(sport: Sport): void {
    this.activeSportId = sport.id;

    this.router.navigate(['/products'], {
      queryParams: {
        childCategory: sport.categoryId,
        categoryId: sport.categoryId,
        categoryName: sport.name
      }
    });
  }

  private getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${this.bannerService.categoryBannerImgBaseUrl}${imageUrl}`;
=======
  }

  private loadSports(): void {
    this.sports = [
      {
        id: 'running',
        name: 'Running',
        imageUrl: '/assets/images/sports/running.jpg'
      },
      {
        id: 'football',
        name: 'Football',
        imageUrl: '/assets/images/sports/football.jpg'
      },
      {
        id: 'basketball',
        name: 'Basketball',
        imageUrl: '/assets/images/sports/basketball.jpg'
      },
      {
        id: 'tennis',
        name: 'Tennis',
        imageUrl: '/assets/images/sports/tennis.jpg'
      },
      {
        id: 'golf',
        name: 'Golf',
        imageUrl: '/assets/images/sports/golf.jpg'
      },
      {
        id: 'training',
        name: 'Training',
        imageUrl: '/assets/images/sports/training.jpg'
      },
      {
        id: 'skateboarding',
        name: 'Skateboarding',
        imageUrl: '/assets/images/sports/skateboarding.jpg'
      },
      {
        id: 'swimming',
        name: 'Swimming',
        imageUrl: '/assets/images/sports/swimming.jpg'
      }
    ];
  }

  selectSport(sportId: string): void {
    this.activeSportId = sportId;
    // TODO: Navigate to sport category page or filter products
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next(): void {
<<<<<<< HEAD
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 0) {
      return;
    }
    this.isDragging = true;
    this.dragStartX = event.touches[0].clientX;
    this.dragDeltaX = 0;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length === 0) {
      return;
    }
    this.dragDeltaX = event.touches[0].clientX - this.dragStartX;
  }

  onTouchEnd(): void {
    this.finishSwipe();
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragDeltaX = 0;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }
    this.dragDeltaX = event.clientX - this.dragStartX;
  }

  onMouseUp(): void {
    this.finishSwipe();
  }

  onMouseLeave(): void {
    if (!this.isDragging) {
      return;
    }
    this.finishSwipe();
  }

  private finishSwipe(): void {
    if (!this.isDragging) {
      return;
    }

    if (this.dragDeltaX <= -this.swipeThreshold) {
      this.next();
    } else if (this.dragDeltaX >= this.swipeThreshold) {
      this.previous();
    }

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragDeltaX = 0;
  }

  private get maxIndex(): number {
    return Math.max(0, this.sports.length - this.itemsPerView);
  }

  private clampCurrentIndex(): void {
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
  }
}
=======
    if (this.currentIndex < this.sports.length - this.itemsPerView) {
      this.currentIndex++;
    }
  }
}
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
