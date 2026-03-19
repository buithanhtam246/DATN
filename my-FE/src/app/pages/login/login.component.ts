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

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef, private notificationService: NotificationService) {}

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
        if (response.success && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userId', response.data.id);
          // Lưu thêm thông tin user vào localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.notificationService.showSuccess("Đăng nhập thành công");
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
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