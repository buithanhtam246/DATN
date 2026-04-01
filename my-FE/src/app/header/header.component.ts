import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  styleUrl: './header.component.scss',
  host: {
    '[class.scrolled]': 'isScrolled'
  }
})
export class HeaderComponent {
  // Dependency Injection - Inversion of Control
  private readonly navigationService = inject(NavigationService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // Scroll state
  public isScrolled = false;

  // Public properties for template
  public readonly menuItems: MenuItem[] = this.navigationService.getMenuItems();
  public readonly cartItemCount = this.cartService.itemCount;

  /**
   * Handle search action
   */
  onSearch(): void {
    // TODO: Implement search functionality
  }

  /**
   * Handle user profile action
   */
  onUserProfile(): void {
    const token = localStorage.getItem('authToken');
    this.router.navigate([token ? '/account' : '/login']);
  }

  /**
   * Handle favorites action
   */
  onFavorites(): void {
    // TODO: Implement favorites functionality
  }

  /**
   * Handle cart action
   */
  onCart(): void {
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