import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Kiểm tra xem user đã đăng nhập chưa
    if (!this.authService.isLoggedIn()) {
      // Chưa đăng nhập, chuyển tới admin login
      this.router.navigate(['/admin/login']);
      return false;
    }

    // Kiểm tra xem user có phải admin không
    if (this.authService.isAdmin()) {
      return true;
    }

    // Không phải admin, chuyển tới trang login bình thường
    this.router.navigate(['/login']);
    return false;
  }
}
