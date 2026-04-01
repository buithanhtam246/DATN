import { Component, signal, inject, OnInit, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Order {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  address?: string;
  totalPrice: number;
  deliveryCost: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  productCount: number;
  created_at: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  // Chuyển sang Signal hết để sửa lỗi load 2 lần
  orders = signal<Order[]>([]);
  searchQuery = signal('');
  selectedStatus = signal('all');
  showDetailModal = signal(false);
  selectedOrder = signal<Order | null>(null);
  isLoading = signal(false);
  newOrderStatus = signal('');
  
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.apiService.getAllOrders().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.orders.set(response.data);
        }
        this.isLoading.set(false);
        this.cdr.detectChanges(); // Ép render ngay lập tức
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.notificationService.showError('Lỗi khi tải danh sách đơn hàng');
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // Dùng computed để tự động lọc khi searchQuery hoặc selectedStatus thay đổi
  filteredOrders = computed(() => {
    const list = this.orders();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();

    return list.filter(order => {
      const matchesSearch = order.id.toString().includes(query) ||
                            order.customerName.toLowerCase().includes(query) ||
                            order.email.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || order.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  // Signal tính toán số đơn chờ xử lý
  pendingOrdersCount = computed(() => {
    return this.orders().filter(order => order.status === 'pending').length;
  });

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'confirmed': 'status-processing',
      'shipped': 'status-shipping',
      'delivered': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return labels[status] || status;
  }

  viewOrderDetail(order: Order) {
    this.selectedOrder.set(order);
    this.showDetailModal.set(true);
    this.newOrderStatus.set(order.status); // Gán status hiện tại vào form update
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
    this.newOrderStatus.set('');
  }

  confirmStatusUpdate(orderId: number) {
    const nextStatus = this.newOrderStatus();
    if (!nextStatus) {
      this.notificationService.showError('Vui lòng chọn trạng thái mới');
      return;
    }

    // Logic cập nhật (Tâm hãy mở comment khi đã có API backend)
    /*
    this.apiService.updateOrderStatus(orderId, nextStatus).subscribe({
      next: (res) => {
        this.orders.update(orders => orders.map(o => o.id === orderId ? { ...o, status: nextStatus as any } : o));
        this.notificationService.showSuccess('Cập nhật thành công');
        this.closeDetailModal();
      }
    });
    */

    // Tạm thời cập nhật client để test UI
    this.orders.update(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus as any } : o));
    this.notificationService.showSuccess('Cập nhật trạng thái thành công');
    this.closeDetailModal();
  }
}