import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Voucher {
  id: number;
  code: string;
  description: string;
  discount: number;
  type: 'percent' | 'fixed';
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
}

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent {
  searchQuery = signal('');
  selectedStatus = signal('all');
  showAddModal = signal(false);
  
  vouchers: Voucher[] = [
    { id: 1, code: 'SUMMER2024', description: 'Giảm giá mùa hè', discount: 20, type: 'percent', minOrder: 500000, maxDiscount: 200000, usageLimit: 100, usageCount: 45, startDate: '2024-06-01', endDate: '2024-08-31', status: 'active' },
    { id: 2, code: 'NEWUSER', description: 'Khách hàng mới', discount: 100000, type: 'fixed', minOrder: 0, usageLimit: 500, usageCount: 234, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active' },
    { id: 3, code: 'FREESHIP', description: 'Miễn phí vận chuyển', discount: 30000, type: 'fixed', minOrder: 300000, usageLimit: 200, usageCount: 198, startDate: '2024-03-01', endDate: '2024-03-31', status: 'active' },
    { id: 4, code: 'LOYALTY50', description: 'Khách hàng thân thiết', discount: 50, type: 'percent', minOrder: 1000000, maxDiscount: 500000, usageLimit: 50, usageCount: 12, startDate: '2024-02-01', endDate: '2024-12-31', status: 'active' },
    { id: 5, code: 'WINTER2023', description: 'Giảm giá mùa đông', discount: 15, type: 'percent', minOrder: 200000, usageLimit: 1000, usageCount: 1000, startDate: '2023-12-01', endDate: '2024-02-28', status: 'expired' },
  ];

  get filteredVouchers() {
    return this.vouchers.filter(voucher => {
      const matchesSearch = voucher.code.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          voucher.description.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesStatus = this.selectedStatus() === 'all' || voucher.status === this.selectedStatus();
      return matchesSearch && matchesStatus;
    });
  }

  getDiscountText(voucher: Voucher): string {
    if (voucher.type === 'percent') {
      return `${voucher.discount}%`;
    }
    return `${voucher.discount.toLocaleString()}₫`;
  }

  getUsagePercent(voucher: Voucher): number {
    return (voucher.usageCount / voucher.usageLimit) * 100;
  }

  toggleStatus(voucher: Voucher) {
    if (voucher.status !== 'expired') {
      voucher.status = voucher.status === 'active' ? 'inactive' : 'active';
    }
  }

  deleteVoucher(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      this.vouchers = this.vouchers.filter(v => v.id !== id);
    }
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }
}
