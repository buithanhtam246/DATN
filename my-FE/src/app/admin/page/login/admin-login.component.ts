import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  email = '';
  password = '';
  isLoading = false;
  emailError = '';
  passwordError = '';

  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    // Nếu đã đăng nhập và là admin, chuyển tới dashboard
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  get isFormValid(): boolean {
    return !!(this.email && this.password);
  }

  onEmailChange() {
    this.emailError = '';
  }

  onPasswordChange() {
    this.passwordError = '';
  }

  login() {
    this.isLoading = true;
    this.emailError = '';
    this.passwordError = '';

    if (!this.email || !this.password) {
      this.notificationService.showError('Vui lòng nhập đầy đủ thông tin');
      this.isLoading = false;
      return;
    }

    // Gọi adminLogin endpoint riêng
    this.authService.adminLogin(this.email, this.password).subscribe({
      next: (response: any) => {
        if (response.success && response.data.token) {
          // Lưu token và thông tin admin
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userId', response.data.user.id);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('userRole', response.data.user.role);

          this.notificationService.showSuccess('Đăng nhập admin thành công');
          this.isLoading = false;

          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1500);
        } else {
          this.notificationService.showError(response.message || 'Đăng nhập thất bại');
          this.isLoading = false;
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';

        if (errorMessage.includes('Email admin không tồn tại')) {
          this.emailError = 'Email admin không tồn tại';
          this.email = '';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.emailInput.nativeElement.focus();
          }, 0);
        } else if (errorMessage === 'Sai mật khẩu') {
          this.passwordError = errorMessage;
          this.password = '';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.passwordInput.nativeElement.focus();
          }, 0);
        } else if (errorMessage.includes('Quá nhiều lần')) {
          this.notificationService.showError(errorMessage);
        } else {
          this.notificationService.showError(errorMessage);
        }
        this.isLoading = false;
      }
    });
  }
}
