import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  // Dependency Injection - Inversion of Control
  private readonly navigationService = inject(NavigationService);
  private readonly cartService = inject(CartService);

  // Public properties for template
  public readonly menuItems: MenuItem[] = this.navigationService.getMenuItems();
  public readonly cartItemCount = this.cartService.itemCount;

  /**
   * Handle search action
   */
  onSearch(): void {
    // TODO: Implement search functionality
    console.log('Search clicked');
  }

  /**
   * Handle user profile action
   */
  onUserProfile(): void {
    // TODO: Implement user profile functionality
    console.log('User profile clicked');
  }

  /**
   * Handle favorites action
   */
  onFavorites(): void {
    // TODO: Implement favorites functionality
    console.log('Favorites clicked');
  }

  /**
   * Handle cart action
   */
  onCart(): void {
    // TODO: Implement cart functionality
    console.log('Cart clicked');
  }
}
