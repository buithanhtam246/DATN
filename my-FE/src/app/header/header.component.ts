import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, CartService, NotificationService } from '../core/services';
import { MenuItem } from '../core/models';
import { Subscription } from 'rxjs';



/**
 * Header Component
 * Single Responsibility: Chỉ hiển thị header UI
 * Open/Closed: Mở rộng thông qua services
 * Dependency Inversion: Phụ thuộc vào abstractions (services)
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy{
  user: any;
  errorMessage = '';
  successMessage = '';
  private subscriptions: Subscription = new Subscription();

  ngOnInit(){
  const data = localStorage.getItem("user");
  if(data){
    this.user = JSON.parse(data);
  }

  // Subscribe to notification messages
  this.subscriptions.add(
    this.notificationService.errorMessage$.subscribe(message => {
      console.log('Header received error message:', message);
      this.errorMessage = message;
    })
  );

  this.subscriptions.add(
    this.notificationService.successMessage$.subscribe(message => {
      console.log('Header received success message:', message);
      this.successMessage = message;
    })
  );
}

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  // Dependency Injection - Inversion of Control
  private readonly navigationService = inject(NavigationService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  

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

const user = localStorage.getItem('user');

if(user){
  this.router.navigate(['/account']);
}else{
  this.router.navigate(['/login']);
}

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
