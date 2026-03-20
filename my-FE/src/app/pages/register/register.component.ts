
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  fullname = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  get isFormValid(): boolean {
    return !!(
      this.fullname.trim() &&
      this.email.trim() &&
      this.password &&
      this.confirmPassword &&
      this.password === this.confirmPassword
    );
  }

  register() {
    // Validation
    if (!this.fullname || !this.email || !this.password || !this.confirmPassword) {
      this.notificationService.showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.notificationService.showError('Mật khẩu không khớp');
      return;
    }

    // Validation mật khẩu mạnh
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.notificationService.showError('Mật khẩu gồm có số, chữ hoa và ký tự đặc biệt');
      return;
    }

    this.isLoading = true;

    // Gọi auth service để đăng ký
    this.authService.register(
      this.fullname,
      this.email,
      this.password,
      this.confirmPassword
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
          this.resetForm();
        } else {
          this.notificationService.showError(response.message || 'Đăng ký thất bại');
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        const isNetworkError = error?.status === 0;
        const errorMessage = isNetworkError
          ? 'Khong ket noi duoc may chu. Vui long mo backend BE/Users (port 5001) va thu lai.'
          : (error.error?.message || 'Lỗi khi đăng ký. Vui lòng thử lại.');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private resetForm() {
    this.fullname = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }
}