import { RouterModule } from '@angular/router';
import { Component, ChangeDetectorRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private gsiLoaded = false;

  email = '';
  password = '';
  isLoading = false;
  emailError = '';
  passwordError = '';
  formError = '';
  errorMessage$;
  successMessage$;

  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  constructor(private authService: AuthService, private cartService: CartService, private router: Router, private cdr: ChangeDetectorRef, private notificationService: NotificationService) {
    this.errorMessage$ = this.notificationService.errorMessage$;
    this.successMessage$ = this.notificationService.successMessage$;
    // Nếu đã đăng nhập và là user bình thường, redirect tới home
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin()) {
        // Admin đã login từ /admin/login, cho phép access /admin routes
        this.router.navigate(['/admin/dashboard']);
      } else {
        // User bình thường đã login, redirect tới home
        this.router.navigate(['/']);
      }
    }
  }

  ngOnInit(): void {
    this.loadGoogleScript();
  }

  private loadGoogleScript(): void {
    if (this.gsiLoaded) return;
    this.gsiLoaded = true;
    const src = 'https://accounts.google.com/gsi/client';
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // initialized later on button click
    };
    document.head.appendChild(script);
  }

  onGoogleSignInClick(): void {
    // ensure google script loaded
    const googleObj = (window as any).google;
    if (!googleObj || !environment.googleClientId) {
      this.notificationService.showError('Google Sign-In chưa được cấu hình. Vui lòng thêm googleClientId vào environment.');
      return;
    }

    // Initialize GSI with callback
    try {
      googleObj.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response)
      });

      // Prompt the One Tap / popup chooser
      googleObj.accounts.id.prompt();
    } catch (e) {
      console.error('Google Sign-In init error', e);
      this.notificationService.showError('Lỗi Google Sign-In. Kiểm tra console.');
    }
  }

  private handleGoogleCredential(response: any): void {
    const credential = response?.credential;
    if (!credential) {
      this.notificationService.showError('Không nhận được credential từ Google');
      return;
    }

    this.isLoading = true;
    this.authService.loginWithGoogle(credential).subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.token) {
          const token = res.data.token;
          const userData = res.data.user;
          localStorage.setItem('authToken', token);
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userRole', userData.role || 'user');
          if (res.data.cart_id) {
            this.cartService.setCartIdForCurrentUser(Number(res.data.cart_id));
          }
          this.cartService.refreshForCurrentUser();
          this.notificationService.showSuccess('Đăng nhập bằng Google thành công');
          // Route user based on role
          const role = userData.role || 'user';
          setTimeout(() => {
            if (role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 800);
        } else {
          this.notificationService.showError(res.message || 'Đăng nhập Google thất bại');
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Google login error', err);
        this.notificationService.showError(err?.error?.message || 'Đăng nhập Google thất bại');
        this.isLoading = false;
      }
    });
  }

  get isFormValid(): boolean {
    return !!(this.email && this.password);
  }

  onEmailChange() {
    this.emailError = '';
    this.formError = '';
  }

  onPasswordChange() {
    this.passwordError = '';
    this.formError = '';
  }

  login(){

    this.isLoading = true;
    this.emailError = '';
    this.passwordError = '';
    this.formError = '';

    if(!this.email || !this.password){
      this.notificationService.showError("Vui lòng nhập đầy đủ thông tin");
      this.isLoading = false;
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.token) {
          const token = response.data.token;
          const userData = response.data.user;
          
          // Verify that we have user data
          if (!userData) {
            this.notificationService.showError("Lỗi: Không có thông tin user từ server");
            this.isLoading = false;
            return;
          }

          // Lưu token
          localStorage.setItem('authToken', token);
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userRole', userData.role);
          
          // Lưu cart_id nếu có
          if (response.data.cart_id) {
            this.cartService.setCartIdForCurrentUser(Number(response.data.cart_id));
          }

          this.cartService.refreshForCurrentUser();

          this.notificationService.showSuccess("Đăng nhập thành công");
          this.isLoading = false;

          // Redirect based on role: admin -> admin dashboard, otherwise -> home
          setTimeout(() => {
            if (userData.role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 800);
        } else {
          this.formError = response.message || 'Đăng nhập thất bại';
          this.notificationService.showError(this.formError);
          this.isLoading = false;
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || "Đăng nhập thất bại. Vui lòng thử lại.";

        if (errorMessage === 'Email không tồn tại') {
          this.emailError = errorMessage;
          this.email = ''; // Clear email on wrong email
          this.cdr.detectChanges();
          setTimeout(() => {
            this.emailInput.nativeElement.focus();
          }, 0);
        } else if (errorMessage === 'Sai mật khẩu') {
          this.passwordError = errorMessage;
          this.password = ''; // Clear password on wrong password
          this.cdr.detectChanges();
          setTimeout(() => {
            this.passwordInput.nativeElement.focus();
          }, 0);
        } else {
          this.formError = errorMessage;
          this.notificationService.showError(errorMessage);
        }
        this.isLoading = false;
      }
    });

  }
}