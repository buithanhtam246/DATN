import { Component, Input, Output, EventEmitter, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
}

interface Order {
  id: number;
  user_id: number;
  totalPrice?: number;
  total_price?: number;
  status: string;
  created_at: string;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  completedOrders: number;
}

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail-modal.component.html',
  styleUrls: ['./user-detail-modal.component.scss']
})
export class UserDetailModalComponent {
  @Input() showModal!: Signal<boolean>;
  @Input() selectedUser!: Signal<User | null>;
  @Input() userOrders!: Signal<Order[]>;
  @Input() userStats!: Signal<UserStats>;
  @Output() closeModal = new EventEmitter<void>();

  activeTab = signal<'info' | 'orders' | 'spending'>('info');

  switchTab(tab: 'info' | 'orders' | 'spending') {
    this.activeTab.set(tab);
  }

  onCloseModal() {
    this.activeTab.set('info');
    this.closeModal.emit();
  }
}
