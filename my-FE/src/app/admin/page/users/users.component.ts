import { Component, signal, inject, OnInit, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserDetailModalComponent } from './user-detail-modal/user-detail-modal.component';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked'; // Bỏ dấu ? để đồng bộ dữ liệu
  totalOrders?: number;
  totalSpent?: number;
  created_at?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDetailModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  // Signals quản lý trạng thái dữ liệu
  users = signal<User[]>([]);
  searchQuery = signal('');
  selectedRole = signal('all');
  selectedStatus = signal('all');
  isLoading = signal(false);
  showDetailModal = signal(false);
  selectedUser = signal<any>(null);
  userOrders = signal<any[]>([]);
  userStats = signal({ totalOrders: 0, totalSpent: 0, completedOrders: 0 });
  activeTab = signal<'info' | 'orders' | 'spending'>('info');
  
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.apiService.getAllUsers().subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          const mappedUsers = response.data.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '||',
            role: user.role,
            status: user.status === 'blocked' ? 'blocked' : 'active',
            totalOrders: user.totalOrders || 0,
            totalSpent: user.totalSpent || 0
          }));
          this.users.set(mappedUsers);
        }
        this.isLoading.set(false);
        this.cdr.detectChanges(); // Ép render ngay lập tức
      },
      error: (error: any) => {
        console.error('Lỗi tải người dùng:', error);
        this.notificationService.showError('Lỗi khi tải danh sách người dùng');
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // Tự động tính toán danh sách hiển thị dựa trên các bộ lọc
  filteredUsers = computed(() => {
    const list = this.users();
    const query = this.searchQuery().toLowerCase();
    const role = this.selectedRole();
    const status = this.selectedStatus();

    return list.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(query) ||
                            user.email.toLowerCase().includes(query) ||
                            user.phone.includes(query);
      // Show tất cả role khi chọn 'all'
      const matchesRole = role === 'all' || user.role === role;
      const matchesStatus = status === 'all' || user.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  toggleUserStatus(user: User) {
    if (user.role === 'admin') {
      return;
    }

    const shouldLock = user.status === 'active';
    const action$ = shouldLock
      ? this.apiService.lockUser(user.id)
      : this.apiService.unlockUser(user.id);

    action$.subscribe({
      next: (response: any) => {
        const latestStatus: 'active' | 'blocked' = response?.data?.status === 'blocked' ? 'blocked' : 'active';
        const updatedList = this.users().map(u =>
          u.id === user.id ? { ...u, status: latestStatus } : u
        );
        this.users.set(updatedList);
        this.notificationService.showSuccess(
          shouldLock ? 'Đã khóa tài khoản người dùng' : 'Đã mở khóa tài khoản người dùng'
        );
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Lỗi cập nhật trạng thái user:', error);
        this.notificationService.showError('Không thể cập nhật trạng thái tài khoản');
      }
    });
  }

  viewUserDetail(user: User) {
    console.log('👁️ Viewing user detail:', user);
    console.log('Before set - showDetailModal:', this.showDetailModal());
    this.selectedUser.set(user);
    console.log('After set - selectedUser:', this.selectedUser());
    this.showDetailModal.set(true);
    console.log('After set - showDetailModal:', this.showDetailModal());
    this.cdr.detectChanges();
    this.loadUserOrders(user.id);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedUser.set(null);
    this.userOrders.set([]);
    this.activeTab.set('info');
  }

  switchTab(tab: 'info' | 'orders' | 'spending') {
    this.activeTab.set(tab);
  }

  loadUserOrders(userId: number) {
    // Gọi API admin để lấy tất cả đơn hàng
    const token = localStorage.getItem('authToken');
    const headers = {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
    
    this.http.get<any>(`http://localhost:3000/api/admin/orders`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Lọc đơn hàng của user này
          const userOrders = response.data.filter((order: any) => order.user_id === userId);
          // Chỉ lấy đơn hàng đã giao (delivered)
          const completedOrders = userOrders.filter((order: any) => order.status === 'delivered');
          this.userOrders.set(completedOrders);
          
          // Tính toán thống kê
          const totalSpent = completedOrders.reduce((sum: number, order: any) => 
            sum + parseFloat(order.totalPrice || order.total_price || 0), 0);
          
          this.userStats.set({
            totalOrders: userOrders.length,
            totalSpent: totalSpent,
            completedOrders: completedOrders.length
          });
          console.log('✅ User orders loaded:', { userId, totalOrders: userOrders.length, completedOrders: completedOrders.length });
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('❌ Error loading user orders:', err);
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.users.update(prev => prev.filter(u => u.id !== id));
      this.notificationService.showSuccess('Đã xóa người dùng');
    }
  }
}