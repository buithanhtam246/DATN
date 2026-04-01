import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Spotlight Component
 * 
 * Responsibility: Display featured product categories
 * - Show product categories in grid layout
 * - Navigate to category pages
 */
@Component({
  selector: 'app-spotlight',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotlight.component.html',
  styleUrl: './spotlight.component.scss'
})
export class SpotlightComponent implements OnInit {
  categories: Category[] = [];

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categories = [
      {
        id: 'air-force',
        name: 'AIR FORCE',
        imageUrl: '/assets/images/categories/nikeaf1.jpg'
      },
      {
        id: 'jordan',
        name: 'JORDAN',
        imageUrl: '/assets/images/categories/nikejd.jpg'
      },
      {
        id: 'vomero',
        name: 'VOMERO',
        imageUrl: '/assets/images/categories/vomero.jpg'
      },
      {
        id: 'air-max',
        name: 'AIR MAX',
        imageUrl: '/assets/images/categories/nike-amax.jpg'
      },
      {
        id: 'pegasus',
        name: 'PEGASUS',
        imageUrl: '/assets/images/categories/pegasus.jpg'
      },
      {
        id: 'dunk',
        name: 'DUNK',
        imageUrl: '/assets/images/categories/nikedunk.jpg'
      },
      {
        id: 'gym',
        name: 'GYM',
        imageUrl: '/assets/images/categories/gym.jpg'
      },
      {
        id: 'adidas',
        name: 'ADIDAS',
        imageUrl: '/assets/images/categories/adidas.jpg'
      },
      {
        id: 'pegasus-2',
        name: 'PEGASUS',
        imageUrl: '/assets/images/categories/tennis.jpg'
      },
      {
        id: 'basketball',
        name: 'BASKETBALL',
        imageUrl: '/assets/images/categories/basketball.jpg'
      },
      {
        id: 'football',
        name: 'FOOTBALL',
        imageUrl: '/assets/images/categories/football.jpg'
      },
      {
        id: 'cortez',
        name: 'CORTEZ',
        imageUrl: '/assets/images/categories/cortez.jpg'
      },
      {
        id: 'kids',
        name: 'KIDS',
        imageUrl: '/assets/images/categories/kids.jpg'
      },
      {
        id: 'golf',
        name: 'GOLF',
        imageUrl: '/assets/images/categories/golf.jpg'
      },
      {
        id: 'blazer',
        name: 'BLAZER',
        imageUrl: '/assets/images/categories/blazer.jpg'
      },
      {
        id: 'skate',
        name: 'SKATE',
        imageUrl: '/assets/images/categories/skate.jpg'
      }
    ];
  }

  selectCategory(categoryId: string): void {
    // TODO: Navigate to category page or filter products
    console.log('Selected category:', categoryId);
  }
}