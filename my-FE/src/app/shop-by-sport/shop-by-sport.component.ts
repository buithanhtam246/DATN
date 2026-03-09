import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Sport {
  id: string;
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
  sports: Sport[] = [];
  currentIndex = 0;
  activeSportId = 'football';
  itemsPerView = 3;
  
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
  }

  private loadSports(): void {
    this.sports = [
      {
        id: 'running',
        name: 'Running',
        imageUrl: '/assets/images/running.jpg'
      },
      {
        id: 'football',
        name: 'Football',
        imageUrl: '/assets/images/football.jpg'
      },
      {
        id: 'basketball',
        name: 'Basketball',
        imageUrl: '/assets/images/basketball.jpg'
      },
      {
        id: 'tennis',
        name: 'Tennis',
        imageUrl: '/assets/images/tennis.jpg'
      },
      {
        id: 'golf',
        name: 'Golf',
        imageUrl: '/assets/images/golf.jpg'
      },
      {
        id: 'gym',
        name: 'Gym',
        imageUrl: '/assets/images/gym.jpg'
      },
      {
        id: 'skateboarding',
        name: 'Skateboarding',
        imageUrl: '/assets/images/skateboarding.jpg'
      },
      {
        id: 'yoga',
        name: 'Yoga',
        imageUrl: '/assets/images/yoga.jpg'
      }
    ];
  }

  selectSport(sportId: string): void {
    this.activeSportId = sportId;
    // TODO: Navigate to sport category page or filter products
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next(): void {
    if (this.currentIndex < this.sports.length - this.itemsPerView) {
      this.currentIndex++;
    }
  }
}
