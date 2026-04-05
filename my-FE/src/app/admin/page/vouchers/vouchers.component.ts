import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { VoucherService, Voucher } from '../../../services/Voucher.Service';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit {
  vouchers = signal<Voucher[]>([]);
  searchQuery = signal('');
  showModal = signal(false);
  voucherForm: FormGroup;

  constructor(private voucherService: VoucherService, private fb: FormBuilder) {
    this.voucherForm = this.fb.group({
      code_voucher: ['', [Validators.required]],
      name_voucher: ['', [Validators.required]],
      promotion_type: ['percentage', [Validators.required]],
      value_reduced: [0, [Validators.min(1)]],
      quantity: [1, [Validators.min(1)]],
      minimum_order: [0],
      max_value: [null],
      start_date: ['', [Validators.required]],
      promotion_date: ['', [Validators.required]]
    }, { validators: this.endDateAfterStartDate.bind(this) });
  }

  // Validator: ngày kết thúc phải sau ngày bắt đầu
  endDateAfterStartDate(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('start_date')?.value;
    const endDate = control.get('promotion_date')?.value;

    if (!startDate || !endDate) {
      return null; // Không validate nếu chưa chọn cả hai
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      control.get('promotion_date')?.setErrors({ 'endBeforeStart': true });
      return { 'endBeforeStart': true };
    } else {
      // Xóa error nếu đã valid
      const errors = control.get('promotion_date')?.errors;
      if (errors && errors['endBeforeStart']) {
        const { endBeforeStart, ...rest } = errors;
        control.get('promotion_date')?.setErrors(Object.keys(rest).length > 0 ? rest : null);
      }
    }

    return null;
  }

  // Check xem ngày bắt đầu đã được chọn chưa
  isStartDateSelected(): boolean {
    return !!this.voucherForm.get('start_date')?.value;
  }

  // Check xem có lỗi ngày kết thúc không
  hasEndDateError(): boolean {
    const endDateControl = this.voucherForm.get('promotion_date');
    return !!(endDateControl?.errors?.['endBeforeStart'] && endDateControl?.touched);
  }

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    this.voucherService.getAllVouchers().subscribe({
      next: (res: any) => {
        console.log('📋 API Response:', res);
        const data = res.data || res;
        console.log('📋 Data:', data);
        const voucherList = Array.isArray(data) ? data : [];
        console.log('📋 Voucher List:', voucherList);
        // Map dữ liệu từ API (snake_case) sang camelCase
        const mappedList = voucherList.map((v: any) => this.voucherService.mapVoucherData(v));
        console.log('📋 Mapped List:', mappedList);
        this.vouchers.set(mappedList);
      },
      error: (err) => {
        console.error('❌ Lỗi tải danh sách:', err);
      }
    });
  }

  // --- TÍNH NĂNG THÊM MỚI ---
  onSubmit() {
    if (this.voucherForm.valid) {
      this.voucherService.createVoucher(this.voucherForm.value).subscribe({
        next: () => {
          this.loadVouchers(); // Tải lại để lấy dữ liệu mới từ server
          this.showModal.set(false);
          this.voucherForm.reset({ promotion_type: 'percentage', quantity: 1 });
        },
        error: (err) => alert('Không thể thêm: ' + err.error?.message)
      });
    }
  }

  // --- TÍNH NĂNG XÓA (ĐÃ FIX LỖI) ---
  deleteVoucher(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      this.voucherService.deleteVoucher(id).subscribe({
        next: (res) => {
          // Cập nhật giao diện ngay lập tức bằng Signal
          this.vouchers.update(list => list.filter(v => v.id !== id));
          console.log('Xóa thành công ID:', id);
        },
        error: (err) => {
          console.error('Lỗi xóa:', err);
          alert('Lỗi: ' + (err.error?.message || 'Không thể xóa voucher này!'));
        }
      });
    }
  }

  getDiscountText(v: Voucher): string {
    const val = Number(v.discountValue || 0);
    return v.discountType === 'percentage' ? `${val}%` : `${val.toLocaleString('vi-VN')}₫`;
  }

  getVoucherStatus(voucher: any): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = voucher.startDate ? new Date(voucher.startDate) : null;
    const endDate = voucher.endDate ? new Date(voucher.endDate) : null;

    if (!startDate || !endDate) return 'Chưa xác định';
    
    if (today < startDate) return 'Sắp diễn ra';
    if (today > endDate) return 'Đã hết hạn';
    return 'Đang hoạt động';
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Đang hoạt động': return 'active';
      case 'Sắp diễn ra': return 'upcoming';
      case 'Đã hết hạn': return 'expired';
      default: return 'pending';
    }
  }

  getRemainingDays(endDate: any): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  filteredVouchers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.vouchers().filter(v => 
      (v.code?.toLowerCase().includes(query) || false) || 
      (v.name?.toLowerCase().includes(query) || false)
    );
  });
}