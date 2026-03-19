import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit {

  user: any;
  defaultAddress: any = null;
  isLoading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Kiểm tra xem user đã login chưa
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load dữ liệu ngay khi component khởi tạo
    this.loadUserProfileWithAddress();

    // Subscribe tới sự kiện NavigationEnd để reload khi quay lại trang này
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/account') {
          this.loadUserProfileWithAddress();
        }
      });
  }

  loadUserProfileWithAddress() {
    this.isLoading = true;
    console.log('Loading user profile, token:', this.authService.getToken());
    
    this.userService.getProfileWithAddress().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);
        if (response && response.success) {
          this.user = response.data;
          this.defaultAddress = response.data?.default_address;
          // Cập nhật localStorage
          localStorage.setItem('user', JSON.stringify(this.user));
          console.log('User loaded:', this.user);
          // Force change detection
          this.cdr.markForCheck();
        } else {
          console.error('Invalid response structure:', response);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading profile:', err);
        // Thử lại với dữ liệu từ localStorage nếu API fail
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          this.user = JSON.parse(cachedUser);
          this.defaultAddress = this.user?.default_address;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
  goToAddresses() {
    this.router.navigate(['/addresses']);
  }

  logout() {
    localStorage.removeItem('user');
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
