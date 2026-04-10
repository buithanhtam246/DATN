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
      title: 'Doanh thu tháng',
      value: '0',
      change: '+0%',
      icon: '💰',
      color: '#9b59b6'
    },
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
    }
  ];

  recentOrders: any[] = [];
  pendingOrders: any[] = [];
  topProducts: any[] = [];
  isLoading = true;

  // Revenue chart state
  selectedYear = new Date().getFullYear();
  revenueLabels: string[] = [];
  revenueValues: number[] = [];

  // Revenue stat (monthly total) uses current month + selectedYear
  monthlyRevenueMonth = new Date().getMonth() + 1;

  get availableYears(): number[] {
    const current = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => current - i);
  }

  get availableMonths(): number[] {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  get todayLabel(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRevenueSeries();
    this.loadMonthlyRevenueTotal();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.productService.getCategories(),
      brands: this.productService.getBrands(),
      topSellingProducts: this.productService.getTopSellingProducts(5),
      recentOrders: this.productService.getRecentOrders(10)
    }).subscribe({
      next: (results: any) => {
        const products = Array.isArray(results.products) ? results.products : (results.products?.data || []);
        const categories = Array.isArray(results.categories) ? results.categories : (results.categories?.data || []);
        const brands = Array.isArray(results.brands) ? results.brands : (results.brands?.data || []);

        // Cập nhật stats từ database (after reordering, index 0 is revenue)
        this.stats[1].value = (products.length || 0).toString();
        this.stats[2].value = (categories.length || 0).toString();
        this.stats[3].value = (brands.length || 0).toString();

        // Lấy top products từ API (dữ liệu bán hàng thực tế)
        this.topProducts = (Array.isArray(results.topSellingProducts) ? results.topSellingProducts : (results.topSellingProducts?.data || []))
          .map((p: any) => ({
            name: p.name,
            sold: p.total_quantity || 0,
            revenue: `₫${Number(p.total_revenue || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}`,
            image: p.image ? `/images/products/${p.image}` : '📦',
            totalSold: p.total_sold || 0
          }))
          .sort((a: any, b: any) => b.totalSold - a.totalSold)
          .slice(0, 5);

        // Lấy recent orders từ API
        const rawRecent = Array.isArray(results.recentOrders) ? results.recentOrders : (results.recentOrders?.data || []);

        // Map for list display (translated status)
        this.recentOrders = rawRecent.map((order: any) => ({
          id: order.order_number || order.id,
          customer: order.customer_name || 'N/A',
          total: `₫${Number(order.total_price ?? order.totalPrice ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}`,
          status: this.getStatusLabel(order.status || order.state || ''),
          date: new Date(order.created_at).toLocaleDateString('vi-VN')
        }));

        // Build pending orders list (orders needing admin action)
        this.pendingOrders = rawRecent
          .filter((o: any) => {
            const s = (o.status || o.state || '').toString().trim().toLowerCase();
            return s === 'pending' || s === 'processing' || s === 'waiting';
          })
          // sort by created date desc
          .sort((a: any, b: any) => {
            const ta = new Date(a.created_at || a.createdAt || a.date || 0).getTime() || 0;
            const tb = new Date(b.created_at || b.createdAt || b.date || 0).getTime() || 0;
            return tb - ta;
          })
          // only show top 3
          .slice(0, 3)
          .map((order: any) => ({
            id: order.order_number || order.id,
            customer: order.customer_name || order.user_name || 'N/A',
            total: `₫${Number(order.total_price ?? order.totalPrice ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}`
          }));

        console.log('Dashboard data loaded:', { 
          products: products.length,
          categories: categories.length,
          brands: brands.length,
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

  loadMonthlyRevenueTotal(): void {
    this.productService
      .getRevenueSeries({ groupBy: 'day', year: this.selectedYear, month: this.monthlyRevenueMonth })
      .subscribe({
        next: (res: any) => {
          if (res?.success && res?.data) {
            const monthValues = (res.data.values || []).map((v: any) => Number(v || 0));
            const monthTotal = monthValues.reduce((sum: number, v: number) => sum + v, 0);
            this.stats[0].value = `₫${Number(monthTotal || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}`;
          }
        },
        error: (err) => console.error('Error loading monthly revenue total:', err)
      });
  }

  loadRevenueSeries(): void {
    // month
    this.productService.getRevenueSeries({ groupBy: 'month', year: this.selectedYear }).subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.revenueLabels = res.data.labels || [];
          this.revenueValues = (res.data.values || []).map((v: any) => Number(v || 0));
        }
      },
      error: (err) => console.error('Error loading revenue series:', err)
    });
  }

  onChangeYear(value: string) {
    const y = Number(value);
    if (!Number.isFinite(y)) return;
    this.selectedYear = y;
    this.loadRevenueSeries();
    this.loadMonthlyRevenueTotal();
  }

  revenueBarHeight(value: number): number {
    const max = Math.max(1, ...(this.revenueValues || [1]));
    // Keep a visible minimum like old placeholder
    const pct = (value / max) * 100;
    return Math.max(20, Math.round(pct));
  }

  formatCurrencyShort(value: number): string {
    const v = Number(value || 0);
    if (v >= 1_000_000_000) return `₫${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `₫${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `₫${Math.round(v / 1_000)}K`;
    return `₫${v.toFixed(0)}`;
  }

  get isDenseRevenueChart(): boolean {
    return (this.revenueLabels?.length || 0) > 12;
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

  // Map various possible backend status values (english or other keys) to Vietnamese labels
  getStatusLabel(rawStatus: string | undefined | null): string {
    const s = (rawStatus || '').toString().trim().toLowerCase();
    const map: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'waiting': 'Chờ xử lý',
      'processing': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'canceled': 'Đã hủy'
    };

    return map[s] || (rawStatus ? rawStatus.toString() : 'Chưa xác định');
  }
}