import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { forkJoin } from 'rxjs';

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
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [
    {
      title: 'Tổng sản phẩm',
      value: '0',
      change: '+0%',
      icon: '📦',
      color: '#e67e22'
    },
    {
      title: 'Danh mục',
      value: '0',
      change: '+0%',
      icon: '📂',
      color: '#3498db'
    },
    {
      title: 'Thương hiệu',
      value: '0',
      change: '+0%',
      icon: '🏷️',
      color: '#2ecc71'
    },
    {
      title: 'Kích thước',
      value: '0',
      change: '+0%',
      icon: '📏',
      color: '#9b59b6'
    }
  ];

  recentOrders: any[] = [];
  topProducts: any[] = [];
  isLoading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.productService.getCategories(),
      brands: this.productService.getBrands(),
      sizes: this.productService.getSizes(),
      topSellingProducts: this.productService.getTopSellingProducts(5),
      recentOrders: this.productService.getRecentOrders(10)
    }).subscribe({
      next: (results: any) => {
        const products = Array.isArray(results.products) ? results.products : (results.products?.data || []);
        const categories = Array.isArray(results.categories) ? results.categories : (results.categories?.data || []);
        const brands = Array.isArray(results.brands) ? results.brands : (results.brands?.data || []);
        const sizes = Array.isArray(results.sizes) ? results.sizes : (results.sizes?.data || []);

        // Cập nhật stats từ database
        this.stats[0].value = (products.length || 0).toString();
        this.stats[1].value = (categories.length || 0).toString();
        this.stats[2].value = (brands.length || 0).toString();
        this.stats[3].value = (sizes.length || 0).toString();

        // Lấy top products từ API (dữ liệu bán hàng thực tế)
        this.topProducts = (Array.isArray(results.topSellingProducts) ? results.topSellingProducts : (results.topSellingProducts?.data || []))
          .map((p: any) => ({
            name: p.name,
            sold: p.total_quantity || 0,
            revenue: `₫${(p.total_revenue || 0).toLocaleString('vi-VN')}`,
            image: p.image ? `/images/products/${p.image}` : '📦',
            totalSold: p.total_sold || 0
          }))
          .sort((a: any, b: any) => b.totalSold - a.totalSold)
          .slice(0, 5);

        // Lấy recent orders từ API
        this.recentOrders = (Array.isArray(results.recentOrders) ? results.recentOrders : (results.recentOrders?.data || []))
          .map((order: any) => ({
            id: order.order_number || order.id,
            customer: order.customer_name || 'N/A',
            total: `₫${(order.total_price || 0).toLocaleString('vi-VN')}`,
            status: order.status || 'Pending',
            date: new Date(order.created_at).toLocaleDateString('vi-VN')
          }));

        console.log('Dashboard data loaded:', { 
          products: products.length,
          categories: categories.length,
          brands: brands.length,
          sizes: sizes.length,
          topProducts: this.topProducts.length,
          recentOrders: this.recentOrders.length 
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Đã giao': 'status-completed',
      'Đang giao': 'status-shipping',
      'Hoàn thành': 'status-completed',
      'Đang xử lý': 'status-processing',
      'Chờ xử lý': 'status-processing',
      'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || '';
  }
}