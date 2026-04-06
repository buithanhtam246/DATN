import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  register(fullname: string, email: string, password: string, confirmPassword: string) {
    return this.apiService.register({ fullname, email, password, confirmPassword });
  }

  login(email: string, password: string) {
    return this.apiService.login({ email, password });
  }

  // Admin login từ endpoint riêng
  adminLogin(email: string, password: string) {
    return this.apiService.adminLogin({ email, password });
  }

  // Xác nhận token admin
  adminVerifyToken() {
    return this.apiService.adminVerifyToken();
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }
}
