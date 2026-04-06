import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;

  user: any;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private notificationService: NotificationService) {}

  ngOnInit() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
    }
  }

  validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  changePassword() {
    this.isLoading = true;

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.notificationService.showError('Vui lòng nhập đầy đủ thông tin');
      this.isLoading = false;
      return;
    }

    if (!this.validatePassword(this.newPassword)) {
      this.notificationService.showError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
      this.isLoading = false;
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.showError('Mật khẩu xác nhận không khớp');
      this.isLoading = false;
      return;
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.notificationService.showError('Bạn chưa đăng nhập');
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:3000/api/auth/change-password', {
      currentPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }, { headers })
    .subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Đổi mật khẩu thành công');
          setTimeout(() => {
            this.router.navigate(['/account']);
          }, 3000);
        } else {
          console.error('Change password failed:', response.message || 'Unknown error');
          this.notificationService.showError(response.message || 'Có lỗi khi đổi mật khẩu');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Change password error:', error);
        this.notificationService.showError(error.error?.message || 'Có lỗi khi đổi mật khẩu');
        this.isLoading = false;
      }
    });
  }

}
