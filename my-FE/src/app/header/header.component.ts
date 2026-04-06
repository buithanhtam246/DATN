<<<<<<< HEAD
import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
=======
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
import { NavigationService, CartService } from '../core/services';
import { MenuItem } from '../core/models';

/**
 * Header Component
 * Single Responsibility: Chỉ hiển thị header UI
 * Open/Closed: Mở rộng thông qua services
 * Dependency Inversion: Phụ thuộc vào abstractions (services)
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
<<<<<<< HEAD
  styleUrl: './header.component.scss',
  host: {
    '[class.scrolled]': 'isScrolled'
  }
=======
  styleUrl: './header.component.scss'
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
})
export class HeaderComponent {
  // Dependency Injection - Inversion of Control
  private readonly navigationService = inject(NavigationService);
  private readonly cartService = inject(CartService);
<<<<<<< HEAD
  private readonly router = inject(Router);

  // Scroll state
  public isScrolled = false;

  // Public properties for template - use signal for reactive updates
  public readonly menuItems = this.navigationService.getMenuItemsSignal();
=======

  // Public properties for template
  public readonly menuItems: MenuItem[] = this.navigationService.getMenuItems();
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  public readonly cartItemCount = this.cartService.itemCount;

  /**
   * Handle search action
   */
  onSearch(): void {
    // TODO: Implement search functionality
<<<<<<< HEAD
=======
    console.log('Search clicked');
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  }

  /**
   * Handle user profile action
   */
  onUserProfile(): void {
<<<<<<< HEAD
    const token = localStorage.getItem('authToken');
    this.router.navigate([token ? '/account' : '/login']);
=======
    // TODO: Implement user profile functionality
    console.log('User profile clicked');
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  }

  /**
   * Handle favorites action
   */
  onFavorites(): void {
    // TODO: Implement favorites functionality
<<<<<<< HEAD
=======
    console.log('Favorites clicked');
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  }

  /**
   * Handle cart action
   */
  onCart(): void {
<<<<<<< HEAD
    this.router.navigate(['/cart']);
  }

  /**
   * Detect scroll to add/remove scrolled class
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }
}
=======
    // TODO: Implement cart functionality
    console.log('Cart clicked');
  }
}
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
