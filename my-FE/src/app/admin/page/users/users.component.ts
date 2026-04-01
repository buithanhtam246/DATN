import { Component, signal, inject, OnInit, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  imports: [CommonModule, FormsModule],
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
  
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

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
            phone: user.phone || 'N/A',
            role: user.role,
            status: 'active' as const, // Ép kiểu string literal
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
      const matchesRole = role === 'all' || user.role === role;
      const matchesStatus = status === 'all' || user.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  toggleUserStatus(user: User) {
    const updatedList = this.users().map(u => {
      if (u.id === user.id) {
        // Fix lỗi Strict Type bằng cách xác định rõ giá trị status
        const nextStatus: 'active' | 'blocked' = u.status === 'active' ? 'blocked' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    this.users.set(updatedList);
  }

  deleteUser(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.users.update(prev => prev.filter(u => u.id !== id));
      this.notificationService.showSuccess('Đã xóa người dùng');
    }
  }
}