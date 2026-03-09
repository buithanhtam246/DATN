import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  status: 'active' | 'blocked';
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  searchQuery = signal('');
  selectedRole = signal('all');
  selectedStatus = signal('all');
  
  users: User[] = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', role: 'customer', status: 'active', totalOrders: 12, totalSpent: 15000000, joinDate: '2023-01-15' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0902345678', role: 'customer', status: 'active', totalOrders: 8, totalSpent: 9500000, joinDate: '2023-02-20' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', phone: '0903456789', role: 'admin', status: 'active', totalOrders: 0, totalSpent: 0, joinDate: '2022-12-01' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0904567890', role: 'customer', status: 'blocked', totalOrders: 3, totalSpent: 2100000, joinDate: '2023-03-10' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', phone: '0905678901', role: 'customer', status: 'active', totalOrders: 25, totalSpent: 32000000, joinDate: '2022-11-05' },
  ];

  get filteredUsers() {
    return this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          user.email.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          user.phone.includes(this.searchQuery());
      const matchesRole = this.selectedRole() === 'all' || user.role === this.selectedRole();
      const matchesStatus = this.selectedStatus() === 'all' || user.status === this.selectedStatus();
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  toggleUserStatus(user: User) {
    user.status = user.status === 'active' ? 'blocked' : 'active';
  }

  deleteUser(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }
}
