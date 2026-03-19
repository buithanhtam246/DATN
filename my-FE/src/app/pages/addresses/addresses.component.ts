import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressesComponent implements OnInit {
  addresses: any[] = [];
  isLoading = false;
  showForm = false;
  isEditing = false;
  editingId: number | null = null;

  formData = {
    receiver_name: '',
    receiver_phone: '',
    full_address: '',
    is_default: false
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoading = true;
    this.userService.getAddresses().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.addresses = response.data || [];
          console.log('Addresses loaded:', this.addresses);
        } else {
          this.notificationService.showError('Không thể tải danh sách địa chỉ');
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading addresses:', err);
        this.notificationService.showError('Lỗi khi tải danh sách địa chỉ');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
    this.cdr.markForCheck();
  }

  editAddress(address: any) {
    this.isEditing = true;
    this.editingId = address.id;
    this.formData = {
      receiver_name: address.receiver_name,
      receiver_phone: address.receiver_phone,
      full_address: address.full_address,
      is_default: address.is_default
    };
    this.showForm = true;
    this.cdr.markForCheck();
  }

  resetForm() {
    this.formData = {
      receiver_name: '',
      receiver_phone: '',
      full_address: '',
      is_default: false
    };
    this.isEditing = false;
    this.editingId = null;
  }

  saveAddress() {
    // Validation
    if (!this.formData.receiver_name.trim()) {
      this.notificationService.showError('Vui lòng nhập tên người nhận');
      return;
    }
    if (!this.formData.receiver_phone.trim()) {
      this.notificationService.showError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!this.formData.full_address.trim()) {
      this.notificationService.showError('Vui lòng nhập địa chỉ');
      return;
    }

    if (this.isEditing && this.editingId) {
      // Update existing address
      this.userService.updateAddress({ id: this.editingId, ...this.formData }).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notificationService.showSuccess('Cập nhật địa chỉ thành công');
            this.loadAddresses();
            this.showForm = false;
            this.resetForm();
          } else {
            this.notificationService.showError(response?.message || 'Cập nhật thất bại');
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error updating address:', err);
          this.notificationService.showError('Lỗi khi cập nhật địa chỉ');
          this.cdr.markForCheck();
        }
      });
    } else {
      // Create new address
      this.userService.addAddress(this.formData).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notificationService.showSuccess('Thêm địa chỉ thành công');
            this.loadAddresses();
            this.showForm = false;
            this.resetForm();
          } else {
            this.notificationService.showError(response?.message || 'Thêm địa chỉ thất bại');
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error adding address:', err);
          this.notificationService.showError('Lỗi khi thêm địa chỉ');
          this.cdr.markForCheck();
        }
      });
    }
  }

  deleteAddress(addressId: number) {
    if (confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) {
      this.userService.deleteAddress(addressId).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notificationService.showSuccess('Xóa địa chỉ thành công');
            this.loadAddresses();
          } else {
            this.notificationService.showError(response?.message || 'Xóa thất bại');
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error deleting address:', err);
          this.notificationService.showError('Lỗi khi xóa địa chỉ');
          this.cdr.markForCheck();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/account']);
  }
}
