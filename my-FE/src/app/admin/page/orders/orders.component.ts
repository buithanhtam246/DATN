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
  productNames?: string;
  created_at: string;
  paymentMethod?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  variant_id?: number;
  quantity: number;
  price: number;
  product_name: string;
  category_name?: string;
  parent_category_name?: string;
  image?: string;
  color_name?: string;
  color_code?: string;
  size_name?: string | number;
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
  selectedPaymentMethod = signal('all');
  showDetailModal = signal(false);
  selectedOrder = signal<Order | null>(null);
  isLoading = signal(false);
  newOrderStatus = signal('');
  rowStatusDrafts = signal<Record<number, string>>({});
  rowStatusSaving = signal<Record<number, boolean>>({});
  readonly statusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];
  
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  readonly productImageBaseUrl = 'http://localhost:3000/public/images/products/';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.apiService.getAllOrders().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          console.log('✅ Orders loaded:', response.data);
          this.orders.set(response.data);
          const drafts: Record<number, string> = {};
          response.data.forEach((order: Order) => {
            drafts[order.id] = order.status;
          });
          this.rowStatusDrafts.set(drafts);
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
    const paymentMethod = this.selectedPaymentMethod();

    return list.filter(order => {
      const matchesSearch = order.id.toString().includes(query) ||
                            order.customerName.toLowerCase().includes(query) ||
                            order.email.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || order.status === status;
      const matchesPaymentMethod = paymentMethod === 'all' || this.getPaymentMethodFilterValue(order.paymentMethod) === paymentMethod;
      return matchesSearch && matchesStatus && matchesPaymentMethod;
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

  private getAllowedTransitions(currentStatus: string): string[] {
    const transitionMap: Record<string, string[]> = {
      pending: ['pending', 'confirmed', 'cancelled'],
      confirmed: ['confirmed', 'shipped', 'cancelled'],
      shipped: ['shipped', 'delivered', 'cancelled'],
      delivered: ['delivered'],
      cancelled: ['cancelled']
    };

    return transitionMap[currentStatus] || [currentStatus];
  }

  isStatusOptionDisabled(currentStatus: string, targetStatus: string): boolean {
    return !this.getAllowedTransitions(currentStatus).includes(targetStatus);
  }

  getPaymentMethodLabel(paymentMethod?: string | number | null): string {
    const methodKey = this.getPaymentMethodFilterValue(paymentMethod);

    if (methodKey === 'unknown') {
      return 'Chưa xác định';
    }

    const paymentMethodMap: Record<string, string> = {
      cod: 'COD',
      bank_transfer: 'Chuyển khoản',
      momo: 'MoMo',
      vnpay: 'VNPay'
    };

    return paymentMethodMap[methodKey] || String(paymentMethod).trim();
  }

  getPaymentMethodFilterValue(paymentMethod?: string | number | null): string {
    if (paymentMethod === null || paymentMethod === undefined || paymentMethod === '') {
      return 'unknown';
    }

    const normalized = String(paymentMethod).trim().toLowerCase();

    if (normalized === '1' || normalized.includes('cod')) {
      return 'cod';
    }

    if (normalized === '2' || normalized.includes('bank') || normalized.includes('chuyển khoản') || normalized.includes('chuyen khoan')) {
      return 'bank_transfer';
    }

    if (normalized.includes('momo')) {
      return 'momo';
    }

    if (normalized.includes('vnpay')) {
      return 'vnpay';
    }

    return normalized;
  }

  viewOrderDetail(order: Order) {
    // Debug: log when button clicked to ensure handler fires
    console.log('viewOrderDetail called for order id=', order?.id);

    // Gọi API Admin để lấy chi tiết đầy đủ của đơn hàng
    this.apiService.getAdminOrderDetail(order.id).subscribe({
      next: (response: any) => {
        console.log('getAdminOrderDetail response for', order.id, response);
        if (response.success && response.data) {
          const detailedOrder = response.data;
          this.selectedOrder.set({
            id: detailedOrder.id,
            customerName: detailedOrder.customerName || detailedOrder.user_name || 'N/A',
            email: detailedOrder.email || detailedOrder.user_email || 'N/A',
            phone: detailedOrder.phone || 'N/A',
            address: detailedOrder.address || detailedOrder.full_address || 'Chưa có địa chỉ',
            totalPrice: detailedOrder.totalPrice || detailedOrder.total_price || 0,
            deliveryCost: Number(detailedOrder.deliveryCost || detailedOrder.delivery_cost || 0),
            status: detailedOrder.status || 'pending',
            paymentMethod: detailedOrder.paymentMethod || 'Chưa xác định',
            productCount: detailedOrder.productCount || 0,
            productNames: detailedOrder.productNames || 'N/A',
            created_at: detailedOrder.created_at || new Date().toISOString(),
            items: Array.isArray(detailedOrder.items) ? detailedOrder.items : []
          });
          this.showDetailModal.set(true);
          this.newOrderStatus.set(detailedOrder.status || order.status);
          console.log('showDetailModal set ->', this.showDetailModal());
        } else {
          console.warn('getAdminOrderDetail returned no data for', order.id);
        }
      },
      error: (err) => {
        console.error('Error loading order detail:', err);
        // Nếu API fail, vẫn hiển thị dữ liệu từ list
        this.selectedOrder.set(order);
        this.showDetailModal.set(true);
        this.newOrderStatus.set(order.status);
        console.log('showDetailModal set in error path ->', this.showDetailModal());
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
    this.newOrderStatus.set('');
  }

  getItemImageUrl(image?: string): string {
    if (!image) {
      return 'https://placehold.co/56x56?text=No+Img';
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }

    return `${this.productImageBaseUrl}${image}`;
  }

  getOrderSubtotal(order: Order | null): number {
    if (!order?.items?.length) return Number(order?.totalPrice || 0);

    return order.items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }

  getCategoryPath(item: OrderItem): string {
    const parent = (item.parent_category_name || '').trim();
    const category = (item.category_name || '').trim();

    if (parent && category && parent !== category) {
      return `${parent} > ${category}`;
    }

    return category || parent || 'N/A';
  }

  getRowDraftStatus(order: Order): string {
    return this.rowStatusDrafts()[order.id] || order.status;
  }

  canInlineApprove(order: Order): boolean {
    return order.status !== 'delivered' && order.status !== 'cancelled';
  }

  isRowSaving(orderId: number): boolean {
    return !!this.rowStatusSaving()[orderId];
  }

  onRowStatusChange(orderId: number, status: string) {
    this.rowStatusDrafts.update((drafts) => ({
      ...drafts,
      [orderId]: status
    }));
  }

  saveRowStatus(order: Order) {
    const nextStatus = this.getRowDraftStatus(order);
    if (!nextStatus || nextStatus === order.status) return;

    if (this.isStatusOptionDisabled(order.status, nextStatus)) {
      this.notificationService.showError('Không thể chuyển trạng thái theo lựa chọn này');
      return;
    }

    this.rowStatusSaving.update((savingMap) => ({
      ...savingMap,
      [order.id]: true
    }));

    this.apiService.updateOrderStatus(order.id, nextStatus).subscribe({
      next: () => {
        this.orders.update((orders) => orders.map((item) =>
          item.id === order.id ? { ...item, status: nextStatus as any } : item
        ));
        this.rowStatusDrafts.update((drafts) => ({
          ...drafts,
          [order.id]: nextStatus
        }));
        this.notificationService.showSuccess('Đã xét duyệt trạng thái đơn hàng');
        this.rowStatusSaving.update((savingMap) => ({
          ...savingMap,
          [order.id]: false
        }));
      },
      error: (error) => {
        console.error('Error inline updating order status:', error);
        this.notificationService.showError('Không thể cập nhật trạng thái đơn hàng');
        this.rowStatusSaving.update((savingMap) => ({
          ...savingMap,
          [order.id]: false
        }));
      }
    });
  }

  confirmStatusUpdate(orderId: number) {
    const nextStatus = this.newOrderStatus();
    if (!nextStatus) {
      this.notificationService.showError('Vui lòng chọn trạng thái mới');
      return;
    }

    const currentOrder = this.selectedOrder();
    if (currentOrder && this.isStatusOptionDisabled(currentOrder.status, nextStatus)) {
      this.notificationService.showError('Trạng thái không hợp lệ theo quy trình xử lý đơn hàng');
      return;
    }

    this.apiService.updateOrderStatus(orderId, nextStatus).subscribe({
      next: (res) => {
        this.orders.update(orders => orders.map(o => o.id === orderId ? { ...o, status: nextStatus as any } : o));
        this.rowStatusDrafts.update((drafts) => ({
          ...drafts,
          [orderId]: nextStatus
        }));
        this.notificationService.showSuccess('Cập nhật trạng thái thành công');
        this.closeDetailModal();
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        this.notificationService.showError('Lỗi cập nhật trạng thái đơn hàng');
      }
    });
  }
}