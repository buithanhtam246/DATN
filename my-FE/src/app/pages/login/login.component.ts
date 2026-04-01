import { RouterModule } from '@angular/router';
import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/services/notification.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email = '';
  password = '';
  isLoading = false;
  emailError = '';
  passwordError = '';

  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef, private notificationService: NotificationService) {
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

  get isFormValid(): boolean {
    return !!(this.email && this.password);
  }

  onEmailChange() {
    this.emailError = '';
  }

  onPasswordChange() {
    this.passwordError = '';
  }

  login(){

    this.isLoading = true;
    this.emailError = '';
    this.passwordError = '';

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

          this.notificationService.showSuccess("Đăng nhập thành công");
          this.isLoading = false;
          
          // Redirect logic:
          // - Nếu user có role='admin', hãy báo và redirect đến /admin/login
          // - Nếu user là 'user' bình thường, redirect đến home '/'
          setTimeout(() => {
            if (userData.role === 'admin') {
              // Admin không được phép login từ /login
              // Phải sử dụng /admin/login endpoint riêng biệt
              this.notificationService.showError("Tài khoản admin phải sử dụng trang /admin/login để đăng nhập!");
              localStorage.clear(); // Xóa token vì không hợp lệ
              this.router.navigate(['/admin/login']);
            } else {
              // User bình thường
              this.router.navigate(['/']);
            }
          }, 1500);
        } else {
          console.error('Login failed:', response.message || 'Unknown error');
          this.notificationService.showError(response.message || "Đăng nhập thất bại");
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        const errorMessage = error.error?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
        console.log('Error message:', errorMessage);
        if (errorMessage === 'Email không tồn tại') {
          this.emailError = errorMessage;
          this.email = ''; // Clear email on wrong email
          console.log('Set emailError:', this.emailError);
          this.cdr.detectChanges();
          setTimeout(() => {
            this.emailInput.nativeElement.focus();
          }, 0);
        } else if (errorMessage === 'Sai mật khẩu') {
          this.passwordError = errorMessage;
          this.password = ''; // Clear password on wrong password
          console.log('Set passwordError:', this.passwordError);
          this.cdr.detectChanges();
          setTimeout(() => {
            this.passwordInput.nativeElement.focus();
          }, 0);
        } else {
          this.notificationService.showError(errorMessage);
        }
        this.isLoading = false;
      }
    });

  }
}