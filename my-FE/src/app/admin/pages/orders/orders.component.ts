import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  items: number;
  date: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  searchQuery = signal('');
  selectedStatus = signal('all');
  showDetailModal = signal(false);
  selectedOrder = signal<Order | null>(null);
  
  orders: Order[] = [
    { id: '#12345', customer: 'Nguyễn Văn A', email: 'nguyenvana@email.com', total: 1250000, status: 'shipping', items: 2, date: '2024-03-01' },
    { id: '#12344', customer: 'Trần Thị B', email: 'tranthib@email.com', total: 890000, status: 'completed', items: 1, date: '2024-03-01' },
    { id: '#12343', customer: 'Lê Văn C', email: 'levanc@email.com', total: 2100000, status: 'processing', items: 3, date: '2024-02-29' },
    { id: '#12342', customer: 'Phạm Thị D', email: 'phamthid@email.com', total: 650000, status: 'completed', items: 1, date: '2024-02-29' },
    { id: '#12341', customer: 'Hoàng Văn E', email: 'hoangvane@email.com', total: 1800000, status: 'cancelled', items: 2, date: '2024-02-28' },
    { id: '#12340', customer: 'Võ Thị F', email: 'vothif@email.com', total: 3200000, status: 'pending', items: 4, date: '2024-02-28' },
  ];

  get filteredOrders() {
    return this.orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          order.customer.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          order.email.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesStatus = this.selectedStatus() === 'all' || order.status === this.selectedStatus();
      return matchesSearch && matchesStatus;
    });
  }

  get pendingOrdersCount() {
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipping': 'status-shipping',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipping': 'Đang giao',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return labels[status] || status;
  }

  viewOrderDetail(order: Order) {
    this.selectedOrder.set(order);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
  }

  updateOrderStatus(orderId: string, newStatus: Order['status']) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
    }
  }
}
