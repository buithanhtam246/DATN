import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderHistoryService } from '../../services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  isLoading = false;
  orderId: number = 0;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError('Vui lòng đăng nhập để xem chi tiết đơn hàng');
      this.router.navigate(['/login']);
      return;
    }

    this.route.params.subscribe(params => {
      this.orderId = parseInt(params['id'], 10);
      if (this.orderId) {
        this.loadOrderDetail();
      } else {
        this.notificationService.showError('ID đơn hàng không hợp lệ');
        this.router.navigate(['/orders']);
      }
    });
  }

  loadOrderDetail() {
    this.isLoading = true;
    this.orderHistoryService.getOrderDetail(this.orderId).subscribe({
      next: (response: any) => {
        console.log('Order detail response:', response);
        if (response.success) {
          // Backend returns {order: {...}, items: [...]}
          this.order = {
            ...response.data.order,
            items: response.data.items
          };
          console.log('Order loaded:', this.order);
        } else {
          this.notificationService.showError(response.message || 'Không thể tải chi tiết đơn hàng');
          this.router.navigate(['/orders']);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading order detail:', err);
        if (err.status === 401) {
          this.notificationService.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          this.authService.logout();
        } else {
          this.notificationService.showError(err.error?.message || 'Không thể tải chi tiết đơn hàng');
        }
        this.router.navigate(['/orders']);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipped: 'Đang vận chuyển',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "pending":
        return "pending";
      case "confirmed":
        return "confirmed";
      case "shipped":
        return "shipped";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  }

  calculateOrderTotal(): number {
    if (!this.order || !this.order.items) return 0;
    let itemsTotal = 0;
    this.order.items.forEach((item: any) => {
      itemsTotal += parseFloat(item.price) * item.quantity;
    });
    const deliveryCost = parseFloat(this.order.delivery_cost) || 0;
    return itemsTotal + deliveryCost;
  }

  getOrderItemsTotal(): number {
    if (!this.order || !this.order.items) return 0;
    return this.order.items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.includes('uploads') || imagePath.includes('public')) {
      return `http://localhost:3000/${imagePath}`;
    }
    
    return `http://localhost:3000/images/products/${imagePath}`;
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}
