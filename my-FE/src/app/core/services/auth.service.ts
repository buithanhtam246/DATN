import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    id?: string;
    user?: unknown;
  };
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5001/api/auth';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  register(
    fullname: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, {
      name: fullname,
      email,
      password,
      confirmPassword
    });
  }
}
