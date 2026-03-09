import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  stats: StatCard[] = [
    {
      title: 'Tổng doanh thu',
      value: '₫125,000,000',
      change: '+12.5%',
      icon: '💰',
      color: '#3498db'
    },
    {
      title: 'Đơn hàng mới',
      value: '156',
      change: '+8.2%',
      icon: '🛒',
      color: '#2ecc71'
    },
    {
      title: 'Người dùng',
      value: '2,543',
      change: '+15.3%',
      icon: '👥',
      color: '#9b59b6'
    },
    {
      title: 'Sản phẩm',
      value: '432',
      change: '+5.1%',
      icon: '📦',
      color: '#e67e22'
    }
  ];

  recentOrders = [
    { id: '#12345', customer: 'Nguyễn Văn A', total: '₫1,250,000', status: 'Đang giao', date: '2024-03-01' },
    { id: '#12344', customer: 'Trần Thị B', total: '₫890,000', status: 'Hoàn thành', date: '2024-03-01' },
    { id: '#12343', customer: 'Lê Văn C', total: '₫2,100,000', status: 'Đang xử lý', date: '2024-02-29' },
    { id: '#12342', customer: 'Phạm Thị D', total: '₫650,000', status: 'Hoàn thành', date: '2024-02-29' },
    { id: '#12341', customer: 'Hoàng Văn E', total: '₫1,800,000', status: 'Đã hủy', date: '2024-02-28' }
  ];

  topProducts = [
    { name: 'Nike Air Max 270', sold: 145, revenue: '₫21,750,000', image: '/assets/images/products/product-1.jpg' },
    { name: 'Adidas Ultraboost', sold: 132, revenue: '₫19,800,000', image: '/assets/images/products/product-2.jpg' },
    { name: 'Puma RS-X', sold: 98, revenue: '₫14,700,000', image: '/assets/images/products/product-3.jpg' },
    { name: 'New Balance 574', sold: 87, revenue: '₫13,050,000', image: '/assets/images/products/product-4.jpg' },
    { name: 'Vans Old Skool', sold: 76, revenue: '₫11,400,000', image: '/assets/images/products/product-5.jpg' }
  ];

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Đang giao': 'status-shipping',
      'Hoàn thành': 'status-completed',
      'Đang xử lý': 'status-processing',
      'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || '';
  }
}
