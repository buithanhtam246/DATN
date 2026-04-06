import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})

export class ForgotPasswordComponent {
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private notificationService: NotificationService) {}
  email:any;
  otp:any;

  showOTP: boolean = false;
  newPassword:any;
  confirmPassword:any;
  showReset = false;
  isLoading: boolean = false;

  validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  sendOTP(){
    this.isLoading = true;

    this.http.post('http://localhost:3000/api/auth/request-reset-code', { email: this.email })
    .subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess("OTP đã gửi vào Gmail");
          this.showOTP = true;
          this.cdr.detectChanges();
          this.isLoading = false;
        } else {
          this.notificationService.showError(response.message || 'Có lỗi khi gửi OTP');
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        this.notificationService.showError('Có lỗi khi gửi OTP. Vui lòng thử lại.');
        this.isLoading = false;
        console.error('Send OTP error:', error);
      }
    });
  }

  verifyOTP(){
    this.isLoading = true;

    this.http.post('http://localhost:3000/api/auth/verify-reset-code', { email: this.email, code: this.otp })
    .subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess("OTP đúng");
          localStorage.setItem("resetCode", this.otp);
          this.showOTP = false;
          this.showReset = true;
          this.cdr.detectChanges();
          this.isLoading = false;
        } else {
          this.notificationService.showError(response.message || "OTP sai. Vui lòng thử lại.");
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        this.notificationService.showError("Có lỗi khi xác nhận OTP. Vui lòng thử lại.");
        this.isLoading = false;
        console.error('Verify OTP error:', error);
      }
    });
  }
 resetPassword() {
  this.isLoading = true;

  if (!this.validatePassword(this.newPassword)) {
    this.notificationService.showError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
    this.isLoading = false;
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.notificationService.showError("Mật khẩu không khớp");
    this.isLoading = false;
    return;
  }

  const code = localStorage.getItem("resetCode");
  if (!code) {
    this.notificationService.showError("Mã OTP không hợp lệ. Vui lòng thử lại từ đầu.");
    this.isLoading = false;
    return;
  }

  this.http.post('http://localhost:3000/api/auth/reset-password-with-code', {
    email: this.email,
    code: code,
    password: this.newPassword,
    confirmPassword: this.confirmPassword
  })
  .subscribe({
    next: (response: any) => {
      if (response.success) {
        this.notificationService.showSuccess("Đổi mật khẩu thành công");
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
        this.isLoading = false;
      } else {
        this.notificationService.showError(response.message || 'Có lỗi khi đổi mật khẩu');
        this.isLoading = false;
      }
    },
    error: (error: any) => {
      this.notificationService.showError('Có lỗi khi đổi mật khẩu. Vui lòng thử lại.');
      this.isLoading = false;
      console.error('Reset password error:', error);
    }
  });
}

  backToEmail() {
    this.showOTP = false;
    this.showReset = false;
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
    localStorage.removeItem("resetCode");
  }

}