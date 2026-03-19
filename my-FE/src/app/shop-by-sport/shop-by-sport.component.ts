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
